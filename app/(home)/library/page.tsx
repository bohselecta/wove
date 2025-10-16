'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import SectionHeader from '@/components/SectionHeader'
import BackButton from '@/components/BackButton'

type Lesson = {
  id: string; title: string; summary?: string; content?: string;
  tags?: string; created_at: string; created_by?: string
}

export default function LibraryPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [form, setForm] = useState({ title:'', summary:'', content:'', tags:'' })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (tag) params.set('tag', tag)
    const res = await fetch('/api/library' + (params.toString() ? `?${params}` : ''))
    setLessons(await res.json())
  }, [q, tag])
  
  useEffect(() => { load() }, [load])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    lessons.forEach(l => (l.tags || '').split(',').map(t=>t.trim()).filter(Boolean).forEach(t=>set.add(t)))
    return Array.from(set).sort()
  }, [lessons])

  async function createLesson(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const res = await fetch('/api/library', {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        title: form.title, summary: form.summary, content: form.content,
        tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean)
      })
    })
    setBusy(false)
    if (res.ok) {
      setForm({ title:'', summary:'', content:'', tags:'' })
      await load()
    } else {
      console.warn('Create failed', await res.json())
    }
  }

  return (
    <>
      <SectionHeader
        title="The Library"
        subtitle="Lessons, guides, and knowledge you can remix into Weave Plans."
        image="/images/headers/library.jpg"
      />

      <div className="w-full px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Filters */}
        <section className="card">
          <div className="grid md:grid-cols-3 gap-3">
            <input
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
              placeholder="Search lessons…"
              value={q} onChange={e=>setQ(e.target.value)}
            />
            <select
              className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
              value={tag} onChange={e=>setTag(e.target.value)}
              aria-label="Filter by tag"
            >
              <option value="">All tags</option>
              {allTags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <a href="/workshop" className="badge text-center">Open Workshop →</a>
          </div>
        </section>

        {/* Composer */}
        <section className="card">
          <h2 className="font-display text-lg mb-2">Add a Lesson</h2>
          <form onSubmit={createLesson} className="grid gap-3">
            <input className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                   placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
            <input className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                   placeholder="Summary" value={form.summary} onChange={e=>setForm({...form, summary:e.target.value})}/>
            <textarea className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 min-h-[120px]"
                      placeholder="Content (Markdown ok)"
                      value={form.content} onChange={e=>setForm({...form, content:e.target.value})}/>
            <input className="rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                   placeholder="Tags (comma-separated, e.g. climate, trees, governance)"
                   value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})}/>
            <div className="flex gap-2">
              <button className="badge" disabled={busy || !form.title.trim()}>
                {busy ? 'Saving…' : 'Save Lesson'}
              </button>
            </div>
          </form>
        </section>

        {/* Lessons grid */}
        <section className="grid md:grid-cols-2 gap-4">
          {lessons.map(l => (
            <article key={l.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg">{l.title}</h3>
                <time className="text-xs opacity-70">{new Date(l.created_at).toLocaleString()}</time>
              </div>
              {l.summary && <p className="opacity-90 mt-2">{l.summary}</p>}
              {l.tags && <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {l.tags.split(',').map(t => <span key={t} className="badge">{t.trim()}</span>)}
              </div>}
              <div className="mt-3 flex gap-2">
                <a className="underline opacity-90" href="#" onClick={(e)=>{e.preventDefault(); alert(l.content || '(no content)')}}>
                  Read content
                </a>
                <button
                  className="badge"
                  onClick={async ()=>{
                    const res = await fetch('/api/workshop/use-lesson', {
                      method:'POST', headers:{'Content-Type':'application/json'},
                      body: JSON.stringify({ lessonId: l.id, createRoom: true })
                    })
                    const data = await res.json()
                    if (res.ok && data.roomUrl) location.href = data.roomUrl
                    else alert(data.error || 'Could not create from lesson')
                  }}
                >
                  Use in Workshop →
                </button>
              </div>
            </article>
          ))}
          {lessons.length === 0 && (
            <div className="opacity-70">No lessons yet — add your first one above.</div>
          )}
        </section>
      </div>
      <BackButton />
    </>
  )
}
