"use client"

import { motion } from "framer-motion"
import { User, Music, Mic, Film } from "lucide-react"
import { Logo } from "@/components/logo"

const testimonials = [
  {
    icon: <Music className="h-7 w-7 text-purple-400" />,
    name: "Alex Rivera",
    role: "Indie Producer",
    quote: "Cujo Audio helped me finish my album with fresh ideas and unique sounds!"
  },
  {
    icon: <Mic className="h-7 w-7 text-blue-400" />,
    name: "Jade Kim",
    role: "Rapper & Songwriter",
    quote: "Perfect for freestyle sessions and writing new hooks on the fly."
  },
  {
    icon: <Film className="h-7 w-7 text-pink-400" />,
    name: "Morgan Lee",
    role: "Filmmaker",
    quote: "I generated a custom score for my short film in minutes. Game changer!"
  },
  {
    icon: <User className="h-7 w-7 text-green-400" />,
    name: "Chris Patel",
    role: "Content Creator",
    quote: "My YouTube intros have never sounded so original. Highly recommend!"
  },
]

function Testimonials() {
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
        What People Are Saying
      </motion.h2>
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
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
                {t.icon}
              </div>
            </div>
            <blockquote className="text-gray-200 italic mb-3">“{t.quote}”</blockquote>
            <div className="font-semibold text-white drop-shadow-md">{t.name}</div>
            <div className="text-xs text-gray-400">{t.role}</div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default Testimonials 