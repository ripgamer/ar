'use client'

import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'

export function WebARHolographicCard() {
  const sceneRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if scripts are already loaded
      if (!document.querySelector('script[src*="aframe.min.js"]')) {
        const aframeScript = document.createElement('script')
        aframeScript.src = 'https://aframe.io/releases/1.4.0/aframe.min.js'
        aframeScript.async = true
        document.body.appendChild(aframeScript)

        aframeScript.onload = () => {
          const arScript = document.createElement('script')
          arScript.src = 'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js'
          arScript.async = true
          document.body.appendChild(arScript)

          arScript.onload = () => {
            setIsLoaded(true)
          }
        }
      } else {
        setIsLoaded(true)
      }
    }

    return () => {
      const scripts = document.querySelectorAll('script[src*="aframe"], script[src*="ar.js"]')
      scripts.forEach(script => script.remove())
    }
  }, [])

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white">
        Loading AR Experience...
      </div>
    )
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover" />
      </Head>

      <div style={{ height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0 }}>
        <a-scene
          ref={sceneRef}
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
          renderer="logarithmicDepthBuffer: true; antialias: true; alpha: true"
          vr-mode-ui="enabled: false"
        >
          <a-marker preset="hiro" smooth="true" smoothCount="10">
            <a-entity
              position="0 0.1 0"
              rotation="-90 0 0"
            >
              <a-plane
                width="1"
                height="1.4"
                material="shader: flat; src: https://assets.codepen.io/13471/charizard-gx.webp; transparent: true; opacity: 1"
              ></a-plane>
            </a-entity>
          </a-marker>

          <a-entity camera></a-entity>
        </a-scene>

        {/* Instructions */}
        <div className="fixed top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded z-50">
          <p className="mb-2">Show the Hiro marker to your camera:</p>
          <a 
            href="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/HIRO.jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
            download="hiro-marker.jpg"
          >
            Download Hiro Marker
          </a>
        </div>
      </div>
    </>
  )
}

