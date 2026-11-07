'use client';

import React, { useState } from 'react';
import { Store } from '@/types/deals';
import { CleanNavbar } from './CleanNavbar';
import { GlobalSidebar } from './GlobalSidebar';
import { CommandPalette } from './CommandPalette';
import { BottomNav } from './BottomNav';
import { GamepadControllerListener } from './GamepadControllerListener';
import { CatalogFilterProvider } from '@/context/CatalogFilterContext';
import { AiConciergeModal } from './AiConciergeModal';
import { SteamWishlistModal } from './SteamWishlistModal';

interface HomeShellProps {
  rate: number;
  stores: Store[];
  children: React.ReactNode;
}

export function HomeShell({ rate, stores, children }: HomeShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiConciergeOpen, setIsAiConciergeOpen] = useState(false);
  const [isSteamModalOpen, setIsSteamModalOpen] = useState(false);

  return (
    <CatalogFilterProvider>
      {/* Navbar Superior Despoluída */}
      <CleanNavbar
        rate={rate}
        onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Estrutura Principal: Sidebar para todo o site + Área Central de Conteúdo */}
      <div className="mx-auto flex max-w-[1600px] items-start gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Global Sidebar (Desktop fixo e gaveta deslizante mobile) */}
        <GlobalSidebar
          stores={stores}
          rate={rate}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Conteúdo Principal (HeroShowcase + Prateleiras + Catálogo de Ofertas) */}
        <main className="flex-1 min-w-0 space-y-10 pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Suporte a Controles de Console / Gamepad */}
      <GamepadControllerListener />

      {/* Barra de Navegação Inferior para Mobile */}
      <BottomNav
        onOpenAiConcierge={() => setIsAiConciergeOpen(true)}
        onOpenSteamModal={() => setIsSteamModalOpen(true)}
      />

      {/* Modais acionados pelo BottomNav no Mobile */}
      <AiConciergeModal
        isOpen={isAiConciergeOpen}
        onClose={() => setIsAiConciergeOpen(false)}
      />
      <SteamWishlistModal
        isOpen={isSteamModalOpen}
        onClose={() => setIsSteamModalOpen(false)}
      />
    </CatalogFilterProvider>
  );
}
