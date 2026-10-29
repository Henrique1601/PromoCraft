'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Search, SlidersHorizontal, Gamepad2, RefreshCw, Zap, TrendingDown } from 'lucide-react';
import { Deal, Store } from '@/types/deals';
import { DealCard } from '@/components/DealCard';

interface DealsFeedProps {
  initialDeals: Deal[];
  stores: Store[];
}

export function DealsFeed({ initialDeals, stores }: DealsFeedProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [search, setSearch] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [sortBy, setSortBy] = useState<'Deal Rating' | 'Savings' | 'Price'>('Deal Rating');
  const [underPrice, setUnderPrice] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const storeMap = new Map<string, Store>();
  stores.forEach((s) => storeMap.set(s.storeID, s));

  const popularStores = stores.filter((s) =>
    ['1', '3', '7', '11', '15', '25', '27'].includes(s.storeID)
  );

  async function handleFilter(newSearch = search, newStore = selectedStore, newSort = sortBy, newUnder = underPrice) {
    startTransition(async () => {
      const params = new URLSearchParams();
      if (newSearch.trim()) params.set('title', newSearch.trim());
      if (newStore) params.set('storeID', newStore);
      if (newSort) params.set('sortBy', newSort);
      if (newUnder) params.set('upperPrice', newUnder);

      try {
        const res = await fetch(`/api/deals?${params.toString()}`);
        if (res.ok) {
          const data: Deal[] = await res.json();
          setDeals(data);
        }
      } catch (err) {
        console.error('Falha ao filtrar promoções:', err);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por título de jogo (ex: Elden Ring, Cyberpunk)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFilter(e.currentTarget.value, selectedStore, sortBy, underPrice);
            }}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Store select */}
          <select
            value={selectedStore}
            onChange={(e) => {
              setSelectedStore(e.target.value);
              handleFilter(search, e.target.value, sortBy, underPrice);
            }}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Todas as Lojas</option>
            {popularStores.map((s) => (
              <option key={s.storeID} value={s.storeID}>
                {s.storeName}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => {
              const val = e.target.value as any;
              setSortBy(val);
              handleFilter(search, selectedStore, val, underPrice);
            }}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="Deal Rating">🔥 Melhor Custo-Benefício</option>
            <option value="Savings">⚡ Maior % Desconto</option>
            <option value="Price">💰 Menor Preço</option>
          </select>

          {/* Price ceiling */}
          <select
            value={underPrice}
            onChange={(e) => {
              setUnderPrice(e.target.value);
              handleFilter(search, selectedStore, sortBy, e.target.value);
            }}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Qualquer Preço</option>
            <option value="5">Até $5 (~R$ 28)</option>
            <option value="10">Até $10 (~R$ 57)</option>
            <option value="20">Até $20 (~R$ 115)</option>
          </select>

          <button
            onClick={() => handleFilter(search, selectedStore, sortBy, underPrice)}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`} />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Store Quick Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-zinc-500 font-medium whitespace-nowrap">Lojas Populares:</span>
        <button
          onClick={() => {
            setSelectedStore('');
            handleFilter(search, '', sortBy, underPrice);
          }}
          className={`rounded-lg px-2.5 py-1 transition whitespace-nowrap ${
            selectedStore === ''
              ? 'bg-emerald-500 text-zinc-950 font-bold'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Todas
        </button>
        {popularStores.map((store) => {
          const isSelected = selectedStore === store.storeID;
          return (
            <button
              key={store.storeID}
              onClick={() => {
                const next = isSelected ? '' : store.storeID;
                setSelectedStore(next);
                handleFilter(search, next, sortBy, underPrice);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition whitespace-nowrap ${
                isSelected
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <img
                src={`https://www.cheapshark.com${store.images.icon}`}
                alt={store.storeName}
                className="h-3 w-3 object-contain"
              />
              <span>{store.storeName}</span>
            </button>
          );
        })}
      </div>

      {/* Deals Grid */}
      {isPending ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex items-center gap-2 text-emerald-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Buscando as melhores ofertas nas lojas...</span>
          </div>
        </div>
      ) : deals.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-12 text-center">
          <Gamepad2 className="mx-auto h-12 w-12 text-zinc-600" />
          <h3 className="mt-3 text-base font-semibold text-zinc-200">Nenhuma oferta encontrada</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Tente buscar com outro nome de jogo ou remover os filtros aplicados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {deals.map((deal) => (
            <DealCard key={deal.dealID} deal={deal} store={storeMap.get(deal.storeID)} />
          ))}
        </div>
      )}
    </div>
  );
}
