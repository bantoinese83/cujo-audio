"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, X, ChevronRight, Lightbulb, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function HelpGuide() {
  const [isOpen, setIsOpen] = useState(false)

  const tips = [
    "Try combining multiple genres like 'Ambient Jazz with Electronic elements'",
    "Adjust the temperature slider for more creative or predictable results",
    "Use specific instruments in your prompts like 'Piano-driven Lofi with subtle drums'",
    "Describe emotions in your prompts: 'Melancholic strings with hopeful piano'",
    "Experiment with different guidance values to control how closely the AI follows your prompt",
  ]

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full bg-purple-900/50 hover:bg-purple-800 backdrop-blur-md z-50"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-full max-w-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-gray-900/90 border-purple-900/50 backdrop-blur-xl">
                <CardHeader className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 rounded-full hover:bg-gray-800"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
                    Cujo Audio Guide
                  </CardTitle>
                  <CardDescription>Learn how to create amazing AI-generated music</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="getting-started">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
                      <TabsTrigger value="prompts">Prompt Tips</TabsTrigger>
                      <TabsTrigger value="settings">Settings Guide</TabsTrigger>
                    </TabsList>

                    <TabsContent value="getting-started" className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <span className="inline-block bg-purple-900/50 rounded-full p-1">
                            <ChevronRight className="h-4 w-4 text-purple-400" />
                          </span>
                          Step 1: Create Prompts
                        </h3>
                        <p className="text-sm text-gray-400 pl-8">
                          Enter descriptive text prompts about the music you want to create. Try genres, moods,
                          instruments, or styles.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <span className="inline-block bg-purple-900/50 rounded-full p-1">
                            <ChevronRight className="h-4 w-4 text-purple-400" />
                          </span>
                          Step 2: Adjust Settings
                        </h3>
                        <p className="text-sm text-gray-400 pl-8">
                          Fine-tune your generation parameters. Temperature controls creativity, guidance controls how
                          closely to follow your prompt.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          <span className="inline-block bg-purple-900/50 rounded-full p-1">
                            <ChevronRight className="h-4 w-4 text-purple-400" />
                          </span>
                          Step 3: Generate Music
                        </h3>
                        <p className="text-sm text-gray-400 pl-8">
                          Press play to start generating. Music will stream in real-time. You can pause or reset
                          anytime.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="prompts">
                      <div className="space-y-4">
                        <div className="bg-purple-950/30 rounded-lg p-4 border border-purple-900/50">
                          <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            Prompt Tips
                          </h3>
                          <ul className="space-y-2">
                            {tips.map((tip, index) => (
                              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                                <span className="text-purple-400 mt-0.5">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">Example Prompts:</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="bg-gray-800/50 rounded p-2 text-sm">"Trap Soul with atmospheric pads"</div>
                            <div className="bg-gray-800/50 rounded p-2 text-sm">"Lo-Fi Drill with vinyl crackle"</div>
                            <div className="bg-gray-800/50 rounded p-2 text-sm">"Melodic Trap with 808 slides"</div>
                            <div className="bg-gray-800/50 rounded p-2 text-sm">"Phonk with chopped vocals"</div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-4">
                      <div className="space-y-3">
                        <div className="border-b border-gray-800 pb-2">
                          <h3 className="font-medium">Temperature (0-3)</h3>
                          <p className="text-sm text-gray-400">
                            Controls randomness and creativity. Higher values produce more varied results.
                          </p>
                          <div className="text-xs text-gray-500 grid grid-cols-3 mt-1">
                            <span>0.5: Predictable</span>
                            <span className="text-center">1.1: Balanced</span>
                            <span className="text-right">2+: Experimental</span>
                          </div>
                        </div>

                        <div className="border-b border-gray-800 pb-2">
                          <h3 className="font-medium">Guidance (0-6)</h3>
                          <p className="text-sm text-gray-400">
                            Controls how closely the AI follows your prompt. Higher values stick closer to your
                            description.
                          </p>
                          <div className="text-xs text-gray-500 grid grid-cols-3 mt-1">
                            <span>1-2: Loose</span>
                            <span className="text-center">3-4: Balanced</span>
                            <span className="text-right">5+: Strict</span>
                          </div>
                        </div>

                        <div className="border-b border-gray-800 pb-2">
                          <h3 className="font-medium">Top K (1-100)</h3>
                          <p className="text-sm text-gray-400">
                            Limits the diversity of choices the AI makes. Lower values are more focused.
                          </p>
                        </div>

                        <div>
                          <h3 className="font-medium">Advanced Settings</h3>
                          <p className="text-sm text-gray-400">
                            Fine-tune with BPM, scale, density, and more in the Advanced Settings tab.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Info className="h-4 w-4 text-purple-400" />
                    <span>Cujo Audio uses Gemini AI to generate music in real-time</span>
                  </div>
                  <Button variant="default" onClick={() => setIsOpen(false)}>
                    Got it
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
