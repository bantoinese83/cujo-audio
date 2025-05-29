"use client";

import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import MusicCard from "@/components/music-card";
import { createSupabaseClient } from '@/utils/supabaseClient'
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import ChartsSection from "@/components/ChartsSection";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { X } from "lucide-react"

function StemModal({ open, onOpenChange, track, onClose }: { open: boolean, onOpenChange: (v: boolean) => void, track: any, onClose: () => void }) {
  const [stemCount, setStemCount] = useState<2 | 4 | 5>(2)
  const [step, setStep] = useState<'idle' | 'downloading' | 'uploading' | 'separating' | 'saving' | 'complete'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [stems, setStems] = useState<Record<string, { data: string; filename: string }> | null>(null)

  const stepLabels = [
    { key: 'downloading', label: '1. Downloading', color: 'text-blue-400' },
    { key: 'uploading', label: '2. Uploading', color: 'text-purple-400' },
    { key: 'separating', label: '3. Separating', color: 'text-amber-400' },
    { key: 'saving', label: '4. Saving', color: 'text-green-400' },
    { key: 'complete', label: '5. Complete', color: 'text-green-500' },
  ]
  const stepOrder = ['downloading', 'uploading', 'separating', 'saving', 'complete']
  const currentStepIndex = stepOrder.indexOf(step)

  const handleSeparate = async () => {
    setStep('downloading')
    setError(null)
    setStems(null)
    try {
      console.log('[StemModal] Downloading audio...')
      // Download the audio file as a blob
      const audioRes = await fetch(track.audio_url)
      if (!audioRes.ok) {
        throw new Error('Failed to download audio')
      }
      const audioBlob = await audioRes.blob()
      setStep('uploading')
      console.log('[StemModal] Uploading audio to API...')
      // Prepare form data
      const formData = new FormData()
      formData.append('file', audioBlob, track.title || 'music.wav')
      formData.append('stems', String(stemCount))
      setStep('separating')
      console.log('[StemModal] Requesting stem separation...')
      // Call the API
      const res = await fetch('/api/separate-stems', { method: 'POST', body: formData })
      if (!res.ok) {
        throw new Error('Stem separation failed')
      }
      const data = await res.json()
      setStep('saving')
      console.log('[StemModal] Saving stems to state...')
      setStems(data.stems)
      setStep('complete')
      console.log('[StemModal] Stem separation complete!')
    } catch (err: any) {
      setError(err.message || 'Unknown error')
      setStep('idle')
      console.error('[StemModal] Error:', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Stem Separation</DialogTitle>
        <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <div className="mb-2 text-gray-300">Separate this track into stems using Spleeter.</div>
        {/* Progress Bar and Step Indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            {stepLabels.map((s, i) => (
              <span
                key={s.key}
                className={`text-xs font-semibold transition-colors duration-300 ${step === s.key ? s.color + ' animate-pulse' : 'text-gray-400'}`}
              >
                {s.label}
              </span>
            ))}
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-2 transition-all duration-500 rounded-full ${
                step === 'downloading' ? 'bg-blue-400 w-1/5' :
                step === 'uploading' ? 'bg-purple-400 w-2/5' :
                step === 'separating' ? 'bg-amber-400 w-3/5' :
                step === 'saving' ? 'bg-green-400 w-4/5' :
                step === 'complete' ? 'bg-green-500 w-full' : 'w-0'
              }`}
            ></div>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="stem-count" className="block text-sm text-gray-300 mb-1">Number of Stems</label>
          <select
            id="stem-count"
            value={stemCount}
            onChange={e => setStemCount(Number(e.target.value) as 2 | 4 | 5)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            disabled={step !== 'idle'}
          >
            <option value={2}>2 (Vocals + Accompaniment)</option>
            <option value={4}>4 (Vocals, Drums, Bass, Other)</option>
            <option value={5}>5 (Vocals, Drums, Bass, Piano, Other)</option>
          </select>
        </div>
        <Button onClick={handleSeparate} disabled={step !== 'idle'} className="w-full mb-4">
          {step === 'idle' ? `Separate (${stemCount} stems)` :
            step === 'downloading' ? 'Downloading...' :
            step === 'uploading' ? 'Uploading...' :
            step === 'separating' ? 'Separating...' :
            step === 'saving' ? 'Saving...' :
            step === 'complete' ? 'Done!' : 'Processing...'}
        </Button>
        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
        {stems && (
          <div className="space-y-2 mt-2">
            {Object.entries(stems).map(([stem, { data, filename }]) => (
              <div key={stem} className="mb-2">
                <div className="font-medium text-purple-300 mb-1 capitalize">{stem}</div>
                <a
                  href={`data:audio/wav;base64,${data}`}
                  download={filename}
                  className="block text-blue-400 underline mb-1"
                >
                  Download {filename}
                </a>
                <audio controls className="w-full">
                  <source src={`data:audio/wav;base64,${data}`} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const router = useRouter();
  const [showStemModal, setShowStemModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase
      .from("music_tracks")
      .select("*, profiles(full_name, avatar_url)")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => setGallery(data || []));
  }, []);

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const handleExportStems = (track: any) => {
    setSelectedTrack(track);
    setShowStemModal(true);
  };

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
                Transform your ideas into music with AI. Create unique tracks from simple text prompts.
              </motion.p>
            </motion.div>

            <FeatureHighlights />
            <ChartsSection />
            <HowItWorks />
            <MusicGenerator />

            {/* Gallery Preview */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Featured Tracks</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {gallery.map((track) => (
                  <MusicCard key={track.id} track={track} onExportStems={handleExportStems} />
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Link href="/gallery">
                  <Button variant="ghost">View All</Button>
                </Link>
              </div>
            </div>

            {showStemModal && selectedTrack && (
              <StemModal
                open={showStemModal}
                onOpenChange={setShowStemModal}
                track={selectedTrack}
                onClose={() => setShowStemModal(false)}
              />
            )}

            <WhosItFor />
            <Testimonials />
            <FAQSection />
          </motion.div>
        </div>
      </main>
    </AppProvider>
  );
}
