'use client'

import { useState } from 'react'
import { HolographicCard } from '@/components/HolographicCard'
import { WebARHolographicCard } from '@/components/WebARHolographicCard'

export default function Home() {
  const [showAR, setShowAR] = useState(false)

  return (
    <main className="min-h-screen bg-[#333844] flex flex-col items-center justify-center p-4">
      <button 
        onClick={() => setShowAR(!showAR)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {showAR ? 'Show Regular View' : 'Show AR View'}
      </button>
      
      {showAR ? (
        <WebARHolographicCard />
      ) : (
        <HolographicCard />
      )}
    </main>
  )
}

