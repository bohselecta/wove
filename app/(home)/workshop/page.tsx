'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SectionHeader from '../../../components/SectionHeader'
import BackButton from '../../../components/BackButton'

type Template = {
  id: string
  title: string
  summary: string
  tags: string[]
  defaultPlan?: {
    title: string
    summary: string
    ifue?: { impact:number, feasibility:number, urgency:number, equity:number }
  }
}

export default function WorkshopPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/workshop/templates').then(r => r.json()).then(setTemplates)
  }, [])

  async function applyTemplate(t: Template, createRoom = true) {
    setBusy(t.id)
    const res = await fetch('/api/workshop/use-template', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ templateId: t.id, createRoom })
    })
    setBusy(null)
    const data = await res.json()
    if (!res.ok) return alert(data?.error || 'Failed to create plan')
    if (data?.roomUrl) router.push(data.roomUrl)
    else if (data?.planId) router.push('/dashboard') // fallback
  }

  return (
    <>
      <SectionHeader
        title="The Workshop"
        subtitle="Make and share useful digital goods. Turn patterns and lessons into actionable Weave Plans."
        image="/images/headers/workshop.jpg"
      />

      <main className="w-full px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        <section className="card">
          <h2 className="font-display text-lg mb-2">Template Gallery</h2>
          <p className="opacity-80">Start from a proven recipe, then edit the plan in the Guidance Engine and coordinate in a Common Room.</p>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          {templates.map(t => (
            <article key={t.id} className="card">
              <h3 className="font-display text-lg">{t.title}</h3>
              <p className="opacity-90 mt-1">{t.summary}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {t.tags.map(tag => <span key={tag} className="badge">{tag}</span>)}
              </div>
              <div className="mt-3 flex gap-2">
                <button className="badge" disabled={busy===t.id} onClick={()=>applyTemplate(t,true)}>
                  {busy===t.id ? 'Creating…' : 'Use this template'}
                </button>
                <button className="badge" disabled={busy===t.id} onClick={()=>applyTemplate(t,false)}>
                  {busy===t.id ? 'Working…' : 'Create plan only'}
                </button>
              </div>
            </article>
          ))}
          {templates.length===0 && <div className="opacity-70">Loading templates…</div>}
        </section>
      </main>
      <BackButton />
    </>
  )
}
