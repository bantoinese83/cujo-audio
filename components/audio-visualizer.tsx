"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface AudioVisualizerProps {
  isPlaying: boolean
  audioContext?: AudioContext
  sourceNode?: AudioNode
}

// A modern waveform visualizer using Web Audio API
export function AudioVisualizer({ isPlaying, audioContext, sourceNode }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const bufferLengthRef = useRef<number>(0)
  const connectedRef = useRef<boolean>(false)

  useEffect(() => {
    if (!isPlaying || !canvasRef.current) return

    // Use provided audioContext or fallback to window.AudioContext
    let ctx = audioContext
    if (!ctx) {
      try {
        ctx = (window as any)._cujoAudioContext || new (window.AudioContext || (window as any).webkitAudioContext)()
        ;(window as any)._cujoAudioContext = ctx
      } catch {
        return
      }
    }
    if (!ctx) return // Guard: ctx must be defined

    // Create or reuse analyser
    if (!analyserRef.current) {
      analyserRef.current = ctx.createAnalyser()
      analyserRef.current.fftSize = 2048
    }
    const analyser = analyserRef.current

    // Connect sourceNode if provided and not already connected
    if (sourceNode && !connectedRef.current) {
      try {
        sourceNode.connect(analyser)
        connectedRef.current = true
      } catch {}
    } else if (!sourceNode && ctx && ctx.destination && !connectedRef.current) {
      // Try to connect the destination (not ideal, but fallback)
      try {
        ctx.destination.connect(analyser)
        connectedRef.current = true
      } catch {}
    }

    bufferLengthRef.current = analyser.frequencyBinCount
    dataArrayRef.current = new Uint8Array(bufferLengthRef.current)

    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    const c = canvas.getContext("2d")
    if (!c) return
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.scale(dpr, dpr)

    const draw = () => {
      if (!analyser || !dataArrayRef.current) return
      analyser.getByteTimeDomainData(dataArrayRef.current)
      c.clearRect(0, 0, canvas.width, canvas.height)
      // Draw waveform
      c.beginPath()
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      const sliceWidth = width / bufferLengthRef.current
      let x = 0
      for (let i = 0; i < bufferLengthRef.current; i++) {
        const v = dataArrayRef.current[i] / 128.0
        const y = (v * height) / 2
        if (i === 0) {
          c.moveTo(x, y)
        } else {
          c.lineTo(x, y)
        }
        x += sliceWidth
      }
      c.lineTo(width, height / 2)
      c.strokeStyle = "#a855f7"
      c.lineWidth = 2
      c.shadowColor = "#a855f7"
      c.shadowBlur = 8
      c.stroke()
      c.shadowBlur = 0
      animationRef.current = requestAnimationFrame(draw)
    }
    animationRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationRef.current)
      // Optionally disconnect analyser
      if (sourceNode && connectedRef.current) {
        try {
          sourceNode.disconnect(analyser)
        } catch {}
        connectedRef.current = false
      }
    }
  }, [isPlaying, audioContext, sourceNode])

  if (!isPlaying) return null

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 h-16 z-10 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  )
}
