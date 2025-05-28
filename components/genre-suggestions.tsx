"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface GenreSuggestionsProps {
  onSelect: (genre: string) => void
}

export function GenreSuggestions({ onSelect }: GenreSuggestionsProps) {
  const genres = [
    { name: "Trap Soul", color: "from-purple-600 to-indigo-600" },
    { name: "Lo-Fi Drill", color: "from-cyan-600 to-blue-600" },
    { name: "Melodic Trap", color: "from-fuchsia-600 to-purple-600" },
    { name: "Neo Soul", color: "from-amber-600 to-orange-600" },
    { name: "Phonk", color: "from-red-600 to-pink-600" },
    { name: "Hyperpop", color: "from-emerald-600 to-teal-600" },
  ]

  return (
    <motion.div
      className="flex flex-wrap gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="text-sm text-gray-400 flex items-center mr-1">
        <Sparkles className="h-3 w-3 mr-1" />
        Try:
      </div>
      {genres.map((genre, index) => (
        <motion.div
          key={genre.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full text-xs px-3 py-1 h-auto bg-gradient-to-r ${genre.color} hover:opacity-90 transition-opacity`}
            onClick={() => onSelect(genre.name)}
          >
            {genre.name}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  )
}
