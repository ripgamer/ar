'use client'

import { useState } from 'react'
import { HolographicCard } from '@/components/HolographicCard'
import { WebARHolographicCard } from '@/components/WebARHolographicCard'

export default function Home() {
  const [showAR, setShowAR] = useState(false)

  return (
    <main className="min-h-screen bg-[#333844]">
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => setShowAR(!showAR)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {showAR ? 'Show Regular View' : 'Show 3D View'}
        </button>
      </div>
      
      {showAR ? (
        <WebARHolographicCard />
      ) : (
        <div className="w-full h-screen flex items-center justify-center">
          <HolographicCard />
        </div>
      )}
    </main>
  )
}

