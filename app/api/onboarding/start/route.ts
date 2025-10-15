import { NextResponse } from 'next/server'
import { getDB } from '../../../../lib/db'
import { randomUUID } from 'crypto'

export async function POST() {
  const db = await getDB()
  const now = new Date().toISOString()

  // 1) Create a sample Need (uses existing frictions table)
  const needId = randomUUID()
  const needText = 'Lower summer heat stress along River Bend trail with more shade & water.'
  await db.run(
    `insert into frictions (id, text, createdAt) values (?, ?, ?)`,
    [needId, needText, now]
  )

  // 2) Pick a couple of recent signals
  const signals = await db.all<any>(
    `select topic, claim from signals_top order by datetime(time) desc limit 2`
  )

  // 3) Create a Weave Plan (recipes) — simple local generation for now
  const title = 'River Bend Shade Sprint'
  const summary = 'Plant native trees and install shade sails + water stations at key segments of the trail.'
  const impact = 0.82, feasibility = 0.7, urgency = 0.75, equity = 0.78
  const total = (impact + feasibility + urgency + equity) / 4
  const planId = randomUUID()
  await db.run(
    `insert into recipes
      (id, title, summary, p_impact, p_feasibility, p_urgency, p_equity, p_total)
     values (?, ?, ?, ?, ?, ?, ?, ?)`,
    [planId, title, summary, impact, feasibility, urgency, equity, total]
  )

  // 4) Create a Common Room from that plan
  const roomId = randomUUID()
  await db.run(
    `insert into common_rooms (id, title, plan_id, status, created_at)
     values (?, ?, ?, 'open', ?)`,
    [roomId, 'Shade Sprint — River Bend', planId, now]
  )

  // 5) Seed 2–3 tasks
  const tasks = [
    'Map heat hotspots on trail',
    'Draft native tree list & spacing',
    'Coordinate with parks dept for permits',
  ]
  for (const t of tasks) {
    await db.run(
      `insert into tasks (id, room_id, title, status, created_at)
       values (?, ?, ?, 'todo', ?)`,
      [randomUUID(), roomId, t, now]
    )
  }

  return NextResponse.json({
    success: true,
    roomId,
    planId,
    needId,
    url: `/commons#room-${roomId}`
  })
}
