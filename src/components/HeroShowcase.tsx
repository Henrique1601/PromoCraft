'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Flame,
  Sparkles,
  ExternalLink,
  Scale,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Gamepad2,
  Tag,
} from 'lucide-react';
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
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
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

  // Imagem de alta resolução: prioriza Steam header widescreen oficial se houver steamAppID
  const highResBanner =
    currentDeal.steamAppID && currentDeal.steamAppID !== '0'
      ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${currentDeal.steamAppID}/header.jpg`
      : currentDeal.thumb;

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
      className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl shadow-2xl shadow-emerald-950/30"
    >
      {/* Background Atmosférico com a Arte do Jogo iluminando o container */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img
          key={`bg-${currentDeal.dealID}`}
          src={highResBanner}
          alt={currentDeal.title}
          className="h-full w-full object-cover scale-110 filter blur-3xl opacity-35 transition-all duration-1000"
          onError={(e) => {
            if (e.currentTarget.src !== currentDeal.thumb) {
              e.currentTarget.src = currentDeal.thumb;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/70" />
      </div>

      <div className="flex flex-col xl:flex-row items-stretch justify-between p-5 sm:p-7 md:p-8 gap-7 min-h-[380px]">
        {/* Painel Central: Arte do Jogo em Primeiro Plano + Informações */}
        <div
          ref={infoRef}
          className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-6 z-10"
        >
          {/* 1. GRANDE IMAGEM DE CAPA DO JOGO EM DESTAQUE (Solução para o vazio preto) */}
          <Link
            href={`/game/${currentDeal.gameID}`}
            className="group/img relative aspect-video w-full md:w-80 lg:w-96 shrink-0 overflow-hidden rounded-2xl border border-emerald-500/30 bg-zinc-950 shadow-2xl shadow-emerald-950/50 block"
            title={`Ver detalhes de ${currentDeal.title}`}
          >
            <img
              key={`cover-${currentDeal.dealID}`}
              src={highResBanner}
              alt={currentDeal.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-105"
              onError={(e) => {
                if (e.currentTarget.src !== currentDeal.thumb) {
                  e.currentTarget.src = currentDeal.thumb;
                }
              }}
            />

            {/* Badges Flutuantes sobre a Imagem */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              {savings > 0 && (
                <span className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-black text-zinc-950 shadow-lg">
                  <Flame className="h-3.5 w-3.5 fill-current" />
                  <span>-{savings}%</span>
                </span>
              )}
              {savings >= 70 && (
                <span className="rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-black text-zinc-950 shadow-lg">
                  RECORDE
                </span>
              )}
            </div>

            {currentStore && (
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-lg bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 px-2.5 py-1 text-[11px] font-bold text-zinc-200">
                {currentStore.images.icon && (
                  <img
                    src={`https://www.cheapshark.com${currentStore.images.icon}`}
                    alt={currentStore.storeName}
                    className="h-3.5 w-3.5 object-contain"
                  />
                )}
                <span>{currentStore.storeName}</span>
              </div>
            )}

            {currentDeal.steamAppID && (
              <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 p-1 text-indigo-400">
                <Gamepad2 className="h-3.5 w-3.5" />
              </div>
            )}
          </Link>

          {/* 2. Informações, Preços e Botões de Compra */}
          <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
            <div>
              {/* Badges de Destaque */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 backdrop-blur-md shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                  <span>Super Destaque da Semana</span>
                </span>

                {currentDeal.dealRating && (
                  <span className="rounded-full bg-zinc-900/90 border border-zinc-800 px-2.5 py-0.5 text-xs font-bold text-zinc-300">
                    Score: <b className="text-emerald-400">{currentDeal.dealRating}/10</b>
                  </span>
                )}
              </div>

              {/* Título Principal */}
              <Link href={`/game/${currentDeal.gameID}`}>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white line-clamp-2 hover:text-emerald-400 transition drop-shadow-md">
                  {currentDeal.title}
                </h2>
              </Link>

              {/* Avaliação Steam */}
              {currentDeal.steamRatingPercent && parseInt(currentDeal.steamRatingPercent) > 0 && (
                <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{currentDeal.steamRatingPercent}% de avaliações positivas no Steam</span>
                </div>
              )}
            </div>

            {/* Preço e Botões */}
            <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-end justify-between gap-4">
              <div>
                {savings > 0 && (
                  <span className="text-xs text-zinc-500 line-through block">
                    R$ {normalBRL} (${normalUSD.toFixed(2)})
                  </span>
                )}
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mt-0.5">
                  {isFree ? 'GRÁTIS' : `R$ ${saleBRL}`}
                  <span className="text-xs font-normal text-zinc-400 ml-2">
                    (${saleUSD.toFixed(2)} USD)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Link
                  href={`/game/${currentDeal.gameID}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3.5 py-2 text-xs font-bold text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-400 active:scale-95"
                >
                  <Scale className="h-4 w-4" />
                  <span>Comparar</span>
                </Link>

                <a
                  href={directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-2 text-xs sm:text-sm font-extrabold text-zinc-950 transition hover:opacity-95 shadow-lg shadow-emerald-500/25 active:scale-95"
                >
                  <span>Aproveitar Oferta</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Lateral: Outros Jogos em Destaque */}
        <div className="w-full xl:w-72 flex flex-col justify-between gap-2.5 z-10 border-t xl:border-t-0 xl:border-l border-zinc-800/80 pt-4 xl:pt-0 xl:pl-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
              Outros Destaques
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setCurrentIndex((prev) => (prev - 1 + fallbackDeals.length) % fallbackDeals.length)
                }
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:text-white transition active:scale-95"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % fallbackDeals.length)}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-400 hover:text-white transition active:scale-95"
                aria-label="Próximo"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Lista de Miniaturas dos Destaques */}
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-2">
            {fallbackDeals.map((d, idx) => {
              const isSelected = idx === currentIndex;
              const dSavings = Math.round(parseFloat(d.savings));
              const dSaleBRL = formatBRL(parseFloat(d.salePrice), rate);
              const dImg =
                d.steamAppID && d.steamAppID !== '0'
                  ? `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${d.steamAppID}/header.jpg`
                  : d.thumb;

              return (
                <button
                  key={d.dealID}
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex items-center gap-3 rounded-xl p-2 text-left transition-all duration-200 border ${
                    isSelected
                      ? 'border-emerald-500/70 bg-emerald-500/15 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                      : 'border-zinc-800/70 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700'
                  }`}
                >
                  <img
                    src={dImg}
                    alt={d.title}
                    className="h-10 w-16 rounded-lg object-cover flex-shrink-0 border border-zinc-800"
                    onError={(e) => {
                      if (e.currentTarget.src !== d.thumb) {
                        e.currentTarget.src = d.thumb;
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-zinc-200 truncate">
                      {d.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {dSavings > 0 && (
                        <span className="text-[10px] font-black text-emerald-400">
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

          {/* Indicadores de Slide */}
          <div className="flex items-center gap-1.5 pt-1">
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
