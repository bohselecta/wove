'use client'
import { useEffect, useState } from 'react'

export default function RoomBadges({ roomId }: { roomId: string }) {
  const [counts, setCounts] = useState({ done:0, total:0, proofs:0 })

  useEffect(() => {
    let alive = true
    async function load() {
      const [tasks, proofs] = await Promise.all([
        fetch(`/api/common_rooms/${roomId}/tasks`).then(r=>r.json()).catch(()=>[]),
        fetch(`/api/proofs?roomId=${roomId}`).then(r=>r.json()).catch(()=>[])
      ])
      if (!alive) return
      const total = Array.isArray(tasks) ? tasks.length : 0
      const done  = Array.isArray(tasks) ? tasks.filter((t:any)=>t.status==='done').length : 0
      const proofsCount = Array.isArray(proofs) ? proofs.length : 0
      setCounts({ done, total, proofs: proofsCount })
    }
    load()
    const t = setInterval(load, 8000) // light auto-refresh
    return () => { alive = false; clearInterval(t) }
  }, [roomId])

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="badge">{counts.done}/{counts.total} tasks</span>
      <span className="badge">{counts.proofs} proofs</span>
    </div>
  )
}
