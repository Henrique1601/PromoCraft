'use client';

import React from 'react';
import {
  Sparkles,
  Flame,
  Award,
  Wallet,
  Gamepad2,
  Gift,
  Store as StoreIcon,
  Filter,
  RotateCcw,
  Star,
  ArrowUpDown,
  X,
  Check,
} from 'lucide-react';
import { Store } from '@/types/deals';

export interface FilterState {
  search: string;
  store: string;
  sortBy: 'Deal Rating' | 'Savings' | 'Price';
  underPrice: string;
  onlyFree: boolean;
  page: number;
  pageSize: number;
  minRating: string;
  onlyAAA: boolean;
  topic?: 'all' | 'super_savings' | 'historic_low' | 'under_30' | 'aaa' | 'free';
}

interface SidebarFiltersProps {
  filters: FilterState;
  stores: Store[];
  popularStores: Store[];
  rate: number;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  activeCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function SidebarFilters({
  filters,
  stores,
  popularStores,
  rate,
  onFilterChange,
  onReset,
  activeCount,
  isOpenMobile,
  onCloseMobile,
}: SidebarFiltersProps) {
  // Conversão de tópicos rápidos para os filtros correspondentes
  function selectTopic(topic: FilterState['topic']) {
    switch (topic) {
      case 'super_savings':
        onFilterChange({
          topic: 'super_savings',
          sortBy: 'Savings',
          onlyFree: false,
          underPrice: '',
          page: 0,
        });
        break;
      case 'historic_low':
        onFilterChange({
          topic: 'historic_low',
          sortBy: 'Deal Rating',
          minRating: '80',
          page: 0,
        });
        break;
      case 'under_30':
        // R$ 30 convertido para USD baseado na taxa
        const usd30 = Math.round(30 / rate).toString();
        onFilterChange({
          topic: 'under_30',
          underPrice: usd30,
          onlyFree: false,
          page: 0,
        });
        break;
      case 'aaa':
        onFilterChange({
          topic: 'aaa',
          onlyAAA: true,
          page: 0,
        });
        break;
      case 'free':
        onFilterChange({
          topic: 'free',
          onlyFree: true,
          underPrice: '',
          page: 0,
        });
        break;
      default:
        onFilterChange({
          topic: 'all',
          onlyFree: false,
          underPrice: '',
          onlyAAA: false,
          page: 0,
        });
        break;
    }
  }

  const content = (
    <div className="flex flex-col gap-6 p-5 text-sm text-zinc-300">
      {/* Header da Sidebar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-400" />
          <span className="font-extrabold tracking-tight text-white">Filtros & Navegação</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition"
            title="Limpar todos os filtros"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Resetar</span>
          </button>
        )}
      </div>

      {/* 1. Tópicos & Coleções */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Coleções & Tópicos</span>
        </h4>
        <div className="flex flex-col gap-1">
          {[
            { id: 'all', label: 'Todos os Jogos', icon: Gamepad2 },
            { id: 'super_savings', label: '🔥 Super Descontos (70%+)', icon: Flame },
            { id: 'historic_low', label: '👑 Menor Preço Histórico', icon: Award },
            { id: 'under_30', label: '💸 Até R$ 30 (Baratos)', icon: Wallet },
            { id: 'aaa', label: '🎮 Jogos AAA & Blockbusters', icon: Gamepad2 },
            { id: 'free', label: '🎁 100% Grátis', icon: Gift },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected =
              filters.topic === item.id ||
              (item.id === 'all' && !filters.topic) ||
              (item.id === 'free' && filters.onlyFree) ||
              (item.id === 'aaa' && filters.onlyAAA);

            return (
              <button
                key={item.id}
                onClick={() => selectTopic(item.id as any)}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition text-left ${
                  isSelected
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-950/40'
                    : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-zinc-950' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Lojas Oficiais */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
          <StoreIcon className="h-3.5 w-3.5 text-emerald-400" />
          <span>Lojas Oficiais</span>
        </h4>

        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => onFilterChange({ store: '', page: 0 })}
            className={`flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filters.store === ''
                ? 'bg-zinc-800 text-emerald-400 font-bold border border-emerald-500/30'
                : 'text-zinc-300 hover:bg-zinc-800/60'
            }`}
          >
            <span>Todas as Lojas</span>
            {filters.store === '' && <Check className="h-3 w-3 text-emerald-400" />}
          </button>

          {popularStores.map((s) => {
            const isSelected = filters.store === s.storeID;
            return (
              <button
                key={s.storeID}
                onClick={() => onFilterChange({ store: isSelected ? '' : s.storeID, page: 0 })}
                className={`flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-zinc-800 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={`https://www.cheapshark.com${s.images.icon}`}
                    alt={s.storeName}
                    className="h-3.5 w-3.5 object-contain"
                  />
                  <span>{s.storeName}</span>
                </div>
                {isSelected && <Check className="h-3 w-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Faixas de Preço em Reais */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5 text-emerald-400" />
          <span>Preço Máximo (BRL)</span>
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Qualquer', usd: '' },
            { label: `Até R$ 15`, usd: Math.round(15 / rate).toString() },
            { label: `Até R$ 30`, usd: Math.round(30 / rate).toString() },
            { label: `Até R$ 60`, usd: Math.round(60 / rate).toString() },
            { label: `Até R$ 100`, usd: Math.round(100 / rate).toString() },
            { label: `Até R$ 200`, usd: Math.round(200 / rate).toString() },
          ].map((tier) => {
            const isSelected = filters.underPrice === tier.usd && !filters.onlyFree;
            return (
              <button
                key={tier.label}
                disabled={filters.onlyFree}
                onClick={() => onFilterChange({ underPrice: tier.usd, page: 0 })}
                className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition border text-center ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:text-white'
                } disabled:opacity-40`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Avaliação Steam */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-emerald-400" />
          <span>Avaliação Steam</span>
        </h4>
        <div className="flex flex-col gap-1">
          {[
            { rating: '', label: 'Qualquer Avaliação' },
            { rating: '90', label: '⭐⭐⭐ 90%+ (Extremamente Positiva)' },
            { rating: '80', label: '⭐⭐ 80%+ (Muito Positiva)' },
            { rating: '70', label: '⭐ 70%+ (Positiva)' },
          ].map((r) => {
            const isSelected = filters.minRating === r.rating;
            return (
              <button
                key={r.rating}
                onClick={() => onFilterChange({ minRating: r.rating, page: 0 })}
                className={`flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-zinc-800 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-zinc-300 hover:bg-zinc-800/60'
                }`}
              >
                <span>{r.label}</span>
                {isSelected && <Check className="h-3 w-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Ordenação */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-emerald-400" />
          <span>Ordenar Resultados</span>
        </h4>
        <div className="flex flex-col gap-1">
          {[
            { id: 'Deal Rating', label: '🔥 Melhor Negócio (Algorítmico)' },
            { id: 'Savings', label: '⚡ Maior Desconto Percentual' },
            { id: 'Price', label: '💰 Menor Preço Absoluto' },
          ].map((ord) => {
            const isSelected = filters.sortBy === ord.id;
            return (
              <button
                key={ord.id}
                onClick={() => onFilterChange({ sortBy: ord.id as any, page: 0 })}
                className={`flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-zinc-800 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-zinc-300 hover:bg-zinc-800/60'
                }`}
              >
                <span>{ord.label}</span>
                {isSelected && <Check className="h-3 w-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop (Fixa / Coluna Lateral Esquerda) */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-20 rounded-3xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl shadow-xl overflow-hidden">
          {content}
        </div>
      </aside>

      {/* Drawer Mobile / Tablet */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop Escuro com Blur */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Lateral Deslizante */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-zinc-950 border-l border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <span className="text-sm font-extrabold text-white">Filtros</span>
              <button
                onClick={onCloseMobile}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white"
                aria-label="Fechar filtros"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
