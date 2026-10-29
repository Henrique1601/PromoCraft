import React from 'react';
import Link from 'next/link';
import { Flame, ExternalLink, ThumbsUp, Scale } from 'lucide-react';
import { Deal, Store } from '@/types/deals';

interface DealCardProps {
  deal: Deal;
  store?: Store;
}

export function DealCard({ deal, store }: DealCardProps) {
  const savings = Math.round(parseFloat(deal.savings));
  const salePriceUSD = parseFloat(deal.salePrice);
  const normalPriceUSD = parseFloat(deal.normalPrice);
  const isFree = salePriceUSD === 0;

  // Cotação estimada USD -> BRL
  const USD_TO_BRL = 5.75;
  const salePriceBRL = (salePriceUSD * USD_TO_BRL).toFixed(2).replace('.', ',');
  const normalPriceBRL = (normalPriceUSD * USD_TO_BRL).toFixed(2).replace('.', ',');

  const storeIconUrl = store?.images.icon
    ? `https://www.cheapshark.com${store.images.icon}`
    : null;

  const dealRedirectUrl = `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(
    deal.dealID
  )}`;

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
              href={dealRedirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500 hover:text-zinc-950"
            >
              <span>Ver</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
