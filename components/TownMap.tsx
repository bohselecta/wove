'use client'
import Image from 'next/image'
import Link from 'next/link'
import TownMapOverlay from './TownMapOverlay'

export default function TownMap() {
  return (
    <section aria-label="Wove town map"
      className="relative w-full h-[78vh] min-h-[560px] rounded-2xl overflow-hidden border border-white/10">
      <Image
        src="/images/wove-town-hero.jpg"
        alt="Bird's-eye view of Wove nestled in green hills under a mountain horizon"
        fill 
        priority 
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />
      <TownMapOverlay />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      
      {/* Floating Logo */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <Image
          src="/images/thewove-typelogo.png"
          alt="The Wove"
          width={400}
          height={120}
          className="animate-float opacity-90"
          style={{ 
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
            animation: 'float 4s ease-in-out infinite'
          }}
        />
      </div>
      
      <Link href="/dashboard"
        className="absolute bottom-4 right-4 rounded-full px-4 py-2 bg-white/10 backdrop-blur border border-white/20 text-sm hover:bg-white/15 transition-colors">
        Open Dashboard →
      </Link>
    </section>
  )
}
