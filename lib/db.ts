import fs from 'fs'
import path from 'path'

const isProd = process.env.NODE_ENV === 'production'
const POSTGRES_URL = process.env.DATABASE_URL || ''

type Row = Record<string, any>

export interface DB {
  all<T = Row>(sql: string, params?: any[]): Promise<T[]>
  get<T = Row>(sql: string, params?: any[]): Promise<T | undefined>
  run(sql: string, params?: any[]): Promise<void>
  close?(): void
}

// Sample data for development and fallback
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
  ],
  common_rooms: [
    {
      id: '1',
      title: 'Community Solar Initiative',
      planId: '1',
      status: 'active',
      createdAt: '2024-01-15T09:00:00Z'
    }
  ],
  tasks: [
    {
      id: '1',
      roomId: '1',
      title: 'Survey community buildings for solar potential',
      assignee: 'Sarah Chen',
      due: '2024-01-20T00:00:00Z',
      completed: 0
    },
    {
      id: '2',
      roomId: '1',
      title: 'Research local solar incentives and grants',
      assignee: 'Mike Rodriguez',
      due: '2024-01-22T00:00:00Z',
      completed: 1
    },
    {
      id: '3',
      roomId: '1',
      title: 'Draft proposal for community solar program',
      assignee: 'Lisa Park',
      due: '2024-01-25T00:00:00Z',
      completed: 0
    }
  ]
}

export async function getDB(): Promise<DB> {
  if (!isProd) {
    // Local: better-sqlite3
    const Database = (await import('better-sqlite3')).default
    const dbPath = path.join(process.cwd(), 'wove.db')
    
    // Ensure directory exists
    const dir = path.dirname(dbPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    const db = new Database(dbPath)
    
    // Bootstrap tables
    db.exec(`
      create table if not exists signals_top (
        id text primary key, source text, topic text, time text, claim text,
        gi_planet real, gi_people real, gi_democracy real, gi_learning real
      );
      create table if not exists frictions (
        id text primary key, text text, createdAt text
      );
      create table if not exists recipes (
        id text primary key, title text, summary text,
        p_impact real, p_feasibility real, p_urgency real, p_equity real, p_total real,
        template_id text
      );
      create table if not exists common_rooms (
        id text primary key,
        title text not null,
        plan_id text,
        status text default 'open',
        created_at text
      );
      create table if not exists tasks (
        id text primary key,
        room_id text not null,
        title text not null,
        assignee text,
        due text,
        due_date text,
        priority text,
        status text default 'todo',
        created_at text
      );
      create table if not exists proofs (
        id text primary key,
        need_id text,
        room_id text,
        plan_id text,
        kind text,
        url text,
        text text,
        created_by text,
        created_at text
      );
      create table if not exists stories (
        id text primary key,
        plan_id text,
        room_id text,
        title text,
        body text,
        gi_delta_planet real,
        gi_delta_people real,
        gi_delta_democracy real,
        gi_delta_learning real,
        created_at text
      );
      create table if not exists gi_scores (
        id text primary key,
        date text,
        planet real,
        people real,
        democracy real,
        learning real,
        source text,
        room_id text,
        plan_id text
      );
      create table if not exists library_lessons (
        id text primary key,
        title text not null,
        summary text,
        content text,
        tags text,
        created_at text,
        created_by text
      );
      create table if not exists nudges (
        id text primary key,
        room_id text,
        task_id text,
        assignee text,
        reason text,
        created_by text,
        created_at text,
        status text
      );
    `)
    
    // Add source_key column if missing (SQLite doesn't support IF NOT EXISTS for ALTER TABLE)
    try {
      const cols = db.prepare("PRAGMA table_info(signals_top)").all()
      const hasSourceKey = cols.some((c: any) => c.name === 'source_key')
      if (!hasSourceKey) {
        db.exec('alter table signals_top add column source_key text')
      }
      db.exec('create unique index if not exists idx_signals_source_key on signals_top(source_key)')
    } catch (e) {
      console.log('Note: source_key column may already exist')
    }
    
    // Add template_id column if missing
    try {
      const cols = db.prepare("PRAGMA table_info(recipes)").all()
      const hasTemplateId = cols.some((c: any) => c.name === 'template_id')
      if (!hasTemplateId) {
        db.exec('alter table recipes add column template_id text')
      }
    } catch (e) {
      console.log('Note: template_id column may already exist')
    }
    
    // Add new task columns if missing
    try {
      const cols = db.prepare("PRAGMA table_info(tasks)").all()
      const hasDueDate = cols.some((c: any) => c.name === 'due_date')
      const hasPriority = cols.some((c: any) => c.name === 'priority')
      if (!hasDueDate) {
        db.exec('alter table tasks add column due_date text')
      }
      if (!hasPriority) {
        db.exec('alter table tasks add column priority text')
      }
    } catch (e) {
      console.log('Note: task columns may already exist')
    }
    
    // Seed with sample data if tables are empty
    const signalCount = db.prepare('select count(*) as count from signals_top').get() as { count: number }
    if (signalCount.count === 0) {
      const insertSignal = db.prepare(`
        insert into signals_top (id, source, topic, time, claim, gi_planet, gi_people, gi_democracy, gi_learning)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      sampleData.signals_top.forEach(signal => {
        insertSignal.run(signal.id, signal.source, signal.topic, signal.time, signal.claim,
          signal.gi_planet, signal.gi_people, signal.gi_democracy, signal.gi_learning)
      })
    }
    
    const frictionCount = db.prepare('select count(*) as count from frictions').get() as { count: number }
    if (frictionCount.count === 0) {
      const insertFriction = db.prepare('insert into frictions (id, text, createdAt) values (?, ?, ?)')
      sampleData.frictions.forEach(friction => {
        insertFriction.run(friction.id, friction.text, friction.createdAt)
      })
    }
    
    const recipeCount = db.prepare('select count(*) as count from recipes').get() as { count: number }
    if (recipeCount.count === 0) {
      const insertRecipe = db.prepare(`
        insert into recipes (id, title, summary, p_impact, p_feasibility, p_urgency, p_equity, p_total)
        values (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      sampleData.recipes.forEach(recipe => {
        insertRecipe.run(recipe.id, recipe.title, recipe.summary, recipe.p_impact, recipe.p_feasibility,
          recipe.p_urgency, recipe.p_equity, recipe.p_total)
      })
    }
    
    const roomCount = db.prepare('select count(*) as count from common_rooms').get() as { count: number }
    if (roomCount.count === 0) {
      const insertRoom = db.prepare('insert into common_rooms (id, title, plan_id, status, created_at) values (?, ?, ?, ?, ?)')
      sampleData.common_rooms.forEach(room => {
        insertRoom.run(room.id, room.title, room.planId, room.status, room.createdAt)
      })
    }
    
    const taskCount = db.prepare('select count(*) as count from tasks').get() as { count: number }
    if (taskCount.count === 0) {
      const insertTask = db.prepare('insert into tasks (id, room_id, title, assignee, due, status, created_at) values (?, ?, ?, ?, ?, ?, ?)')
      sampleData.tasks.forEach(task => {
        insertTask.run(task.id, task.roomId, task.title, task.assignee, task.due, 'todo', new Date().toISOString())
      })
    }
    
    return {
      all: async <T = Row>(sql: string, params: any[] = []) => db.prepare(sql).all(params) as T[],
      get: async <T = Row>(sql: string, params: any[] = []) => db.prepare(sql).get(params) as T | undefined,
      run: async (sql: string, params: any[] = []) => { db.prepare(sql).run(params) },
      close: () => db.close(),
    }
  }

  // Prod: Neon Postgres
  if (POSTGRES_URL) {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(POSTGRES_URL)
    
    // Bootstrap tables (idempotent)
    await sql`
      create table if not exists signals_top (
        id text primary key, source text, topic text, time text, claim text,
        gi_planet float, gi_people float, gi_democracy float, gi_learning float
      );
      create table if not exists frictions (
        id text primary key, text text, createdAt text
      );
      create table if not exists recipes (
        id text primary key, title text, summary text,
        p_impact float, p_feasibility float, p_urgency float, p_equity float, p_total float,
        template_id text
      );
      create table if not exists common_rooms (
        id text primary key,
        title text not null,
        plan_id text,
        status text default 'open',
        created_at text
      );
      create table if not exists tasks (
        id text primary key,
        room_id text not null,
        title text not null,
        assignee text,
        due text,
        due_date text,
        priority text,
        status text default 'todo',
        created_at text
      );
      create table if not exists proofs (
        id text primary key,
        need_id text,
        room_id text,
        plan_id text,
        kind text,
        url text,
        text text,
        created_by text,
        created_at text
      );
      create table if not exists stories (
        id text primary key,
        plan_id text,
        room_id text,
        title text,
        body text,
        gi_delta_planet float,
        gi_delta_people float,
        gi_delta_democracy float,
        gi_delta_learning float,
        created_at text
      );
      create table if not exists gi_scores (
        id text primary key,
        date text,
        planet float,
        people float,
        democracy float,
        learning float,
        source text,
        room_id text,
        plan_id text
      );
      create table if not exists nudges (
        id text primary key,
        room_id text,
        task_id text,
        assignee text,
        reason text,
        created_by text,
        created_at text,
        status text
      );
    `
    
    // Add source_key column and unique index (Postgres supports IF NOT EXISTS)
    await sql`alter table signals_top add column if not exists source_key text`
    await sql`create unique index if not exists idx_signals_source_key on signals_top(source_key)`
    
    // Add template_id column if missing
    await sql`alter table recipes add column if not exists template_id text`
    
    // Add new task columns if missing
    await sql`alter table tasks add column if not exists due_date text`
    await sql`alter table tasks add column if not exists priority text`
    
    return {
      all: async <T = Row>(s: string, p: any[] = []) => (await sql.query(s, p)) as T[],
      get: async <T = Row>(s: string, p: any[] = []) => ((await sql.query(s, p)) as T[])[0],
      run: async (s: string, p: any[] = []) => { await sql.query(s, p) },
    }
  }

  // Fallback: return mock database for development
  const mockDb = {
    all: async <T = Row>(query: string) => {
      if (query.includes('signals_top')) return sampleData.signals_top as T[]
      if (query.includes('recipes')) return sampleData.recipes as T[]
      if (query.includes('frictions')) return sampleData.frictions as T[]
      if (query.includes('common_rooms')) return sampleData.common_rooms as T[]
      if (query.includes('tasks')) return sampleData.tasks as T[]
      if (query.includes('proofs')) return [] as T[]
      if (query.includes('stories')) return [] as T[]
      if (query.includes('gi_scores')) return [] as T[]
      return [] as T[]
    },
    get: async <T = Row>(query: string) => {
      const results = await mockDb.all<T>(query)
      return results[0]
    },
    run: async (query: string) => {
      // Mock implementation - in real scenario this would modify data
      console.log('Mock DB run:', query)
    },
  }
  
  return mockDb
}