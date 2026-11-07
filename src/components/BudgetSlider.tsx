'use client';

import React, { useState } from 'react';
import { Wallet, Sparkles, X } from 'lucide-react';

interface BudgetSliderProps {
  currentUSD: string;
  rate: number;
  onChange: (usdPrice: string) => void;
  className?: string;
}

export function BudgetSlider({
  currentUSD,
  rate,
  onChange,
  className = '',
}: BudgetSliderProps) {
  const currentBRL = currentUSD ? Math.round(parseFloat(currentUSD) * rate) : 0;
  const [sliderValue, setSliderValue] = useState<number>(currentBRL || 60);

  function handleSliderChange(val: number) {
    setSliderValue(val);
    const usd = (val / rate).toFixed(2);
    onChange(usd);
  }

  function handleClear() {
    setSliderValue(60);
    onChange('');
  }

  const QUICK_BUDGETS = [15, 30, 50, 100];

  return (
    <div className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Orçamento no Bolso
          </span>
        </div>

        {currentUSD && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-emerald-400 transition"
            title="Limpar filtro de orçamento"
          >
            <X className="h-3 w-3" />
            <span>Limpar</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">Tenho até:</span>
        <span className="text-base font-black text-emerald-400">
          R$ {currentBRL > 0 ? currentBRL : `${sliderValue}`}
          <span className="text-[10px] text-zinc-500 font-normal ml-1">
            (~${((currentBRL || sliderValue) / rate).toFixed(2)} USD)
          </span>
        </span>
      </div>

      {/* Slider Input */}
      <input
        type="range"
        min={10}
        max={200}
        step={5}
        value={currentBRL || sliderValue}
        onChange={(e) => handleSliderChange(Number(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition"
      />

      {/* Chips Rápidos */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {QUICK_BUDGETS.map((budget) => {
          const isSelected = currentBRL === budget;
          return (
            <button
              key={budget}
              onClick={() => handleSliderChange(budget)}
              className={`rounded-lg px-2 py-1 text-[10px] font-bold border transition ${
                isSelected
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-sm'
                  : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              Até R$ {budget}
            </button>
          );
        })}
      </div>
    </div>
  );
}
