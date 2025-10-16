'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Observatory } from '../../../components/Observatory'
import { GuidanceEngine } from '../../../components/GuidanceEngine'
import { Loom } from '../../../components/Loom'
import SectionHeader from '../../../components/SectionHeader'
import BackButton from '../../../components/BackButton'

type Signal = {
  id: string
  source: string
  topic: string
  time: string
  claim: string
  gi: { planet: number, people: number, democracy: number, learning: number }
}

type Friction = {
  id: string
  text: string
  createdAt: string
}

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [frictions, setFrictions] = useState<Friction[]>([])
  const [allLessons, setAllLessons] = useState<any[]>([])
  const [selectedNeed, setSelectedNeed] = useState<string>('')
  const [selectedSignals, setSelectedSignals] = useState<string[]>([])
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([])
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const [showPlanForm, setShowPlanForm] = useState(false)

  useEffect(() => {
    // Fetch signals, frictions, and lessons for plan creation
    Promise.all([
      fetch('/api/signals/top').then(r => r.json()),
      fetch('/api/frictions').then(r => r.json()),
      fetch('/api/library').then(r => r.json())
    ]).then(([signalsData, frictionsData, lessonsData]) => {
      setSignals(signalsData)
      setFrictions(frictionsData)
      setAllLessons(lessonsData)
    }).catch(console.error)
  }, [])

  const handleCreatePlan = async () => {
    if (!selectedNeed || selectedSignals.length === 0) {
      alert('Please select a need and at least one signal')
      return
    }

    setIsCreatingPlan(true)
    try {
      const response = await fetch('/api/recipes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          needId: selectedNeed,
          signalIds: selectedSignals,
          lessonIds: selectedLessonIds
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create plan')
      }

      const newPlan = await response.json()
      console.log('Created plan:', newPlan)
      
      // Reset form and refresh page
      setSelectedNeed('')
      setSelectedSignals([])
      setSelectedLessonIds([])
      setShowPlanForm(false)
      
      // Refresh the page to show new plan
      window.location.reload()
    } catch (error) {
      console.error('Error creating plan:', error)
      alert('Failed to create Weave Plan. Please try again.')
    } finally {
      setIsCreatingPlan(false)
    }
  }

  return (
    <>
      <SectionHeader
        title="Dashboard"
        subtitle="Live view: Signals → Plans → Rooms—what needs attention now."
        image="/images/headers/dashboard.jpg"
      />
      <main className="w-full px-4 py-6">
      <div className="space-y-6">
        <div className="card">
          <h1 className="text-2xl font-display mb-2">The Wove — Live View</h1>
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
          <h2 className="text-xl font-display mb-2">Your Wove</h2>
          <Loom />
          
          {/* Create Weave Plan Section */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-lg font-medium mb-3">Create Weave Plan</h3>
            
            {!showPlanForm ? (
              <button 
                onClick={() => setShowPlanForm(true)}
                className="badge hover:bg-white/15 transition-colors"
              >
                Create New Plan
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select a Need:</label>
                  <select 
                    value={selectedNeed} 
                    onChange={(e) => setSelectedNeed(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2"
                    aria-label="Select a need to address"
                  >
                    <option value="">Choose a need...</option>
                    {frictions.map(f => (
                      <option key={f.id} value={f.id}>{f.text}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Relevant Signals:</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {signals.slice(0, 5).map(signal => (
                      <label key={signal.id} className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedSignals.includes(signal.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSignals([...selectedSignals, signal.id])
                            } else {
                              setSelectedSignals(selectedSignals.filter(id => id !== signal.id))
                            }
                          }}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium">{signal.source}</div>
                          <div className="opacity-80 text-xs">{signal.claim}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Attach lessons (optional):</label>
                  <div className="flex flex-wrap gap-2">
                    {allLessons.slice(0,8).map((l:any)=>{
                      const on = selectedLessonIds.includes(l.id)
                      return (
                        <button key={l.id}
                          onClick={(e)=>{e.preventDefault(); setSelectedLessonIds(on ? selectedLessonIds.filter(x=>x!==l.id) : [...selectedLessonIds,l.id])}}
                          className={`badge ${on ? 'bg-white/20' : ''}`}>
                          {l.title}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleCreatePlan}
                    disabled={isCreatingPlan || !selectedNeed || selectedSignals.length === 0}
                    className="badge hover:bg-white/15 transition-colors disabled:opacity-50"
                  >
                    {isCreatingPlan ? 'Creating...' : 'Generate Weave Plan'}
                  </button>
                  <button 
                    onClick={() => setShowPlanForm(false)}
                    className="badge hover:bg-white/15 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex gap-3 text-sm">
            <Link href="/commons" className="badge">Go to Commons</Link>
            <Link href="/workshop" className="badge">Open Workshop</Link>
            <Link href="/library" className="badge">Browse Library</Link>
          </div>
        </section>
      </div>
      </div>
      </main>
      <BackButton />
    </>
  )
}
