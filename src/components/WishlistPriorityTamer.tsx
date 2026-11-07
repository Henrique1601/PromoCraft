'use client';

import React, { useState } from 'react';
import { Sparkles, Trophy, ArrowRight, Zap, Target, DollarSign, Clock } from 'lucide-react';
import { WishlistItemForAchievements } from './WishlistAchievements';
import { calculateCostPerHour } from '@/lib/gameMetrics';

interface WishlistPriorityTamerProps {
  items: WishlistItemForAchievements[];
  rate?: number;
}

export function WishlistPriorityTamer({ items, rate = 5.75 }: WishlistPriorityTamerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length < 2) return null;

  // Classifica itens por prioridade matemática:
  // Score = (% desconto ou proximidade do recorde) + (bônus se custo por hora for baixo)
  const rankedItems = [...items].map((item) => {
    const currentPriceBRL = (item.currentBestPrice || 0) * rate;
    const cheapestEverBRL = (item.cheapestPriceEver || 0) * rate;
    const isRecord = cheapestEverBRL > 0 && currentPriceBRL <= cheapestEverBRL * 1.05;
    const costInfo = calculateCostPerHour(currentPriceBRL, item.title);

    let priorityScore = 0;
    if (isRecord) priorityScore += 50;
    if (costInfo.verdictLabel === 'Lendário') priorityScore += 40;
    else if (costInfo.verdictLabel === 'Excelente') priorityScore += 25;
    else if (costInfo.verdictLabel === 'Bom') priorityScore += 10;
    if (item.targetPrice && currentPriceBRL <= item.targetPrice) priorityScore += 30;

    let tier: 'TOP_PICK' | 'SOLID' | 'BACKLOG' = 'BACKLOG';
    if (priorityScore >= 60) tier = 'TOP_PICK';
    else if (priorityScore >= 30) tier = 'SOLID';

    return {
      ...item,
      currentPriceBRL,
      isRecord,
      costInfo,
      priorityScore,
      tier,
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  const topPick = rankedItems[0];

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-zinc-900/60 to-purple-950/20 p-5 backdrop-blur-md shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                IA Backlog Tamer
              </span>
              <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.2 text-[9px] font-bold text-indigo-300">
                Estratégia de Aquisição
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              O que comprar primeiro na sua lista?
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="self-start sm:self-auto rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500/20 transition active:scale-95"
        >
          {isOpen ? 'Ocultar Estratégia' : 'Ver Priorização IA'}
        </button>
      </div>

      {/* Destaque Principal: Top 1 Recomendação */}
      {topPick && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs">
              #1
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                Melhor Custo x Benefício Imediato
              </span>
              <span className="text-sm font-extrabold text-white block">
                {topPick.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-zinc-400">
              R$ {topPick.costInfo.formattedCost}/hora (~{topPick.costInfo.hours}h)
            </span>
            <span className="font-black text-emerald-400 text-sm">
              R$ {topPick.currentPriceBRL.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      )}

      {/* Lista Completa Ranqueada se Aberto */}
      {isOpen && (
        <div className="space-y-2 pt-2 border-t border-zinc-800/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Ordem de Prioridade Recomendada pela IA:
          </span>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {rankedItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-zinc-500 font-bold text-[11px] w-5">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                    {item.title}
                  </span>
                  {item.isRecord && (
                    <span className="rounded bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-300">
                      Recorde
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-zinc-400 hidden sm:inline">
                    R$ {item.costInfo.formattedCost}/h
                  </span>
                  <span className="font-bold text-emerald-400">
                    R$ {item.currentPriceBRL.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
