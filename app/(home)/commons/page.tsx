'use client'
import { useEffect, useState } from 'react'
import RoomProofs from '../../../components/RoomProofs'
import RoomBadges from '../../../components/RoomBadges'
import SectionHeader from '../../../components/SectionHeader'
import BackButton from '../../../components/BackButton'

type Room = { id:string; title:string; plan_id?:string; status:string; created_at:string }
type Task = { id:string; room_id:string; title:string; status:string; assignee?:string|null; due?:string|null; due_date?:string|null; priority?:string|null; created_at:string }

export default function CommonsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [title, setTitle] = useState('')
  const [planId, setPlanId] = useState('')
  const [tasks, setTasks] = useState<Record<string, Task[]>>({})

  useEffect(() => { 
    fetch('/api/common_rooms')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRooms(data)
        } else {
          console.error('Invalid data format:', data)
          setRooms([])
        }
      })
      .catch(err => {
        console.error('Failed to load rooms:', err)
        setRooms([])
      })
  }, [])

  async function createRoom() {
    if(!title.trim()) return
    const res = await fetch('/api/common_rooms/create', {
      method: 'POST', 
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title, planId: planId || null })
    })
    const data = await res.json()
    if (data?.room) setRooms([data.room, ...rooms])
    setTitle(''); setPlanId('')
  }

  async function loadTasks(roomId: string) {
    try {
      const res = await fetch(`/api/common_rooms/${roomId}/tasks`)
      const list = await res.json()
      if (Array.isArray(list)) {
        setTasks(prev => ({ ...prev, [roomId]: list }))
      } else {
        console.error('Invalid tasks data:', list)
        setTasks(prev => ({ ...prev, [roomId]: [] }))
      }
    } catch (err) {
      console.error('Failed to load tasks:', err)
      setTasks(prev => ({ ...prev, [roomId]: [] }))
    }
  }

  async function addTask(roomId: string, text: string) {
    const res = await fetch(`/api/common_rooms/${roomId}/tasks`, {
      method: 'POST', 
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title: text })
    })
    const data = await res.json()
    setTasks(prev => ({ ...prev, [roomId]: [data.task, ...(prev[roomId] || [])] }))
  }

  async function toggleTask(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH', 
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ status: newStatus })
    })
    const { task: updated } = await res.json()
    setTasks(prev => ({
      ...prev,
      [task.room_id]: (prev[task.room_id] || []).map(t => t.id === updated.id ? updated : t)
    }))
  }

  return (
    <>
      <SectionHeader
        title="The Commons"
        subtitle="Coordinate in Common Rooms—assign tasks, add proofs, nudge momentum."
        image="/images/headers/commons.jpg"
      />
      <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="space-y-6">
        <div className="card">
        <h1 className="text-2xl font-display mb-2">The Commons — Common Rooms</h1>
        <p className="opacity-80 mb-4">Collaborative spaces for turning Weave Plans into action.</p>
        
        <div className="flex gap-2">
          <input 
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2"
            placeholder="Room title (e.g., Shade Sprint for River Bend)"
            value={title} 
            onChange={e=>setTitle(e.target.value)}
          />
          <input 
            className="w-64 rounded-xl bg-white/5 border border-white/10 px-3 py-2"
            placeholder="Optional planId (recipes.id)"
            value={planId} 
            onChange={e=>setPlanId(e.target.value)}
          />
          <button className="badge" onClick={createRoom}>Create Room</button>
        </div>
      </div>

      {rooms.map(r => (
        <div key={r.id} className="card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg">{r.title}</h2>
              <div className="mt-1"><RoomBadges roomId={r.id} /></div>
              <p className="text-xs opacity-70">Status: {r.status} • Created {new Date(r.created_at).toLocaleString()}</p>
            </div>
            <button className="badge" onClick={()=>loadTasks(r.id)}>Load Tasks</button>
          </div>
          <RoomTasks roomId={r.id} tasks={tasks[r.id] || []} onAdd={addTask} onToggle={toggleTask}/>
          <RoomNudges roomId={r.id} />
          <RoomProofs roomId={r.id} />
        </div>
      ))}
      </div>
      </main>
      <BackButton />
    </>
  )
}

function RoomTasks({ roomId, tasks, onAdd, onToggle }:{
  roomId: string; tasks: Task[]; onAdd: (roomId:string, text:string)=>void; onToggle:(task:Task)=>void
}) {
  const [text, setText] = useState('')
  return (
    <div className="mt-4">
      <form onSubmit={e=>{ e.preventDefault(); if(text.trim()) { onAdd(roomId, text); setText('') }}} className="flex gap-2">
        <input 
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2"
          placeholder="Add a task (e.g., Map shade gaps)"
          value={text} 
          onChange={e=>setText(e.target.value)} 
        />
        <button className="badge" type="submit">Add Task</button>
      </form>
      <ul className="mt-3 grid gap-2">
        {tasks.map(t => (
          <li key={t.id} className="space-y-2">
            <div className="flex items-center gap-3">
              <button onClick={()=>onToggle(t)} className="badge">
                {t.status === 'done' ? '✅' : '⬜️'}
              </button>
              <span className={t.status==='done' ? 'line-through opacity-70' : ''}>{t.title}</span>
              {t.assignee && <span className="text-xs opacity-70 ml-auto">→ {t.assignee}</span>}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 ml-8">
              <input className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                     placeholder="Assignee (name/email)"
                     defaultValue={t.assignee || ''}
                     onBlur={e=>{
                       fetch(`/api/tasks/${t.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'},
                         body: JSON.stringify({ assignee: e.target.value || null }) })
                     }}/>

              <input type="date" className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                     defaultValue={t.due_date?.slice(0,10) || ''}
                     aria-label="Due date"
                     onChange={e=>{
                       fetch(`/api/tasks/${t.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'},
                         body: JSON.stringify({ due_date: e.target.value || null }) })
                     }}/>

              <select className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                      defaultValue={t.priority || 'med'}
                      aria-label="Priority level"
                      onChange={e=>{
                        fetch(`/api/tasks/${t.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'},
                          body: JSON.stringify({ priority: e.target.value }) })
                      }}>
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>

              <button className="badge" onClick={async ()=>{
                const reason = prompt('Reason for nudge?') || 'Please take a look'
                const res = await fetch('/api/nudges', {
                  method:'POST', headers:{'Content-Type':'application/json'},
                  body: JSON.stringify({ roomId: roomId, taskId: t.id, assignee: t.assignee || 'unassigned', reason })
                })
                if (!res.ok) alert('Nudge failed'); else alert('Nudge queued')
              }}>Nudge</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RoomNudges({ roomId }: { roomId: string }) {
  const [rows, setRows] = useState<any[]>([])
  useEffect(()=>{
    let alive = true
    async function load(){ 
      const r = await fetch(`/api/nudges?roomId=${roomId}`)
      const j = await r.json()
      if(alive) setRows(j) 
    }
    load()
    const t = setInterval(load, 10000)
    return ()=>{ alive=false; clearInterval(t) }
  },[roomId])

  if (!rows.length) return null
  return (
    <div className="mt-3 text-xs flex flex-col gap-1">
      {rows.slice(0,6).map(n =>
        <div key={n.id} className="opacity-80">
          <span className="badge mr-2">{n.status}</span>
          <b>{n.assignee}</b>: {n.reason}
          <span className="opacity-60 ml-2">{new Date(n.created_at).toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}