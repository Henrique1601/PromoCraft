'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bot, Tag, Gamepad2, Sparkles } from 'lucide-react';

interface BottomNavProps {
  onOpenAiConcierge: () => void;
  onOpenSteamModal: () => void;
}

export function BottomNav({ onOpenAiConcierge, onOpenSteamModal }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around text-center">
        {/* Início */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-[11px] font-bold transition ${
            pathname === '/'
              ? 'text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Início</span>
        </Link>

        {/* IA Concierge */}
        <button
          onClick={onOpenAiConcierge}
          className="flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-[11px] font-bold text-zinc-400 hover:text-emerald-400 transition"
        >
          <Bot className="h-5 w-5 text-emerald-400" />
          <span>IA Deals</span>
        </button>

        {/* Sync Steam */}
        <button
          onClick={onOpenSteamModal}
          className="flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-[11px] font-bold text-zinc-400 hover:text-emerald-400 transition"
        >
          <Gamepad2 className="h-5 w-5 text-indigo-400" />
          <span>Sync Steam</span>
        </button>

        {/* Wishlist */}
        <Link
          href="/wishlist"
          className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-[11px] font-bold transition ${
            pathname === '/wishlist'
              ? 'text-emerald-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Tag className="h-5 w-5" />
          <span>Wishlist</span>
        </Link>
      </div>
    </div>
  );
}
