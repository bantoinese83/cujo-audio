"use client";

import { useState } from "react";
import { Logo } from "@/components/logo";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, UserPlus, LogIn } from "lucide-react";
import { createSupabaseClient } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const supabase = createSupabaseClient();
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) {
          throw error;
        }
        // After signup, create profile row if not exists
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          if (!profile && !profileError) {
            await supabase.from('profiles').insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || "",
              avatar_url: user.user_metadata?.avatar_url || "",
              email: user.email,
            });
          }
        }
        setSuccess("Signup successful! Check your email to confirm.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        // After login, create profile row if not exists
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
          if (!profile && !profileError) {
            await supabase.from('profiles').insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || "",
              avatar_url: user.user_metadata?.avatar_url || "",
              email: user.email,
            });
          }
        }
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => router.push("/"), 1200);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-black/80">
      {/* Left: Logo & Branding */}
      <motion.div
        className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-purple-900/80 via-fuchsia-900/60 to-blue-900/80 relative overflow-hidden"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Logo size="xl" />
        <h2 className="mt-8 text-4xl font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 animate-gradient-x drop-shadow-lg text-center">Welcome to Cujo Audio</h2>
        <p className="mt-4 text-lg text-gray-200 text-center max-w-md">AI-powered music generation. Create, save, and share unique tracks from simple text prompts.</p>
        <ul className="mt-8 space-y-3 text-gray-300 text-base max-w-xs">
          <li>🎵 Generate music from text</li>
          <li>🔒 Secure, privacy-first auth</li>
          <li>🌈 Save, remix, and share tracks</li>
          <li>⚡ Real-time streaming & analytics</li>
        </ul>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-10 pointer-events-none">
          <Logo size="xl" />
        </div>
      </motion.div>
      {/* Right: Auth Form */}
      <motion.div
        className="flex flex-1 items-center justify-center bg-black/60 backdrop-blur-xl relative"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
      >
        <form
          className="relative z-10 bg-black/70 border border-purple-900/40 rounded-3xl shadow-2xl p-10 w-full max-w-md flex flex-col gap-6"
          onSubmit={handleAuth}
        >
          <div className="flex items-center gap-3 mb-2">
            {isSignup ? <UserPlus className="h-6 w-6 text-purple-400" /> : <LogIn className="h-6 w-6 text-purple-400" />}
            <h2 className="text-2xl font-bold text-white">{isSignup ? "Sign Up" : "Sign In"}</h2>
          </div>
          <AnimatePresence>
            {isSignup && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <label className="block text-sm text-gray-300 mb-1">Full Name</label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required={isSignup}
                  className="mb-2"
                  autoComplete="name"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-purple-400"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div className="text-red-400 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div className="text-green-400 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {success}
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-2"
            disabled={loading}
          >
            {loading ? (isSignup ? "Signing up..." : "Signing in...") : isSignup ? "Sign Up" : "Sign In"}
          </Button>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-400 text-sm">
              {isSignup ? "Already have an account?" : "Don't have an account?"}
            </span>
            <button
              type="button"
              className="text-purple-400 hover:underline text-sm font-semibold ml-2"
              onClick={() => {
                setIsSignup(v => !v);
                setError(null);
                setSuccess(null);
              }}
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </form>
        {/* Mobile: show logo in background */}
        <div className="absolute inset-0 flex md:hidden items-center justify-center opacity-10 pointer-events-none">
          <Logo size="xl" />
        </div>
      </motion.div>
    </div>
  );
} 