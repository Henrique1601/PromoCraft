import React from 'react';
import { Gamepad, ExternalLink, Laptop } from 'lucide-react';

interface SteamDeckBadgeProps {
  steamAppID?: string;
  title: string;
}

export function SteamDeckBadge({ steamAppID, title }: SteamDeckBadgeProps) {
  if (!steamAppID) return null;

  const protonDbUrl = `https://www.protondb.com/app/${steamAppID}`;
  const steamStoreUrl = `https://store.steampowered.com/app/${steamAppID}`;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Gamepad className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-200">
              Steam Deck & PCs Portáteis
            </span>
            <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.2">
              Proton Ready
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Jogue no Steam Deck, ASUS ROG Ally, Lenovo Legion Go e Linux com otimização gráfica.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={protonDbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-indigo-500 hover:text-white"
        >
          <span>Relatórios ProtonDB</span>
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={steamStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-emerald-500 hover:text-white"
        >
          <span>Página Steam</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
