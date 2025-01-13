'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ARButton } from 'three/examples/jsm/webxr/ARButton'

export function WebARHolographicCard() {
  const containerRef = useRef(null)
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.xr.enabled = true
    containerRef.current.appendChild(renderer.domElement)

    // Check AR support and initialize
    async function initAR() {
      try {
        const supported = await navigator.xr?.isSessionSupported('immersive-ar')
        setIsSupported(supported)
        
        if (supported) {
          const arButton = ARButton.createButton(renderer, {
            requiredFeatures: ['hit-test', 'camera-access'],
            optionalFeatures: ['dom-overlay'],
            domOverlay: { root: document.body },
            sessionInit: {
              requiredPermissions: ['camera'],
            }
          })
          
          // Style the AR button
          arButton.style.position = 'absolute'
          arButton.style.bottom = '20px'
          arButton.style.left = '50%'
          arButton.style.transform = 'translateX(-50%)'
          arButton.style.padding = '12px 24px'
          arButton.style.border = 'none'
          arButton.style.borderRadius = '4px'
          arButton.style.background = '#4CAF50'
          arButton.style.color = 'white'
          arButton.style.cursor = 'pointer'
          arButton.style.fontWeight = 'bold'
          
          document.body.appendChild(arButton)
        } else {
          setError('AR is not supported on this device')
        }
      } catch (err) {
        setError(err.message)
        console.error('AR initialization error:', err)
      }
    }

    initAR()

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(0, 5, 0)
    scene.add(directionalLight)

    // Create card
    const cardGeometry = new THREE.PlaneGeometry(0.5, 0.7)
    const textureLoader = new THREE.TextureLoader()

    // Load card texture
    textureLoader.load('https://assets.codepen.io/13471/charizard-gx.webp', (texture) => {
      const cardMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        metalness: 0.5,
        roughness: 0.5,
      })

      const card = new THREE.Mesh(cardGeometry, cardMaterial)
      card.position.set(0, 0, -1)
      scene.add(card)

      // Add holographic effect
      const holographicMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          baseTexture: { value: texture },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform sampler2D baseTexture;
          varying vec2 vUv;
          
          void main() {
            vec2 uv = vUv;
            float rainbow = sin(uv.x * 10.0 + time) * 0.5 + 0.5;
            vec3 rainbowColor = vec3(
              sin(rainbow * 3.14159 * 2.0) * 0.5 + 0.5,
              sin(rainbow * 3.14159 * 2.0 + 2.094) * 0.5 + 0.5,
              sin(rainbow * 3.14159 * 2.0 + 4.189) * 0.5 + 0.5
            );
            
            vec4 baseColor = texture2D(baseTexture, uv);
            gl_FragColor = vec4(mix(baseColor.rgb, rainbowColor, 0.2), baseColor.a);
          }
        `,
        transparent: true,
      })

      const holographicOverlay = new THREE.Mesh(cardGeometry, holographicMaterial)
      holographicOverlay.position.z = 0.001
      card.add(holographicOverlay)

      // XR Hit Test Source
      let hitTestSource = null
      let hitTestSourceRequested = false

      // Handle XR Session
      renderer.xr.addEventListener('sessionstart', async () => {
        try {
          const session = renderer.xr.getSession()
          
          // Request reference space after session starts
          const viewerReferenceSpace = await session.requestReferenceSpace('viewer')
          const localReferenceSpace = await session.requestReferenceSpace('local')
          renderer.xr.setReferenceSpace(localReferenceSpace)
          
          hitTestSource = await session.requestHitTestSource({
            space: viewerReferenceSpace
          })

          session.addEventListener('select', () => {
            if (reticle.visible) {
              card.position.setFromMatrixPosition(reticle.matrix)
              card.visible = true
            }
          })
        } catch (err) {
          setError('Error starting AR session: ' + err.message)
          console.error('Session start error:', err)
        }
      })

      // Create reticle for placement
      const reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial()
      )
      reticle.visible = false
      scene.add(reticle)

      // Animation loop
      let time = 0
      renderer.setAnimationLoop((timestamp, frame) => {
        time += 0.01
        holographicMaterial.uniforms.time.value = time

        if (frame) {
          const referenceSpace = renderer.xr.getReferenceSpace()
          const session = renderer.xr.getSession()

          if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource)
            if (hitTestResults.length) {
              const hit = hitTestResults[0]
              reticle.visible = true
              reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix)
            } else {
              reticle.visible = false
            }
          }
        }

        renderer.render(scene, camera)
      })

      // Handle resize
      const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', onWindowResize)

      return () => {
        window.removeEventListener('resize', onWindowResize)
      }
    })

    return () => {
      renderer.dispose()
      const arButton = document.querySelector('button[data-xr-type="ar"]')
      if (arButton) arButton.remove()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />
      
      {!isSupported && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded">
          <p>WebXR AR is not supported on your device.</p>
          <p>Please use a compatible mobile device with AR support.</p>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 bg-red-500 bg-opacity-50 text-white p-4 rounded">
          <p>Error: {error}</p>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded text-center">
        <p>Tap the AR button to start</p>
        <p>Point your camera at a flat surface</p>
        <p>Tap to place the card</p>
      </div>
    </div>
  )
}

