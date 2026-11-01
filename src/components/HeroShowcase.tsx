'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Flame, Sparkles, ExternalLink, Scale, ChevronLeft, ChevronRight, ThumbsUp } from 'lucide-react';
import gsap from 'gsap';
import { Deal, Store } from '@/types/deals';
import { formatBRL } from '@/lib/currency';
import { getDirectStoreUrl } from '@/lib/links';

interface HeroShowcaseProps {
  deals: Deal[];
  stores: Store[];
  rate?: number;
}

export function HeroShowcase({ deals, stores, rate = 5.75 }: HeroShowcaseProps) {
  const storeMap = new Map<string, Store>();
  stores.forEach((s) => storeMap.set(s.storeID, s));

  // Selecionar os 5 melhores destaques (maior economia e melhor rating)
  const featured = deals
    .filter((d) => parseFloat(d.savings) >= 40 && parseFloat(d.normalPrice) >= 15)
    .slice(0, 5);

  const fallbackDeals = featured.length >= 3 ? featured : deals.slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const currentDeal = fallbackDeals[currentIndex] || deals[0];

  // Alternância automática a cada 6 segundos
  useEffect(() => {
    if (isPaused || fallbackDeals.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % fallbackDeals.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, fallbackDeals.length]);

  // Transição GSAP ao trocar de slide
  useEffect(() => {
    if (!infoRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        infoRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }, infoRef);

    return () => ctx.revert();
  }, [currentIndex]);

  if (!currentDeal) return null;

  const currentStore = storeMap.get(currentDeal.storeID);
  const savings = Math.round(parseFloat(currentDeal.savings));
  const saleUSD = parseFloat(currentDeal.salePrice);
  const normalUSD = parseFloat(currentDeal.normalPrice);
  const saleBRL = formatBRL(saleUSD, rate);
  const normalBRL = formatBRL(normalUSD, rate);
  const isFree = saleUSD === 0;

  const directUrl = getDirectStoreUrl(
    currentDeal.dealID,
    currentDeal.storeID,
    currentDeal.steamAppID,
    currentDeal.title
  );

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl shadow-2xl shadow-emerald-950/20"
    >
      {/* Background Cinematográfico Blur com a Arte do Jogo */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img
          src={currentDeal.thumb}
          alt={currentDeal.title}
          className="h-full w-full object-cover scale-110 filter blur-2xl opacity-20 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/60" />
      </div>

      <div className="flex flex-col lg:flex-row items-stretch justify-between p-6 sm:p-8 md:p-10 gap-8 min-h-[380px]">
        {/* Painel Esquerdo: Informações e Chamada de Compra */}
        <div ref={infoRef} className="flex-1 flex flex-col justify-between z-10 max-w-2xl">
          <div>
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 backdrop-blur-md shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                <span>Super Destaque da Semana</span>
              </span>

              {savings >= 70 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
                  <Flame className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span>Preço Histórico</span>
                </span>
              )}

              {currentStore && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-semibold text-zinc-300">
                  {currentStore.images.icon && (
                    <img
                      src={`https://www.cheapshark.com${currentStore.images.icon}`}
                      alt={currentStore.storeName}
                      className="h-3.5 w-3.5 object-contain"
                    />
                  )}
                  <span>{currentStore.storeName}</span>
                </span>
              )}
            </div>

            {/* Título Principal */}
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white line-clamp-2 drop-shadow-md">
              {currentDeal.title}
            </h2>

            {/* Avaliação Steam & Score */}
            <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
              {currentDeal.steamRatingPercent && parseInt(currentDeal.steamRatingPercent) > 0 && (
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{currentDeal.steamRatingPercent}% de aprovação no Steam</span>
                </div>
              )}
              {currentDeal.dealRating && (
                <div className="rounded-md bg-zinc-900/90 border border-zinc-800 px-2.5 py-0.5 font-bold text-zinc-300">
                  Score do Negócio: <span className="text-emerald-400">{currentDeal.dealRating}/10</span>
                </div>
              )}
            </div>
          </div>

          {/* Preço e CTAs */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                {savings > 0 && (
                  <span className="text-xs text-zinc-500 line-through">
                    R$ {normalBRL} (${normalUSD.toFixed(2)})
                  </span>
                )}
                {savings > 0 && (
                  <span className="inline-flex items-center rounded-lg bg-emerald-500 px-2.5 py-0.5 text-xs font-black text-zinc-950 shadow-md">
                    -{savings}% OFF
                  </span>
                )}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight mt-1">
                {isFree ? 'GRÁTIS' : `R$ ${saleBRL}`}
                <span className="text-xs font-normal text-zinc-400 ml-2">
                  (${saleUSD.toFixed(2)} USD)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/game/${currentDeal.gameID}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/90 px-4 py-2.5 text-xs font-bold text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-400 hover:shadow-lg"
              >
                <Scale className="h-4 w-4" />
                <span>Comparar Lojas</span>
              </Link>

              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-zinc-950 transition hover:opacity-95 shadow-lg shadow-emerald-500/25 hover:scale-102"
              >
                <span>Aproveitar Oferta</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Painel Direito: Miniaturas dos Outros Jogos em Destaque */}
        <div className="w-full lg:w-72 flex flex-col justify-between gap-3 z-10 border-t lg:border-t-0 lg:border-l border-zinc-800/80 pt-4 lg:pt-0 lg:pl-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Outros Destaques
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setCurrentIndex((prev) => (prev - 1 + fallbackDeals.length) % fallbackDeals.length)
                }
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:text-white transition"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % fallbackDeals.length)}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:text-white transition"
                aria-label="Próximo"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
            {fallbackDeals.map((d, idx) => {
              const isSelected = idx === currentIndex;
              const dSavings = Math.round(parseFloat(d.savings));
              const dSaleBRL = formatBRL(parseFloat(d.salePrice), rate);

              return (
                <button
                  key={d.dealID}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex items-center gap-3 rounded-xl p-2 text-left transition-all duration-200 border ${
                    isSelected
                      ? 'border-emerald-500/60 bg-emerald-500/10 shadow-md shadow-emerald-950/40'
                      : 'border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700'
                  }`}
                >
                  <img
                    src={d.thumb}
                    alt={d.title}
                    className="h-10 w-16 rounded-lg object-cover flex-shrink-0 border border-zinc-800"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-zinc-200 truncate">
                      {d.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {dSavings > 0 && (
                        <span className="text-[10px] font-bold text-emerald-400">
                          -{dSavings}%
                        </span>
                      )}
                      <span className="text-[11px] font-extrabold text-zinc-300">
                        R$ {dSaleBRL}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Barra de Progresso / Indicadores */}
          <div className="flex items-center gap-1.5 pt-2">
            {fallbackDeals.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'w-8 bg-emerald-400' : 'w-2 bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
