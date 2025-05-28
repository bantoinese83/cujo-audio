"use client"

import type { PlaybackState } from "@/types/music"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Square, RefreshCw, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ControlPanelProps {
  playbackState: PlaybackState
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onReset: () => void
}

export function ControlPanel({ playbackState, onPlay, onPause, onStop, onReset }: ControlPanelProps) {
  const isPlaying = playbackState === "playing"
  const isLoading = playbackState === "loading"
  const isPaused = playbackState === "paused"
  const isStopped = playbackState === "stopped"

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause()
    } else {
      onPlay()
    }
  }

  return (
    <Card className="bg-black/50 backdrop-blur-sm border-gray-800">
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-16 w-16 rounded-full border-2",
              isPlaying && "border-green-500 bg-green-950/20",
              isLoading && "border-yellow-500 bg-yellow-950/20",
              (isPaused || isStopped) && "border-gray-500",
            )}
            onClick={handlePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={onStop}
            disabled={isStopped}
          >
            <Square className="h-5 w-5" />
          </Button>
        </div>

        <Button variant="ghost" className="gap-2" onClick={onReset}>
          <RefreshCw className="h-4 w-4" />
          Reset
        </Button>
      </CardContent>
    </Card>
  )
}
