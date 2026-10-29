import React from 'react';
import Link from 'next/link';
import { Flame, ExternalLink, ThumbsUp, Scale } from 'lucide-react';
import { Deal, Store } from '@/types/deals';
import { getDirectStoreUrl } from '@/lib/links';

interface DealCardProps {
  deal: Deal;
  store?: Store;
  rate?: number;
  viewMode?: 'grid' | 'compact' | 'list';
}

export function DealCard({ deal, store, rate = 5.75, viewMode = 'grid' }: DealCardProps) {
  const savings = Math.round(parseFloat(deal.savings));
  const salePriceUSD = parseFloat(deal.salePrice);
  const normalPriceUSD = parseFloat(deal.normalPrice);
  const isFree = salePriceUSD === 0;

  // Cotação dinâmica
  const salePriceBRL = (salePriceUSD * rate).toFixed(2).replace('.', ',');
  const normalPriceBRL = (normalPriceUSD * rate).toFixed(2).replace('.', ',');

  const storeIconUrl = store?.images.icon
    ? `https://www.cheapshark.com${store.images.icon}`
    : null;

  const directStoreUrl = getDirectStoreUrl(
    deal.dealID,
    deal.storeID,
    deal.steamAppID,
    deal.title
  );

  // MODO LISTA / TABELA
  if (viewMode === 'list') {
    return (
      <div className="group flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 transition hover:border-emerald-500/50 hover:bg-zinc-900/90">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href={`/game/${deal.gameID}`} className="h-14 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-950">
            <img src={deal.thumb} alt={deal.title} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/game/${deal.gameID}`} className="block font-semibold text-sm text-zinc-100 hover:text-emerald-400 truncate">
              {deal.title}
            </Link>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
              {store && (
                <span className="flex items-center gap-1">
                  {storeIconUrl && <img src={storeIconUrl} alt={store.storeName} className="h-3 w-3 object-contain" />}
                  <span>{store.storeName}</span>
                </span>
              )}
              {deal.steamRatingPercent && parseInt(deal.steamRatingPercent) > 0 && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <ThumbsUp className="h-3 w-3" />
                  {deal.steamRatingPercent}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-zinc-800/60 pt-2 sm:pt-0">
          {savings > 0 && (
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
              -{savings}%
            </span>
          )}
          <div className="text-right">
            {savings > 0 && (
              <span className="block text-[11px] text-zinc-500 line-through">
                R$ {normalPriceBRL}
              </span>
            )}
            <span className="text-base font-bold text-emerald-400">
              {isFree ? 'GRÁTIS' : `R$ ${salePriceBRL}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/game/${deal.gameID}`}
              title="Comparar preços"
              className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-2 text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400"
            >
              <Scale className="h-3.5 w-3.5" />
            </Link>
            <a
              href={directStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400"
            >
              <span>Ir à Loja</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // MODO COMPACTO
  if (viewMode === 'compact') {
    return (
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2.5 transition hover:border-emerald-500/50 hover:bg-zinc-900/90">
        <Link href={`/game/${deal.gameID}`} className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-zinc-950 block">
          <img src={deal.thumb} alt={deal.title} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
          {savings > 0 && (
            <div className="absolute right-1.5 top-1.5 rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-zinc-950">
              -{savings}%
            </div>
          )}
        </Link>
        <div className="mt-2">
          <Link href={`/game/${deal.gameID}`}>
            <h3 className="line-clamp-1 text-xs font-semibold text-zinc-100 hover:text-emerald-400" title={deal.title}>
              {deal.title}
            </h3>
          </Link>
          <div className="mt-2 flex items-center justify-between border-t border-zinc-800/60 pt-2">
            <span className="text-xs font-bold text-emerald-400">
              {isFree ? 'GRÁTIS' : `R$ ${salePriceBRL}`}
            </span>
            <a
              href={directStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950"
            >
              <span>Loja</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // MODO GRID PADRÃO
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-emerald-950/20">
      {/* Top Banner / Image */}
      <Link href={`/game/${deal.gameID}`} className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-zinc-950 block">
        <img
          src={deal.thumb}
          alt={deal.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badge de Desconto */}
        {savings > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-0.5 text-xs font-bold text-zinc-950 shadow-lg">
            <Flame className="h-3.5 w-3.5 fill-zinc-950 stroke-zinc-950" />
            <span>-{savings}%</span>
          </div>
        )}

        {/* Loja Icon */}
        {store && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-zinc-950/80 px-2 py-1 text-xs backdrop-blur-md">
            {storeIconUrl && (
              <img
                src={storeIconUrl}
                alt={store.storeName}
                className="h-3.5 w-3.5 object-contain"
              />
            )}
            <span className="font-medium text-zinc-300">{store.storeName}</span>
          </div>
        )}
      </Link>

      {/* Title & Info */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/game/${deal.gameID}`} className="block">
            <h3
              className="line-clamp-2 text-sm font-semibold text-zinc-100 group-hover:text-emerald-400"
              title={deal.title}
            >
              {deal.title}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
            {deal.steamRatingPercent && parseInt(deal.steamRatingPercent) > 0 && (
              <div className="flex items-center gap-1 text-emerald-400" title={`Avaliação Steam: ${deal.steamRatingText || ''}`}>
                <ThumbsUp className="h-3 w-3" />
                <span>{deal.steamRatingPercent}%</span>
              </div>
            )}
            {deal.dealRating && (
              <div className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300" title="Nota do Desconto">
                Score: {deal.dealRating}/10
              </div>
            )}
          </div>
        </div>

        {/* Preços e Ações */}
        <div className="mt-4 flex items-end justify-between border-t border-zinc-800/60 pt-3">
          <div>
            {savings > 0 && (
              <span className="block text-[11px] text-zinc-500 line-through">
                R$ {normalPriceBRL} (${normalPriceUSD.toFixed(2)})
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-emerald-400">
                {isFree ? 'GRÁTIS' : `R$ ${salePriceBRL}`}
              </span>
              {!isFree && (
                <span className="text-[10px] text-zinc-400">
                  (${salePriceUSD.toFixed(2)})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href={`/game/${deal.gameID}`}
              title="Comparar preços entre lojas"
              className="flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/80 p-2 text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400"
            >
              <Scale className="h-3.5 w-3.5" />
            </Link>

            <a
              href={directStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 shadow-sm"
            >
              <span>Ir à Loja</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
