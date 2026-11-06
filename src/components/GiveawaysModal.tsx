'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Gift,
  ExternalLink,
  Sparkles,
  Search,
  Clock,
  Tag,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Giveaway } from '@/app/api/giveaways/route';

interface GiveawaysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GiveawaysModal({ isOpen, onClose }: GiveawaysModalProps) {
  const [mounted, setMounted] = useState(false);
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloquear scroll do body quando aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchGiveaways();
    } else {
      document.body.style.overflow = '';
      setSearch('');
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

  async function fetchGiveaways() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/giveaways');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.giveaways)) {
          setGiveaways(data.giveaways);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar giveaways:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (!mounted || !isOpen) return null;

  const filteredGiveaways = giveaways.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.platforms.toLowerCase().includes(search.toLowerCase())
  );

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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-950/40">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">
                  AO VIVO
                </span>
                <span className="text-xs text-zinc-400">
                  {giveaways.length} jogos grátis disponíveis hoje
                </span>
              </div>
              <h2 className="text-xl font-black text-white">
                Central de Giveaways & Jogos Grátis
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchGiveaways}
              disabled={isLoading}
              className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50"
              title="Atualizar lista de brindes"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Barra de Busca de Giveaways */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por jogo ou plataforma (Steam, Epic Games, GOG)..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Conteúdo de Giveaways */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            <span className="text-xs font-semibold">Buscando promoções 100% grátis e giveaways ao vivo...</span>
          </div>
        ) : filteredGiveaways.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center space-y-2">
            <Gift className="h-10 w-10 text-zinc-600 mx-auto" />
            <h4 className="font-bold text-white text-sm">Nenhum giveaway encontrado</h4>
            <p className="text-xs text-zinc-400">
              Tente alterar os termos da busca para encontrar brindes ativos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[58vh] overflow-y-auto pr-1">
            {filteredGiveaways.map((giveaway) => (
              <div
                key={giveaway.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 transition-all hover:border-emerald-500/40 hover:bg-zinc-900/90 shadow-md"
              >
                <div className="space-y-3">
                  {/* Imagem do Brinde */}
                  <div className="relative overflow-hidden rounded-xl border border-zinc-800 aspect-video bg-zinc-950">
                    <img
                      src={giveaway.image || giveaway.thumbnail}
                      alt={giveaway.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-zinc-950 shadow-md">
                      <span>GRÁTIS</span>
                      {giveaway.worth && giveaway.worth !== 'N/A' && (
                        <span className="opacity-80 line-through">({giveaway.worth})</span>
                      )}
                    </div>

                    <div className="absolute bottom-2 right-2 rounded-md bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                      {giveaway.platforms}
                    </div>
                  </div>

                  {/* Informações */}
                  <div>
                    <h3 className="font-extrabold text-white text-sm line-clamp-1 group-hover:text-emerald-300 transition">
                      {giveaway.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {giveaway.description}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Resgate Oficial</span>
                  </div>

                  <a
                    href={giveaway.open_giveaway_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3.5 py-1.5 text-xs font-bold transition shadow-md shadow-emerald-950/40 active:scale-[0.98]"
                  >
                    <span>Resgatar Grátis</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-zinc-800/80 pt-4 text-xs text-zinc-500 gap-2">
          <span>* Giveaways verificados com ativação oficial em lojas digitais autorizadas.</span>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
          >
            Fechar Central
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
