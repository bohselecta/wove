'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TownMap from '../components/TownMap'

export default function Home() {
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function startWeave() {
    setBusy(true)
    const res = await fetch('/api/onboarding/start', { method: 'POST' })
    const data = await res.json()
    setBusy(false)
    if (data?.url) router.push(data.url)
  }

  return (
    <>
      <TownMap />
      <div className="mt-4 flex gap-3 justify-end">
        <button
          onClick={startWeave}
          disabled={busy}
          className="rounded-full px-4 py-2 bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15"
        >
          {busy ? 'Starting…' : 'Start a Weave'}
        </button>
        <a href="/dashboard" className="rounded-full px-4 py-2 bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15">
          Open Dashboard →
        </a>
      </div>
    </>
  )
}
