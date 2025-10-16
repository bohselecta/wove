import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'

const BASE = [
  { id:'shade-sprint', title:'Shade Sprint: Cooler Walkways', summary:'Plant native trees + shade sails on key paths; map hotspots; hydrate stations.', tags:['climate','health','public-space'],
    defaultPlan:{ title:'Shade Sprint — Cooler Walkways', summary:'Map heat hotspots, select native species, install shade + water stations along busy routes.',
      ifue:{ impact:0.82, feasibility:0.70, urgency:0.75, equity:0.78 } } },
  { id:'civic-wifi', title:'Civic Wi-Fi Nodes', summary:'Community mesh network for public spaces and emergency resilience.', tags:['connectivity','resilience','equity'],
    defaultPlan:{ title:'Civic Mesh Nodes', summary:'Survey sites, install open Wi-Fi repeaters, publish access map, train stewards.',
      ifue:{ impact:0.76, feasibility:0.68, urgency:0.72, equity:0.80 } } },
  { id:'school-garden', title:'School Garden Starter', summary:'Raised beds, rain capture, soil health, seasonal curricula.', tags:['food','education','community'],
    defaultPlan:{ title:'School Garden Starter', summary:'Build raised beds; collect rainwater; integrate science classes; host harvest days.',
      ifue:{ impact:0.74, feasibility:0.78, urgency:0.60, equity:0.82 } } }
]

export async function GET() {
  let templates = BASE
  try {
    const raw = await readFile(process.cwd() + '/data/templates.json', 'utf8')
    const overrides = JSON.parse(raw)
    // merge by id (shallow, safe)
    const map = new Map(templates.map(t => [t.id, t]))
    for (const o of overrides) map.set(o.id, { ...(map.get(o.id) || {}), ...o })
    templates = Array.from(map.values())
  } catch(_) { /* no overrides file present; keep BASE */ }

  return NextResponse.json(templates)
}
