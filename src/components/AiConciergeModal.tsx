'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bot, Sparkles, X, ArrowRight, Loader2, ThumbsUp, Scale, Flame } from 'lucide-react';

interface AiConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Recommendation {
  gameID: string;
  dealID: string;
  title: string;
  thumb: string;
  salePriceBRL: string;
  savings: number;
  steamRatingPercent?: string;
  reason: string;
}

export function AiConciergeModal({ isOpen, onClose }: AiConciergeModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  async function handleSearch(searchQuery: string) {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setQuery(searchQuery);

    try {
      const res = await fetch('/api/ai-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error('Erro no AI Concierge:', err);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    'RPG longo e imersivo com bom desconto',
    'Terror cooperativo barato para jogar com amigos',
    'Jogos leves excelentes para Steam Deck',
    'Blockbusters AAA por menos de R$ 50',
    'Roguelike viciante para jogar muitas horas',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] flex flex-col">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black tracking-tight text-white">
                PromoCraft AI Concierge
              </h3>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                IA Generativa
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Diga o que você quer jogar em linguagem natural e nossa IA vasculhará mais de 30 lojas oficiais.
            </p>
          </div>
        </div>

        {/* Input & Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="mt-6 flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: Quero um jogo cooperativo de tiro barato para jogar hoje..."
            className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-3 text-xs sm:text-sm font-extrabold text-zinc-950 transition hover:opacity-95 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="hidden sm:inline">Consultar IA</span>
          </button>
        </form>

        {/* Sugestões Rápidas de Prompt */}
        {!hasSearched && (
          <div className="mt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">
              Sugestões Rápidas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSearch(sug)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300 hover:border-emerald-500/40 hover:text-white transition"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resultados */}
        <div className="mt-6 overflow-y-auto pr-1 flex-1 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-zinc-400 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-400" />
              <p className="text-xs">Analisando histórico de preços, avaliações e catálogo...</p>
            </div>
          ) : hasSearched && recommendations.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs">
              Nenhuma recomendação encontrada para este critério. Tente outro estilo de jogo.
            </div>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.gameID}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3.5 hover:border-emerald-500/40 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={rec.thumb}
                    alt={rec.title}
                    className="h-12 w-20 rounded-xl object-cover flex-shrink-0 border border-zinc-800"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{rec.title}</h4>
                    <p className="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{rec.reason}</span>
                    </p>
                    {rec.steamRatingPercent && (
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <ThumbsUp className="h-2.5 w-2.5 text-emerald-400" />
                        {rec.steamRatingPercent}% aprovação no Steam
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-zinc-800/80 pt-2 sm:pt-0">
                  <div className="text-right">
                    {rec.savings > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-400">
                        <Flame className="h-2.5 w-2.5 fill-current" />
                        -{rec.savings}%
                      </span>
                    )}
                    <span className="block text-sm font-black text-emerald-400">
                      R$ {rec.salePriceBRL}
                    </span>
                  </div>

                  <Link
                    href={`/game/${rec.gameID}`}
                    onClick={onClose}
                    className="flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition shadow-sm"
                  >
                    <span>Ver Oferta</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
