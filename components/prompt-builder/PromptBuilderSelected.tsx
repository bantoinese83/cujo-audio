// PromptBuilderSelected: Displays selected genres, instruments, elements, and moods as badges with remove buttons
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface PromptBuilderSelectedProps {
  selectedGenres: string[]
  selectedInstruments: string[]
  selectedElements: string[]
  selectedMoods: string[]
  toggleItem: (item: string, category: "genres" | "instruments" | "elements" | "moods") => void
}

const PromptBuilderSelected = ({
  selectedGenres,
  selectedInstruments,
  selectedElements,
  selectedMoods,
  toggleItem,
}: PromptBuilderSelectedProps) => {
  return (
    <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto w-full">
      {selectedGenres.map((genre) => (
        <Badge key={genre} variant="secondary" className="bg-purple-900/50">
          {genre}
          <button
            onClick={() => toggleItem(genre, "genres")}
            className="ml-1 hover:text-red-400"
            aria-label={`Remove ${genre}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {selectedInstruments.map((instrument) => (
        <Badge key={instrument} variant="secondary" className="bg-blue-900/50">
          {instrument}
          <button
            onClick={() => toggleItem(instrument, "instruments")}
            className="ml-1 hover:text-red-400"
            aria-label={`Remove ${instrument}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {selectedElements.map((element) => (
        <Badge key={element} variant="secondary" className="bg-amber-900/50">
          {element}
          <button
            onClick={() => toggleItem(element, "elements")}
            className="ml-1 hover:text-red-400"
            aria-label={`Remove ${element}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {selectedMoods.map((mood) => (
        <Badge key={mood} variant="secondary" className="bg-cyan-900/50">
          {mood}
          <button
            onClick={() => toggleItem(mood, "moods")}
            className="ml-1 hover:text-red-400"
            aria-label={`Remove ${mood}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  )
}

export default PromptBuilderSelected 