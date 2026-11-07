'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Users2,
  Gamepad2,
  Sparkles,
  ExternalLink,
  Search,
  Loader2,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { Deal } from '@/types/deals';
import { formatBRL } from '@/lib/currency';

interface CoopMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  rate?: number;
}

const CURATED_COOP_TITLES = [
  'Terraria',
  'It Takes Two',
  'Overcooked! 2',
  'Don\'t Starve Together',
  'Left 4 Dead 2',
  'Portal 2',
  'Valheim',
  'Deep Rock Galactic',
  'Monster Hunter: World',
  'Stardew Valley',
  'Phasmophobia',
  'A Way Out',
];

export function CoopMatcherModal({
  isOpen,
  onClose,
  rate = 5.75,
}: CoopMatcherModalProps) {
  const [mounted, setMounted] = useState(false);
  const [coopDeals, setCoopDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadCoopDeals();
    } else {
      document.body.style.overflow = '';
      setSearch('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  async function loadCoopDeals() {
    setIsLoading(true);
    try {
      // Busca ofertas combinando os títulos cooperativos curados
      const promises = CURATED_COOP_TITLES.slice(0, 6).map((title) =>
        fetch(`/api/deals?title=${encodeURIComponent(title)}&pageSize=2`)
          .then((r) => r.json())
          .catch(() => [])
      );
      const results = await Promise.all(promises);
      const flat = results.flat().filter(Boolean);
      // Remover duplicatas
      const unique = Array.from(new Map(flat.map((d: Deal) => [d.dealID, d])).values());
      setCoopDeals(unique);
    } catch (err) {
      console.error('Erro ao carregar jogos cooperativos:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (!mounted || !isOpen) return null;

  const filtered = coopDeals.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl text-zinc-100 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 shadow-md shadow-cyan-950/40">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-extrabold text-cyan-400">
                  CO-OP RADAR
                </span>
                <span className="text-xs text-zinc-400">
                  Jogos multiplayer e cooperativos em promoção para curtir com a galera
                </span>
              </div>
              <h2 className="text-xl font-black text-white">
                Co-op Deal Matcher ("Jogar com os Amigos")
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Busca Rápida */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nome do jogo (ex: Terraria, It Takes Two, Left 4 Dead)..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Feed de Jogos Coop */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            <span className="text-xs font-semibold">Localizando ofertas cooperativas ativas...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center space-y-2">
            <Users2 className="h-10 w-10 text-zinc-600 mx-auto" />
            <h4 className="font-bold text-white text-sm">Nenhuma oferta coop encontrada</h4>
            <p className="text-xs text-zinc-400">
              Tente buscar outros títulos ou explore o feed geral.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[55vh] overflow-y-auto pr-1">
            {filtered.map((deal) => {
              const priceUSD = parseFloat(deal.salePrice);
              const priceBRL = formatBRL(priceUSD, rate);
              const savings = Math.round(parseFloat(deal.savings));

              return (
                <div
                  key={deal.dealID}
                  className="group flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3.5 transition hover:border-cyan-500/40 hover:bg-zinc-900/90 shadow-md"
                >
                  <div className="space-y-2.5">
                    <div className="relative overflow-hidden rounded-xl border border-zinc-800 aspect-video bg-zinc-950">
                      <img
                        src={deal.thumb}
                        alt={deal.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      {savings > 0 && (
                        <span className="absolute top-2 left-2 rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-zinc-950 shadow-md">
                          -{savings}%
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-cyan-300 transition">
                        {deal.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400">
                        <Users2 className="h-3 w-3 text-cyan-400" />
                        <span>Online & Local Co-op</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Menor Preço</span>
                      <span className="text-sm font-black text-emerald-400">
                        R$ {priceBRL}
                      </span>
                    </div>

                    <a
                      href={`/game/${deal.gameID}`}
                      className="flex items-center gap-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 px-3 py-1 text-xs font-bold transition active:scale-95"
                    >
                      <span>Ver Oferta</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 text-xs text-zinc-500">
          <span>* Ideais para jogar em dupla ou esquadrão completo.</span>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 font-bold text-white hover:bg-zinc-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
