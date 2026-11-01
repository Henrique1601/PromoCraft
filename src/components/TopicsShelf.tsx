'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ExternalLink, Flame, Scale, ThumbsUp } from 'lucide-react';
import { Deal, Store } from '@/types/deals';
import { formatBRL } from '@/lib/currency';
import { getDirectStoreUrl } from '@/lib/links';

interface TopicsShelfProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  deals: Deal[];
  stores: Store[];
  rate?: number;
}

export function TopicsShelf({
  title,
  subtitle,
  badge,
  icon,
  deals,
  stores,
  rate = 5.75,
}: TopicsShelfProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const storeMap = new Map<string, Store>();
  stores.forEach((s) => storeMap.set(s.storeID, s));

  function scroll(direction: 'left' | 'right') {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -380 : 380;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  }

  if (!deals || deals.length === 0) return null;

  return (
    <div className="relative rounded-3xl border border-zinc-800/80 bg-zinc-950/40 p-5 sm:p-6 backdrop-blur-md">
      {/* Header do Tópico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-emerald-400">{icon}</div>}
            <h3 className="text-xl font-black tracking-tight text-zinc-100 flex items-center gap-2.5">
              <span>{title}</span>
              {badge && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                  {badge}
                </span>
              )}
            </h3>
          </div>
          {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
        </div>

        {/* Botões de Scroll Horizontal */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => scroll('left')}
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 hover:border-emerald-500/50 hover:text-white transition shadow-sm"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 hover:border-emerald-500/50 hover:text-white transition shadow-sm"
            aria-label="Rolar para direita"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carrossel de Cards do Tópico */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {deals.map((deal) => {
          const store = storeMap.get(deal.storeID);
          const savings = Math.round(parseFloat(deal.savings));
          const saleUSD = parseFloat(deal.salePrice);
          const normalUSD = parseFloat(deal.normalPrice);
          const saleBRL = formatBRL(saleUSD, rate);
          const normalBRL = formatBRL(normalUSD, rate);
          const isFree = saleUSD === 0;

          const storeIcon = store?.images.icon
            ? `https://www.cheapshark.com${store.images.icon}`
            : null;

          const directUrl = getDirectStoreUrl(
            deal.dealID,
            deal.storeID,
            deal.steamAppID,
            deal.title
          );

          return (
            <div
              key={deal.dealID}
              className="group flex-shrink-0 w-64 flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-emerald-950/30"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Thumbnail com Badges */}
              <Link
                href={`/game/${deal.gameID}`}
                className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-zinc-950 block border border-zinc-800"
              >
                <img
                  src={deal.thumb}
                  alt={deal.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {savings > 0 && (
                  <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-gradient-to-r from-emerald-500 to-teal-400 px-2 py-0.5 text-xs font-black text-zinc-950 shadow-md">
                    <Flame className="h-3 w-3 fill-zinc-950" />
                    <span>-{savings}%</span>
                  </div>
                )}

                {store && (
                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1.5 rounded-md bg-zinc-950/80 px-2 py-0.5 text-[11px] backdrop-blur-md border border-zinc-800/60 font-semibold text-zinc-300">
                    {storeIcon && (
                      <img src={storeIcon} alt={store.storeName} className="h-3 w-3 object-contain" />
                    )}
                    <span>{store.storeName}</span>
                  </div>
                )}
              </Link>

              {/* Informações */}
              <div className="mt-3 flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/game/${deal.gameID}`}>
                    <h4
                      className="line-clamp-2 text-xs font-bold text-zinc-100 group-hover:text-emerald-400 transition"
                      title={deal.title}
                    >
                      {deal.title}
                    </h4>
                  </Link>

                  {deal.steamRatingPercent && parseInt(deal.steamRatingPercent) > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{deal.steamRatingPercent}% aprovação</span>
                    </div>
                  )}
                </div>

                {/* Preço e Botão */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-end justify-between">
                  <div>
                    {savings > 0 && (
                      <span className="block text-[10px] text-zinc-500 line-through">
                        R$ {normalBRL}
                      </span>
                    )}
                    <span className="text-base font-black text-emerald-400 tracking-tight">
                      {isFree ? 'GRÁTIS' : `R$ ${saleBRL}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/game/${deal.gameID}`}
                      title="Comparar preços"
                      className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-1.5 text-zinc-300 hover:text-emerald-400 hover:border-emerald-500 transition"
                    >
                      <Scale className="h-3.5 w-3.5" />
                    </Link>
                    <a
                      href={directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition shadow-sm"
                    >
                      <span>Loja</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
