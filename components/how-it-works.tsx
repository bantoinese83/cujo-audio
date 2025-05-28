"use client"

import { motion } from "framer-motion"
import { Pencil, Sliders, PlayCircle, Download } from "lucide-react"
import { Logo } from "@/components/logo"

const steps = [
  {
    icon: <Pencil className="h-8 w-8 text-purple-500" />, 
    title: "Enter a Prompt",
    desc: "Type your idea or select a preset to get started."
  },
  {
    icon: <Sliders className="h-8 w-8 text-blue-500" />,
    title: "Fine-tune Your Sound",
    desc: "Choose genres, moods, instruments, and more."
  },
  {
    icon: <PlayCircle className="h-8 w-8 text-green-500" />,
    title: "Generate & Stream",
    desc: "Hear your music in real-time as it's created by AI."
  },
  {
    icon: <Download className="h-8 w-8 text-yellow-500" />,
    title: "Download or Share",
    desc: "Export your track or share it with the world."
  },
]

function HowItWorks() {
  return (
    <motion.section
      className="relative w-full max-w-5xl mx-auto my-12 px-4 py-12 bg-black/60 rounded-3xl border border-purple-900/40 shadow-2xl backdrop-blur-2xl overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {/* Cujo logo watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0">
        <Logo size="xl" withText={false} />
      </div>
      <motion.h2
        className="relative z-10 text-3xl md:text-4xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 animate-gradient-x drop-shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.7 }}
      >
        How It Works
      </motion.h2>
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            className="group flex flex-col items-center text-center bg-gradient-to-br from-gray-900/80 to-gray-800/70 rounded-2xl p-7 shadow-xl border border-purple-900/30 transition-all duration-300 hover:shadow-2xl hover:border-fuchsia-500/60 relative overflow-hidden"
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5, type: "spring" }}
          >
            {/* Animated border beam */}
            <div className="absolute inset-0 pointer-events-none z-0 group-hover:animate-pulse border-2 border-fuchsia-500/30 rounded-2xl transition-all duration-300" />
            {/* Icon with glow */}
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-gradient-to-br from-purple-700 via-fuchsia-600 to-blue-600 p-3 shadow-lg animate-pulse-slow">
                {step.icon}
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-1 text-white drop-shadow-md">{step.title}</h3>
            <p className="text-gray-200 text-sm mb-2">{step.desc}</p>
            <span className="mt-2 text-xs text-fuchsia-400 font-mono tracking-wider">Step {i + 1}</span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default HowItWorks 