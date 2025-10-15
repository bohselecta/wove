'use client'
import { useEffect, useState } from 'react'

type Row = { date: string; planet: number; people: number; democracy: number; learning: number }
type Series = { series: Row[] }

export default function BankPage() {
  const [data, setData] = useState<Series>({ series: [] })

  useEffect(() => { fetch('/api/bank/gi').then(r=>r.json()).then(setData) }, [])
  const rows = data.series
  const latest = rows[rows.length-1] || { planet:0, people:0, democracy:0, learning:0 }
  const heartbeat = ((latest.planet + latest.people + latest.democracy + latest.learning) / 4).toFixed(3)

  return (
    <div className="grid gap-6">
      <section className="card">
        <h1 className="text-2xl font-display mb-2">The Bank — Good Index (GI) • Heartbeat</h1>
        <p className="opacity-80">Daily deltas derived from Stories and activity.</p>
        <div className="mt-3 text-sm">Current Heartbeat: <span className="badge">{heartbeat}</span></div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Planet" rows={rows} keyName="planet" />
        <MetricCard title="People" rows={rows} keyName="people" />
        <MetricCard title="Democracy" rows={rows} keyName="democracy" />
        <MetricCard title="Learning" rows={rows} keyName="learning" />
      </section>
    </div>
  )
}

function MetricCard({ title, rows, keyName }:{
  title: string; rows: Row[]; keyName: keyof Row
}) {
  const w=220, h=100, pad=8
  const vals = rows.map(r => Number(r[keyName] || 0))
  const max = Math.max(0.001, ...vals)
  const points = vals.map((v,i)=> {
    const x = pad + (i*(w-2*pad)/Math.max(1, vals.length-1))
    const y = h - pad - (v/max)*(h-2*pad)
    return `${x},${y}`
  }).join(' ')

  const sum = vals.reduce((a,b)=>a+b,0).toFixed(3)

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <span className="badge">{sum}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full h-[100px]">
        <polyline fill="none" stroke="currentColor" strokeOpacity="0.9" strokeWidth="2" points={points} />
      </svg>
      <div className="mt-1 text-xs opacity-70">{rows.length} days tracked</div>
    </div>
  )
}