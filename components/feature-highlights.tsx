"use client"

import { motion } from "framer-motion"
import { Music, Sliders, Palette, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function FeatureHighlights() {
  const features = [
    {
      icon: <Music className="h-5 w-5 text-purple-500" />,
      title: "Text-to-Music",
      description: "Generate unique music from simple text prompts",
    },
    {
      icon: <Sliders className="h-5 w-5 text-cyan-500" />,
      title: "Fine-tune Controls",
      description: "Adjust parameters to perfect your sound",
    },
    {
      icon: <Palette className="h-5 w-5 text-fuchsia-500" />,
      title: "Multiple Genres",
      description: "Create anything from ambient to techno to jazz",
    },
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: "Real-time Generation",
      description: "Hear your music as it's being created",
    },
  ]

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full bg-black/30 border-purple-900/30 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="rounded-full bg-gray-900/80 p-3 mb-3">{feature.icon}</div>
              <h3 className="font-medium text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
