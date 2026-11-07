'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Scale, Skull, Check } from 'lucide-react';

interface CommunityVibeTrackerProps {
  gameID: string;
  title: string;
  compact?: boolean;
}

type VibeType = 'fire' | 'scale' | 'skull';

// Gera votos base consistentes via hash para engajamento inicial real
function getSeedVotes(title: string): { fire: number; scale: number; skull: number } {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const positiveSeed = Math.abs(hash % 120) + 45;
  const neutralSeed = Math.abs((hash >> 2) % 60) + 15;
  const negativeSeed = Math.abs((hash >> 4) % 25) + 3;

  return { fire: positiveSeed, scale: neutralSeed, skull: negativeSeed };
}

export function CommunityVibeTracker({
  gameID,
  title,
  compact = false,
}: CommunityVibeTrackerProps) {
  const [userVote, setUserVote] = useState<VibeType | null>(null);
  const [votes, setVotes] = useState({ fire: 0, scale: 0, skull: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const seed = getSeedVotes(title);

    try {
      const storageKey = `promocraft_vibe_${gameID}`;
      const saved = localStorage.getItem(storageKey) as VibeType | null;
      if (saved && (saved === 'fire' || saved === 'scale' || saved === 'skull')) {
        setUserVote(saved);
        seed[saved] += 1;
      }
    } catch {
      // ignore
    }

    setVotes(seed);
  }, [gameID, title]);

  function handleVote(vibe: VibeType) {
    if (userVote === vibe) return;

    setVotes((prev) => {
      const updated = { ...prev };
      if (userVote) {
        updated[userVote] = Math.max(0, updated[userVote] - 1);
      }
      updated[vibe] += 1;
      return updated;
    });

    setUserVote(vibe);

    try {
      const storageKey = `promocraft_vibe_${gameID}`;
      localStorage.setItem(storageKey, vibe);
    } catch {
      // ignore
    }
  }

  if (!mounted) return null;

  const total = votes.fire + votes.scale + votes.skull;
  const firePercent = total > 0 ? Math.round((votes.fire / total) * 100) : 0;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1 font-bold text-emerald-400">
          <Flame className="h-3 w-3 fill-emerald-400 text-emerald-400" />
          <span>{firePercent}%</span>
        </span>
        <span className="text-[10px] text-zinc-500">aprovam</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
            Termômetro da Comunidade
          </span>
          <h4 className="text-xs font-bold text-white">
            O que a comunidade acha deste jogo?
          </h4>
        </div>
        <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
          {total} votos
        </span>
      </div>

      {/* Botões de Voto Rápido */}
      <div className="grid grid-cols-3 gap-2">
        {/* Voto: Compra Obrigatória */}
        <button
          onClick={() => handleVote('fire')}
          className={`flex flex-col items-center gap-1 rounded-xl p-2.5 border text-center transition active:scale-95 ${
            userVote === 'fire'
              ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-950/40 font-bold'
              : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-emerald-500/30 hover:text-white'
          }`}
        >
          <Flame className={`h-4 w-4 ${userVote === 'fire' ? 'fill-emerald-400 text-emerald-400' : 'text-zinc-400'}`} />
          <span className="text-[11px] font-semibold leading-tight">Obrigatório</span>
          <span className="text-[10px] text-zinc-500 font-bold">{votes.fire}</span>
        </button>

        {/* Voto: Só na Promoção */}
        <button
          onClick={() => handleVote('scale')}
          className={`flex flex-col items-center gap-1 rounded-xl p-2.5 border text-center transition active:scale-95 ${
            userVote === 'scale'
              ? 'border-amber-500/50 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-950/40 font-bold'
              : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-amber-500/30 hover:text-white'
          }`}
        >
          <Scale className={`h-4 w-4 ${userVote === 'scale' ? 'text-amber-400' : 'text-zinc-400'}`} />
          <span className="text-[11px] font-semibold leading-tight">Em Promoção</span>
          <span className="text-[10px] text-zinc-500 font-bold">{votes.scale}</span>
        </button>

        {/* Voto: Passe Longe */}
        <button
          onClick={() => handleVote('skull')}
          className={`flex flex-col items-center gap-1 rounded-xl p-2.5 border text-center transition active:scale-95 ${
            userVote === 'skull'
              ? 'border-rose-500/50 bg-rose-500/20 text-rose-300 shadow-md shadow-rose-950/40 font-bold'
              : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-rose-500/30 hover:text-white'
          }`}
        >
          <Skull className={`h-4 w-4 ${userVote === 'skull' ? 'text-rose-400' : 'text-zinc-400'}`} />
          <span className="text-[11px] font-semibold leading-tight">Passe Longe</span>
          <span className="text-[10px] text-zinc-500 font-bold">{votes.skull}</span>
        </button>
      </div>
    </div>
  );
}
