// PromptBuilderElements: Handles the elements tab, category filter, and element selection UI for the PromptBuilder
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface PromptBuilderElementsProps {
  filteredElements: string[]
  selectedElements: string[]
  toggleElement: (element: string) => void
  PRODUCTION_ELEMENTS: Record<string, string[]>
  activeElementCategory: string
  setActiveElementCategory: (cat: string) => void
  filterItemsBySearchTerm: (items: string[]) => string[]
}

const PromptBuilderElements = ({
  filteredElements,
  selectedElements,
  toggleElement,
  PRODUCTION_ELEMENTS,
  activeElementCategory,
  setActiveElementCategory,
  filterItemsBySearchTerm,
}: PromptBuilderElementsProps) => {
  return (
    <div>
      {/* Category Filter Buttons */}
      <div className="bg-gray-800/50 p-2 overflow-x-auto whitespace-nowrap">
        <Button
          variant={activeElementCategory === "All" ? "default" : "ghost"}
          size="sm"
          className="mr-1"
          onClick={() => setActiveElementCategory("All")}
        >
          All
        </Button>
        {Object.keys(PRODUCTION_ELEMENTS).map((category) => (
          <Button
            key={category}
            variant={activeElementCategory === category ? "default" : "ghost"}
            size="sm"
            className="mr-1"
            onClick={() => setActiveElementCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      {/* Elements grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {filteredElements.map((element) => (
          <motion.button
            key={element}
            onClick={() => toggleElement(element)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${selectedElements.includes(element) ? "bg-amber-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={selectedElements.includes(element)}
          >
            {element}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default PromptBuilderElements 