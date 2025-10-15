'use client'
import { useEffect, useState } from 'react'
import RoomProofs from '../../components/RoomProofs'

type Room = { id:string; title:string; plan_id?:string; status:string; created_at:string }
type Task = { id:string; room_id:string; title:string; status:string; assignee?:string|null; due?:string|null; created_at:string }

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
              <p className="text-xs opacity-70">Status: {r.status} • Created {new Date(r.created_at).toLocaleString()}</p>
            </div>
            <button className="badge" onClick={()=>loadTasks(r.id)}>Load Tasks</button>
          </div>
          <RoomTasks roomId={r.id} tasks={tasks[r.id] || []} onAdd={addTask} onToggle={toggleTask}/>
          <RoomProofs roomId={r.id} />
        </div>
      ))}
    </div>
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
          <li key={t.id} className="flex items-center gap-3">
            <button onClick={()=>onToggle(t)} className="badge">
              {t.status === 'done' ? '✅' : '⬜️'}
            </button>
            <span className={t.status==='done' ? 'line-through opacity-70' : ''}>{t.title}</span>
            {t.assignee && <span className="text-xs opacity-70 ml-auto">→ {t.assignee}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}