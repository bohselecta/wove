import './globals.css'
import type { Metadata } from 'next'
import Image from 'next/image'
import Navigation from '../components/Navigation'

export const metadata: Metadata = {
  title: "Wove — The Living Loom",
  description: "A virtual small town for doing measurable good.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-body">
        <header className="sticky top-0 z-50 backdrop-blur bg-black/30 border-b border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/images/wove-logo.svg"
                alt="Wove"
                width={120}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </div>
            <Navigation />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-xs opacity-70">
          <p>© {new Date().getFullYear()} Wove — What we weave is what we wove.</p>
        </footer>
      </body>
    </html>
  )
}
