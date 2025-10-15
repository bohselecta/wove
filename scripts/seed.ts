import { getDB } from '../lib/db'
import { randomUUID } from 'crypto'

async function seedData() {
  const db = await getDB()
  const now = new Date()

  // Seed signals (if not already present)
  const signalCount = await db.get('select count(*) as count from signals_top') as { count: number }
  if (signalCount.count === 0) {
    const items = [
      {source:'Climate Research Institute', topic:'Renewable Energy', claim:'Solar panel efficiency increased 15% this year, making community solar projects more viable', gp:0.8, gh:0.6, gd:0.4, gl:0.7},
      {source:'Community Health Network', topic:'Public Health', claim:'Local vaccination rates improved 25% with community outreach programs', gp:0.2, gh:0.9, gd:0.6, gl:0.5},
      {source:'Urban Planning Council', topic:'Transportation', claim:'Bike lane expansion reduced traffic accidents by 30% in pilot neighborhoods', gp:0.7, gh:0.8, gd:0.5, gl:0.4},
      {source:'Food Security Alliance', topic:'Local Agriculture', claim:'Community gardens increased fresh food access for 500+ families', gp:0.6, gh:0.8, gd:0.7, gl:0.6},
      {source:'Digital Equity Coalition', topic:'Technology Access', claim:'Free WiFi zones helped 200+ students access online learning resources', gp:0.1, gh:0.7, gd:0.8, gl:0.9},
      {source:'Housing Justice Network', topic:'Affordable Housing', claim:'Cooperative housing model reduced rent burden for 150 families', gp:0.3, gh:0.9, gd:0.8, gl:0.5}
    ]
    
    for (const [i, item] of items.entries()) {
      await db.run(
        `insert into signals_top (id, source, topic, time, claim, gi_planet, gi_people, gi_democracy, gi_learning)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          item.source,
          item.topic,
          new Date(now.getTime() - i*3600_000).toISOString(),
          item.claim,
          item.gp,
          item.gh,
          item.gd,
          item.gl
        ]
      )
    }
    console.log(`Seeded ${items.length} signals`)
  }

  // Seed recipes (if not already present)
  const recipeCount = await db.get('select count(*) as count from recipes') as { count: number }
  if (recipeCount.count === 0) {
    const items = [
      {title:'Community Solar Initiative', summary:'Install solar panels on community buildings and create shared energy program', pi:0.8, pf:0.7, pu:0.6, pe:0.9},
      {title:'Local Food Network', summary:'Connect local farmers with community kitchens and food banks', pi:0.7, pf:0.8, pu:0.5, pe:0.8},
      {title:'Digital Literacy Program', summary:'Train community members in essential digital skills and online safety', pi:0.6, pf:0.9, pu:0.7, pe:0.9},
      {title:'Safe Streets Campaign', summary:'Advocate for pedestrian-friendly infrastructure and traffic calming measures', pi:0.8, pf:0.6, pu:0.8, pe:0.7},
      {title:'Housing Cooperative Development', summary:'Support formation of resident-owned housing cooperatives', pi:0.9, pf:0.5, pu:0.9, pe:0.9},
      {title:'Community Composting Hub', summary:'Establish neighborhood composting system to reduce waste and create soil', pi:0.7, pf:0.8, pu:0.4, pe:0.6}
    ]
    
    for (const item of items) {
      const pt = (item.pi + item.pf + item.pu + item.pe) / 4
      await db.run(
        `insert into recipes (id, title, summary, p_impact, p_feasibility, p_urgency, p_equity, p_total)
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
        [randomUUID(), item.title, item.summary, item.pi, item.pf, item.pu, item.pe, pt]
      )
    }
    console.log(`Seeded ${items.length} recipes`)
  }

  // Seed frictions (if not already present)
  const frictionCount = await db.get('select count(*) as count from frictions') as { count: number }
  if (frictionCount.count === 0) {
    const items = [
      'Our neighborhood lacks safe bike routes to the community center',
      'Many families struggle to access fresh, affordable produce',
      'Elderly residents feel isolated due to limited transportation options',
      'Students need better internet access for remote learning'
    ]
    
    for (const [i, text] of items.entries()) {
      await db.run(
        'insert into frictions (id, text, createdAt) values (?, ?, ?)',
        [
          randomUUID(),
          text,
          new Date(now.getTime() - i*3600_000).toISOString()
        ]
      )
    }
    console.log(`Seeded ${items.length} frictions`)
  }

  if (db.close) db.close()
  console.log("✅ Wove demo data seeded successfully!")
}

// Run the seed function
seedData().catch(console.error)
