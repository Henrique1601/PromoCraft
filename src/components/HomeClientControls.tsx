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
          className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500 transition shadow-sm"
          title="Buscar recomendações com inteligência artificial"
        >
          <Bot className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">IA Concierge</span>
        </button>

        {/* Botão Sincronizar Steam */}
        <button
          onClick={() => setIsSteamModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500 transition shadow-sm"
          title="Importar lista de desejos do Steam em 1 clique"
        >
          <Gamepad2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sync Steam</span>
        </button>
      </div>

      {/* Modais Globais Interativos */}
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
