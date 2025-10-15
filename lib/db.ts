import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

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

export function getDB() {
  return new Database(dbPath)
}
