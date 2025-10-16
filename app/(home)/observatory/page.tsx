'use client'
import { useEffect, useState } from 'react'
import { Observatory } from '../../../components/Observatory'
import SectionHeader from '../../../components/SectionHeader'

export default function ObservatoryPage() {
  const [isIngesting, setIsIngesting] = useState(false)
  const [lastIngest, setLastIngest] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleIngest = async () => {
    setIsIngesting(true)
    try {
      const response = await fetch('/api/ingest')
      const result = await response.json()
      
      if (result.success) {
        setLastIngest(new Date().toLocaleString())
        // Trigger refresh of Observatory component
        setRefreshKey(prev => prev + 1)
      } else {
        alert('Failed to ingest signals')
      }
    } catch (error) {
      console.error('Error ingesting:', error)
      alert('Error ingesting signals')
    } finally {
      setIsIngesting(false)
    }
  }

  return (
    <>
      <SectionHeader
        title="The Observatory"
        subtitle="Trusted global patterns—fresh signals, filter by what matters."
        image="/images/headers/observatory.jpg"
      />
      <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display mb-2">The Observatory — Trusted Global Patterns</h1>
              <p className="opacity-80">Live map of verified signals from trusted sources worldwide.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleIngest}
                disabled={isIngesting}
                className="badge hover:bg-white/15 transition-colors disabled:opacity-50"
              >
                {isIngesting ? 'Ingesting...' : 'Refresh Signals'}
              </button>
              {lastIngest && (
                <span className="text-xs opacity-70">
                  Last updated: {lastIngest}
                </span>
              )}
            </div>
          </div>
        </div>

      <div className="card">
        <h2 className="text-xl font-display mb-4">Live Signal Feed</h2>
        <Observatory key={refreshKey} />
      </div>

      <div className="card">
        <h3 className="text-lg font-medium mb-3">About the Observatory</h3>
        <div className="space-y-3 text-sm opacity-80">
          <p>
            The Observatory continuously monitors trusted sources for patterns that impact our collective wellbeing:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Climate Action:</strong> Environmental progress and sustainability initiatives</li>
            <li><strong>Education Access:</strong> Learning opportunities and digital equity</li>
            <li><strong>Public Health:</strong> Community wellbeing and healthcare innovations</li>
            <li><strong>Civic Participation:</strong> Democratic engagement and governance</li>
            <li><strong>Sustainable Food Systems:</strong> Food security and agricultural practices</li>
          </ul>
          <p>
            Each signal is scored across four dimensions of the Good Index (GI): Planet, People, Democracy, and Learning.
            These patterns inform the Guidance Engine to create contextually relevant Weave Plans.
          </p>
        </div>
      </div>
      </div>
      </main>
    </>
  )
}
