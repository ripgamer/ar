'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { HolographicCard } from './HolographicCard'

export function WebARHolographicCard() {
  const sceneRef = useRef(null)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)

  const handleScriptsLoaded = () => {
    setScriptsLoaded(true)
  }

  return (
    <>
      <Script 
        src="https://aframe.io/releases/1.4.0/aframe.min.js"
        strategy="beforeInteractive"
        onLoad={() => {
          // Load AR.js after A-Frame is loaded
          const arScript = document.createElement('script')
          arScript.src = 'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js'
          arScript.onload = handleScriptsLoaded
          document.body.appendChild(arScript)
        }}
      />

      <div className="relative w-full min-h-screen">
        {/* Regular card view */}
        <div className="absolute top-0 left-0 w-1/2 h-screen flex items-center justify-center">
          <HolographicCard />
        </div>
        
        {/* AR view */}
        <div className="absolute top-0 right-0 w-1/2 h-screen">
          {scriptsLoaded && (
            <div ref={sceneRef} style={{ width: '100%', height: '100%' }}>
              <a-scene
                embedded
                arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
                vr-mode-ui="enabled: false"
              >
                <a-assets>
                  <img 
                    id="card-texture" 
                    src="https://assets.codepen.io/13471/charizard-gx.webp" 
                    crossOrigin="anonymous"
                  />
                </a-assets>

                <a-marker preset="hiro">
                  <a-plane
                    position="0 0 0"
                    rotation="-90 0 0"
                    width="1"
                    height="1.4"
                    material="src: #card-texture; transparent: true;"
                  ></a-plane>
                </a-marker>

                <a-entity camera></a-entity>
              </a-scene>
            </div>
          )}

          {/* Download marker message */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded">
            <p>Print or display the Hiro marker:</p>
            <a 
              href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/HIRO.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Download Hiro Marker
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

