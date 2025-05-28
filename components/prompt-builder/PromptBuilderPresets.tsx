// PromptBuilderPresets: Handles the presets tab, category filter, and preset cards for the PromptBuilder UI
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

// Props for the presets subcomponent
interface PromptBuilderPresetsProps {
  filteredPresets: any[]
  activeCategory: string
  setActiveCategory: (cat: string) => void
  applyPresetConfiguration: (preset: any) => void
  searchTerm: string
  setSearchTerm: (s: string) => void
  hasSelections: boolean
  clearAllSelections: () => void
  PRESET_CATEGORIES: Record<string, any[]>
}

const PromptBuilderPresets = ({
  filteredPresets,
  activeCategory,
  setActiveCategory,
  applyPresetConfiguration,
  searchTerm,
  setSearchTerm,
  hasSelections,
  clearAllSelections,
  PRESET_CATEGORIES,
}: PromptBuilderPresetsProps) => {
  return (
    <div>
      {/* Category Filter Buttons */}
      <div className="bg-gray-800/50 p-2 overflow-x-auto whitespace-nowrap">
        <Button
          variant={activeCategory === "All" ? "default" : "ghost"}
          size="sm"
          className="mr-1"
          onClick={() => setActiveCategory("All")}
        >
          All
        </Button>
        {Object.keys(PRESET_CATEGORIES).map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "ghost"}
            size="sm"
            className="mr-1"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      {/* Search and clear all */}
      <div className="flex items-center gap-2 p-2">
        <input
          type="text"
          placeholder="Search presets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
          aria-label="Search for presets"
        />
        {hasSelections && (
          <Button variant="outline" size="sm" onClick={clearAllSelections} aria-label="Clear all selections">
            Clear All
          </Button>
        )}
      </div>
      {/* Preset Cards */}
      <ScrollArea className="h-[300px] p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPresets.map((preset) => (
            <motion.div
              key={preset.name}
              className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-all border border-gray-700 hover:border-purple-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => applyPresetConfiguration(preset)}
            >
              <h3 className="text-lg font-semibold text-white mb-1">{preset.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{preset.description}</p>
              <div className="flex flex-wrap gap-1">
                {preset.genres.slice(0, 3).map((genre: string) => (
                  <span key={genre} className="text-xs bg-purple-900/30 rounded px-2 py-1 mr-1">{genre}</span>
                ))}
                {preset.instruments.slice(0, 2).map((instrument: string) => (
                  <span key={instrument} className="text-xs bg-blue-900/30 rounded px-2 py-1 mr-1">{instrument}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default PromptBuilderPresets; 