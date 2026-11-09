'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Gamepad2,
  LayoutGrid,
  List,
  Columns3,
  Table,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  X,
  Sparkles,
} from 'lucide-react';
import gsap from 'gsap';
import { Deal, Store } from '@/types/deals';
import { DealCard } from '@/components/DealCard';
import { DealsTable } from '@/components/DealsTable';
import { DealSkeleton } from '@/components/DealSkeleton';
import { sound } from '@/lib/sound';
import { SidebarFilters, FilterState } from '@/components/SidebarFilters';
import { useCatalogFilters } from '@/context/CatalogFilterContext';

interface DealsFeedProps {
  initialDeals: Deal[];
  stores: Store[];
  rate?: number;
  hideSidebar?: boolean;
  initialFilters?: Partial<FilterState>;
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
  topic: 'all',
};

export function DealsFeed({ initialDeals, stores, rate = 5.75, hideSidebar, initialFilters }: DealsFeedProps) {
  const catalogContext = useCatalogFilters();
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [internalFilters, setInternalFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTERS,
    ...initialFilters,
  }));
  const [suggestions, setSuggestions] = useState<Deal[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'list' | 'table'>('grid');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const filters = catalogContext?.filters ?? internalFilters;

  const storeMap = new Map<string, Store>();
  stores.forEach((s) => storeMap.set(s.storeID, s));

  const popularStores = stores.filter((s) =>
    ['1', '2', '3', '7', '11', '15', '25', '27'].includes(s.storeID)
  );

  // Contagem de filtros ativos
  const activeFiltersCount =
    catalogContext?.activeFiltersCount ??
    [
      Boolean(filters.search.trim()),
      Boolean(filters.store),
      Boolean(filters.underPrice),
      Boolean(filters.onlyFree),
      Boolean(filters.minRating),
      Boolean(filters.onlyAAA),
      Boolean(filters.topic && filters.topic !== 'all'),
    ].filter(Boolean).length;

  // Atualização reativa de ofertas quando filters muda (acionado pela GlobalSidebar ou busca)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    startTransition(async () => {
      const params = new URLSearchParams();
      if (filters.search.trim()) params.set('title', filters.search.trim());
      if (filters.store) params.set('storeID', filters.store);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.minRating) params.set('steamRating', filters.minRating);
      if (filters.onlyAAA) params.set('AAA', '1');
      params.set('pageNumber', filters.page.toString());
      params.set('pageSize', filters.pageSize.toString());

      if (filters.onlyFree) {
        params.set('upperPrice', '0');
      } else if (filters.underPrice) {
        params.set('upperPrice', filters.underPrice);
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
  }, [filters]);

  // Autocomplete com debounce
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

  // Animação GSAP Stagger nos cards ao atualizar dados
  useEffect(() => {
    if (!gridContainerRef.current || isPending || deals.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.deal-grid-item',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.025, ease: 'power2.out' }
      );
    }, gridContainerRef);

    return () => ctx.revert();
  }, [deals, isPending]);

  // Dispatcher centralizado de filtros com transição limpa
  function applyFilters(updates: Partial<FilterState>) {
    setShowSuggestions(false);
    if (catalogContext) {
      catalogContext.applyFilters(updates);
    } else {
      setInternalFilters((prev) => ({ ...prev, ...updates }));
    }
  }

  function handleSearchInput(search: string) {
    if (catalogContext) {
      catalogContext.applyFilters({ search });
    } else {
      setInternalFilters((prev: FilterState) => ({ ...prev, search }));
    }
  }

  function changePage(newPage: number) {
    if (newPage < 0) return;
    applyFilters({ page: newPage });
    const target = document.getElementById('catalogo') || document.body;
    target.scrollIntoView({ behavior: 'smooth' });
  }

  function resetAllFilters() {
    setShowSuggestions(false);
    if (catalogContext) {
      catalogContext.resetAllFilters();
    } else {
      setInternalFilters(INITIAL_FILTERS);
    }
  }

  const shouldHideInternalSidebar = hideSidebar || Boolean(catalogContext);

  const mainFeedContent = (
    <div className="w-full space-y-5">
      {/* Barra Superior: Busca, Botão Mobile de Filtros e Controles de Visualização */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-3.5 backdrop-blur-xl shadow-lg">
        {/* Botão de Filtros no Mobile (apenas quando usando a sidebar interna) */}
        {!shouldHideInternalSidebar && (
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex lg:hidden items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-400"
          >
            <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
            <span>Filtros & Categorias</span>
            {activeFiltersCount > 0 && (
              <span className="rounded-full bg-emerald-500 px-1.5 py-0.2 text-[10px] font-black text-zinc-950">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}

          {/* Campo de Busca com Autocomplete */}
          <div ref={searchContainerRef} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar jogos (ex: Resident Evil, Cyberpunk, Baldur's Gate)..."
              value={filters.search}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyFilters({ search: filters.search, page: 0 });
                }
              }}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 transition focus:border-emerald-500 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
            {filters.search && (
              <button
                onClick={() => applyFilters({ search: '', page: 0 })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Dropdown de Sugestões Autocomplete */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-md">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Sugestões Rápidas
                </div>
                <div className="divide-y divide-zinc-900">
                  {suggestions.map((deal) => {
                    const store = storeMap.get(deal.storeID);
                    const priceUSD = parseFloat(deal.salePrice);
                    const priceBRL = (priceUSD * rate).toFixed(2).replace('.', ',');
                    return (
                      <Link
                        key={deal.dealID}
                        href={`/game/${deal.gameID}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center justify-between p-2 hover:bg-zinc-900/90 rounded-xl transition group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={deal.thumb}
                            alt={deal.title}
                            className="h-9 w-14 rounded-lg object-cover border border-zinc-800"
                          />
                          <div className="min-w-0">
                            <span className="block truncate text-xs font-bold text-zinc-200 group-hover:text-emerald-400 transition">
                              {deal.title}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {store?.storeName || 'Loja Oficial'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right pl-3">
                          <span className="text-xs font-black text-emerald-400">
                            R$ {priceBRL}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Seletor de Modo de Visualização & Itens por Página */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            <select
              value={filters.pageSize}
              onChange={(e) => applyFilters({ pageSize: Number(e.target.value), page: 0 })}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-xs font-medium text-zinc-300 focus:outline-none"
            >
              <option value="16">16 / pág</option>
              <option value="32">32 / pág</option>
              <option value="48">48 / pág</option>
            </select>

            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/90 p-0.5">
              <button
                onClick={() => { sound.playClick(); setViewMode('grid'); }}
                title="Grade Padrão"
                className={`rounded-lg p-1.5 transition ${
                  viewMode === 'grid'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => { sound.playClick(); setViewMode('compact'); }}
                title="Grade Compacta"
                className={`rounded-lg p-1.5 transition ${
                  viewMode === 'compact'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Columns3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => { sound.playClick(); setViewMode('list'); }}
                title="Lista Detalhada"
                className={`rounded-lg p-1.5 transition ${
                  viewMode === 'list'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => { sound.playClick(); setViewMode('table'); }}
                title="Tabela Compacta (Estilo SteamDB)"
                className={`rounded-lg p-1.5 transition ${
                  viewMode === 'table'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Table className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Chips de Filtros Ativos (quando houver) */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-zinc-500 font-medium">Filtros aplicados:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1 text-zinc-200">
                <span>Busca: "{filters.search}"</span>
                <button onClick={() => applyFilters({ search: '', page: 0 })}>
                  <X className="h-3 w-3 text-zinc-400 hover:text-white" />
                </button>
              </span>
            )}
            {filters.store && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                <span>Loja: {storeMap.get(filters.store)?.storeName || filters.store}</span>
                <button onClick={() => applyFilters({ store: '', page: 0 })}>
                  <X className="h-3 w-3 text-emerald-400 hover:text-white" />
                </button>
              </span>
            )}
            {filters.topic && filters.topic !== 'all' && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                <Sparkles className="h-3 w-3" />
                <span>Tópico Ativo</span>
                <button onClick={() => applyFilters({ topic: 'all', page: 0 })}>
                  <X className="h-3 w-3 text-emerald-400 hover:text-white" />
                </button>
              </span>
            )}
            {filters.underPrice && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1 text-zinc-200">
                <span>Até ${filters.underPrice} USD</span>
                <button onClick={() => applyFilters({ underPrice: '', page: 0 })}>
                  <X className="h-3 w-3 text-zinc-400 hover:text-white" />
                </button>
              </span>
            )}
            {filters.minRating && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1 text-zinc-200">
                <span>Avaliação {filters.minRating}%+</span>
                <button onClick={() => applyFilters({ minRating: '', page: 0 })}>
                  <X className="h-3 w-3 text-zinc-400 hover:text-white" />
                </button>
              </span>
            )}
            <button
              onClick={resetAllFilters}
              className="text-xs text-emerald-400 hover:underline font-semibold ml-1"
            >
              Limpar Todos
            </button>
          </div>
        )}

        {/* Deals Container com GSAP Stagger e Skeletons */}
        <div ref={gridContainerRef}>
          {isPending ? (
            <DealSkeleton viewMode={viewMode} count={filters.pageSize > 32 ? 16 : 8} />
          ) : deals.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/40 p-12 text-center backdrop-blur-md">
              <Gamepad2 className="mx-auto h-12 w-12 text-zinc-600" />
              <h3 className="mt-3 text-base font-extrabold text-zinc-200">
                Nenhuma oferta encontrada
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                Tente ajustar os filtros na barra lateral ou buscar por outro título.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 shadow-lg shadow-emerald-950/40"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restaurar Catálogo Completo</span>
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <DealsTable deals={deals} stores={stores} rate={rate} />
          ) : (
            <div
              className={
                viewMode === 'list'
                  ? 'space-y-3'
                  : viewMode === 'compact'
                  ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5'
                  : 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'
              }
            >
              {deals.map((deal) => (
                <div key={deal.dealID} className="deal-grid-item">
                  <DealCard
                    deal={deal}
                    store={storeMap.get(deal.storeID)}
                    rate={rate}
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controles de Paginação */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-6">
          <button
            onClick={() => changePage(filters.page - 1)}
            disabled={filters.page === 0 || isPending}
            className="flex items-center gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-xs font-bold text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Página Anterior</span>
          </button>

          <span className="text-xs font-semibold text-zinc-400">
            Página <b className="text-emerald-400">{filters.page + 1}</b>
          </span>

          <button
            onClick={() => changePage(filters.page + 1)}
            disabled={deals.length < filters.pageSize || isPending}
            className="flex items-center gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-xs font-bold text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-40"
          >
            <span>Próxima Página</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
  );

  if (shouldHideInternalSidebar) {
    return mainFeedContent;
  }

  return (
    <div className="flex flex-col lg:flex-row items-start gap-8">
      <SidebarFilters
        filters={filters}
        stores={stores}
        popularStores={popularStores}
        rate={rate}
        onFilterChange={applyFilters}
        onReset={resetAllFilters}
        activeCount={activeFiltersCount}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 min-w-0 w-full">
        {mainFeedContent}
      </div>
    </div>
  );
}
