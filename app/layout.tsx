import './globals.css'
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "Wove — The Living Weave",
  description: "A virtual small town for doing measurable good.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-dvh bg-[#0f1115] text-zinc-100 font-body">
          {/* Content flows naturally */}
          {children}

          {/* Footer flows naturally below content */}
          <footer className="border-t border-white/10">
            <div className="mx-auto max-w-screen-xl px-4 py-3
                            flex items-center gap-3 text-xs text-white/70
                            whitespace-nowrap overflow-hidden">
              <span className="truncate">© {new Date().getFullYear()} Wove — What we weave is what we wove.</span>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  )
}
