'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Tag,
  Cpu,
  Users2,
  Heart,
  ShieldCheck,
  DollarSign,
  X,
  Check,
  Bot,
} from 'lucide-react';
import { Store } from '@/types/deals';
import { FilterState } from '@/components/SidebarFilters';
import { BudgetSlider } from '@/components/BudgetSlider';
import { AiConciergeModal } from '@/components/AiConciergeModal';
import { SteamWishlistModal } from '@/components/SteamWishlistModal';
import { GiveawaysModal } from '@/components/GiveawaysModal';
import { CoopMatcherModal } from '@/components/CoopMatcherModal';
import { CommandPalette } from '@/components/CommandPalette';
import { useCatalogFilters } from '@/context/CatalogFilterContext';

interface GlobalSidebarProps {
  filters?: FilterState;
  stores?: Store[];
  popularStores?: Store[];
  rate?: number;
  onFilterChange?: (updates: Partial<FilterState>) => void;
  onReset?: () => void;
  activeCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function GlobalSidebar({
  filters: propFilters,
  stores = [],
  popularStores = [],
  rate = 5.75,
  onFilterChange: propOnFilterChange,
  onReset: propOnReset,
  activeCount: propActiveCount,
  isOpenMobile,
  onCloseMobile,
}: GlobalSidebarProps) {
  const pathname = usePathname();
  const catalogContext = useCatalogFilters();

  const filters = propFilters || catalogContext?.filters;
  const onFilterChange = propOnFilterChange || catalogContext?.applyFilters;
  const onReset = propOnReset || catalogContext?.resetAllFilters;
  const activeCount = propActiveCount !== undefined ? propActiveCount : (catalogContext?.activeFiltersCount ?? 0);

  const actualPopularStores =
    popularStores.length > 0
      ? popularStores
      : stores.filter((s) =>
          ['1', '2', '3', '7', '11', '15', '25', '27'].includes(s.storeID)
        );

  // Estados dos Modais de Ferramentas
  const [isAiConciergeOpen, setIsAiConciergeOpen] = useState(false);
  const [isSteamModalOpen, setIsSteamModalOpen] = useState(false);
  const [isGiveawaysOpen, setIsGiveawaysOpen] = useState(false);
  const [isCoopOpen, setIsCoopOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Listener para Ctrl+K global
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Seletor de tópicos rápidos
  function selectTopic(topic: FilterState['topic']) {
    if (!onFilterChange) return;

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
      case 'steam_deck':
        onFilterChange({
          topic: 'steam_deck',
          sortBy: 'Deal Rating',
          minRating: '75',
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

  const sidebarContent = (
    <div className="flex flex-col gap-6 p-4 text-xs text-zinc-300">
      {/* Header da Sidebar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-400" />
          <span className="font-extrabold text-sm tracking-tight text-white">Navegação & Ferramentas</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold text-emerald-400">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-emerald-400 transition"
            title="Limpar todos os filtros"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Resetar</span>
          </button>
        )}
      </div>

      {/* SEÇÃO 1: FERRAMENTAS & IA GAMER (Deslocadas da Navbar) */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>Ferramentas & Inteligência</span>
        </h4>

        <div className="flex flex-col gap-1.5">
          {/* IA Concierge */}
          <button
            onClick={() => setIsAiConciergeOpen(true)}
            className="group flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-500/20 px-3 py-2 text-left font-bold text-emerald-300 transition active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-emerald-400 transition group-hover:rotate-12" />
              <span>IA Concierge</span>
            </div>
            <span className="rounded-full bg-emerald-500/30 px-1.5 py-0.2 text-[9px] font-black text-emerald-300">
              IA
            </span>
          </button>

          {/* Co-op Radar */}
          <button
            onClick={() => setIsCoopOpen(true)}
            className="group flex items-center justify-between rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-500/20 px-3 py-2 text-left font-bold text-cyan-300 transition active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <Users2 className="h-4 w-4 text-cyan-400 transition group-hover:scale-110" />
              <span>Co-op Radar</span>
            </div>
            <span className="text-[10px] text-cyan-400/80 font-normal">Amigos</span>
          </button>

          {/* Giveaways ao Vivo */}
          <button
            onClick={() => setIsGiveawaysOpen(true)}
            className="group flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-500/20 px-3 py-2 text-left font-bold text-amber-300 transition active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <Gift className="h-4 w-4 text-amber-400 transition group-hover:scale-110" />
              <span>Giveaways ao Vivo</span>
            </div>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>

          {/* Sync Steam */}
          <button
            onClick={() => setIsSteamModalOpen(true)}
            className="group flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-500/20 px-3 py-2 text-left font-bold text-indigo-300 transition active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <Gamepad2 className="h-4 w-4 text-indigo-400 transition group-hover:scale-110" />
              <span>Sincronizar Steam</span>
            </div>
            <span className="text-[10px] text-indigo-400/80 font-normal">Wishlist</span>
          </button>
        </div>
      </div>

      {/* SEÇÃO 2: COLEÇÕES & TÓPICOS */}
      {filters && onFilterChange && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-emerald-400" />
            <span>Coleções do Catálogo</span>
          </h4>

          <div className="flex flex-col gap-1">
            {[
              { id: 'all', label: 'Todos os Jogos', icon: Gamepad2 },
              { id: 'super_savings', label: '🔥 Super Descontos (70%+)', icon: Flame },
              { id: 'historic_low', label: '👑 Menor Preço Histórico', icon: Award },
              { id: 'under_30', label: '💸 Até R$ 30 (Baratos)', icon: Wallet },
              { id: 'aaa', label: '🎮 Jogos AAA & Blockbusters', icon: Gamepad2 },
              { id: 'steam_deck', label: '🔋 Steam Deck & Portáteis', icon: Cpu },
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
      )}

      {/* SEÇÃO 3: GÊNEROS POPULARES */}
      {filters && onFilterChange && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-emerald-400" />
            <span>Gêneros Populares</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Ação',
              'RPG',
              'Estratégia',
              'Terror',
              'Indie',
              'Roguelike',
              'Soulslike',
              'Cooperativo',
            ].map((genre) => {
              const isSelected = filters.search.toLowerCase() === genre.toLowerCase();
              return (
                <button
                  key={genre}
                  onClick={() =>
                    onFilterChange({
                      search: isSelected ? '' : genre,
                      page: 0,
                    })
                  }
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition border ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SEÇÃO 4: ORÇAMENTO NO BOLSO */}
      {filters && onFilterChange && (
        <BudgetSlider
          currentUSD={filters.underPrice}
          rate={rate}
          onChange={(usd) => onFilterChange({ underPrice: usd, onlyFree: false, page: 0 })}
        />
      )}

      {/* SEÇÃO 5: LOJAS OFICIAIS */}
      {filters && onFilterChange && actualPopularStores.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <StoreIcon className="h-3.5 w-3.5 text-emerald-400" />
            <span>Lojas Oficiais</span>
          </h4>

          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
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

            {actualPopularStores.map((s) => {
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
      )}

      {/* SEÇÃO 6: MINHA CONTA & WISHLIST */}
      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-emerald-400" />
          <span>Minha Área</span>
        </h4>
        <Link
          href="/wishlist"
          className={`flex items-center justify-between rounded-xl px-3 py-2 font-bold transition ${
            pathname === '/wishlist'
              ? 'bg-emerald-500 text-zinc-950 font-bold'
              : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-emerald-400" />
            <span>Minha Wishlist & Alertas</span>
          </div>
        </Link>
      </div>

      {/* SEÇÃO 7: STATUS & GARANTIA */}
      <div className="border-t border-zinc-800/80 pt-3 text-[11px] text-zinc-500 space-y-2">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Lojas 100% Oficiais & Autorizadas</span>
        </div>
        <p className="text-[10px] text-zinc-500 leading-tight">
          Chaves legítimas com ativação direta na Steam, Epic Games, GOG e Nuuvem.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR FIXA */}
      <aside className="hidden lg:block w-72 shrink-0 self-start sticky top-20 rounded-3xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl shadow-xl max-h-[calc(100vh-6rem)] overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* MOBILE DRAWER / OVERLAY */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop Escuro */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Lateral */}
          <div className="relative z-10 w-80 max-w-[85vw] h-full bg-zinc-950 border-r border-zinc-800 p-2 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between p-3 border-b border-zinc-800">
              <span className="font-extrabold text-sm text-white">Menu PromoCraft</span>
              <button
                onClick={onCloseMobile}
                className="rounded-xl border border-zinc-800 p-1.5 text-zinc-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {sidebarContent}
          </div>
        </div>
      )}

      {/* Modais Globais Renderizados com Portal */}
      <AiConciergeModal
        isOpen={isAiConciergeOpen}
        onClose={() => setIsAiConciergeOpen(false)}
      />

      <SteamWishlistModal
        isOpen={isSteamModalOpen}
        onClose={() => setIsSteamModalOpen(false)}
      />

      <GiveawaysModal
        isOpen={isGiveawaysOpen}
        onClose={() => setIsGiveawaysOpen(false)}
      />

      <CoopMatcherModal
        isOpen={isCoopOpen}
        onClose={() => setIsCoopOpen(false)}
        rate={rate}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
}
