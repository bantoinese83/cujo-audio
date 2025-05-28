"use client";

import { motion } from "framer-motion";
import MusicGenerator from "@/components/music-generator";
import { EnhancedBackground } from "@/components/enhanced-background";
import { Logo } from "@/components/logo";
import { FeatureHighlights } from "@/components/feature-highlights";
import { HelpGuide } from "@/components/help-guide";
import { WelcomeBanner } from "@/components/welcome-banner";
import { animations } from "@/lib/design-system";
import { AppProvider } from "@/store/context";
import WhosItFor from "@/components/whos-it-for";
import HowItWorks from "@/components/how-it-works";
import Testimonials from "@/components/testimonials";
import FAQSection from "@/components/faq-section";

export default function Home() {
  return (
    <AppProvider>
      <main className="relative min-h-screen overflow-hidden">
        <EnhancedBackground />
        <WelcomeBanner />
        <HelpGuide />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 pt-16 pb-16">
          <motion.div
            className="w-full max-w-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: animations.easings.easeOut }}
          >
            {/* Header */}
            <motion.div
              className="flex flex-col items-center justify-center mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: animations.easings.elastic }}
            >
              <Logo size="xl" />

              <motion.p
                className="text-center text-gray-400 mt-4 mb-8 text-lg max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Transform your ideas into music with AI. Create unique tracks
                from simple text prompts.
              </motion.p>
            </motion.div>

            <FeatureHighlights />
            <HowItWorks />
            <MusicGenerator />
            <WhosItFor />
            <Testimonials />
            <FAQSection />

            {/* Footer */}
            <motion.div
              className="mt-12 text-center text-gray-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <p>Cujo Audio © 2025 • Powered by Gemini AI</p>
              <p className="mt-1">
                <a href="#" className="hover:text-purple-400 transition-colors">
                  Terms
                </a>{" "}
                •
                <a
                  href="#"
                  className="hover:text-purple-400 transition-colors ml-3"
                >
                  Privacy
                </a>{" "}
                •
                <a
                  href="#"
                  className="hover:text-purple-400 transition-colors ml-3"
                >
                  Help
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </AppProvider>
  );
}
