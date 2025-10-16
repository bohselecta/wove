'use client'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from './Navigation'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
      <header className="sticky top-0 z-50 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image
                src="/images/wove-logo.svg"
                alt="Wove"
                width={120}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Navigation />
            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="rounded-full px-4 py-2 bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>
      
      <section aria-label="Wove town map"
        className="relative w-full max-w-[1600px] mx-auto rounded-2xl overflow-hidden border border-white/10">
      <div className="relative w-full aspect-[16/9] max-h-[78vh]">
        <Image
          src="/images/wove-town-hero.jpg"
          alt="Bird's-eye view of Wove nestled in green hills under a mountain horizon"
          fill 
          priority 
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        
        {/* SVG Overlay with all interactive elements */}
        <object 
          data="/images/wove-map-overlay.svg" 
          type="image/svg+xml" 
          className="absolute inset-0 w-full h-full pointer-events-auto" 
        />
        
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
    
    <footer className="mx-auto max-w-6xl px-4 h-[50px] flex items-center text-xs opacity-70">
      <p>© {new Date().getFullYear()} Wove — What we weave is what we wove.</p>
    </footer>
    </>
  )
}
