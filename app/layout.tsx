import './globals.css'
import type { Metadata } from 'next'

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
            <div className="font-display text-lg tracking-wide">🕸️ Wove</div>
            <nav className="flex gap-4 text-sm">
              <a href="/" className="hover:underline">The Loom</a>
              <a href="/dashboard" className="hover:underline">Dashboard</a>
              <a href="/library" className="hover:underline">The Library</a>
              <a href="/workshop" className="hover:underline">The Workshop</a>
              <a href="/commons" className="hover:underline">The Commons</a>
              <a href="/park" className="hover:underline">The Park</a>
              <a href="/bank" className="hover:underline">The Bank</a>
              <a href="/observatory" className="hover:underline">The Observatory</a>
            </nav>
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
