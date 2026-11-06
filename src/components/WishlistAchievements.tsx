'use client';

import React from 'react';
import {
  Trophy,
  Target,
  Sparkles,
  Flame,
  Shield,
  Zap,
  Gift,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export interface WishlistItemForAchievements {
  id: string;
  gameID: string;
  title: string;
  steamAppID?: string;
  cheapestPriceEver?: number;
  currentBestPrice?: number;
  targetPrice?: number;
  email?: string;
  discordWebhook?: string;
}

interface WishlistAchievementsProps {
  items: WishlistItemForAchievements[];
  totalSavingsBRL: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  xp: number;
  progressText?: string;
}

export function calculateAchievements(
  items: WishlistItemForAchievements[],
  totalSavingsBRL: number
): {
  achievements: Achievement[];
  unlockedCount: number;
  totalXp: number;
  currentLevel: number;
  levelTitle: string;
  progressPercent: number;
} {
  const hasHistoricLow = items.some(
    (i) =>
      i.currentBestPrice != null &&
      i.cheapestPriceEver != null &&
      i.currentBestPrice > 0 &&
      i.currentBestPrice <= i.cheapestPriceEver * 1.05
  );

  const hasHighSavings = totalSavingsBRL >= 100;

  const steamCount = items.filter((i) => Boolean(i.steamAppID)).length;
  const isValveCitizen = steamCount >= 3;

  const hasFiveItems = items.length >= 5;

  const hasAlertSet = items.some(
    (i) =>
      Boolean(i.targetPrice && i.targetPrice > 0) ||
      Boolean(i.email) ||
      Boolean(i.discordWebhook)
  );

  const hasFreebie = items.some(
    (i) => i.currentBestPrice != null && i.currentBestPrice === 0
  );

  const achievements: Achievement[] = [
    {
      id: 'sniper',
      title: 'Sniper de Recordes',
      description: 'Tenha na lista ao menos 1 jogo no menor preço histórico',
      icon: Target,
      unlocked: hasHistoricLow,
      xp: 150,
      progressText: hasHistoricLow ? 'Desbloqueado!' : 'Aguardando recorde',
    },
    {
      id: 'piggy_bank',
      title: 'Mão de Vaca Lendário',
      description: 'Acumule mais de R$ 100 em economia estimada',
      icon: Flame,
      unlocked: hasHighSavings,
      xp: 200,
      progressText: `R$ ${totalSavingsBRL.toFixed(0)} / R$ 100`,
    },
    {
      id: 'valve_citizen',
      title: 'Cidadão da Valve',
      description: 'Tenha 3 ou mais jogos importados ou vinculados à Steam',
      icon: Shield,
      unlocked: isValveCitizen,
      xp: 120,
      progressText: `${Math.min(steamCount, 3)} / 3 jogos`,
    },
    {
      id: 'pix_master',
      title: 'Mestre do Orçamento',
      description: 'Monitore 5 ou mais títulos simultaneamente',
      icon: Zap,
      unlocked: hasFiveItems,
      xp: 180,
      progressText: `${Math.min(items.length, 5)} / 5 títulos`,
    },
    {
      id: 'guardian',
      title: 'Guardião de Preço',
      description: 'Configure uma meta de preço ou alerta em um jogo',
      icon: Sparkles,
      unlocked: hasAlertSet,
      xp: 150,
      progressText: hasAlertSet ? 'Meta configurada' : 'Nenhuma meta ativa',
    },
    {
      id: 'freebie_hunter',
      title: 'Caçador de Freebies',
      description: 'Tenha ao menos uma oferta 100% grátis na lista',
      icon: Gift,
      unlocked: hasFreebie,
      xp: 200,
      progressText: hasFreebie ? 'Oferta grátis salva' : 'Aguardando giveaway',
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXp = achievements
    .filter((a) => a.unlocked)
    .reduce((acc, a) => acc + a.xp, 0);

  let currentLevel = 1;
  let levelTitle = 'Gamer Iniciante';

  if (unlockedCount >= 5) {
    currentLevel = 5;
    levelTitle = 'Lenda dos Descontos';
  } else if (unlockedCount >= 4) {
    currentLevel = 4;
    levelTitle = 'Mestre da Economia Gamer';
  } else if (unlockedCount >= 3) {
    currentLevel = 3;
    levelTitle = 'Estrategista das Steam Sales';
  } else if (unlockedCount >= 2) {
    currentLevel = 2;
    levelTitle = 'Caçador de Promoções';
  } else if (unlockedCount >= 1) {
    currentLevel = 1;
    levelTitle = 'Gamer Poupador';
  }

  const maxAchievements = achievements.length;
  const progressPercent = Math.round((unlockedCount / maxAchievements) * 100);

  return {
    achievements,
    unlockedCount,
    totalXp,
    currentLevel,
    levelTitle,
    progressPercent,
  };
}

export function WishlistAchievements({
  items,
  totalSavingsBRL,
}: WishlistAchievementsProps) {
  const {
    achievements,
    unlockedCount,
    totalXp,
    currentLevel,
    levelTitle,
    progressPercent,
  } = calculateAchievements(items, totalSavingsBRL);

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl space-y-4">
      {/* Header com Nível e XP */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-amber-400 shadow-md shadow-emerald-950/40">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Nível {currentLevel} • {levelTitle}
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                {totalXp} XP
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              Conquistas de Economia Gamer
            </h3>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full sm:w-56 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400">
            <span>Progresso da Coleção</span>
            <span className="font-bold text-white">
              {unlockedCount} / {achievements.length} ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid de Badges / Conquistas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {achievements.map((ach) => {
          const Icon = ach.icon;
          return (
            <div
              key={ach.id}
              className={`group relative flex items-start gap-3 rounded-xl p-3 border transition-all ${
                ach.unlocked
                  ? 'border-emerald-500/30 bg-emerald-950/15 hover:border-emerald-500/50 shadow-sm shadow-emerald-950/30'
                  : 'border-zinc-800/80 bg-zinc-950/40 opacity-60 hover:opacity-80'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
                  ach.unlocked
                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-sm'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs font-bold truncate ${
                      ach.unlocked ? 'text-white' : 'text-zinc-400'
                    }`}
                  >
                    {ach.title}
                  </span>
                  {ach.unlocked ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Lock className="h-3 w-3 text-zinc-500 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-snug">
                  {ach.description}
                </p>
                <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-zinc-500">
                  <span>{ach.progressText}</span>
                  <span className="text-emerald-400/80">+{ach.xp} XP</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
