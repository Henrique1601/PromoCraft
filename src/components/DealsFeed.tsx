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
  Award,
  RotateCcw,
} from 'lucide-react';
import { Deal, Store } from '@/types/deals';
import { DealCard } from '@/components/DealCard';
import { DealSkeleton } from '@/components/DealSkeleton';
import { formatBRL } from '@/lib/currency';

interface DealsFeedProps {
  initialDeals: Deal[];
  stores: Store[];
  rate?: number;
}

interface FilterState {
  search: string;
  store: string;
  sortBy: 'Deal Rating' | 'Savings' | 'Price';
  underPrice: string;
  onlyFree: boolean;
  page: number;
  pageSize: number;
  minRating: string;
  onlyAAA: boolean;
}

const INITIAL_FILTERS: FilterState = {
  search: '',
  store: '',
  sortBy: 'Deal Rating',
  underPrice: '',
  onlyFree: false,
  page: 0,
  pageSize: 32,
  minRating: '',
  onlyAAA: false,
};

export function DealsFeed({ initialDeals, stores, rate = 5.75 }: DealsFeedProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [suggestions, setSuggestions] = useState<Deal[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'list'>('grid');
  const [isPending, startTransition] = useTransition();

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const storeMap = new Map<string, Store>();
  stores.forEach((s) => storeMap.set(s.storeID, s));

  const popularStores = stores.filter((s) =>
    ['1', '2', '3', '7', '11', '15', '25', '27'].includes(s.storeID)
  );

  // Autocomplete debounced
  useEffect(() => {
    if (!filters.search || filters.search.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/deals?title=${encodeURIComponent(filters.search.trim())}&pageSize=5`);
        if (res.ok) {
          const data: Deal[] = await res.json();
          setSuggestions(data.slice(0, 5));
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Erro ao buscar sugestões:', err);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [filters.search]);

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

  // Dispatcher centralizado de filtros com transição limpa
  function applyFilters(updates: Partial<FilterState>) {
    const next: FilterState = { ...filters, ...updates };
    setFilters(next);
    setShowSuggestions(false);

    startTransition(async () => {
      const params = new URLSearchParams();
      if (next.search.trim()) params.set('title', next.search.trim());
      if (next.store) params.set('storeID', next.store);
      if (next.sortBy) params.set('sortBy', next.sortBy);
      if (next.minRating) params.set('steamRating', next.minRating);
      if (next.onlyAAA) params.set('AAA', '1');
      params.set('pageNumber', next.page.toString());
      params.set('pageSize', next.pageSize.toString());

      if (next.onlyFree) {
        params.set('upperPrice', '0');
      } else if (next.underPrice) {
        params.set('upperPrice', next.underPrice);
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
    applyFilters({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetAllFilters() {
    applyFilters({ ...INITIAL_FILTERS });
  }

  return (
    <div className="space-y-6">
      {/* Search & Main Filter Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-md md:flex-row md:items-center md:justify-between shadow-lg">
        {/* Search Input com Dropdown Autocomplete */}
        <div ref={searchContainerRef} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por jogo (ex: Elden Ring, Cyberpunk, Resident Evil)..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyFilters({ search: e.currentTarget.value, page: 0 });
              }
            }}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 transition focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-xl">
              <div className="p-2.5 text-[11px] font-semibold uppercase text-zinc-500 border-b border-zinc-800/80">
                Sugestões Rápidas:
              </div>
              <div className="divide-y divide-zinc-800/50">
                {suggestions.map((sug) => {
                  const sugPrice = formatBRL(parseFloat(sug.salePrice), rate);
                  return (
                    <Link
                      key={sug.dealID}
                      href={`/game/${sug.gameID}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center justify-between p-2.5 transition hover:bg-zinc-900"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={sug.thumb} alt={sug.title} className="h-9 w-16 rounded-lg object-cover border border-zinc-800" />
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
            value={filters.store}
            onChange={(e) => applyFilters({ store: e.target.value, page: 0 })}
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
            value={filters.sortBy}
            onChange={(e) => applyFilters({ sortBy: e.target.value as any, page: 0 })}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="Deal Rating">🔥 Melhor Negócio</option>
            <option value="Savings">⚡ Maior Desconto</option>
            <option value="Price">💰 Menor Preço</option>
          </select>

          {/* Filtro de Avaliação Steam */}
          <select
            value={filters.minRating}
            onChange={(e) => applyFilters({ minRating: e.target.value, page: 0 })}
            className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Qualquer Nota</option>
            <option value="70">⭐ Steam 70%+ (Positiva)</option>
            <option value="80">⭐⭐ Steam 80%+ (Muito Positiva)</option>
            <option value="90">⭐⭐⭐ Steam 90%+ (Extremamente)</option>
          </select>

          {/* Teto de Preço */}
          <select
            value={filters.underPrice}
            disabled={filters.onlyFree}
            onChange={(e) => applyFilters({ underPrice: e.target.value, page: 0 })}
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
            onClick={() => applyFilters({ onlyAAA: !filters.onlyAAA, page: 0 })}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition border ${
              filters.onlyAAA
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
            onClick={() => applyFilters({ onlyFree: !filters.onlyFree, page: 0 })}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition border ${
              filters.onlyFree
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
            onClick={() => applyFilters({ store: '', page: 0 })}
            className={`rounded-lg px-2.5 py-1 transition whitespace-nowrap ${
              filters.store === ''
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Todas
          </button>
          {popularStores.map((store) => {
            const isSelected = filters.store === store.storeID;
            return (
              <button
                key={store.storeID}
                onClick={() => applyFilters({ store: isSelected ? '' : store.storeID, page: 0 })}
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
              value={filters.pageSize}
              onChange={(e) => applyFilters({ pageSize: Number(e.target.value), page: 0 })}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="16">16</option>
              <option value="32">32</option>
              <option value="48">48</option>
              <option value="60">60</option>
            </select>
          </div>

          {/* Seletor de Modo de Visualização */}
          <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-0.5 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              title="Grade Padrão"
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
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
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
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
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Deals Container & Loading Skeletons */}
      {isPending ? (
        <DealSkeleton viewMode={viewMode} count={filters.pageSize > 32 ? 16 : 8} />
      ) : deals.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-12 text-center">
          <Gamepad2 className="mx-auto h-12 w-12 text-zinc-600" />
          <h3 className="mt-3 text-base font-semibold text-zinc-200">Nenhuma oferta encontrada</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Tente remover alguns filtros ou buscar por outro termo.
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 shadow-lg shadow-emerald-950/40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Limpar Todos os Filtros</span>
          </button>
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
          onClick={() => changePage(filters.page - 1)}
          disabled={filters.page === 0 || isPending}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-40 disabled:hover:border-zinc-800 disabled:hover:text-zinc-300"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Página Anterior</span>
        </button>

        <span className="text-xs font-medium text-zinc-400">
          Página <b className="text-emerald-400">{filters.page + 1}</b>
        </span>

        <button
          onClick={() => changePage(filters.page + 1)}
          disabled={deals.length < filters.pageSize || isPending}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-40"
        >
          <span>Próxima Página</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
