'use client'
import { useEffect, useState } from 'react'
import SectionHeader from '../../../components/SectionHeader'
import BackButton from '../../../components/BackButton'

type Story = {
  id: string; plan_id?: string|null; room_id?: string|null;
  title: string; body: string; created_at: string;
  gi_delta_planet: number; gi_delta_people: number; gi_delta_democracy: number; gi_delta_learning: number;
}
type Room = { id: string; title: string }

export default function ParkPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  async function loadStories(){ setStories(await fetch('/api/stories').then(r=>r.json())) }
  async function loadRooms(){ setRooms(await fetch('/api/common_rooms').then(r=>r.json())) }

  useEffect(()=>{ loadStories(); loadRooms() }, [])

  async function createStory() {
    if (!selectedRoom) return
    setIsCreating(true)
    const r = await fetch('/api/stories/create', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ roomId: selectedRoom })
    })
    setIsCreating(false)
    if (r.ok) { await loadStories(); setSelectedRoom('') }
  }

  return (
    <>
      <SectionHeader
        title="The Park"
        subtitle="Stories & celebrations of progress—turn threads into narratives."
        image="/images/headers/park.jpg"
      />
      <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-6">
        <section className="card">
        <h1 className="text-2xl font-display mb-2">The Park — Stories & Celebrations</h1>
        <div className="flex items-center gap-3">
          <select className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                  value={selectedRoom} onChange={e=>setSelectedRoom(e.target.value)}
                  aria-label="Select a common room">
            <option value="">Choose a Common Room…</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
          <button className="badge" disabled={!selectedRoom || isCreating} onClick={createStory}>
            {isCreating ? 'Creating…' : 'Create Story'}
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        {stories.map(s => (
          <article key={s.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-lg">{s.title}</h2>
              <time className="text-xs opacity-70">{new Date(s.created_at).toLocaleString()}</time>
            </div>
            <p className="mt-2 opacity-90">{s.body}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="badge">Planet +{s.gi_delta_planet}</span>
              <span className="badge">People +{s.gi_delta_people}</span>
              <span className="badge">Democracy +{s.gi_delta_democracy}</span>
              <span className="badge">Learning +{s.gi_delta_learning}</span>
            </div>
          </article>
        ))}
        {stories.length===0 && <div className="opacity-70">No stories yet — create one from a Common Room.</div>}
      </section>
      </div>
      </main>
      <BackButton />
    </>
  )
}