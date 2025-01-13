'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function WebARHolographicCard() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Set up scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)

    // Create card
    const geometry = new THREE.PlaneGeometry(1, 1.4)
    const textureLoader = new THREE.TextureLoader()
    const material = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      transparent: true,
    })

    // Load texture
    textureLoader.load('https://assets.codepen.io/13471/charizard-gx.webp', (texture) => {
      material.map = texture
      material.needsUpdate = true
    })

    const card = new THREE.Mesh(geometry, material)
    scene.add(card)

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Position camera and card
    camera.position.z = 2
    card.position.set(0, 0, -0.5)

    // Animation
    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0
    let targetRotationY = 0

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1

      targetRotationX = mouseY * 0.5
      targetRotationY = mouseX * 0.5
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      // Smooth rotation
      card.rotation.x += (targetRotationX - card.rotation.x) * 0.05
      card.rotation.y += (targetRotationY - card.rotation.y) * 0.05

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      containerRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <div className="w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded">
        <p>Move your mouse to rotate the card in 3D.</p>
      </div>
    </div>
  )
}

