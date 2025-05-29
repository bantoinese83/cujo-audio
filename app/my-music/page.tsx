'use client'

import { useEffect, useState, useRef } from 'react'
import { createSupabaseClient } from '@/utils/supabaseClient'
import MusicCard from '@/components/music-card'

export default function MyMusicPage() {
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createSupabaseClient()
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Not logged in')
        setLoading(false)
        return
      }
      setUserId(user.id)
      const { data, error } = await supabase
        .from('music_tracks')
        .select('*, profiles(full_name, avatar_url)')
        .eq('user_id', user.id)
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

  useEffect(() => {
    if (!userId) {
      return
    }
    // Subscribe to realtime updates for this user's tracks
    const channel = supabase.channel(`user-tracks-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'music_tracks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTracks((prev) => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTracks((prev) => prev.map((t) => t.id === payload.new.id ? { ...t, ...payload.new } : t))
          }
        }
      )
      .subscribe()
    subscriptionRef.current = channel
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>

  return (
    <div className="max-w-6xl mx-auto mt-12">
      <h2 className="text-3xl font-bold mb-8 text-white text-center">My Music Library</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tracks.map(track => (
          <MusicCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  )
} 