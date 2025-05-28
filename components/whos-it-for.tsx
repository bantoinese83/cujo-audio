"use client"

import { Music, Mic, Film, Sparkles, Users, Book } from "lucide-react"
import { motion } from "framer-motion"
import { Logo } from "@/components/logo"

const personas = [
  {
    icon: <Music className="h-7 w-7 text-purple-500" />, 
    title: "Music Producers",
    desc: "Jumpstart your next track with AI-generated ideas and unique sounds."
  },
  {
    icon: <Mic className="h-7 w-7 text-blue-500" />,
    title: "Artists & Rappers",
    desc: "Freestyle, write, or record over fresh, never-heard-before beats."
  },
  {
    icon: <Film className="h-7 w-7 text-pink-500" />,
    title: "Filmmakers & Game Devs",
    desc: "Need a score for a movie scene or game? Instantly generate custom soundtracks."
  },
  {
    icon: <Sparkles className="h-7 w-7 text-yellow-500" />,
    title: "Creators & Streamers",
    desc: "Level up your content with original background music, intros, and more."
  },
  {
    icon: <Users className="h-7 w-7 text-green-500" />,
    title: "Anyone Seeking Inspiration",
    desc: "Stuck in a rut? Let AI spark your next creative breakthrough."
  },
  {
    icon: <Book className="h-7 w-7 text-orange-500" />,
    title: "Educators & Students",
    desc: "Explore music theory, composition, and production in an interactive, hands-on way."
  },
]

function WhosItFor() {
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
        Who is Cujo Audio for?
      </motion.h2>
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {personas.map((p, i) => (
          <motion.div
            key={p.title}
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
                {p.icon}
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-1 text-white drop-shadow-md">{p.title}</h3>
            <p className="text-gray-200 text-sm mb-2">{p.desc}</p>
          </motion.div>
        ))}
      </div>
      <p className="relative z-10 mt-12 text-center text-gray-300 text-base max-w-2xl mx-auto bg-black/30 rounded-xl py-4 px-6 shadow border border-purple-900/20">
        Whether you're a seasoned producer, an artist looking to freestyle, a filmmaker in need of a score, or just someone searching for musical inspiration—Cujo Audio is the app for you.
      </p>
    </motion.section>
  )
}

export default WhosItFor 