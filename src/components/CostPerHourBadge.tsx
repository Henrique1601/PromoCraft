'use client';

import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { calculateCostPerHour } from '@/lib/gameMetrics';

interface CostPerHourBadgeProps {
  priceBRL: number;
  title: string;
  className?: string;
  compact?: boolean;
}

export function CostPerHourBadge({
  priceBRL,
  title,
  className = '',
  compact = false,
}: CostPerHourBadgeProps) {
  if (priceBRL <= 0) return null;

  const result = calculateCostPerHour(priceBRL, title);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${result.badgeColor} ${className}`}
        title={`Campanha estimada em ~${result.hours}h de gameplay. Custo: R$ ${result.formattedCost} por hora jogada.`}
      >
        <Clock className="h-3 w-3" />
        <span>R$ {result.formattedCost}/h</span>
      </span>
    );
  }

  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition ${result.badgeColor} ${className}`}
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <div>
          <span className="font-extrabold block text-white">
            R$ {result.formattedCost} <span className="text-[10px] font-normal text-zinc-400">/ hora de jogo</span>
          </span>
          <span className="text-[10px] text-zinc-400 block">
            ~{result.hours}h de campanha estimada (HowLongToBeat)
          </span>
        </div>
      </div>

      <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
        {result.verdictLabel}
      </span>
    </div>
  );
}
