'use client'
import Link from 'next/link'

export default function BackButton() {
  return (
    <Link 
      href="/"
      className="fixed bottom-4 right-4 z-50 rounded-full p-3 bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 transition-colors"
      aria-label="Back to map"
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-white"
      >
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </Link>
  )
}
