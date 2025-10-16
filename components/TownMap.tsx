'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TownMapOverlay from './TownMapOverlay'

export default function TownMap() {
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
      <section aria-label="Wove town map"
        className="relative w-full max-w-[1600px] mx-auto rounded-2xl overflow-hidden border border-white/10">
      <div className="relative w-full h-auto min-h-[400px]">
        <Image
          src="/images/wove-town-hero.jpg"
          alt="Bird's-eye view of Wove nestled in green hills under a mountain horizon"
          fill 
          priority 
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        
        {/* SVG Overlay with all interactive elements */}
        <TownMapOverlay />
        
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        
        {/* Floating Action Buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-3">
          <button
            onClick={startWeave}
            disabled={busy}
            className="rounded-full px-4 py-2 bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 transition-colors"
          >
            {busy ? 'Starting…' : 'Start a Weave'}
          </button>
          <Link href="/dashboard" className="rounded-full px-4 py-2 bg-white/10 backdrop-blur border border-white/20 text-sm hover:bg-white/15 transition-colors text-center">
            Open Dashboard →
          </Link>
        </div>
      </div>
    </section>
    </>
  )
}
