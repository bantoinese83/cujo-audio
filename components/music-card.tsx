import { useState, useEffect, useRef } from 'react'
import { createSupabaseClient } from '@/utils/supabaseClient'
import { useToast } from '@/hooks/use-toast'
import { Download, Scissors } from 'lucide-react'

export default function MusicCard({ track, onExportStems }: { track: any, onExportStems?: (track: any) => void }) {
  const [likes, setLikes] = useState(track.likes || 0)
  const [liked, setLiked] = useState(false)
  const [listens, setListens] = useState(track.listens || 0)
  const [downloads, setDownloads] = useState(track.download_count || 0)
  const [playing, setPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [likeLoading, setLikeLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const supabase = createSupabaseClient()
  const { toast } = useToast()
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    // Subscribe to realtime updates for this track
    const channel = supabase.channel(`track-${track.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'music_tracks',
          filter: `id=eq.${track.id}`,
        },
        (payload) => {
          const newTrack = payload.new
          setLikes(newTrack.likes || 0)
          setListens(newTrack.listens || 0)
          setDownloads(newTrack.download_count || 0)
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
  }, [track.id])

  const handleLike = async () => {
    if (liked || likeLoading) {
      return
    }
    setLikeLoading(true)
    setLiked(true)
    setLikes((l: number) => l + 1)
    try {
      await supabase.from('music_likes').insert({ track_id: track.id })
      await supabase.from('music_tracks').update({ likes: likes + 1 }).eq('id', track.id)
      toast({ title: 'Liked!', description: 'You liked this track.' })
    } catch (err: any) {
      setLiked(false)
      setLikes((l: number) => l - 1)
      toast({ title: 'Error', description: err.message || 'Failed to like', variant: 'destructive' })
    } finally {
      setLikeLoading(false)
    }
  }

  const handleListen = async () => {
    setListens((l: number) => l + 1)
    await supabase.from('music_listens').insert({ track_id: track.id })
    await supabase.from('music_tracks').update({ listens: listens + 1 }).eq('id', track.id)
  }

  const handleDownload = async () => {
    if (downloadLoading) {
      return
    }
    setDownloadLoading(true)
    setDownloads((d: number) => d + 1)
    try {
      await supabase.from('music_downloads').insert({ track_id: track.id })
      await supabase.from('music_tracks').update({ download_count: downloads + 1 }).eq('id', track.id)
      window.open(track.audio_url, '_blank')
      toast({ title: 'Downloaded!', description: 'Track download started.' })
    } catch (err: any) {
      setDownloads((d: number) => d - 1)
      toast({ title: 'Error', description: err.message || 'Failed to download', variant: 'destructive' })
    } finally {
      setDownloadLoading(false)
    }
  }

  const handlePlay = () => {
    if (audio) {
      audio.play()
      setPlaying(true)
      handleListen()
    } else {
      const a = new window.Audio(track.audio_url)
      setAudio(a)
      a.play()
      setPlaying(true)
      handleListen()
      a.onended = () => setPlaying(false)
    }
  }

  const handlePause = () => {
    if (audio) {
      audio.pause()
      setPlaying(false)
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg p-4 flex flex-col items-center w-full max-w-xs mx-auto">
      <img src={track.cover_url || '/images/default-cover.png'} alt="Cover" className="w-32 h-32 rounded-lg mb-2 object-cover" />
      <h3 className="text-lg font-bold text-white mb-1 text-center line-clamp-2">{track.title}</h3>
      <div className="text-xs text-gray-400 mb-2 truncate w-full text-center">by {track.profiles?.full_name || 'Unknown Artist'}</div>
      <audio src={track.audio_url} controls className="w-full mb-2" onPlay={handlePlay} onPause={handlePause} />
      <div className="flex gap-3 mb-2 w-full justify-center">
        <button
          onClick={handleLike}
          className={`text-pink-400 hover:text-pink-300 transition-all font-bold flex items-center gap-1 disabled:opacity-50`}
          disabled={liked || likeLoading}
          aria-label="Like this track"
        >
          ♥ <span className="transition-all duration-200">{likes}</span>
        </button>
        <span className="text-blue-400 flex items-center gap-1">▶ <span className="transition-all duration-200">{listens}</span></span>
        <button
          onClick={handleDownload}
          className="text-yellow-400 hover:text-yellow-300 transition-all flex items-center gap-1 disabled:opacity-50"
          disabled={downloadLoading}
          aria-label="Download this track"
        >
          ↓ <span className="transition-all duration-200">{downloads}</span>
        </button>
        <button
          onClick={() => onExportStems && onExportStems(track)}
          className="text-purple-400 hover:text-purple-300 transition-all flex items-center gap-1 disabled:opacity-50"
          title="Export & Separate Stems"
          style={{ marginLeft: 8 }}
          disabled={track.stems_ready}
        >
          <Scissors className="h-5 w-5" />
        </button>
      </div>
      {track.stems_ready && (
        <div className="mt-2">
          <a href={`/api/download-stems?track_id=${track.id}`} className="text-purple-400 underline text-xs">Download Stems</a>
        </div>
      )}
    </div>
  )
} 