import { NextResponse } from 'next/server'
import { getDB } from '../../../lib/db'
import Parser from 'rss-parser'
import { randomUUID, createHash } from 'crypto'

const parser = new Parser()
// Start small; expand later
const FEEDS = [
  'https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml',
  'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Education.xml',
]

function hashKey(s: string) {
  return createHash('sha256').update(s).digest('hex').slice(0, 32)
}

export async function GET() {
  const db = await getDB()
  let inserted = 0

  for (const url of FEEDS) {
    try {
      const feed = await parser.parseURL(url)
      for (const item of (feed.items || []).slice(0, 6)) {
        const link = item.link || ''
        const title = item.title || ''
        const pub = item.isoDate || item.pubDate || ''
        const source_key = hashKey(link || (title + pub + url))
        const claim = title
        const topic =
          /climate/i.test(feed.title || '') ? 'Climate Action' :
          /health|who/i.test(feed.title || '') ? 'Public Health' :
          /education|learning/i.test(feed.title || '') ? 'Education Access' :
          'Civic Participation'

        // naive GI heuristic (can refine later)
        const gi_planet = /climate|energy|forest|emissions/i.test(claim) ? 0.8 : 0.3
        const gi_people = /health|care|wellbeing|education|students/i.test(claim) ? 0.8 : 0.4
        const gi_democracy = /vote|civic|policy|govern/i.test(claim) ? 0.7 : 0.3
        const gi_learning = /education|learning|research|training/i.test(claim) ? 0.8 : 0.5

        // Upsert by source_key
        const exists = await db.get<{ id: string }>(
          'select id from signals_top where source_key = ?',
          [source_key]
        )
        if (!exists) {
          await db.run(
            `insert into signals_top
              (id, source, topic, time, claim, gi_planet, gi_people, gi_democracy, gi_learning, source_key)
             values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              randomUUID(),
              (feed.title || url).slice(0, 140),
              topic,
              new Date(pub || Date.now()).toISOString(),
              claim.slice(0, 400),
              gi_planet, gi_people, gi_democracy, gi_learning,
              source_key,
            ]
          )
          inserted++
        }
      }
    } catch (e) {
      console.error('Ingest failed for', url, e)
    }
  }

  return NextResponse.json({ success: true, inserted })
}

// --- MANUAL INGEST TRIGGER (for testing) ---
export async function POST() {
  // Same as GET but allows manual triggering
  return GET()
}