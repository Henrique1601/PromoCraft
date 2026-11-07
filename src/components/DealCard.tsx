'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, ExternalLink, ThumbsUp, Scale, Sparkles, Gamepad2, Bell, QrCode, Share2 } from 'lucide-react';
import { Deal, Store } from '@/types/deals';
import { getDirectStoreUrl } from '@/lib/links';
import { formatBRL } from '@/lib/currency';
import { getPixPrice, getInstallmentInfo } from '@/lib/payment';
import { PriceAlertModal } from '@/components/PriceAlertModal';
import { CostPerHourBadge } from '@/components/CostPerHourBadge';
import { EditionBadge } from '@/components/EditionBadge';
import { CommunityVibeTracker } from '@/components/CommunityVibeTracker';
import { ShareableDealModal } from '@/components/ShareableDealModal';

interface DealCardProps {
  deal: Deal;
  store?: Store;
  rate?: number;
  viewMode?: 'grid' | 'compact' | 'list';
}

export function DealCard({ deal, store, rate = 5.75, viewMode = 'grid' }: DealCardProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const savings = Math.round(parseFloat(deal.savings));
  const salePriceUSD = parseFloat(deal.salePrice);
  const normalPriceUSD = parseFloat(deal.normalPrice);
  const isFree = salePriceUSD === 0;

  // Cotação centralizada
  const salePriceBRL = formatBRL(salePriceUSD, rate);
  const normalPriceBRL = formatBRL(normalPriceUSD, rate);
  const salePriceBRLNum = salePriceUSD * rate;

  // Regionalização Financeira
  const pix = getPixPrice(salePriceBRLNum);
  const installments = getInstallmentInfo(salePriceBRLNum);

  // É Recorde Histórico / Super Deal?
  const isAllTimeLow = savings >= 75 || parseFloat(deal.dealRating || '0') >= 9.5;

  const storeIconUrl = store?.images.icon
    ? `https://www.cheapshark.com${store.images.icon}`
    : null;

  const directStoreUrl = getDirectStoreUrl(
    deal.dealID,
    deal.storeID,
    deal.steamAppID,
    deal.title
  );

  return (
    <>
      <PriceAlertModal
        deal={deal}
        currentPriceBRL={salePriceBRL}
        rate={rate}
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
      />

      <ShareableDealModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={deal.title}
        thumb={deal.thumb}
        priceBRL={salePriceBRL}
        priceUSD={salePriceUSD.toFixed(2)}
        savings={savings}
      />

      {/* MODO LISTA / TABELA */}
      {viewMode === 'list' && (
        <div className="group flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 transition-all duration-300 hover:border-emerald-500/50 hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-emerald-950/20 backdrop-blur-md">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link
              href={`/game/${deal.gameID}`}
              className="h-16 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800 shadow-md relative group/thumb"
            >
              <img
                src={deal.thumb}
                alt={deal.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400/09090b/10b981?text=PromoCraft';
                }}
              />
              {isAllTimeLow && (
                <span className="absolute top-1 left-1 rounded bg-amber-500/90 px-1 py-0.2 text-[9px] font-black text-zinc-950">
                  RECORDE
                </span>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                href={`/game/${deal.gameID}`}
                className="block font-bold text-sm sm:text-base text-zinc-100 hover:text-emerald-400 truncate transition"
              >
                {deal.title}
              </Link>

              <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-xs text-zinc-400">
                {store && (
                  <span className="flex items-center gap-1.5 font-semibold text-zinc-300 bg-zinc-900/80 px-2 py-0.5 rounded-lg border border-zinc-800/80">
                    {storeIconUrl && (
                      <img src={storeIconUrl} alt={store.storeName} className="h-3.5 w-3.5 object-contain" />
                    )}
                    <span>{store.storeName}</span>
                  </span>
                )}

                {deal.steamRatingPercent && parseInt(deal.steamRatingPercent) > 0 && (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <ThumbsUp className="h-3 w-3" />
                    {deal.steamRatingPercent}%
                  </span>
                )}

                {deal.steamAppID && (
                  <span className="flex items-center gap-1 text-zinc-400" title="Compatível com Steam Deck">
                    <Gamepad2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="hidden md:inline">Steam Deck</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto border-t sm:border-t-0 border-zinc-800/80 pt-3 sm:pt-0">
            {savings > 0 && (
              <span
                className={`rounded-xl px-2.5 py-1 text-xs font-black shadow-md ${
                  isAllTimeLow
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950'
                    : 'bg-emerald-500 text-zinc-950'
                }`}
              >
                -{savings}%
              </span>
            )}

            <div className="text-right">
              {savings > 0 && (
                <span className="block text-xs text-zinc-500 line-through">
                  R$ {normalPriceBRL}
                </span>
              )}
              <span className="text-lg font-black text-emerald-400 tracking-tight">
                {isFree ? 'GRÁTIS' : `R$ ${salePriceBRL}`}
              </span>
              {!isFree && (
                <span className="block text-[10px] text-zinc-400 font-medium">
                  R$ {pix.formatted} no Pix
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAlertOpen(true)}
                title="Criar alerta de preço"
                className="rounded-xl border border-zinc-700 bg-zinc-900/90 p-2.5 text-zinc-300 transition hover:border-amber-500 hover:text-amber-400 hover:shadow-md"
              >
                <Bell className="h-4 w-4" />
              </button>

              <Link
                href={`/game/${deal.gameID}`}
                title="Comparar preços entre lojas"
                className="rounded-xl border border-zinc-700 bg-zinc-900/90 p-2.5 text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400 hover:shadow-md"
              >
                <Scale className="h-4 w-4" />
              </Link>

              <a
                href={directStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2 text-xs font-extrabold text-zinc-950 transition hover:opacity-95 shadow-lg shadow-emerald-950/40"
              >
                <span>Ir à Loja</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODO COMPACTO */}
      {viewMode === 'compact' && (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-emerald-950/20 backdrop-blur-md">
          <Link
            href={`/game/${deal.gameID}`}
            className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-950 block border border-zinc-800/80 shadow-md"
          >
            <img
              src={deal.thumb}
              alt={deal.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400/09090b/10b981?text=PromoCraft';
              }}
            />
            {savings > 0 && (
              <div className="absolute right-1.5 top-1.5 rounded-lg bg-emerald-500 px-2 py-0.5 text-[11px] font-black text-zinc-950 shadow-md">
                -{savings}%
              </div>
            )}
          </Link>

          <div className="mt-3">
            <Link href={`/game/${deal.gameID}`}>
              <h3
                className="line-clamp-1 text-xs font-bold text-zinc-100 hover:text-emerald-400 transition"
                title={deal.title}
              >
                {deal.title}
              </h3>
            </Link>

            <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800/80 pt-2">
              <div>
                <span className="text-xs font-black text-emerald-400">
                  {isFree ? 'GRÁTIS' : `R$ ${salePriceBRL}`}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsAlertOpen(true)}
                  title="Alerta de preço"
                  className="rounded-lg p-1 text-zinc-400 hover:text-amber-400 transition"
                >
                  <Bell className="h-3.5 w-3.5" />
                </button>
                <a
                  href={directStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 transition"
                >
                  <span>Loja</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODO GRID PADRÃO */}
      {viewMode === 'grid' && (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/50 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-emerald-950/40 backdrop-blur-md">
          {/* Top Banner / Image */}
          <Link
            href={`/game/${deal.gameID}`}
            className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-zinc-950 block border border-zinc-800/80 shadow-md group/img"
          >
            <img
              src={deal.thumb}
              alt={deal.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400/09090b/10b981?text=PromoCraft';
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-80" />

            {/* Badge de Desconto */}
            {savings > 0 && (
              <div
                className={`absolute right-2 top-2 flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black shadow-lg ${
                  isAllTimeLow
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 shadow-amber-950/60'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-emerald-950/60'
                }`}
              >
                <Flame className="h-3.5 w-3.5 fill-zinc-950 stroke-zinc-950" />
                <span>-{savings}%</span>
              </div>
            )}

            {/* Tag Recorde Histórico */}
            {isAllTimeLow && (
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-zinc-950/90 border border-amber-500/50 px-2 py-0.5 text-[10px] font-black text-amber-400 backdrop-blur-md shadow-md animate-pulse">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Recorde Histórico</span>
              </div>
            )}

            {/* Loja Oficial Pill */}
            {store && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-zinc-950/90 px-2.5 py-1 text-xs backdrop-blur-md border border-zinc-800/80 shadow-md font-semibold text-zinc-200">
                {storeIconUrl && (
                  <img
                    src={storeIconUrl}
                    alt={store.storeName}
                    className="h-3.5 w-3.5 object-contain"
                  />
                )}
                <span>{store.storeName}</span>
              </div>
            )}

            {/* Steam Deck Indicator */}
            {deal.steamAppID && (
              <div
                className="absolute bottom-2 right-2 rounded-lg bg-zinc-950/80 p-1 text-indigo-400 border border-zinc-800/80 backdrop-blur-md"
                title="Compatível com Steam Deck"
              >
                <Gamepad2 className="h-3.5 w-3.5" />
              </div>
            )}
          </Link>

          {/* Título & Detalhes */}
          <div className="mt-4 flex flex-1 flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <EditionBadge title={deal.title} />
              </div>
              <Link href={`/game/${deal.gameID}`} className="block">
                <h3
                  className="line-clamp-2 text-sm font-extrabold text-zinc-100 group-hover:text-emerald-400 transition leading-snug"
                  title={deal.title}
                >
                  {deal.title}
                </h3>
              </Link>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2.5">
                  {deal.steamRatingPercent && parseInt(deal.steamRatingPercent) > 0 && (
                    <div
                      className="flex items-center gap-1 text-emerald-400 font-semibold"
                      title={`Avaliação Steam: ${deal.steamRatingText || ''}`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{deal.steamRatingPercent}%</span>
                    </div>
                  )}
                  {deal.dealRating && (
                    <div
                      className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300"
                      title="Score de Negócio"
                    >
                      Score: <span className="text-emerald-400">{deal.dealRating}/10</span>
                    </div>
                  )}
                </div>

                <CostPerHourBadge priceBRL={salePriceBRLNum} title={deal.title} compact />
              </div>
            </div>

            {/* Preços e Ações */}
            <div className="mt-4 border-t border-zinc-800/80 pt-3">
              <div className="flex items-end justify-between">
                <div>
                  {savings > 0 && (
                    <span className="block text-[11px] text-zinc-500 line-through">
                      R$ {normalPriceBRL} (${normalPriceUSD.toFixed(2)})
                    </span>
                  )}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-emerald-400 tracking-tight">
                      {isFree ? 'GRÁTIS' : `R$ ${salePriceBRL}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsShareOpen(true)}
                    title="Compartilhar oferta gamer"
                    className="flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/90 p-2 text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400 hover:shadow-md"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setIsAlertOpen(true)}
                    title="Definir alerta de preço (Discord/E-mail)"
                    className="flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/90 p-2 text-zinc-300 transition hover:border-amber-500 hover:text-amber-400 hover:shadow-md"
                  >
                    <Bell className="h-4 w-4" />
                  </button>

                  <Link
                    href={`/game/${deal.gameID}`}
                    title="Comparar preços entre lojas"
                    className="flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/90 p-2 text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400 hover:shadow-md"
                  >
                    <Scale className="h-4 w-4" />
                  </Link>

                  <a
                    href={directStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-3.5 py-2 text-xs font-extrabold text-zinc-950 transition hover:opacity-95 shadow-lg shadow-emerald-950/40"
                  >
                    <span>Ir à Loja</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Simulador Pix & Parcelamento */}
              {!isFree && (
                <div className="mt-2.5 pt-2 border-t border-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <QrCode className="h-3 w-3" />
                    <span>R$ {pix.formatted} no Pix</span>
                  </span>

                  {installments && (
                    <span className="text-zinc-500">
                      ou {installments.installments}x de R$ {installments.valuePerInstallment} s/ juros
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
