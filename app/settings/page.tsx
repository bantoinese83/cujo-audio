"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Not logged in");
        setLoading(false);
        return;
      }
      setUser(user);
      setEmail(user.email ?? "");
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (profileError) {
        setError(profileError.message);
      } else if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
      } else {
        // No profile row exists
        setProfile(null);
        setFullName("");
        setAvatarUrl("");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ full_name: fullName, avatar_url: avatarUrl })
        .eq("id", user.id);
      if (updateError) throw updateError;
      setSuccess("Profile updated!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (!password) throw new Error("Password cannot be empty");
      const { error: pwError } = await supabase.auth.updateUser({ password });
      if (pwError) throw pwError;
      setSuccess("Password updated!");
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

  return (
    <div className="relative max-w-lg mx-auto mt-12 bg-black/60 backdrop-blur-xl border border-purple-900/40 rounded-3xl shadow-2xl p-8 overflow-hidden">
      {/* Cujo logo watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0">
        <Image src="/images/cujo-dog-logo.png" alt="Cujo Logo" width={160} height={160} className="w-40 h-40 object-contain" priority />
      </div>
      <h2 className="relative z-10 text-3xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 animate-gradient-x drop-shadow-lg">User Settings</h2>
      {success && <div className="relative z-10 text-green-400 mb-4 text-center">{success}</div>}
      {error && <div className="relative z-10 text-red-400 mb-4 text-center">{error}</div>}
      <div className="relative z-10 flex flex-col items-center mb-6">
        <Image src={avatarUrl || '/images/default-avatar.png'} alt="Avatar" width={96} height={96} className="w-24 h-24 rounded-full mb-2 border-2 border-purple-500 shadow-lg" />
        <input type="text" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="Avatar URL" className="w-full mb-4 p-2 rounded-lg bg-gray-800/80 text-white border border-purple-900/30 focus:border-purple-500 transition-all" />
      </div>
      <div className="relative z-10 mb-4">
        <label className="block mb-2 text-gray-300 font-semibold">Display Name</label>
        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full mb-4 p-2 rounded-lg bg-gray-800/80 text-white border border-purple-900/30 focus:border-purple-500 transition-all" />
      </div>
      <div className="relative z-10 mb-4">
        <label className="block mb-2 text-gray-300 font-semibold">Email</label>
        <input type="text" value={email} disabled className="w-full mb-4 p-2 rounded-lg bg-gray-800/80 text-gray-400 border border-purple-900/30" />
      </div>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 rounded-lg font-semibold mb-4 transition-all shadow-md" disabled={saving}>Save Profile</Button>
      </form>
      <form onSubmit={e => { e.preventDefault(); handleChangePassword(); }}>
        <div className="relative z-10 mb-4">
          <label className="block mb-2 text-gray-300 font-semibold">Change Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" className="w-full mb-2 p-2 rounded-lg bg-gray-800/80 text-white border border-purple-900/30 focus:border-purple-500 transition-all" />
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 rounded-lg font-semibold transition-all shadow" disabled={saving || !password}>Update Password</Button>
        </div>
      </form>
    </div>
  );
} 