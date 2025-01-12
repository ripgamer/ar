'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton'

export function WebARHolographicCard() {
  const containerRef = useRef(null)
  const [isARSupported, setIsARSupported] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!containerRef.current) return

    // Set up Three.js scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
    })
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.xr.enabled = true
    containerRef.current.appendChild(renderer.domElement)

    // Create AR button with simplified options
    const arButton = ARButton.createButton(renderer, {
      sessionInit: {
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
      }
    })
    document.body.appendChild(arButton)

    // Create card geometry (using aspect ratio of a typical trading card)
    const geometry = new THREE.PlaneGeometry(0.5, 0.7)

    // Load card texture
    const textureLoader = new THREE.TextureLoader()
    const material = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      metalness: 0.5,
      roughness: 0.2,
    })

    // Load the Charizard texture
    textureLoader.load('https://assets.codepen.io/13471/charizard-gx.webp', (texture) => {
      material.map = texture
      material.needsUpdate = true
    })

    // Create card mesh
    const card = new THREE.Mesh(geometry, material)
    card.position.set(0, 0, -1)
    scene.add(card)

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Animation loop
    renderer.setAnimationLoop((currentTime) => {
      card.rotation.y = Math.sin(currentTime * 0.001) * 0.1
      renderer.render(scene, camera)
    })

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Check AR support
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then(supported => {
          setIsARSupported(supported)
          if (!supported) {
            setError('AR is not supported on this device')
          }
        })
        .catch(err => {
          setError('Error checking AR support: ' + err.message)
        })
    } else {
      setError('WebXR is not available in your browser')
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.setAnimationLoop(null)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      const arButtonElement = document.querySelector('button[data-xr-type="ar"]')
      if (arButtonElement) {
        document.body.removeChild(arButtonElement)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute top-0 left-0 w-full h-full">
      {!isARSupported && (
        <div className="absolute top-0 left-0 w-full p-4 bg-black bg-opacity-50 text-white text-center">
          {error || 'AR is not supported on this device or browser'}
        </div>
      )}
    </div>
  )
}