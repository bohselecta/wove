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
      <html lang="en" className="h-full">
        <body className="h-full font-body flex flex-col">
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
