"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  withText?: boolean
  className?: string
}

export function Logo({ size = "md", withText = true, className }: LogoProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl",
  }

  return (
    <motion.div
      className={cn("flex items-center gap-3", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        {/* Triangle container */}
        <motion.div
          className={cn("relative z-10", sizes[size])}
          whileHover={{ scale: 1.05, rotateZ: 5 }}
          whileTap={{ scale: 0.95 }}
          style={{
            perspective: "1000px",
          }}
        >
          {/* 3D Triangle with image */}
          <div
            className="w-full h-full relative"
            style={{
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              transform: "rotateX(10deg) rotateY(10deg)",
              transformStyle: "preserve-3d",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Image
              src="/images/cujo-dog-logo.png"
              alt="Cujo Audio"
              width={size === "xl" ? 64 : size === "lg" ? 48 : size === "md" ? 40 : 32}
              height={size === "xl" ? 64 : size === "lg" ? 48 : size === "md" ? 40 : 32}
              className="object-contain w-full h-full"
              style={{
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                background: "linear-gradient(135deg, rgba(255,0,0,0.7) 0%, rgba(200,0,0,0.9) 100%)",
              }}
            />
            {/* 3D edge highlights */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 30%)",
                mixBlendMode: "overlay",
              }}
            />
          </div>

          {/* Bottom shadow */}
          <div
            className="absolute -bottom-1 left-0 w-full h-2 blur-sm opacity-40"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)",
              transform: "rotateX(60deg)",
            }}
          />
        </motion.div>

        {/* Animated glow effect */}
        <motion.div
          className="absolute inset-0 blur-md opacity-50"
          style={{
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            background: "linear-gradient(135deg, #ff3d00 0%, #ff0000 100%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {withText && (
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1
            className={cn(
              "font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-red-500 to-red-700",
              textSizes[size],
            )}
          >
            Cujo Audio
          </h1>
          {size === "lg" || size === "xl" ? <p className="text-sm text-gray-400">AI-powered music generation</p> : null}
        </motion.div>
      )}
    </motion.div>
  )
}
