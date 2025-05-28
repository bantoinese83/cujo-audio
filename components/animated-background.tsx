"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { colors } from "@/lib/design-system"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
      opacity: number
    }> = []

    const particleColors = [
      colors.accent.purple,
      colors.accent.pink,
      colors.accent.blue,
      colors.accent.green,
      colors.accent.indigo,
    ]

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    let animationId: number

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off walls
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()
        ctx.globalAlpha = 1

        // Draw connections
        particles.forEach((otherParticle) => {
          const distance = Math.sqrt((particle.x - otherParticle.x) ** 2 + (particle.y - otherParticle.y) ** 2)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = particle.color
            ctx.globalAlpha = (1 - distance / 100) * 0.2
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{ background: "radial-gradient(circle at center, transparent 0%, black 100%)" }}
      />
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.accent.purple}40 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute right-0 bottom-0 w-96 h-96 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.accent.pink}40 0%, transparent 70%)`,
            filter: "blur(40px)",
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
    </>
  )
}
