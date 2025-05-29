"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseClient } from "@/utils/supabaseClient";
import { Flame, Trophy, ArrowUpRight, ArrowDownRight, Music, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

function getTrendingScore(track: any) {
  // Simple trending score: recent likes + listens + downloads (last 7 days)
  // You can improve this with time decay, etc.
  return (
    (track.recent_likes || 0) * 2 +
    (track.recent_listens || 0) +
    (track.recent_downloads || 0) * 1.5
  );
}

export default function ChartsSection() {
  const [trending, setTrending] = useState<any[]>([]);
  const [top, setTop] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();
  const { toast } = useToast();
  const trendingRef = useRef<any>(null);
  const topRef = useRef<any>(null);

  // Fetch trending and top tracks
  useEffect(() => {
    const fetchCharts = async () => {
      setLoading(true);
      // Trending: last 7 days
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      // Trending: aggregate recent likes/listens/downloads
      const { data: trendingData, error: trendingError } = await supabase.rpc("get_trending_tracks", { since });
      // Top: all-time
      const { data: topData, error: topError } = await supabase
        .from("music_tracks")
        .select("*, profiles(full_name, avatar_url)")
        .eq("is_public", true)
        .order("likes", { ascending: false })
        .limit(10);
      if (trendingError || topError) {
        toast({ title: "Failed to load charts", description: trendingError?.message || topError?.message, variant: "destructive" });
      }
      setTrending(trendingData || []);
      setTop(topData || []);
      setLoading(false);
    };
    fetchCharts();
  }, [supabase, toast]);

  // Realtime updates for trending/top
  useEffect(() => {
    const trendingSub = supabase
      .channel("trending-charts")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "music_tracks" },
        (payload) => {
          // Refetch on stat change
          if (trendingRef.current) trendingRef.current();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(trendingSub);
    };
  }, [supabase]);

  // Refetch handler for realtime
  trendingRef.current = async () => {
    setLoading(true);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: trendingData } = await supabase.rpc("get_trending_tracks", { since });
    setTrending(trendingData || []);
    setLoading(false);
  };

  // UI helpers
  const getRankIcon = (i: number) => {
    if (i === 0) return <Trophy className="h-5 w-5 text-yellow-400 animate-bounce" />;
    if (i === 1) return <Trophy className="h-5 w-5 text-gray-300" />;
    if (i === 2) return <Trophy className="h-5 w-5 text-orange-400" />;
    return <span className="font-bold text-lg text-purple-400">{i + 1}</span>;
  };

  return (
    <section className="w-full max-w-5xl mx-auto my-12 px-4">
      <motion.h2
        className="text-3xl md:text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-fuchsia-400 to-blue-400 animate-gradient-x drop-shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <Flame className="inline h-7 w-7 text-orange-500 mr-2 animate-pulse" /> Trending & Top Charts
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Trending Tracks */}
        <motion.div
          className="bg-black/60 rounded-3xl border border-orange-900/40 shadow-2xl backdrop-blur-2xl p-6 overflow-hidden"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 animate-pulse" /> Trending Now
          </h3>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <ol className="space-y-4">
              {trending.map((track, i) => (
                <motion.li
                  key={track.id}
                  className="flex items-center gap-4 bg-gradient-to-r from-orange-900/30 to-purple-900/20 rounded-xl p-3 hover:scale-[1.02] transition-transform shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <div className="flex-shrink-0">{getRankIcon(i)}</div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={track.profiles?.avatar_url || "/images/default-avatar.png"} alt={track.profiles?.full_name || "User"} />
                    <AvatarFallback>{(track.profiles?.full_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{track.title || "Untitled"}</div>
                    <div className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <User className="h-3 w-3 mr-1" /> {track.profiles?.full_name || "Anonymous"}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="bg-orange-700/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Flame className="h-3 w-3" /> {getTrendingScore(track)}
                    </span>
                    <span className="bg-purple-700/60 text-white text-xs px-2 py-1 rounded-full">{track.recent_likes || 0} Likes</span>
                    <span className="bg-blue-700/60 text-white text-xs px-2 py-1 rounded-full">{track.recent_listens || 0} Listens</span>
                    <span className="bg-amber-700/60 text-white text-xs px-2 py-1 rounded-full">{track.recent_downloads || 0} Downloads</span>
                  </div>
                  {/* Trending indicator */}
                  {track.trending_up ? (
                    <ArrowUpRight className="h-5 w-5 text-green-400 animate-bounce" title="Rising" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-400" title="Falling" />
                  )}
                </motion.li>
              ))}
            </ol>
          )}
        </motion.div>
        {/* Top Tracks */}
        <motion.div
          className="bg-black/60 rounded-3xl border border-yellow-900/40 shadow-2xl backdrop-blur-2xl p-6 overflow-hidden"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 animate-bounce" /> Top Tracks
          </h3>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <ol className="space-y-4">
              {top.map((track, i) => (
                <motion.li
                  key={track.id}
                  className="flex items-center gap-4 bg-gradient-to-r from-yellow-900/30 to-purple-900/20 rounded-xl p-3 hover:scale-[1.02] transition-transform shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <div className="flex-shrink-0">{getRankIcon(i)}</div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={track.profiles?.avatar_url || "/images/default-avatar.png"} alt={track.profiles?.full_name || "User"} />
                    <AvatarFallback>{(track.profiles?.full_name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{track.title || "Untitled"}</div>
                    <div className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <User className="h-3 w-3 mr-1" /> {track.profiles?.full_name || "Anonymous"}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="bg-yellow-700/60 text-white text-xs px-2 py-1 rounded-full">{track.likes || 0} Likes</span>
                    <span className="bg-blue-700/60 text-white text-xs px-2 py-1 rounded-full">{track.listens || 0} Listens</span>
                    <span className="bg-amber-700/60 text-white text-xs px-2 py-1 rounded-full">{track.download_count || 0} Downloads</span>
                  </div>
                </motion.li>
              ))}
            </ol>
          )}
        </motion.div>
      </div>
    </section>
  );
} 