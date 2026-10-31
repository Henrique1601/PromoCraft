'use client';

import React from 'react';
import { Sparkles, TrendingDown, Clock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface DealVerdictProps {
  currentPrice: number;
  cheapestEverPrice: number;
  retailPrice: number;
  rate: number;
  title: string;
}

export function DealVerdictCard({
  currentPrice,
  cheapestEverPrice,
  retailPrice,
  rate,
  title,
}: DealVerdictProps) {
  const currentBRL = (currentPrice * rate).toFixed(2).replace('.', ',');
  const cheapestEverBRL = (cheapestEverPrice * rate).toFixed(2).replace('.', ',');
  const retailBRL = (retailPrice * rate).toFixed(2).replace('.', ',');
  const savingsPercent = retailPrice > 0 ? Math.round(((retailPrice - currentPrice) / retailPrice) * 100) : 0;
  
  // Análise de proximidade do menor preço histórico
  const isHistoricLow = cheapestEverPrice > 0 && currentPrice <= cheapestEverPrice * 1.05;
  const isGoodDeal = !isHistoricLow && savingsPercent >= 30;

  let verdict = {
    title: 'COMPRA OBRIGATÓRIA — Recorde Histórico',
    badgeText: 'Melhor Momento',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    borderClass: 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-zinc-900/60',
    icon: Sparkles,
    iconColor: 'text-emerald-400',
    description: `Este jogo está no menor preço histórico registrado (ou a menos de 5% dele). Dificilmente você encontrará uma condição melhor nos próximos meses.`,
    advice: `Economia de ${savingsPercent}% em relação ao preço regular de R$ ${retailBRL}.`,
    action: 'Oportunidade ideal para ativação imediata.',
  };

  if (!isHistoricLow && isGoodDeal) {
    const diffFromLowest = ((currentPrice - cheapestEverPrice) * rate).toFixed(2).replace('.', ',');
    verdict = {
      title: 'BOM PREÇO — Desconto Expressivo',
      badgeText: 'Preço Atrativo',
      badgeClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      borderClass: 'border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 to-zinc-900/60',
      icon: TrendingDown,
      iconColor: 'text-cyan-400',
      description: `Com ${savingsPercent}% de desconto, é um preço bastante favorável. O menor valor histórico absoluto foi de R$ ${cheapestEverBRL} (apenas R$ ${diffFromLowest} a menos).`,
      advice: `Excelente para quem planeja jogar agora sem esperar as grandes liquidações sazonais.`,
      action: 'Boa relação custo-benefício garantida.',
    };
  } else if (!isHistoricLow && !isGoodDeal) {
    verdict = {
      title: 'AGUARDE A PRÓXIMA SALE — Desconto Superficial',
      badgeText: 'Recomenda-se Esperar',
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      borderClass: 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-zinc-900/60',
      icon: Clock,
      iconColor: 'text-amber-400',
      description: `O jogo está próximo do preço de tabela ou com desconto modesto. O histórico revela que ele costuma receber reduções bem mais agressivas (atingindo até R$ ${cheapestEverBRL}).`,
      advice: `Adicione o jogo à sua Wishlist abaixo para ser notificado automaticamente quando o preço despencar.`,
      action: 'Vale mais a pena aguardar as próximas semanas.',
    };
  }

  const VerdictIcon = verdict.icon;

  return (
    <div className={`rounded-2xl border p-5 backdrop-blur-md shadow-xl transition ${verdict.borderClass}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 shadow-inner">
            <VerdictIcon className={`h-5 w-5 ${verdict.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Assistente de Compra Inteligente
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${verdict.badgeClass}`}>
                {verdict.badgeText}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-zinc-100">
              {verdict.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Diagnóstico em Tempo Real</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="md:col-span-2 space-y-2">
          <p className="text-zinc-300 leading-relaxed text-sm">
            {verdict.description}
          </p>
          <div className="flex items-center gap-2 text-zinc-400">
            <ArrowRight className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
            <span>{verdict.advice}</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-zinc-400">Resumo da Análise</span>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-zinc-300">
              <span>Menor Histórico:</span>
              <span className="font-bold text-white">R$ {cheapestEverBRL}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Preço Atual:</span>
              <span className="font-bold text-emerald-400">R$ {currentBRL}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Desconto Máx:</span>
              <span className="font-semibold text-emerald-400">-{savingsPercent}%</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 text-center">
            {verdict.action}
          </div>
        </div>
      </div>
    </div>
  );
}
