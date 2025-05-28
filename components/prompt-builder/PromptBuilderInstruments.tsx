// PromptBuilderInstruments: Handles the instruments tab and instrument selection UI for the PromptBuilder
import { motion } from "framer-motion"

interface PromptBuilderInstrumentsProps {
  instruments: string[]
  selectedInstruments: string[]
  toggleInstrument: (instrument: string) => void
  filterItemsBySearchTerm: (items: string[]) => string[]
  searchTerm: string
}

const PromptBuilderInstruments = ({ instruments, selectedInstruments, toggleInstrument, filterItemsBySearchTerm, searchTerm }: PromptBuilderInstrumentsProps) => {
  const filteredInstruments = filterItemsBySearchTerm(instruments)
  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {filteredInstruments.map((instrument) => (
        <motion.button
          key={instrument}
          onClick={() => toggleInstrument(instrument)}
          className={`px-3 py-2 rounded-lg text-sm transition-all ${selectedInstruments.includes(instrument) ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-pressed={selectedInstruments.includes(instrument)}
        >
          {instrument}
        </motion.button>
      ))}
    </div>
  )
}

export default PromptBuilderInstruments 