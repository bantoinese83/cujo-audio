"use client"

import { useRef, useEffect, memo, useCallback, useState } from "react"
import type { SettingsPanelProps } from "@/types/app-types"
import type { MusicGenerationConfig } from "@/types/music"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { colors } from "@/lib/design-system"
import { MusicConfigBuilder } from "@/utils/config-builder"

function SettingsPanel({ onSettingsChange, disabled = false, config }: SettingsPanelProps) {
  // Use refs for values that don't need to trigger re-renders
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const configRef = useRef<MusicGenerationConfig>(config)

  // Local state for UI controls
  const [autoDensity, setAutoDensity] = useState<boolean>(true)
  const [autoBrightness, setAutoBrightness] = useState<boolean>(true)

  // Update ref when props change
  useEffect(() => {
    configRef.current = config
  }, [config])

  // Debounced update function
  const updateConfig = useCallback(
    (updates: Partial<MusicGenerationConfig>): void => {
      if (disabled) return

      // Use the builder pattern to create a new config
      const configBuilder = MusicConfigBuilder.fromConfig(configRef.current)

      // Apply updates using the builder
      if (updates.temperature !== undefined) configBuilder.withTemperature(updates.temperature)
      if (updates.topK !== undefined) configBuilder.withTopK(updates.topK)
      if (updates.guidance !== undefined) configBuilder.withGuidance(updates.guidance)
      if (updates.bpm !== undefined) configBuilder.withBpm(updates.bpm)
      if (updates.density !== undefined) configBuilder.withDensity(updates.density)
      if (updates.brightness !== undefined) configBuilder.withBrightness(updates.brightness)
      if (updates.scale !== undefined) configBuilder.withScale(updates.scale)
      if (updates.seed !== undefined) configBuilder.withSeed(updates.seed)
      if (updates.muteBass !== undefined) configBuilder.withMuteBass(updates.muteBass)
      if (updates.muteDrums !== undefined) configBuilder.withMuteDrums(updates.muteDrums)
      if (updates.onlyBassAndDrums !== undefined) configBuilder.withOnlyBassAndDrums(updates.onlyBassAndDrums)
      if (updates.musicGenerationMode !== undefined) configBuilder.withMusicGenerationMode(updates.musicGenerationMode)

      const newConfig = configBuilder.build()

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        onSettingsChange(newConfig)
      }, 200)
    },
    [disabled, onSettingsChange],
  )

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleAutoDensityChange = (checked: boolean): void => {
    if (disabled) return

    setAutoDensity(checked)
    if (checked) {
      const { density, ...rest } = configRef.current
      updateConfig(rest)
    } else {
      updateConfig({ density: 0.5 })
    }
  }

  const handleAutoBrightnessChange = (checked: boolean): void => {
    if (disabled) return

    setAutoBrightness(checked)
    if (checked) {
      const { brightness, ...rest } = configRef.current
      updateConfig(rest)
    } else {
      updateConfig({ brightness: 0.5 })
    }
  }

  const scaleOptions = [
    { value: "SCALE_UNSPECIFIED", label: "Auto" },
    { value: "C_MAJOR_A_MINOR", label: "C Major / A Minor" },
    { value: "D_FLAT_MAJOR_B_FLAT_MINOR", label: "C# Major / A# Minor" },
    { value: "D_MAJOR_B_MINOR", label: "D Major / B Minor" },
    { value: "E_FLAT_MAJOR_C_MINOR", label: "D# Major / C Minor" },
    { value: "E_MAJOR_D_FLAT_MINOR", label: "E Major / C# Minor" },
    { value: "F_MAJOR_D_MINOR", label: "F Major / D Minor" },
    { value: "G_FLAT_MAJOR_E_FLAT_MINOR", label: "F# Major / D# Minor" },
    { value: "G_MAJOR_E_MINOR", label: "G Major / E Minor" },
    { value: "A_FLAT_MAJOR_F_MINOR", label: "G# Major / F Minor" },
    { value: "A_MAJOR_G_FLAT_MINOR", label: "A Major / F# Minor" },
    { value: "B_FLAT_MAJOR_G_MINOR", label: "A# Major / G Minor" },
    { value: "B_MAJOR_A_FLAT_MINOR", label: "B Major / G# Minor" },
  ]

  return (
    <Card className={`bg-black/50 backdrop-blur-sm border-gray-800 ${disabled ? "opacity-70" : ""}`}>
      <CardContent className="p-6">
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-2 mb-6 bg-gray-900/50">
            <TabsTrigger value="basic" disabled={disabled}>
              Basic Settings
            </TabsTrigger>
            <TabsTrigger value="advanced" disabled={disabled}>
              Advanced Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="temperature" className={disabled ? "text-gray-500" : ""}>
                    Temperature
                  </Label>
                  <span className="text-sm text-muted-foreground">{config.temperature?.toFixed(1)}</span>
                </div>
                <div className="relative pt-1">
                  <input
                    id="temperature"
                    type="range"
                    min={0}
                    max={3}
                    step={0.1}
                    value={config.temperature || 1.1}
                    onChange={(e) => updateConfig({ temperature: Number.parseFloat(e.target.value) })}
                    className={`w-full h-2 bg-gray-700 rounded-lg appearance-none ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    style={{
                      background: `linear-gradient(to right, ${colors.primary[500]} 0%, ${colors.primary[500]} ${
                        ((config.temperature || 1.1) / 3) * 100
                      }%, rgba(255,255,255,0.2) ${((config.temperature || 1.1) / 3) * 100}%, rgba(255,255,255,0.2) 100%)`,
                    }}
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="guidance" className={disabled ? "text-gray-500" : ""}>
                    Guidance
                  </Label>
                  <span className="text-sm text-muted-foreground">{config.guidance?.toFixed(1)}</span>
                </div>
                <div className="relative pt-1">
                  <input
                    id="guidance"
                    type="range"
                    min={0}
                    max={6}
                    step={0.1}
                    value={config.guidance || 4.0}
                    onChange={(e) => updateConfig({ guidance: Number.parseFloat(e.target.value) })}
                    className={`w-full h-2 bg-gray-700 rounded-lg appearance-none ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    style={{
                      background: `linear-gradient(to right, ${colors.primary[500]} 0%, ${colors.primary[500]} ${
                        ((config.guidance || 4.0) / 6) * 100
                      }%, rgba(255,255,255,0.2) ${((config.guidance || 4.0) / 6) * 100}%, rgba(255,255,255,0.2) 100%)`,
                    }}
                    disabled={disabled}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="topK" className={disabled ? "text-gray-500" : ""}>
                    Top K
                  </Label>
                  <span className="text-sm text-muted-foreground">{config.topK}</span>
                </div>
                <div className="relative pt-1">
                  <input
                    id="topK"
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={config.topK || 40}
                    onChange={(e) => updateConfig({ topK: Number.parseInt(e.target.value) })}
                    className={`w-full h-2 bg-gray-700 rounded-lg appearance-none ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    style={{
                      background: `linear-gradient(to right, ${colors.primary[500]} 0%, ${colors.primary[500]} ${
                        ((config.topK || 40) / 100) * 100
                      }%, rgba(255,255,255,0.2) ${((config.topK || 40) / 100) * 100}%, rgba(255,255,255,0.2) 100%)`,
                    }}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seed" className={disabled ? "text-gray-500" : ""}>
                    Seed
                  </Label>
                  <Input
                    id="seed"
                    type="number"
                    placeholder="Auto"
                    value={config.seed || ""}
                    onChange={(e) => {
                      const value = e.target.value ? Number.parseInt(e.target.value) : undefined
                      updateConfig({ seed: value })
                    }}
                    className={`bg-gray-900/50 border-gray-700 ${disabled ? "opacity-50" : ""}`}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bpm" className={disabled ? "text-gray-500" : ""}>
                    BPM
                  </Label>
                  <Input
                    id="bpm"
                    type="number"
                    placeholder="Auto"
                    min={60}
                    max={200}
                    value={config.bpm || ""}
                    onChange={(e) => {
                      const value = e.target.value ? Number.parseInt(e.target.value) : undefined
                      updateConfig({ bpm: value })
                    }}
                    className={`bg-gray-900/50 border-gray-700 ${disabled ? "opacity-50" : ""}`}
                    disabled={disabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scale" className={disabled ? "text-gray-500" : ""}>
                    Scale
                  </Label>
                  <Select
                    value={config.scale || "SCALE_UNSPECIFIED"}
                    onValueChange={(value) => updateConfig({ scale: value })}
                    disabled={disabled}
                  >
                    <SelectTrigger
                      id="scale"
                      className={`bg-gray-900/50 border-gray-700 ${disabled ? "opacity-50" : ""}`}
                    >
                      <SelectValue placeholder="Auto" />
                    </SelectTrigger>
                    <SelectContent>
                      {scaleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="density" className={cn((autoDensity || disabled) && "text-muted-foreground")}>
                      Density
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Auto</span>
                      <Switch
                        id="auto-density"
                        checked={autoDensity}
                        onCheckedChange={handleAutoDensityChange}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                  {!autoDensity && (
                    <>
                      <div className="relative pt-1">
                        <input
                          id="density"
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={config.density || 0.5}
                          onChange={(e) => updateConfig({ density: Number.parseFloat(e.target.value) })}
                          className={`w-full h-2 bg-gray-700 rounded-lg appearance-none ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                          style={{
                            background: `linear-gradient(to right, ${colors.primary[500]} 0%, ${colors.primary[500]} ${
                              ((config.density || 0.5) / 1) * 100
                            }%, rgba(255,255,255,0.2) ${((config.density || 0.5) / 1) * 100}%, rgba(255,255,255,0.2) 100%)`,
                          }}
                          disabled={disabled}
                        />
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {(config.density || 0.5).toFixed(2)}
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="brightness" className={cn((autoBrightness || disabled) && "text-muted-foreground")}>
                      Brightness
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Auto</span>
                      <Switch
                        id="auto-brightness"
                        checked={autoBrightness}
                        onCheckedChange={handleAutoBrightnessChange}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                  {!autoBrightness && (
                    <>
                      <div className="relative pt-1">
                        <input
                          id="brightness"
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={config.brightness || 0.5}
                          onChange={(e) => updateConfig({ brightness: Number.parseFloat(e.target.value) })}
                          className={`w-full h-2 bg-gray-700 rounded-lg appearance-none ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                          style={{
                            background: `linear-gradient(to right, ${colors.primary[500]} 0%, ${colors.primary[500]} ${
                              ((config.brightness || 0.5) / 1) * 100
                            }%, rgba(255,255,255,0.2) ${((config.brightness || 0.5) / 1) * 100}%, rgba(255,255,255,0.2) 100%)`,
                          }}
                          disabled={disabled}
                        />
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {(config.brightness || 0.5).toFixed(2)}
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className={disabled ? "text-gray-500" : ""}>Generation Mode</Label>
                  <Select
                    value={config.musicGenerationMode || "QUALITY"}
                    onValueChange={(value: "QUALITY" | "DIVERSITY") => updateConfig({ musicGenerationMode: value })}
                    disabled={disabled}
                  >
                    <SelectTrigger className={`bg-gray-900/50 border-gray-700 ${disabled ? "opacity-50" : ""}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QUALITY">Quality</SelectItem>
                      <SelectItem value="DIVERSITY">Diversity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mute-bass"
                    checked={!!config.muteBass}
                    onCheckedChange={(checked) => updateConfig({ muteBass: checked })}
                    disabled={disabled}
                  />
                  <Label htmlFor="mute-bass" className={disabled ? "text-gray-500" : ""}>
                    Mute Bass
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="mute-drums"
                    checked={!!config.muteDrums}
                    onCheckedChange={(checked) => updateConfig({ muteDrums: checked })}
                    disabled={disabled}
                  />
                  <Label htmlFor="mute-drums" className={disabled ? "text-gray-500" : ""}>
                    Mute Drums
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="only-bass-drums"
                    checked={!!config.onlyBassAndDrums}
                    onCheckedChange={(checked) => updateConfig({ onlyBassAndDrums: checked })}
                    disabled={disabled}
                  />
                  <Label htmlFor="only-bass-drums" className={disabled ? "text-gray-500" : ""}>
                    Only Bass & Drums
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default memo(SettingsPanel)
