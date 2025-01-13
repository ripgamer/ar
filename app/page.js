'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { HolographicCard } from '@/components/HolographicCard'

// Dynamically import AR component to avoid SSR issues
const WebARHolographicCard = dynamic(
  () => import('@/components/WebARHolographicCard').then(mod => mod.WebARHolographicCard),
  { ssr: false }
)

export default function Home() {
  const [showAR, setShowAR] = useState(false)

  return (
    <main className="min-h-screen bg-[#333844]">
      {!showAR && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <button 
            onClick={() => setShowAR(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Start AR Experience
          </button>
        </div>
      )}
      
      {showAR ? (
        <>
          <button 
            onClick={() => setShowAR(false)}
            className="fixed top-4 right-4 z-50 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Exit AR
          </button>
          <WebARHolographicCard />
        </>
      ) : (
        <div className="w-full h-screen flex items-center justify-center">
          <HolographicCard />
        </div>
      )}
    </main>
  )
}

