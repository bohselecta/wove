'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TownMap from '../../components/TownMap'

export default function Home() {
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function startWeave() {
    setBusy(true)
    const res = await fetch('/api/onboarding/start', { method: 'POST' })
    const data = await res.json()
    setBusy(false)
    if (data?.url) router.push(data.url)
  }

  return (
    <TownMap />
  )
}
