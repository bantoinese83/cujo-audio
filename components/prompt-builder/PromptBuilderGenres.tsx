// PromptBuilderGenres: Handles the genres tab and genre selection UI for the PromptBuilder
import { motion } from "framer-motion"

interface PromptBuilderGenresProps {
  genres: string[]
  selectedGenres: string[]
  toggleGenre: (genre: string) => void
  filterItemsBySearchTerm: (items: string[]) => string[]
  searchTerm: string
}

const PromptBuilderGenres = ({ genres, selectedGenres, toggleGenre, filterItemsBySearchTerm, searchTerm }: PromptBuilderGenresProps) => {
  const filteredGenres = filterItemsBySearchTerm(genres)
  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {filteredGenres.map((genre) => (
        <motion.button
          key={genre}
          onClick={() => toggleGenre(genre)}
          className={`px-3 py-2 rounded-lg text-sm transition-all ${selectedGenres.includes(genre) ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-pressed={selectedGenres.includes(genre)}
        >
          {genre}
        </motion.button>
      ))}
    </div>
  )
}

export default PromptBuilderGenres 