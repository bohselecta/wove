'use client'
import { useEffect, useState } from 'react'

type Friction = { id:string, text:string, createdAt:string }
export function Loom(){
  const [frictions, setFrictions] = useState<Friction[]>([])
  const [text, setText] = useState('')
  useEffect(()=>{ fetch('/api/frictions').then(r=>r.json()).then(setFrictions).catch(()=>{}) },[])
  async function add(e: React.FormEvent){
    e.preventDefault()
    if(!text.trim()) return
    const r = await fetch('/api/frictions', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({text}) })
    const item = await r.json()
    setFrictions([item, ...frictions]); setText('')
  }
  return (
    <div>
      <form onSubmit={add} className="flex gap-2">
        <input className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2" placeholder="What need do you want to address?" value={text} onChange={e=>setText(e.target.value)} />
        <button className="badge" type="submit">Add</button>
      </form>
      <div className="grid-col mt-3">
        {frictions.map(f => (
          <div key={f.id} className="card">
            <div className="text-sm opacity-60">{new Date(f.createdAt).toLocaleString()}</div>
            <div>{f.text}</div>
          </div>
        ))}
        {frictions.length===0 && <div className="opacity-70">No needs yet — share one to start a Common Room.</div>}
      </div>
    </div>
  )
}
