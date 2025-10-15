import { NextResponse } from 'next/server'
import { getDB } from '../../../lib/db'
import { randomUUID } from 'crypto'

// --- MOCK SIGNAL SOURCES (later, replace with real feeds) ---
const mockFeeds = [
  {
    topic: 'Climate Action',
    source: 'World Resources Institute',
    claim: 'Global CO₂ emissions have plateaued in 2025 after significant renewable investments.',
    gi_planet: 0.85,
    gi_people: 0.65,
    gi_democracy: 0.4,
    gi_learning: 0.55,
  },
  {
    topic: 'Education Access',
    source: 'UNESCO Education Index',
    claim: 'Digital literacy initiatives improved rural connectivity in 10 new regions this quarter.',
    gi_planet: 0.35,
    gi_people: 0.8,
    gi_democracy: 0.5,
    gi_learning: 0.9,
  },
  {
    topic: 'Public Health',
    source: 'WHO Weekly Bulletin',
    claim: 'Early community detection systems reduced disease spread in pilot towns by 40%.',
    gi_planet: 0.6,
    gi_people: 0.9,
    gi_democracy: 0.45,
    gi_learning: 0.7,
  },
  {
    topic: 'Civic Participation',
    source: 'OpenGov Watch',
    claim: 'Local town forums using AI co-deliberation tools increased attendance by 22%.',
    gi_planet: 0.3,
    gi_people: 0.7,
    gi_democracy: 0.9,
    gi_learning: 0.65,
  },
  {
    topic: 'Sustainable Food Systems',
    source: 'FAO Food Index',
    claim: 'Regenerative farming methods led to 15% higher yield in degraded soil regions.',
    gi_planet: 0.88,
    gi_people: 0.7,
    gi_democracy: 0.35,
    gi_learning: 0.55,
  },
]

// --- INGEST ROUTE HANDLER ---
export async function GET() {
  try {
    const db = await getDB()
    const now = new Date().toISOString()
    let insertedCount = 0

    // Insert mock signals (avoid duplicates by topic)
    for (const feed of mockFeeds) {
      const existing = await db.get(
        'select id from signals_top where topic = ?',
        [feed.topic]
      )
      if (!existing) {
        await db.run(
          `insert into signals_top (
            id, source, topic, time, claim,
            gi_planet, gi_people, gi_democracy, gi_learning
          ) values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(),
            feed.source,
            feed.topic,
            now,
            feed.claim,
            feed.gi_planet,
            feed.gi_people,
            feed.gi_democracy,
            feed.gi_learning,
          ]
        )
        insertedCount++
      }
    }

    if (db.close) db.close()

    return NextResponse.json({ 
      success: true, 
      inserted: insertedCount,
      message: `Ingested ${insertedCount} new signals from ${mockFeeds.length} sources`
    })
  } catch (error) {
    console.error('Error ingesting signals:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to ingest signals' 
    }, { status: 500 })
  }
}

// --- MANUAL INGEST TRIGGER (for testing) ---
export async function POST() {
  // Same as GET but allows manual triggering
  return GET()
}
