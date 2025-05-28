// PromptBuilderMoods: Handles the moods tab and mood selection UI for the PromptBuilder
import { motion } from "framer-motion"

interface PromptBuilderMoodsProps {
  moods: string[]
  selectedMoods: string[]
  toggleMood: (mood: string) => void
  filterItemsBySearchTerm: (items: string[]) => string[]
  searchTerm: string
}

const PromptBuilderMoods = ({ moods, selectedMoods, toggleMood, filterItemsBySearchTerm, searchTerm }: PromptBuilderMoodsProps) => {
  const filteredMoods = filterItemsBySearchTerm(moods)
  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {filteredMoods.map((mood) => (
        <motion.button
          key={mood}
          onClick={() => toggleMood(mood)}
          className={`px-3 py-2 rounded-lg text-sm transition-all ${selectedMoods.includes(mood) ? "bg-cyan-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-pressed={selectedMoods.includes(mood)}
        >
          {mood}
        </motion.button>
      ))}
    </div>
  )
}

export default PromptBuilderMoods 