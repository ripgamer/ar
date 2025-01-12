'use client'

import { useEffect, useRef } from 'react'
import styles from './HolographicCard.module.css'

export function HolographicCard() {
  const cardRefs = useRef([])
  const styleRef = useRef(null)

  useEffect(() => {
    const cards = cardRefs.current
    const style = styleRef.current
    let timeoutId

    const handleMouseMove = (e, card) => {
      let pos = [e.offsetX, e.offsetY]
      e.preventDefault()

      if (e.type === "touchmove") {
        pos = [e.touches[0].clientX, e.touches[0].clientY]
      }

      const l = pos[0]
      const t = pos[1]
      const h = card.offsetHeight
      const w = card.offsetWidth
      const px = Math.abs(Math.floor(100 / w * l) - 100)
      const py = Math.abs(Math.floor(100 / h * t) - 100)
      const pa = (50 - px) + (50 - py)

      const lp = (50 + (px - 50) / 1.5)
      const tp = (50 + (py - 50) / 1.5)
      const px_spark = (50 + (px - 50) / 7)
      const py_spark = (50 + (py - 50) / 7)
      const p_opc = 20 + (Math.abs(pa) * 1.5)
      const ty = ((tp - 50) / 2) * -1
      const tx = ((lp - 50) / 1.5) * 0.5

      const grad_pos = `background-position: ${lp}% ${tp}%;`
      const sprk_pos = `background-position: ${px_spark}% ${py_spark}%;`
      const opc = `opacity: ${p_opc / 100};`
      const tf = `transform: rotateX(${ty}deg) rotateY(${tx}deg)`

      const styleContent = `
        .${styles.card}:hover:before { ${grad_pos} }
        .${styles.card}:hover:after { ${sprk_pos} ${opc} }
      `

      card.classList.remove(styles.animated)
      card.style = tf
      if (style) style.innerHTML = styleContent
    }

    const handleMouseOut = (card) => {
      if (style) style.innerHTML = ""
      card.removeAttribute("style")
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        card.classList.add(styles.animated)
      }, 2500)
    }

    cards.forEach(card => {
      if (!card) return

      card.addEventListener('mousemove', (e) => handleMouseMove(e, card))
      card.addEventListener('touchmove', (e) => handleMouseMove(e, card))
      card.addEventListener('mouseout', () => handleMouseOut(card))
      card.addEventListener('touchend', () => handleMouseOut(card))
      card.addEventListener('touchcancel', () => handleMouseOut(card))
    })

    return () => {
      cards.forEach(card => {
        if (!card) return
        card.removeEventListener('mousemove', handleMouseMove)
        card.removeEventListener('touchmove', handleMouseMove)
        card.removeEventListener('mouseout', handleMouseOut)
        card.removeEventListener('touchend', handleMouseOut)
        card.removeEventListener('touchcancel', handleMouseOut)
      })
    }
  }, [])

  return (
    <div className={styles.app}>
      {/* <h1 className="text-3xl font-bold mb-8">Pokemon Card, Holo Effect</h1> */}
      
      <section className={styles.cards}>
        <div ref={el => cardRefs.current[0] = el} className={`${styles.card} ${styles.charizard} ${styles.animated}`}></div>
        {/* <div ref={el => cardRefs.current[1] = el} className={`${styles.card} ${styles.pika} ${styles.animated}`}></div>
        <div ref={el => cardRefs.current[2] = el} className={`${styles.card} ${styles.eevee} ${styles.animated}`}></div>
        <div ref={el => cardRefs.current[3] = el} className={`${styles.card} ${styles.mewtwo} ${styles.animated}`}></div> */}
      </section>

      <style ref={styleRef}></style>
    </div>
  )
} 