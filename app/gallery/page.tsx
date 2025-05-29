'use client'
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/utils/supabaseClient'
import MusicCard from '@/components/music-card'
    

export default function GalleryPage() {
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true)
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('music_tracks')
        .select('*, profiles(full_name, avatar_url)')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      if (error) {
        setError(error.message)
      } else {
        setTracks(data)
      }
      setLoading(false)
    }
    fetchTracks()
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">Cujo Music Gallery</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tracks.map(track => (
          <MusicCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  )
} 