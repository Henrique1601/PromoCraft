'use client';

import React, { useState, useEffect } from 'react';
import { SUPPORTED_CURRENCIES, CurrencyCode } from '@/lib/currency';
import { ChevronDown, Globe } from 'lucide-react';

const STORAGE_KEY = 'promocraft_currency';

export function CurrencySelector() {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('BRL');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
      if (saved && SUPPORTED_CURRENCIES[saved]) {
        setSelectedCurrency(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  function handleSelect(code: CurrencyCode) {
    setSelectedCurrency(code);
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, code);
      window.dispatchEvent(new CustomEvent('currency-changed', { detail: code }));
    } catch {
      // ignore
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs text-zinc-400">
        <Globe className="h-3.5 w-3.5 text-emerald-400" />
        <span>🇧🇷 BRL</span>
      </div>
    );
  }

  const currentConfig = SUPPORTED_CURRENCIES[selectedCurrency] || SUPPORTED_CURRENCIES.BRL;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-emerald-500/50 hover:text-white active:scale-[0.98] shadow-sm"
        title="Alterar moeda de exibição"
      >
        <span className="text-sm">{currentConfig.flag}</span>
        <span className="font-bold text-white">{currentConfig.code}</span>
        <ChevronDown className="h-3 w-3 text-zinc-400" />
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40"
            aria-hidden="true"
          />
          <div className="absolute right-0 top-11 z-50 w-44 rounded-2xl border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
            <span className="block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Moeda do Catálogo
            </span>
            {(Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]).map((code) => {
              const item = SUPPORTED_CURRENCIES[code];
              const isSelected = selectedCurrency === code;
              return (
                <button
                  key={code}
                  onClick={() => handleSelect(code)}
                  className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-medium transition ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                      : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{item.flag}</span>
                    <span>{item.code}</span>
                  </div>
                  <span className="text-[11px] text-zinc-500">{item.symbol}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
