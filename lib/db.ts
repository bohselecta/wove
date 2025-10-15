import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

// Vercel-compatible database handling
const isVercel = process.env.VERCEL === '1'

let db: Database.Database | null = null

// Sample data for Vercel deployment
const sampleData = {
  signals_top: [
    {
      id: '1',
      source: 'Climate Research Institute',
      topic: 'Renewable Energy',
      time: '2024-01-15T10:00:00Z',
      claim: 'Solar panel efficiency increased 15% this year',
      gi_planet: 0.8,
      gi_people: 0.6,
      gi_democracy: 0.4,
      gi_learning: 0.7
    },
    {
      id: '2',
      source: 'Community Health Network',
      topic: 'Public Health',
      time: '2024-01-14T14:30:00Z',
      claim: 'Local vaccination rates improved 25% with community outreach',
      gi_planet: 0.2,
      gi_people: 0.9,
      gi_democracy: 0.6,
      gi_learning: 0.5
    }
  ],
  recipes: [
    {
      id: '1',
      title: 'Community Solar Initiative',
      summary: 'Install solar panels on community buildings',
      p_impact: 0.8,
      p_feasibility: 0.7,
      p_urgency: 0.6,
      p_equity: 0.9,
      p_total: 0.75
    },
    {
      id: '2',
      title: 'Local Food Network',
      summary: 'Connect local farmers with community kitchens',
      p_impact: 0.7,
      p_feasibility: 0.8,
      p_urgency: 0.5,
      p_equity: 0.8,
      p_total: 0.7
    }
  ],
  frictions: []
}

if (!isVercel) {
  // Local development with SQLite
  const dbPath = path.join(process.cwd(), 'wove.db')

  if (!fs.existsSync(dbPath)) {
    const touch = new Database(dbPath)
    touch.exec(`
      create table if not exists signals_top (
        id text primary key,
        source text,
        topic text,
        time text,
        claim text,
        gi_planet real,
        gi_people real,
        gi_democracy real,
        gi_learning real
      );
      create table if not exists frictions (
        id text primary key,
        text text,
        createdAt text
      );
      create table if not exists recipes (
        id text primary key,
        title text,
        summary text,
        p_impact real,
        p_feasibility real,
        p_urgency real,
        p_equity real,
        p_total real
      );
    `)
    touch.close()
  }
}

export function getDB() {
  if (isVercel) {
    // Return a mock database object for Vercel
    return {
      prepare: (query: string) => ({
        all: () => {
          if (query.includes('signals_top')) return sampleData.signals_top
          if (query.includes('recipes')) return sampleData.recipes
          if (query.includes('frictions')) return sampleData.frictions
          return []
        },
        get: () => null,
        run: () => ({ changes: 0 })
      }),
      close: () => {}
    } as any
  }

  // Local development
  if (!db) {
    const dbPath = path.join(process.cwd(), 'wove.db')
    db = new Database(dbPath)
  }
  return db
}
