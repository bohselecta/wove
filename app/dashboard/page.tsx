import Link from 'next/link'
import { Observatory } from '../../components/Observatory'
import { GuidanceEngine } from '../../components/GuidanceEngine'
import { Loom } from '../../components/Loom'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-display mb-2">Dashboard — Your Working View</h1>
        <p className="opacity-80">Monitor patterns, track Weave Plans, and manage your needs.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <section className="md:col-span-2 card">
          <h2 className="text-xl font-display mb-2">Observatory</h2>
          <p className="opacity-80 mb-4">Live map of patterns: verified signals + local activity.</p>
          <Observatory />
        </section>
        
        <aside className="card">
          <h2 className="text-xl font-display mb-2">Guidance Engine</h2>
          <p className="opacity-80 mb-4">AI-guided Weave Plans ranked by impact, feasibility, urgency, equity.</p>
          <GuidanceEngine />
        </aside>
        
        <section className="md:col-span-3 card">
          <h2 className="text-xl font-display mb-2">Your Loom</h2>
          <Loom />
          <div className="mt-4 flex gap-3 text-sm">
            <Link href="/commons" className="badge">Go to Commons</Link>
            <Link href="/workshop" className="badge">Open Workshop</Link>
            <Link href="/library" className="badge">Browse Library</Link>
          </div>
        </section>
      </div>
    </div>
  )
}
