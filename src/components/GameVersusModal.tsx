'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Swords,
  Search,
  Sparkles,
  Award,
  Zap,
  TrendingDown,
  DollarSign,
  Gamepad2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Deal } from '@/types/deals';
import { formatBRL } from '@/lib/currency';
import { getPixPrice } from '@/lib/payment';

interface VersusGame1 {
  title: string;
  thumb: string;
  currentPrice: number;
  cheapestEverPrice: number;
  retailPrice: number;
  steamAppID?: string;
  rate: number;
}

interface GameVersusModalProps {
  isOpen: boolean;
  onClose: () => void;
  game1: VersusGame1;
}

export function GameVersusModal({ isOpen, onClose, game1 }: GameVersusModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Deal[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGame2, setSelectedGame2] = useState<Deal | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloquear scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSelectedGame2(null);
      setSearchQuery('');
      setSearchResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Tecla ESC para fechar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/deals?title=${encodeURIComponent(searchQuery.trim())}&pageSize=6`);
        if (res.ok) {
          const data: Deal[] = await res.json();
          // Filtrar o próprio jogo 1 se aparecer
          const filtered = data.filter((d) => d.title.toLowerCase() !== game1.title.toLowerCase());
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error('Erro ao pesquisar jogo para comparação:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, game1.title]);

  if (!mounted || !isOpen) return null;

  // Cálculos do Game 1
  const g1PriceBRL = game1.currentPrice * game1.rate;
  const g1CheapestBRL = game1.cheapestEverPrice * game1.rate;
  const g1Savings = game1.retailPrice > 0
    ? Math.max(0, Math.round(((game1.retailPrice - game1.currentPrice) / game1.retailPrice) * 100))
    : 0;
  const g1Pix = getPixPrice(g1PriceBRL);

  // Cálculos do Game 2 (se selecionado)
  const g2PriceUSD = selectedGame2 ? parseFloat(selectedGame2.salePrice) : 0;
  const g2PriceBRL = g2PriceUSD * game1.rate;
  const g2RetailUSD = selectedGame2 ? parseFloat(selectedGame2.normalPrice) : 0;
  const g2Savings = selectedGame2 ? Math.round(parseFloat(selectedGame2.savings)) : 0;
  const g2Pix = getPixPrice(g2PriceBRL);

  // Veredito do Duelo
  let winnerText = '';
  if (selectedGame2) {
    if (g1PriceBRL < g2PriceBRL) {
      winnerText = `🏆 ${game1.title} é mais barato hoje por uma diferença de R$ ${(g2PriceBRL - g1PriceBRL).toFixed(2).replace('.', ',')}!`;
    } else if (g2PriceBRL < g1PriceBRL) {
      winnerText = `🏆 ${selectedGame2.title} é mais barato hoje por uma diferença de R$ ${(g1PriceBRL - g2PriceBRL).toFixed(2).replace('.', ',')}!`;
    } else {
      winnerText = '🤝 Ambos os jogos estão rigorosamente com o mesmo valor!';
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl text-zinc-100 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <Swords className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                <span>Modo Versus: Comparador de Jogos</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Compare preços, histórico e custo-benefício lado a lado antes de fechar sua compra.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Veredito Superior se o jogo 2 estiver selecionado */}
        {selectedGame2 && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 text-xs sm:text-sm font-bold text-emerald-300 text-center flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{winnerText}</span>
          </div>
        )}

        {/* Comparador Grid Lado a Lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Card Jogo 1 */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-300 uppercase">
                  Jogo Selecionado
                </span>
              </div>
              <div className="flex items-center gap-3.5">
                <img
                  src={game1.thumb}
                  alt={game1.title}
                  className="h-16 w-24 rounded-xl border border-zinc-800 object-cover"
                />
                <h3 className="font-extrabold text-white text-base leading-tight">
                  {game1.title}
                </h3>
              </div>

              {/* Métricas Jogo 1 */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-xs border-b border-zinc-800/60 pb-2">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                    Menor Preço Atual
                  </span>
                  <div className="text-right">
                    <span className="font-black text-white text-base block">
                      R$ {g1PriceBRL.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[10px] text-zinc-500">${game1.currentPrice.toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-zinc-800/60 pb-2">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                    Desconto Atual
                  </span>
                  <span className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-xs font-black text-emerald-400">
                    -{g1Savings}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-zinc-800/60 pb-2">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-emerald-400" />
                    Preço no Pix à vista (-10%)
                  </span>
                  <span className="font-bold text-emerald-300">
                    R$ {g1Pix.pixPriceFormatted}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    Recorde Histórico
                  </span>
                  <span className="font-semibold text-zinc-300">
                    R$ {g1CheapestBRL.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Jogo 2 */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-4 flex flex-col justify-between">
            {selectedGame2 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase">
                    Oponente Versus
                  </span>
                  <button
                    onClick={() => setSelectedGame2(null)}
                    className="text-[11px] text-zinc-400 hover:text-white underline"
                  >
                    Trocar Jogo
                  </button>
                </div>

                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedGame2.thumb}
                    alt={selectedGame2.title}
                    className="h-16 w-24 rounded-xl border border-zinc-800 object-cover"
                  />
                  <h3 className="font-extrabold text-white text-base leading-tight">
                    {selectedGame2.title}
                  </h3>
                </div>

                {/* Métricas Jogo 2 */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between text-xs border-b border-zinc-800/60 pb-2">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                      Menor Preço Atual
                    </span>
                    <div className="text-right">
                      <span className="font-black text-white text-base block">
                        R$ {g2PriceBRL.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] text-zinc-500">${g2PriceUSD.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs border-b border-zinc-800/60 pb-2">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                      Desconto Atual
                    </span>
                    <span className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-xs font-black text-emerald-400">
                      -{g2Savings}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-b border-zinc-800/60 pb-2">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      Preço no Pix à vista (-10%)
                    </span>
                    <span className="font-bold text-emerald-300">
                      R$ {g2Pix.pixPriceFormatted}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Gamepad2 className="h-3.5 w-3.5 text-indigo-400" />
                      Avaliação Steam
                    </span>
                    <span className="font-semibold text-zinc-300">
                      {selectedGame2.steamRatingPercent ? `${selectedGame2.steamRatingPercent}% Positiva` : 'Sem reviews'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-300 uppercase">
                  Selecione o 2º Jogo
                </span>

                {/* Campo de Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Digite o nome de outro jogo (ex: Elden Ring)..."
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-2.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                    autoFocus
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-zinc-400" />
                  )}
                </div>

                {/* Sugestões Rápidas */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-zinc-500">
                    Sugestões Populares:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Cyberpunk 2077', 'The Witcher 3', 'Red Dead Redemption 2', 'God of War'].map((sug) => (
                      <button
                        key={sug}
                        onClick={() => setSearchQuery(sug)}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-400 hover:border-indigo-500 hover:text-white transition"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resultados da Busca */}
                {searchResults.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {searchResults.map((deal) => {
                      const dealPriceBRL = parseFloat(deal.salePrice) * game1.rate;
                      return (
                        <button
                          key={deal.dealID}
                          onClick={() => setSelectedGame2(deal)}
                          className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-left hover:border-indigo-500 hover:bg-zinc-800/50 transition group"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={deal.thumb}
                              alt={deal.title}
                              className="h-9 w-14 rounded object-cover"
                            />
                            <div>
                              <span className="text-xs font-bold text-white group-hover:text-indigo-300 block line-clamp-1">
                                {deal.title}
                              </span>
                              <span className="text-[10px] text-zinc-400">
                                Desconto: -{Math.round(parseFloat(deal.savings))}%
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-400">
                            R$ {dealPriceBRL.toFixed(2).replace('.', ',')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 text-xs text-zinc-500">
          <span>* Preços convertidos em tempo real para a cotação oficial.</span>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 font-bold text-white hover:bg-zinc-700 transition"
          >
            Fechar Comparador
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
