'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

/** Overlay uses a 1600x900 viewBox. Positions match the hero render. */
export default function TownMapOverlay() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  return (
            <svg
              viewBox="0 0 1600 900"
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="xMidYMid slice"
              aria-label="Interactive navigation overlay for Wove"
              role="img"
            >
      <style>{`
        .label { fill: #fff; font: 600 20px/1.2 Inter, system-ui, sans-serif; paint-order: stroke; stroke: rgba(0,0,0,.35); stroke-width: 3; }
        .dot  { fill: #fff; stroke: #ffffffaa; stroke-width: 3; }
        .ring { fill: none; stroke: #ffffff66; stroke-width: 3; }
        /* Mobile: hide labels, keep dots large */
        @media (max-width: 768px) { .label { display: none } .dot { r: 10 } }
        /* Larger, invisible hit halos for touch */
        .halo { fill: transparent; stroke: transparent; stroke-width: 44; }
        a:focus-visible .dot { outline: 3px solid #4ea1ff; outline-offset: 4px }
      `}</style>

              {[
                // Left hill, centered on the dome's ridge
                { x: 200, y: 520, href: '/observatory' as const, text: 'Observatory' },

                // Central stone hall (main building)
                { x: 760, y: 520, href: '/library' as const, text: 'Library' },

                // Front-left cottages cluster
                { x: 340, y: 720, href: '/workshop' as const, text: 'Workshop' },

                // Lower middle path, just left of the bridge
                { x: 600, y: 760, href: '/commons' as const, text: 'Commons' },

                // Right-center manor near river bend
                { x: 1060, y: 620, href: '/bank' as const, text: 'Bank' },

                // Open lawn by the right riverbank
                { x: 920, y: 740, href: '/park' as const, text: 'Park' },

                // Slightly right of central hall, near trees
                { x: 820, y: 590, href: '/' as const, text: 'The Wove' },
              ].map(({ x, y, href, text }) => (
                <Link key={href} href={href} aria-label={text}>
                  {/* group preserves keyboard focus in Safari/iOS */}
                  <g transform={`translate(${x},${y})`} className="cursor-pointer">
                    <circle className="halo" r="22" />
                    <circle className="ring" r="18">
                      {!prefersReducedMotion && (
                        <>
                          <animateTransform
                            attributeName="transform"
                            type="scale"
                            values="1;1.25;1"
                            dur="2.4s"
                            repeatCount="indefinite"
                            additive="sum"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.8;0.2;0.8"
                            dur="2.4s"
                            repeatCount="indefinite"
                          />
                        </>
                      )}
                    </circle>
                    <circle className="dot" r="8" />
                    <text className="label" x="22" y="8">{text}</text>
                  </g>
                </Link>
              ))}

            </svg>
  )
}
