'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, ThumbsUp, Gamepad2, Bell, Heart, Check } from 'lucide-react';
import { Deal, Store } from '@/types/deals';
import { getDirectStoreUrl } from '@/lib/links';
import { formatBRL } from '@/lib/currency';
import { sound } from '@/lib/sound';
import { PriceAlertModal } from '@/components/PriceAlertModal';

interface DealsTableProps {
  deals: Deal[];
  stores: Store[];
  rate?: number;
}

export function DealsTable({ deals, stores, rate = 5.75 }: DealsTableProps) {
  const [selectedDealForAlert, setSelectedDealForAlert] = useState<Deal | null>(null);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('promocraft_wishlist_v1');
        if (raw) {
          const list = JSON.parse(raw);
          return new Set(list.map((i: any) => i.gameID));
        }
      } catch {}
    }
    return new Set();
  });

  const storeMap = new Map<string, Store>();
  stores.forEach((s) => storeMap.set(s.storeID, s));

  const toggleWishlist = (deal: Deal) => {
    sound.playClick();
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem('promocraft_wishlist_v1');
      const list = raw ? JSON.parse(raw) : [];
      const isAlready = wishlistedIds.has(deal.gameID);

      let updatedList;
      if (isAlready) {
        updatedList = list.filter((i: any) => i.gameID !== deal.gameID);
        const nextSet = new Set(wishlistedIds);
        nextSet.delete(deal.gameID);
        setWishlistedIds(nextSet);
      } else {
        const newItem = {
          id: `local_${Date.now()}_${deal.gameID}`,
          gameID: deal.gameID,
          title: deal.title,
          thumb: deal.thumb,
          steamAppID: deal.steamAppID || null,
          currentBestPrice: parseFloat(deal.salePrice) || null,
          cheapestPriceEver: null,
          createdAt: new Date().toISOString(),
        };
        updatedList = [newItem, ...list];
        const nextSet = new Set(wishlistedIds);
        nextSet.add(deal.gameID);
        setWishlistedIds(nextSet);
        sound.playSuccess();
      }

      localStorage.setItem('promocraft_wishlist_v1', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch {}
  };

  return (
    <>
      {selectedDealForAlert && (
        <PriceAlertModal
          deal={selectedDealForAlert}
          currentPriceBRL={formatBRL(parseFloat(selectedDealForAlert.salePrice), rate)}
          rate={rate}
          onClose={() => setSelectedDealForAlert(null)}
        />
      )}

      <div className="w-full overflow-x-auto rounded-3xl border border-zinc-800/80 bg-zinc-950/60 shadow-xl backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-zinc-800/80 bg-zinc-900/60 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="py-3.5 pl-4 pr-2 w-12">Jogo</th>
              <th className="py-3.5 px-3">Título & Plataforma</th>
              <th className="py-3.5 px-3">Loja</th>
              <th className="py-3.5 px-3 text-right">Preço Normal</th>
              <th className="py-3.5 px-3 text-right">Melhor Preço</th>
              <th className="py-3.5 px-3 text-center">Desconto</th>
              <th className="py-3.5 px-3 text-center">Avaliação</th>
              <th className="py-3.5 pr-4 pl-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {deals.map((deal) => {
              const store = storeMap.get(deal.storeID);
              const storeIconUrl = store?.images.icon
                ? `https://www.cheapshark.com${store.images.icon}`
                : null;
              const directStoreUrl = getDirectStoreUrl(
                deal.dealID,
                deal.storeID,
                deal.steamAppID,
                deal.title
              );

              const saleUSD = parseFloat(deal.salePrice);
              const normalUSD = parseFloat(deal.normalPrice);
              const saleBRL = formatBRL(saleUSD, rate);
              const normalBRL = formatBRL(normalUSD, rate);
              const savings = Math.round(parseFloat(deal.savings));
              const isFree = saleUSD === 0;
              const isWishlisted = wishlistedIds.has(deal.gameID);
              const isRecord = savings >= 75 || parseFloat(deal.dealRating || '0') >= 9.5;

              return (
                <tr
                  key={deal.dealID}
                  className="group hover:bg-zinc-900/50 transition-colors duration-150"
                >
                  {/* Capa Compacta */}
                  <td className="py-2.5 pl-4 pr-2">
                    <Link
                      href={`/game/${deal.gameID}`}
                      className="block h-8 w-14 overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800/80 relative flex-shrink-0"
                    >
                      <img
                        src={deal.thumb}
                        alt={deal.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://placehold.co/120x60/09090b/10b981?text=PromoCraft';
                        }}
                      />
                    </Link>
                  </td>

                  {/* Título & Badges */}
                  <td className="py-2.5 px-3 font-semibold text-zinc-100 max-w-[220px] sm:max-w-xs">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/game/${deal.gameID}`}
                        className="truncate hover:text-emerald-400 transition"
                      >
                        {deal.title}
                      </Link>
                      {isRecord && (
                        <span className="flex-shrink-0 rounded bg-amber-500/20 px-1 py-0.5 text-[9px] font-black text-amber-400 border border-amber-500/30">
                          RECORDE
                        </span>
                      )}
                    </div>
                    {deal.steamAppID && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 font-normal">
                        <Gamepad2 className="h-3 w-3 text-indigo-400" />
                        <span>Steam Deck</span>
                      </span>
                    )}
                  </td>

                  {/* Loja */}
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-2 py-0.5 text-[11px] text-zinc-300">
                      {storeIconUrl && (
                        <img src={storeIconUrl} alt={store?.storeName} className="h-3 w-3 object-contain" />
                      )}
                      <span className="truncate max-w-[80px]">{store?.storeName || 'Loja Oficial'}</span>
                    </span>
                  </td>

                  {/* Preço Normal */}
                  <td className="py-2.5 px-3 text-right text-zinc-500 line-through">
                    R$ {normalBRL}
                  </td>

                  {/* Preço Promocional */}
                  <td className="py-2.5 px-3 text-right font-black">
                    {isFree ? (
                      <span className="text-emerald-400 font-extrabold uppercase tracking-wide">
                        GRÁTIS
                      </span>
                    ) : (
                      <div>
                        <span className="text-emerald-400 text-sm">R$ {saleBRL}</span>
                        <div className="text-[10px] font-normal text-zinc-500">${saleUSD.toFixed(2)}</div>
                      </div>
                    )}
                  </td>

                  {/* Desconto */}
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block rounded-lg px-2 py-0.5 text-xs font-black ${
                        isFree
                          ? 'bg-emerald-500 text-zinc-950 font-black'
                          : savings >= 75
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      -{savings}%
                    </span>
                  </td>

                  {/* Avaliação Steam */}
                  <td className="py-2.5 px-3 text-center">
                    {deal.steamRatingPercent && parseInt(deal.steamRatingPercent) > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <ThumbsUp className="h-3 w-3" />
                        {deal.steamRatingPercent}%
                      </span>
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
                  </td>

                  {/* Ações Rápidas */}
                  <td className="py-2.5 pr-4 pl-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => toggleWishlist(deal)}
                        title={isWishlisted ? 'Remover da Wishlist' : 'Adicionar à Wishlist'}
                        className={`rounded-lg p-1.5 transition ${
                          isWishlisted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                      >
                        {isWishlisted ? <Check className="h-3.5 w-3.5" /> : <Heart className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() => setSelectedDealForAlert(deal)}
                        title="Criar Alerta de Preço"
                        className="rounded-lg p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition"
                      >
                        <Bell className="h-3.5 w-3.5" />
                      </button>

                      <a
                        href={directStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ir para a Loja Oficial"
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-zinc-950 transition hover:bg-emerald-400 shadow-sm"
                      >
                        <span>Loja</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
