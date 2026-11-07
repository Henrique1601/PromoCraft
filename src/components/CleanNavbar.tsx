'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Search, Heart, DollarSign } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';

interface CleanNavbarProps {
  rate: number;
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
}

export function CleanNavbar({
  rate,
  onToggleSidebar,
  onOpenCommandPalette,
}: CleanNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl shadow-lg">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
        {/* Esquerda: Menu Hambúrguer + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 hover:border-emerald-500/50 hover:text-white transition lg:hidden"
            title="Abrir menu de navegação lateral"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <img
              src="/logo-mark.png"
              alt="PromoCraft"
              className="h-9 w-9 rounded-xl border border-emerald-500/30 object-cover shadow-md shadow-emerald-950/40"
            />
            <div>
              <span className="text-lg font-extrabold tracking-tight text-zinc-100">
                Promo<span className="text-emerald-400">Craft</span>
              </span>
              <span className="ml-2 hidden sm:inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.2 text-[10px] font-semibold text-emerald-400">
                PC Gaming Deals
              </span>
            </div>
          </Link>
        </div>

        {/* Centro: Barra de Busca Rápida (Command Palette Ctrl+K) */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-2 text-xs text-zinc-400 hover:border-emerald-500/50 hover:bg-zinc-900 hover:text-zinc-200 transition shadow-inner group"
            title="Buscar jogos rapidamente (Ctrl+K)"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-zinc-400 group-hover:text-emerald-400 transition" />
              <span>Pesquisar ofertas, títulos, gêneros...</span>
            </div>
            <kbd className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400 border border-zinc-700">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Direita: Câmbio, Moeda & Wishlist */}
        <div className="flex items-center gap-3 text-xs">
          {/* Cotação Dólar */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-3 py-1.5 text-zinc-300">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              USD/BRL: <b className="text-emerald-400">R$ {rate.toFixed(2)}</b>
            </span>
          </div>

          {/* Seletor Global de Moeda */}
          <CurrencySelector />

          {/* Link Rápido para a Wishlist */}
          <Link
            href="/wishlist"
            className="group flex items-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-3.5 py-1.5 font-bold text-zinc-200 transition hover:border-emerald-500 hover:bg-zinc-800 hover:text-white shadow-sm active:scale-95"
            title="Acessar minha lista de desejos"
          >
            <Heart className="h-3.5 w-3.5 text-emerald-400 transition group-hover:scale-110" />
            <span className="hidden sm:inline">Wishlist</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
