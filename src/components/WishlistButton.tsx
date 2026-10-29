'use client';

import React, { useState } from 'react';
import { Heart, Bell, Check, Loader2, Send } from 'lucide-react';

interface WishlistButtonProps {
  gameID: string;
  title: string;
  thumb?: string;
  steamAppID?: string;
  cheapestPriceEver?: string;
  currentBestPrice?: string;
  rate?: number;
}

export function WishlistButton({
  gameID,
  title,
  thumb,
  steamAppID,
  cheapestPriceEver,
  currentBestPrice,
  rate = 5.75,
}: WishlistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [email, setEmail] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameID,
          title,
          thumb,
          steamAppID,
          cheapestPriceEver,
          currentBestPrice,
          targetPrice: targetPrice ? parseFloat(targetPrice) / rate : null,
          email,
          discordWebhook,
        }),
      });

      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsOpen(false), 1400);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition shadow-sm ${
          isSaved
            ? 'bg-emerald-500 text-zinc-950 font-bold'
            : 'border border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-emerald-500 hover:text-emerald-400'
        }`}
      >
        {isSaved ? <Check className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
        <span>{isSaved ? 'Monitorando!' : 'Monitorar Preço / Wishlist'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-88 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Bell className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-zinc-100">Criar Alerta de Preço Inteligente</h4>
          </div>

          <div className="mt-3 space-y-3 text-xs">
            <div>
              <label className="block font-medium text-zinc-300">
                Avisar quando o preço atingir (R$):
              </label>
              <input
                type="number"
                placeholder="Ex: 50.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-300">
                E-mail para Notificação:
              </label>
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-300">
                Webhook do Discord (Opcional - Notificação no Canal):
              </label>
              <input
                type="url"
                placeholder="https://discord.com/api/webhooks/..."
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-1.5 text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50 shadow-md shadow-emerald-950/40"
              >
                {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                <span>{isSaved ? 'Monitorando!' : 'Ativar Alerta'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
