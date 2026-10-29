'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Gamepad2,
  RefreshCw,
  Zap,
  LayoutGrid,
  List,
  Columns3,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
} from 'lucide-react';
import { Deal, Store } from '@/types/deals';
import { DealCard } from '@/components/DealCard';

interface DealsFeedProps {
  initialDeals: Deal[];
  stores: Store[];
  rate?: number;
}

export function DealsFeed({ initialDeals, stores, rate = 5.75 }: DealsFeedProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Deal[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  const [selectedStore, setSelectedStore] = useState('');
  const [sortBy, setSortBy] = useState<'Deal Rating' | 'Savings' | 'Price'>('Deal Rating');
  const [underPrice, setUnderPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [onlyAAA, setOnlyAAA] = useState(false);
  const [onlyFree, setOnlyFree] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(32);
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'list'>('grid');
  const [isPending, startTransition] = useTransition();

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const storeMap = new Map<string, Store>();
  stores.forEach((s) => storeMap.set(s.storeID, s));

  const popularStores = stores.filter((s) =>
    ['1', '3', '7', '11', '15', '25', '27'].includes(s.storeID)
  );

  // Autocomplete debounced
  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingSuggestions(true);
      try {
        const res = await fetch(`/api/deals?title=${encodeURIComponent(search.trim())}&pageSize=5`);
        if (res.ok) {
          const data: Deal[] = await res.json();
          setSuggestions(data.slice(0, 5));
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [search]);

  // Fechar autocomplete ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleFilter(
    newSearch = search,
    newStore = selectedStore,
    newSort = sortBy,
    newUnder = underPrice,
    isFree = onlyFree,
    newPage = page,
    newPageSize = pageSize,
    newRating = minRating,
    isAAA = onlyAAA
  ) {
    setShowSuggestions(false);
    startTransition(async () => {
      const params = new URLSearchParams();
      if (newSearch.trim()) params.set('title', newSearch.trim());
      if (newStore) params.set('storeID', newStore);
      if (newSort) params.set('sortBy', newSort);
      if (newRating) params.set('steamRating', newRating);
      if (isAAA) params.set('AAA', '1');
      params.set('pageNumber', newPage.toString());
      params.set('pageSize', newPageSize.toString());

      if (isFree) {
        params.set('upperPrice', '0');
      } else if (newUnder) {
        params.set('upperPrice', newUnder);
      }

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

  function changePage(newPage: number) {
    if (newPage < 0) return;
    setPage(newPage);
    handleFilter(search, selectedStore, sortBy, underPrice, onlyFree, newPage, pageSize, minRating, onlyAAA);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-6">
      {/* Search & Main Filter Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between">
        {/* Search Input com Dropdown Autocomplete */}
        <div ref={searchContainerRef} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por jogo (ex: Elden Ring, Cyberpunk, Resident Evil)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(0);
                setShowSuggestions(false);
                handleFilter(e.currentTarget.value, selectedStore, sortBy, underPrice, onlyFree, 0, pageSize, minRating, onlyAAA);
              }
            }}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-xl">
              <div className="p-2 text-[11px] font-semibold uppercase text-zinc-500 border-b border-zinc-800/80">
                Sugestões Rápidas:
              </div>
              <div className="divide-y divide-zinc-800/50">
                {suggestions.map((sug) => {
                  const sugPrice = (parseFloat(sug.salePrice) * rate).toFixed(2).replace('.', ',');
                  return (
                    <Link
                      key={sug.dealID}
                      href={`/game/${sug.gameID}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center justify-between p-2.5 transition hover:bg-zinc-900"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={sug.thumb} alt={sug.title} className="h-9 w-16 rounded object-cover" />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-zinc-200 truncate">{sug.title}</p>
                          <span className="text-[10px] text-zinc-400">Score: {sug.dealRating}/10</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-xs font-bold text-emerald-400">
                          {parseFloat(sug.salePrice) === 0 ? 'GRÁTIS' : `R$ ${sugPrice}`}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Loja */}
          <select
            value={selectedStore}
            onChange={(e) => {
              setSelectedStore(e.target.value);
              setPage(0);
              handleFilter(search, e.target.value, sortBy, underPrice, onlyFree, 0, pageSize, minRating, onlyAAA);
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

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => {
              const val = e.target.value as any;
              setSortBy(val);
              setPage(0);
              handleFilter(search, selectedStore, val, underPrice, onlyFree, 0, pageSize, minRating, onlyAAA);
            }}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="Deal Rating">🔥 Melhor Negócio</option>
            <option value="Savings">⚡ Maior Desconto</option>
            <option value="Price">💰 Menor Preço</option>
          </select>

          {/* Filtro de Avaliação Steam */}
          <select
            value={minRating}
            onChange={(e) => {
              setMinRating(e.target.value);
              setPage(0);
              handleFilter(search, selectedStore, sortBy, underPrice, onlyFree, 0, pageSize, e.target.value, onlyAAA);
            }}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Qualquer Nota</option>
            <option value="70">⭐ Steam 70%+ (Positiva)</option>
            <option value="80">⭐⭐ Steam 80%+ (Muito Positiva)</option>
            <option value="90">⭐⭐⭐ Steam 90%+ (Extremamente)</option>
          </select>

          {/* Teto de Preço */}
          <select
            value={underPrice}
            disabled={onlyFree}
            onChange={(e) => {
              setUnderPrice(e.target.value);
              setPage(0);
              handleFilter(search, selectedStore, sortBy, e.target.value, onlyFree, 0, pageSize, minRating, onlyAAA);
            }}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none disabled:opacity-50"
          >
            <option value="">Qualquer Preço</option>
            <option value="5">Até $5 (~R$ {(5 * rate).toFixed(0)})</option>
            <option value="10">Até $10 (~R$ {(10 * rate).toFixed(0)})</option>
            <option value="20">Até $20 (~R$ {(20 * rate).toFixed(0)})</option>
          </select>

          {/* Botão Jogos AAA */}
          <button
            type="button"
            onClick={() => {
              const nextAAA = !onlyAAA;
              setOnlyAAA(nextAAA);
              setPage(0);
              handleFilter(search, selectedStore, sortBy, underPrice, onlyFree, 0, pageSize, minRating, nextAAA);
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition border ${
              onlyAAA
                ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-950/40'
                : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-purple-500 hover:text-purple-400'
            }`}
          >
            <Award className="h-3.5 w-3.5 fill-current" />
            <span>Grandes Jogos (AAA)</span>
          </button>

          {/* Botão de Jogos Grátis */}
          <button
            type="button"
            onClick={() => {
              const nextFree = !onlyFree;
              setOnlyFree(nextFree);
              setPage(0);
              handleFilter(search, selectedStore, sortBy, underPrice, nextFree, 0, pageSize, minRating, onlyAAA);
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition border ${
              onlyFree
                ? 'bg-amber-400 border-amber-300 text-zinc-950 shadow-md shadow-amber-950/40'
                : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-amber-400 hover:text-amber-400'
            }`}
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>100% Grátis</span>
          </button>
        </div>
      </div>

      {/* View Options & Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        {/* Lojas Rápidas */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
          <span className="text-zinc-500 font-medium whitespace-nowrap">Lojas:</span>
          <button
            onClick={() => {
              setSelectedStore('');
              setPage(0);
              handleFilter(search, '', sortBy, underPrice, onlyFree, 0, pageSize, minRating, onlyAAA);
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
                  setPage(0);
                  handleFilter(search, next, sortBy, underPrice, onlyFree, 0, pageSize, minRating, onlyAAA);
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

        {/* View Mode Controls & Items per page */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Itens por página */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span>Itens:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setPageSize(newSize);
                setPage(0);
                handleFilter(search, selectedStore, sortBy, underPrice, onlyFree, 0, newSize, minRating, onlyAAA);
              }}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="16">16</option>
              <option value="32">32</option>
              <option value="48">48</option>
              <option value="60">60</option>
            </select>
          </div>

          {/* Seletor de Modo de Visualização */}
          <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              title="Grade Padrão"
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              title="Grade Compacta"
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'compact'
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Columns3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="Lista Detalhada"
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Deals Container */}
      {isPending ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex items-center gap-2 text-emerald-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Buscando as melhores ofertas...</span>
          </div>
        </div>
      ) : deals.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-12 text-center">
          <Gamepad2 className="mx-auto h-12 w-12 text-zinc-600" />
          <h3 className="mt-3 text-base font-semibold text-zinc-200">Nenhuma oferta encontrada</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Tente remover alguns filtros ou buscar por outro termo.
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'list'
              ? 'space-y-3'
              : viewMode === 'compact'
              ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
              : 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }
        >
          {deals.map((deal) => (
            <DealCard
              key={deal.dealID}
              deal={deal}
              store={storeMap.get(deal.storeID)}
              rate={rate}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-6">
        <button
          onClick={() => changePage(page - 1)}
          disabled={page === 0 || isPending}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-40 disabled:hover:border-zinc-800 disabled:hover:text-zinc-300"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Página Anterior</span>
        </button>

        <span className="text-xs font-medium text-zinc-400">
          Página <b className="text-emerald-400">{page + 1}</b>
        </span>

        <button
          onClick={() => changePage(page + 1)}
          disabled={deals.length < pageSize || isPending}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-40"
        >
          <span>Próxima Página</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
