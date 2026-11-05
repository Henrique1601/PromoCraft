'use client';

import React, { useState } from 'react';
import { Bot, Gamepad2, Sparkles } from 'lucide-react';
import { SteamWishlistModal } from '@/components/SteamWishlistModal';
import { AiConciergeModal } from '@/components/AiConciergeModal';
import { BottomNav } from '@/components/BottomNav';

export function HomeClientControls() {
  const [isSteamModalOpen, setIsSteamModalOpen] = useState(false);
  const [isAiConciergeOpen, setIsAiConciergeOpen] = useState(false);

  return (
    <>
      {/* Botões de Ação Rápida no Topo (Desktop / Tablet) */}
      <div className="flex items-center gap-2">
        {/* Botão IA Concierge */}
        <button
          onClick={() => setIsAiConciergeOpen(true)}
          className="group relative flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300 shadow-sm shadow-emerald-950/40 transition hover:border-emerald-400 hover:bg-emerald-500/25 hover:text-white hover:shadow-emerald-500/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          title="Buscar recomendações inteligentes com IA"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-400 transition group-hover:rotate-12 group-hover:scale-110" />
          <span className="hidden sm:inline">IA Concierge</span>
          <span className="rounded-full bg-emerald-500/30 px-1.5 py-0.2 text-[9px] font-black text-emerald-300 group-hover:bg-emerald-400 group-hover:text-zinc-950 transition">
            IA
          </span>
        </button>

        {/* Botão Sincronizar Steam */}
        <button
          onClick={() => setIsSteamModalOpen(true)}
          className="group relative flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-indigo-500/15 px-3 py-1.5 text-xs font-bold text-indigo-300 shadow-sm shadow-indigo-950/40 transition hover:border-indigo-400 hover:bg-indigo-500/25 hover:text-white hover:shadow-indigo-500/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          title="Importar lista de desejos do Steam em 1 clique"
        >
          <Gamepad2 className="h-3.5 w-3.5 text-indigo-400 transition group-hover:scale-110" />
          <span className="hidden sm:inline">Sync Steam</span>
        </button>
      </div>

      {/* Modais Globais Interativos (Renderizados via Portal no document.body para eliminar stacking context) */}
      <SteamWishlistModal
        isOpen={isSteamModalOpen}
        onClose={() => setIsSteamModalOpen(false)}
      />

      <AiConciergeModal
        isOpen={isAiConciergeOpen}
        onClose={() => setIsAiConciergeOpen(false)}
      />

      {/* Barra de Navegação Inferior para Mobile & Steam Deck */}
      <BottomNav
        onOpenAiConcierge={() => setIsAiConciergeOpen(true)}
        onOpenSteamModal={() => setIsSteamModalOpen(true)}
      />
    </>
  );
}
