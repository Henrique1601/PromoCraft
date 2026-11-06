'use client';

import React, { useState } from 'react';
import { Swords } from 'lucide-react';
import { GameVersusModal } from './GameVersusModal';

interface GameVersusButtonProps {
  title: string;
  thumb: string;
  currentPrice: number;
  cheapestEverPrice: number;
  retailPrice: number;
  steamAppID?: string;
  rate: number;
}

export function GameVersusButton({
  title,
  thumb,
  currentPrice,
  cheapestEverPrice,
  retailPrice,
  steamAppID,
  rate,
}: GameVersusButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-2 text-xs font-bold text-indigo-300 transition hover:border-indigo-400 hover:bg-indigo-500/25 hover:text-white shadow-sm active:scale-[0.98]"
        title="Comparar este jogo lado a lado com outro"
      >
        <Swords className="h-4 w-4 text-indigo-400" />
        <span>Modo Versus: Comparar</span>
      </button>

      <GameVersusModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        game1={{
          title,
          thumb,
          currentPrice,
          cheapestEverPrice,
          retailPrice,
          steamAppID,
          rate,
        }}
      />
    </>
  );
}
