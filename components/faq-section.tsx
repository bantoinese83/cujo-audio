"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Logo } from "@/components/logo"

const faqs = [
  {
    q: "Can I use the music commercially?",
    a: "Yes! All music you generate with Cujo Audio is yours to use, even for commercial projects."
  },
  {
    q: "What genres are supported?",
    a: "Cujo Audio supports a wide range of genres, from hip hop and trap to orchestral, pop, electronic, and more."
  },
  {
    q: "How does the AI work?",
    a: "Our AI is powered by Gemini and Lyria models, trained on diverse music data to generate unique tracks from your prompts."
  },
  {
    q: "Is my music private?",
    a: "Absolutely. Your music is never stored or shared without your permission."
  },
  {
    q: "Can I export tracks to my DAW?",
    a: "Yes, you can download your music as audio files and import them into any DAW (Ableton, FL Studio, Logic, etc.)."
  },
]

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <motion.section
      className="relative w-full max-w-3xl mx-auto my-12 px-4 py-12 bg-black/60 rounded-3xl border border-purple-900/40 shadow-2xl backdrop-blur-2xl overflow-hidden"
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
        Frequently Asked Questions
      </motion.h2>
      <div className="relative z-10 space-y-5">
        {faqs.map((faq, i) => (
          <motion.div
            key={faq.q}
            className="group bg-gradient-to-br from-gray-900/80 to-gray-800/70 rounded-2xl border border-purple-900/30 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-fuchsia-500/60 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.07, duration: 0.5, type: "spring" }}
          >
            <button
              className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`faq-panel-${i}`}
            >
              <span className="font-semibold text-white text-lg drop-shadow-md">{faq.q}</span>
              <ChevronDown className={`h-6 w-6 text-purple-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  id={`faq-panel-${i}`}
                  className="px-6 pb-6 text-gray-200 text-base"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {faq.a}
                </motion.div>
              )}
            </AnimatePresence>
            {/* Animated border beam */}
            <div className="absolute inset-0 pointer-events-none z-0 group-hover:animate-pulse border-2 border-fuchsia-500/30 rounded-2xl transition-all duration-300" />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default FAQSection 