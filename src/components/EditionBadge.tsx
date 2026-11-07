'use client';

import React from 'react';
import { Award, Crown, Sparkles, Layers } from 'lucide-react';
import { detectGameEdition, GameEditionType } from '@/lib/gameMetrics';

interface EditionBadgeProps {
  title: string;
  className?: string;
}

export function EditionBadge({ title, className = '' }: EditionBadgeProps) {
  const edition = detectGameEdition(title);
  if (edition === 'Standard') return null;

  let colorClass = 'bg-zinc-800 text-zinc-300 border-zinc-700';
  let Icon = Layers;

  if (edition === 'GOTY / Complete') {
    colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm';
    Icon = Crown;
  } else if (edition === 'Ultimate') {
    colorClass = 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm';
    Icon = Sparkles;
  } else if (edition === 'Gold') {
    colorClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-sm';
    Icon = Award;
  } else if (edition === 'Deluxe') {
    colorClass = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm';
    Icon = Sparkles;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${colorClass} ${className}`}
      title={`Edição especial com DLCs ou conteúdo adicional: ${edition}`}
    >
      <Icon className="h-3 w-3" />
      <span>{edition}</span>
    </span>
  );
}
