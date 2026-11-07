'use client';

import React from 'react';
import { Sparkles, Calendar, TrendingDown, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { predictSaleTiming } from '@/lib/gameMetrics';

interface DealPredictorBadgeProps {
  currentPriceUSD: number;
  cheapestEverPriceUSD: number;
  savingsPercent: number;
  compact?: boolean;
  className?: string;
}

export function DealPredictorBadge({
  currentPriceUSD,
  cheapestEverPriceUSD,
  savingsPercent,
  compact = false,
  className = '',
}: DealPredictorBadgeProps) {
  const prediction = predictSaleTiming(currentPriceUSD, cheapestEverPriceUSD, savingsPercent);

  if (compact) {
    const isBuy = prediction.verdict === 'BUY_NOW';
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold border ${
          isBuy
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        } ${className}`}
        title={prediction.reason}
      >
        <Sparkles className="h-3 w-3" />
        <span>{isBuy ? 'Compre Agora' : `Espere Sale (~${prediction.daysToNextSale}d)`}</span>
      </span>
    );
  }

  const isBuy = prediction.verdict === 'BUY_NOW';
  const isWait = prediction.verdict === 'WAIT_SALE';

  return (
    <div
      className={`rounded-2xl border p-4 shadow-lg backdrop-blur-md transition ${
        isBuy
          ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
          : isWait
          ? 'border-amber-500/40 bg-amber-950/20 text-amber-200'
          : 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
              isBuy
                ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                : 'border-amber-500/40 bg-amber-500/20 text-amber-300'
            }`}
          >
            <Sparkles className="h-4 w-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                IA Preditiva de Promoções
              </span>
              <span className="rounded-full bg-black/40 border border-white/10 px-2 py-0.2 text-[9px] font-bold">
                {prediction.confidencePercent}% Confiança
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-white mt-0.5">
              {prediction.title}
            </h4>
          </div>
        </div>

        <span
          className={`rounded-lg px-2.5 py-1 text-[11px] font-black uppercase tracking-wider border ${
            isBuy
              ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
              : 'bg-amber-500 text-zinc-950 border-amber-400'
          }`}
        >
          {prediction.verdict === 'BUY_NOW' ? 'Comprar' : 'Aguardar'}
        </span>
      </div>

      <p className="mt-2.5 text-xs text-zinc-300 leading-relaxed">
        {prediction.reason}
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          <span>{prediction.nextMajorSaleName}</span>
        </span>
        <span className="font-semibold text-white">
          Em ~{prediction.daysToNextSale} dias
        </span>
      </div>
    </div>
  );
}
