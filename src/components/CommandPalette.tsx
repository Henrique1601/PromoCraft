'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2, Gamepad2, ArrowRight, Flame } from 'lucide-react';
import { Deal } from '@/types/deals';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  rate?: number;
}

export function CommandPalette({ isOpen, onClose, rate = 5.75 }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Deal[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Foco automático e bloqueio de scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/deals?title=${encodeURIComponent(query.trim())}&pageSize=8`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Erro ao buscar no Command Palette:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Navegação por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        router.push(`/game/${results[selectedIndex].gameID}`);
        onClose();
      }
    }
  };

  if (!isOpen || !mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Palette Card */}
      <div
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/95 shadow-2xl z-10 flex flex-col max-h-[80vh] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-zinc-800/80 px-5 py-4">
          <Search className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o nome do jogo (ex: Cyberpunk, Resident Evil, Elden Ring)..."
            className="flex-1 bg-transparent text-sm sm:text-base text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-emerald-400 flex-shrink-0" />}
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white transition sm:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[160px] max-h-[420px]">
          {loading && results.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
              <span>Vasculhando promoções em 30+ lojas oficiais...</span>
            </div>
          ) : query.trim() && !loading && results.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Nenhuma oferta encontrada para "{query}". Tente outro termo de busca.
            </div>
          ) : !query.trim() ? (
            <div className="py-10 text-center text-xs text-zinc-500 space-y-2">
              <Gamepad2 className="h-8 w-8 text-zinc-700 mx-auto" />
              <p>Busque qualquer título para comparar preços oficiais em Reais (BRL).</p>
              <p className="text-[11px] text-zinc-600">Use ↑ e ↓ para navegar e Enter para abrir.</p>
            </div>
          ) : (
            results.map((deal, idx) => {
              const isSelected = idx === selectedIndex;
              const priceUSD = parseFloat(deal.salePrice);
              const priceBRL = (priceUSD * rate).toFixed(2).replace('.', ',');
              const savings = Math.round(parseFloat(deal.savings));

              return (
                <div
                  key={deal.dealID}
                  onClick={() => {
                    router.push(`/game/${deal.gameID}`);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 rounded-2xl p-3 cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-500/15 border border-emerald-500/40 text-white'
                      : 'border border-transparent hover:bg-zinc-900/60 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={deal.thumb}
                      alt={deal.title}
                      className="h-10 w-16 rounded-xl object-cover border border-zinc-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="block text-sm font-bold truncate text-white">
                        {deal.title}
                      </span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        Loja #{deal.storeID} • Steam Rating: {deal.steamRatingText || 'Positivo'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {savings > 0 && (
                      <span className="inline-flex items-center gap-0.5 rounded-lg bg-amber-500/20 px-2 py-0.5 text-xs font-black text-amber-400">
                        <Flame className="h-3 w-3 fill-current" />
                        -{savings}%
                      </span>
                    )}
                    <span className="text-sm font-black text-emerald-400">
                      R$ {priceBRL}
                    </span>
                    <ArrowRight className="h-4 w-4 text-zinc-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 bg-zinc-950 px-5 py-2.5 text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 font-bold">↑</kbd>{' '}
              <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5 font-bold">↓</kbd> navegar
            </span>
            <span>
              <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-bold">↵</kbd> selecionar
            </span>
          </div>
          <span>PromoCraft Fast Search</span>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
