'use client'
import Link from 'next/link'

/** Overlay uses a 1600x900 viewBox. Positions match the hero render. */
export default function TownMapOverlay() {
  return (
    <svg
      viewBox="0 0 1600 900"
      className="absolute inset-0 w-full h-full"
      aria-label="Interactive navigation overlay for Wove"
      role="img"
      preserveAspectRatio="xMidYMid slice"
    >
      <style>{`
        .label { fill: #fff; font: 600 20px/1.2 Inter, system-ui, sans-serif; paint-order: stroke; stroke: rgba(0,0,0,.35); stroke-width: 3; }
        .dot  { fill: #fff; stroke: #ffffffaa; stroke-width: 3; }
        .ring { fill: none; stroke: #ffffff66; stroke-width: 3; }
        .pulse { transform-origin: 0px 0px; animation: pulse 2.4s ease-in-out infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 0.8 } 60% { transform: scale(1.25); opacity: 0.2 } 100% { transform: scale(1); opacity: 0.8 } }
        @media (prefers-reduced-motion: reduce) { .pulse { animation: none } }
        /* Mobile: hide labels, keep dots large */
        @media (max-width: 768px) { .label { display: none } .dot { r: 10 } }
        /* Larger, invisible hit halos for touch */
        .halo { fill: transparent; stroke: transparent; stroke-width: 44; }
        a:focus-visible .dot { outline: 3px solid #4ea1ff; outline-offset: 4px }
      `}</style>

              {[
                { x: 210,  y: 270,  href: '/observatory' as const, text: 'Observatory' },
                { x: 640,  y: 510,  href: '/library' as const,      text: 'Library' },
                { x: 280,  y: 690,  href: '/workshop' as const,     text: 'Workshop' },
                { x: 540,  y: 730,  href: '/commons' as const,      text: 'Commons' },
                { x: 880,  y: 700,  href: '/park' as const,         text: 'Park' },
                { x: 970,  y: 630,  href: '/bank' as const,         text: 'Bank' },
                { x: 740,  y: 560,  href: '/' as const,             text: 'The Loom' },
              ].map(({ x, y, href, text }) => (
        <Link key={href} href={href} aria-label={text}>
          {/* group preserves keyboard focus in Safari/iOS */}
          <g transform={`translate(${x},${y})`} className="cursor-pointer">
            <circle className="halo" r="22" />
            <circle className="ring pulse" r="18" />
            <circle className="dot" r="8" />
            <text className="label" x="22" y="8">{text}</text>
          </g>
        </Link>
      ))}
    </svg>
  )
}
