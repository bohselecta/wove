'use client'
import Image from 'next/image'
import Link from 'next/link'
import Navigation from './Navigation'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs'

export default function LandingHeader() {
  return (
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
  )
}
