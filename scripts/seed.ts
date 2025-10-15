import { getDB } from '../lib/db'
import { randomUUID } from 'crypto'

const db = getDB()

function seedSignals(){
  const stmt = db.prepare(`insert into signals_top (id, source, topic, time, claim, gi_planet, gi_people, gi_democracy, gi_learning)
  values (@id, @source, @topic, @time, @claim, @gp, @gh, @gd, @gl)`)
  const now = new Date()
  const items = [
    {source:'NOAA', topic:'heat', claim:'Heat advisory expected this weekend; tree shade priority areas identified.', gp:0.7, gh:0.6, gd:0.2, gl:0.3},
    {source:'City', topic:'transit', claim:'Bus route changes could isolate seniors — volunteer driver pool needed.', gp:0.2, gh:0.8, gd:0.5, gl:0.2},
    {source:'WHO', topic:'health', claim:'Local vaccination gaps detected; multilingual outreach recommended.', gp:0.3, gh:0.9, gd:0.4, gl:0.5}
  ]
  items.forEach((it,i)=>stmt.run({id: randomUUID(), source:it.source, topic:it.topic, time: new Date(now.getTime() - i*3600_000).toISOString(),
    claim: it.claim, gp:it.gp, gh:it.gh, gd:it.gd, gl:it.gl }))
}

function seedRecipes(){
  const stmt = db.prepare(`insert into recipes (id, title, summary, p_impact, p_feasibility, p_urgency, p_equity, p_total)
  values (@id, @title, @summary, @pi, @pf, @pu, @pe, @pt)`)
  const items = [
    {title:'Shade Sprint: Map + Water Trees', summary:'Mobilize 20 neighbors to water young trees and pin shade deficits before the heat event.', pi:0.8, pf:0.7, pu:0.9, pe:0.6},
    {title:'Senior Ride Pool', summary:'Stand up a driver rota for affected bus stops; verify pickups with photo proofs.', pi:0.6, pf:0.8, pu:0.7, pe:0.9},
    {title:'Vaccination Outreach', summary:'Translate flyers and host info hour at the community center; track Q&A learnings.', pi:0.7, pf:0.6, pu:0.6, pe:0.8}
  ]
  items.forEach(it => {
    const pt = (it.pi+it.pf+it.pu+it.pe)/4
    stmt.run({ id: randomUUID(), title: it.title, summary: it.summary, pi: it.pi, pf: it.pf, pu: it.pu, pe: it.pe, pt })
  })
}

seedSignals()
seedRecipes()
db.close()
console.log("Seeded Wove demo data.")
