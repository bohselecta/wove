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
      claim: 'Solar panel efficiency increased 15% this year, making community solar projects more viable',
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
      claim: 'Local vaccination rates improved 25% with community outreach programs',
      gi_planet: 0.2,
      gi_people: 0.9,
      gi_democracy: 0.6,
      gi_learning: 0.5
    },
    {
      id: '3',
      source: 'Urban Planning Council',
      topic: 'Transportation',
      time: '2024-01-14T09:15:00Z',
      claim: 'Bike lane expansion reduced traffic accidents by 30% in pilot neighborhoods',
      gi_planet: 0.7,
      gi_people: 0.8,
      gi_democracy: 0.5,
      gi_learning: 0.4
    },
    {
      id: '4',
      source: 'Food Security Alliance',
      topic: 'Local Agriculture',
      time: '2024-01-13T16:45:00Z',
      claim: 'Community gardens increased fresh food access for 500+ families',
      gi_planet: 0.6,
      gi_people: 0.8,
      gi_democracy: 0.7,
      gi_learning: 0.6
    },
    {
      id: '5',
      source: 'Digital Equity Coalition',
      topic: 'Technology Access',
      time: '2024-01-13T11:20:00Z',
      claim: 'Free WiFi zones helped 200+ students access online learning resources',
      gi_planet: 0.1,
      gi_people: 0.7,
      gi_democracy: 0.8,
      gi_learning: 0.9
    },
    {
      id: '6',
      source: 'Housing Justice Network',
      topic: 'Affordable Housing',
      time: '2024-01-12T13:30:00Z',
      claim: 'Cooperative housing model reduced rent burden for 150 families',
      gi_planet: 0.3,
      gi_people: 0.9,
      gi_democracy: 0.8,
      gi_learning: 0.5
    }
  ],
  recipes: [
    {
      id: '1',
      title: 'Community Solar Initiative',
      summary: 'Install solar panels on community buildings and create shared energy program',
      p_impact: 0.8,
      p_feasibility: 0.7,
      p_urgency: 0.6,
      p_equity: 0.9,
      p_total: 0.75
    },
    {
      id: '2',
      title: 'Local Food Network',
      summary: 'Connect local farmers with community kitchens and food banks',
      p_impact: 0.7,
      p_feasibility: 0.8,
      p_urgency: 0.5,
      p_equity: 0.8,
      p_total: 0.7
    },
    {
      id: '3',
      title: 'Digital Literacy Program',
      summary: 'Train community members in essential digital skills and online safety',
      p_impact: 0.6,
      p_feasibility: 0.9,
      p_urgency: 0.7,
      p_equity: 0.9,
      p_total: 0.775
    },
    {
      id: '4',
      title: 'Safe Streets Campaign',
      summary: 'Advocate for pedestrian-friendly infrastructure and traffic calming measures',
      p_impact: 0.8,
      p_feasibility: 0.6,
      p_urgency: 0.8,
      p_equity: 0.7,
      p_total: 0.725
    },
    {
      id: '5',
      title: 'Housing Cooperative Development',
      summary: 'Support formation of resident-owned housing cooperatives',
      p_impact: 0.9,
      p_feasibility: 0.5,
      p_urgency: 0.9,
      p_equity: 0.9,
      p_total: 0.8
    },
    {
      id: '6',
      title: 'Community Composting Hub',
      summary: 'Establish neighborhood composting system to reduce waste and create soil',
      p_impact: 0.7,
      p_feasibility: 0.8,
      p_urgency: 0.4,
      p_equity: 0.6,
      p_total: 0.625
    }
  ],
  frictions: [
    {
      id: '1',
      text: 'Our neighborhood lacks safe bike routes to the community center',
      createdAt: '2024-01-15T08:30:00Z'
    },
    {
      id: '2',
      text: 'Many families struggle to access fresh, affordable produce',
      createdAt: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      text: 'Elderly residents feel isolated due to limited transportation options',
      createdAt: '2024-01-14T10:20:00Z'
    },
    {
      id: '4',
      text: 'Students need better internet access for remote learning',
      createdAt: '2024-01-13T14:15:00Z'
    }
  ]
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

  // Local development - don't close the connection, keep it open
  if (!db) {
    const dbPath = path.join(process.cwd(), 'wove.db')
    db = new Database(dbPath)
  }
  return db
}
