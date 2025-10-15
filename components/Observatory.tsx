'use client'
import { useEffect, useState } from 'react'

type SignalTop = {
  id: string
  source: string
  topic: string
  time: string
  gi: { planet:number, people:number, democracy:number, learning:number }
  claim: string
}

export function Observatory(){
  const [signals, setSignals] = useState<SignalTop[]>([])
  useEffect(()=>{
    fetch('/api/signals/top').then(r=>r.json()).then(setSignals).catch(()=>{})
  },[])
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {signals.map(s => (
        <div key={s.id} className="card">
          <div className="text-sm opacity-70">{s.source} • {new Date(s.time).toLocaleString()}</div>
          <div className="font-medium mt-1">{s.claim}</div>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="badge" title="Planet">🟢 {s.gi.planet}</span>
            <span className="badge" title="People">🟡 {s.gi.people}</span>
            <span className="badge" title="Democracy">🔵 {s.gi.democracy}</span>
            <span className="badge" title="Learning">🟣 {s.gi.learning}</span>
          </div>
        </div>
      ))}
      {signals.length===0 && <div className="opacity-70">No patterns yet — run the ingestors or seed the DB.</div>}
    </div>
  )
}
