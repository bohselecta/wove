'use client'
import { useState } from 'react'
import Link from 'next/link'

const navigationItems = [
  { href: '/' as const, label: 'The Loom' },
  { href: '/dashboard' as const, label: 'Dashboard' },
  { href: '/library' as const, label: 'The Library' },
  { href: '/workshop' as const, label: 'The Workshop' },
  { href: '/commons' as const, label: 'The Commons' },
  { href: '/park' as const, label: 'The Park' },
  { href: '/bank' as const, label: 'The Bank' },
  { href: '/observatory' as const, label: 'The Observatory' },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="relative z-50 flex flex-col items-center justify-center w-8 h-8 space-y-1 focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen ? 'true' : 'false'}
      >
        <span
          className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
            isOpen ? 'rotate-45 translate-y-1.5' : ''
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${
            isOpen ? '-rotate-45 -translate-y-1.5' : ''
          }`}
        />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Navigation Menu */}
      <nav
        className={`fixed top-0 right-0 z-40 h-full w-80 bg-black/95 backdrop-blur-md border-l border-white/10 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full pt-20 px-6">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="block px-4 py-3 text-lg font-medium text-white hover:bg-white/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="mt-auto pb-8">
            <div className="border-t border-white/10 pt-6">
              <p className="text-sm text-white/70 px-4">
                Navigate through Wove&apos;s civic districts
              </p>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
