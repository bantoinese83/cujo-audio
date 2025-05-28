"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { colors } from "@/lib/design-system"

export function EnhancedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    // Create stars
    const stars: Array<{
      x: number
      y: number
      radius: number
      color: string
      alpha: number
      direction: number
      speed: number
    }> = []

    // Create constellation points
    const constellationPoints: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
      connections: number[]
    }> = []

    // Colors
    const starColors = [
      colors.accent.purple + "80",
      colors.accent.pink + "80",
      colors.accent.blue + "80",
      colors.accent.indigo + "80",
      "#ffffff20",
    ]

    const constellationColors = [colors.accent.purple, colors.accent.pink, colors.accent.blue, colors.accent.indigo]

    // Initialize stars
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        alpha: Math.random() * 0.8 + 0.2,
        direction: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.05 + 0.01,
      })
    }

    // Initialize constellation points
    for (let i = 0; i < 20; i++) {
      constellationPoints.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 2 + 1,
        color: constellationColors[Math.floor(Math.random() * constellationColors.length)],
        connections: [],
      })
    }

    // Find connections between constellation points
    constellationPoints.forEach((point, i) => {
      // Each point connects to 1-3 other points
      const numConnections = Math.floor(Math.random() * 3) + 1
      const distances: Array<{ index: number; distance: number }> = []

      constellationPoints.forEach((otherPoint, j) => {
        if (i !== j) {
          const dx = point.x - otherPoint.x
          const dy = point.y - otherPoint.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          distances.push({ index: j, distance })
        }
      })

      // Sort by distance and take the closest ones
      distances.sort((a, b) => a.distance - b.distance)
      point.connections = distances.slice(0, numConnections).map((d) => d.index)
    })

    // Animation loop
    let animationId: number
    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw and update stars
      stars.forEach((star) => {
        // Update position with subtle movement
        star.x += Math.cos(star.direction) * star.speed
        star.y += Math.sin(star.direction) * star.speed

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width
        if (star.x > canvas.width) star.x = 0
        if (star.y < 0) star.y = canvas.height
        if (star.y > canvas.height) star.y = 0

        // Twinkle effect
        star.alpha = 0.2 + Math.abs(Math.sin(Date.now() * 0.001 * star.speed) * 0.8)

        // Draw star
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.globalAlpha = star.alpha
        ctx.fill()
      })

      // Draw and update constellation points
      constellationPoints.forEach((point) => {
        // Update position
        point.x += point.vx
        point.y += point.vy

        // Bounce off edges
        if (point.x < 0 || point.x > canvas.width) point.vx *= -1
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1

        // Draw point
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        ctx.fillStyle = point.color
        ctx.globalAlpha = 0.7
        ctx.fill()

        // Draw connections
        point.connections.forEach((connectionIndex) => {
          const connectedPoint = constellationPoints[connectionIndex]
          const dx = point.x - connectedPoint.x
          const dy = point.y - connectedPoint.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 300) {
            // Only draw if points are close enough
            ctx.beginPath()
            ctx.moveTo(point.x, point.y)
            ctx.lineTo(connectedPoint.x, connectedPoint.y)
            ctx.strokeStyle = point.color
            ctx.globalAlpha = 0.2 * (1 - distance / 300)
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", updateDimensions)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle at center, #13111C 0%, #090909 100%)" }}
      />

      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${colors.accent.purple}40 0%, transparent 70%)`,
            filter: "blur(70px)",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20"
          style={{
            background: `radial-gradient(circle, ${colors.accent.pink}40 0%, transparent 70%)`,
            filter: "blur(70px)",
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-96 h-96 rounded-full opacity-10"
          style={{
            background: `radial-gradient(circle, ${colors.accent.blue}40 0%, transparent 70%)`,
            filter: "blur(70px)",
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
    </>
  )
}
