"use client";

import { Logo } from "@/components/logo";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-black/80 border-t border-gray-800 px-4 flex flex-col md:flex-row items-center justify-between gap-4 z-50 min-h-[56px] h-[56px]">
      <div className="flex items-center gap-2">
        {/* Upside-down triangle SVG logo */}
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="object-contain">
          <polygon points="16,28 2,4 30,4" fill="#ff3d00" stroke="#fff" strokeWidth="2" />
        </svg>
        <span className="text-gray-300 font-semibold text-sm">Cujo Audio © 2025 • Powered by Gemini AI</span>
      </div>
      <div className="flex items-center gap-6 text-gray-400 text-sm">
        <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
        <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
        <a href="#" className="hover:text-purple-400 transition-colors">Help</a>
      </div>
    </footer>
  );
} 