import React from 'react';
import { Sparkles, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';

interface AiBuyAdvisorProps {
  title: string;
  currentPriceUSD: number;
  cheapestEverUSD: number;
  retailPriceUSD: number;
  savingsPercent: number;
  rate: number;
}

export function AiBuyAdvisor({
  title,
  currentPriceUSD,
  cheapestEverUSD,
  retailPriceUSD,
  savingsPercent,
  rate,
}: AiBuyAdvisorProps) {
  const curBRL = (currentPriceUSD * rate).toFixed(2).replace('.', ',');
  const cheapBRL = (cheapestEverUSD * rate).toFixed(2).replace('.', ',');
  const diffBRL = Math.max(0, (currentPriceUSD - cheapestEverUSD) * rate).toFixed(2).replace('.', ',');

  const isAtHistoricalLow = currentPriceUSD <= cheapestEverUSD * 1.03;
  const isGoodDeal = savingsPercent >= 50 || currentPriceUSD <= cheapestEverUSD * 1.25;

  let verdict: 'COMPRAR AGORA' | 'BOA OFERTA' | 'AGUARDAR';
  let badgeColor: string;
  let summary: string;

  if (currentPriceUSD === 0) {
    verdict = 'COMPRAR AGORA';
    badgeColor = 'bg-emerald-500 text-zinc-950';
    summary = `${title} está 100% GRÁTIS no momento! Resgate imediatamente antes que a oferta expire.`;
  } else if (isAtHistoricalLow) {
    verdict = 'COMPRAR AGORA';
    badgeColor = 'bg-emerald-500 text-zinc-950';
    summary = `O preço atual (R$ ${curBRL}) está no menor patamar histórico já registrado (R$ ${cheapBRL}). Excelente momento para comprar com ${savingsPercent}% de desconto.`;
  } else if (isGoodDeal) {
    verdict = 'BOA OFERTA';
    badgeColor = 'bg-sky-500 text-zinc-950';
    summary = `${title} está com ${savingsPercent}% de desconto (R$ ${curBRL}). O menor preço histórico foi R$ ${cheapBRL} (diferença de apenas R$ ${diffBRL}). Vale a pena se você pretende jogar em breve.`;
  } else {
    verdict = 'AGUARDAR';
    badgeColor = 'bg-amber-400 text-zinc-950';
    summary = `O desconto atual é de ${savingsPercent}% (R$ ${curBRL}), mas o jogo já custou R$ ${cheapBRL} no passado (economia potencial de R$ ${diffBRL}). Recomendamos criar um alerta de preço e aguardar uma promoção sazonal.`;
  }

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-zinc-900/60 to-zinc-900/40 p-5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-zinc-100">Assistente de Decisão PromoCraft IA</h3>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-extrabold ${badgeColor}`}>
          {verdict === 'COMPRAR AGORA' && <CheckCircle2 className="h-3.5 w-3.5" />}
          {verdict === 'BOA OFERTA' && <TrendingDown className="h-3.5 w-3.5" />}
          {verdict === 'AGUARDAR' && <Clock className="h-3.5 w-3.5" />}
          <span>{verdict}</span>
        </span>
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-zinc-300">{summary}</p>
    </div>
  );
}
