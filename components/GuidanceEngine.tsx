'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Recipe = {
  id: string
  title: string
  summary: string
  priority: { impact:number, feasibility:number, urgency:number, equity:number, total:number }
}

export function GuidanceEngine(){
  const [recipes, setRecipes] = useState<Recipe[]>([])
  useEffect(()=>{
    fetch('/api/recipes').then(r=>r.json()).then(setRecipes).catch(()=>{})
  },[])
  return (
    <div className="grid-col">
      {recipes.slice(0,3).map(r => (
        <div key={r.id} className="card">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium">{r.title}</h3>
            <div className="text-sm opacity-80">Weave Score: {r.priority.total.toFixed(2)}</div>
          </div>
          <p className="opacity-80 text-sm mt-1">{r.summary}</p>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="badge">Impact {r.priority.impact.toFixed(1)}</span>
            <span className="badge">Feas {r.priority.feasibility.toFixed(1)}</span>
            <span className="badge">Urg {r.priority.urgency.toFixed(1)}</span>
            <span className="badge">Equity {r.priority.equity.toFixed(1)}</span>
          </div>
          <div className="mt-3">
            <Link 
              href={`/commons?planId=${r.id}`}
              className="badge hover:bg-white/15 transition-colors"
            >
              Open in Common Room →
            </Link>
          </div>
        </div>
      ))}
      {recipes.length===0 && <div className="opacity-70">No Weave Plans yet — generate from Patterns and Needs.</div>}
    </div>
  )
}
