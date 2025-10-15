'use client'
import { useEffect, useState } from 'react'
type Proof = { id:string; room_id:string; kind:string; url?:string|null; text?:string|null; created_at:string }

export default function RoomProofs({ roomId }:{ roomId: string }) {
  const [list, setList] = useState<Proof[]>([])
  const [kind, setKind] = useState<'text'|'link'|'image'|'file'>('text')
  const [text, setText] = useState(''); const [url, setUrl] = useState('')

  async function load(){ setList(await fetch(`/api/proofs?roomId=${roomId}`).then(r=>r.json())) }
  useEffect(()=>{ load() }, [roomId, load])

  async function add(e: React.FormEvent){
    e.preventDefault()
    const r = await fetch('/api/proofs', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ roomId, kind, text: text || null, url: url || null })
    })
    if (r.ok) { setText(''); setUrl(''); await load() }
  }

  return (
    <div className="mt-4">
      <details className="mb-3">
        <summary className="cursor-pointer opacity-90">Add Thread (proof)</summary>
        <form onSubmit={add} className="mt-2 grid gap-2 md:grid-cols-3">
          <select className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                  value={kind} onChange={e=>setKind(e.target.value as any)}>
            <option value="text">Text</option>
            <option value="link">Link</option>
            <option value="image">Image URL</option>
            <option value="file">File URL</option>
          </select>
          <input className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                 placeholder="Optional URL" value={url} onChange={e=>setUrl(e.target.value)} />
          <input className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 md:col-span-3"
                 placeholder="Note (what's the proof?)" value={text} onChange={e=>setText(e.target.value)} />
          <button className="badge w-max" type="submit">Save Proof</button>
        </form>
      </details>

      <div className="grid gap-2">
        {list.map(p => (
          <div key={p.id} className="text-sm flex items-center gap-2">
            <span className="badge">{p.kind}</span>
            {p.url ? <a href={p.url} className="underline break-all" target="_blank">{p.url}</a> : null}
            {p.text ? <span className="opacity-90">{p.text}</span> : null}
            <span className="ml-auto opacity-60 text-xs">{new Date(p.created_at).toLocaleString()}</span>
          </div>
        ))}
        {list.length===0 && <div className="opacity-70 text-sm">No proofs yet.</div>}
      </div>
    </div>
  )
}
