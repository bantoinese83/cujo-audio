"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/logo";
import { createSupabaseClient } from "@/utils/supabaseClient";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/gallery", label: "Gallery" },
    { href: "/my-music", label: "My Music" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-xl border-b border-purple-900/40 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="md" />
        </Link>
        <nav className="hidden md:flex gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg font-semibold text-white hover:bg-purple-900/30 transition-all bg-gradient-to-r from-purple-900/10 to-blue-900/10 hover:from-purple-900/30 hover:to-blue-900/30"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {!user && (
            <Link href="/login">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-all">Login / Signup</button>
            </Link>
          )}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="ml-2 cursor-pointer">
                  <Avatar>
                    <AvatarImage src={user.user_metadata?.avatar_url || "/images/default-avatar.png"} alt={user.user_metadata?.full_name || user.email} />
                    <AvatarFallback>{(user.user_metadata?.full_name || user.email || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {/* Mobile nav */}
      <nav className="md:hidden flex gap-1 px-2 pb-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex-1 text-center px-2 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-900/10 to-blue-900/10 hover:from-purple-900/30 hover:to-blue-900/30 transition-all"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
} 