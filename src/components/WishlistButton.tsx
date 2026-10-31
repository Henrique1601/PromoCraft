'use client';

import React, { useState, useEffect } from 'react';
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

const LOCAL_STORAGE_KEY = 'promocraft_wishlist_v1';

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

  // Verificar se o jogo já está salvo no localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.some((item) => item.gameID === gameID)) {
          setIsSaved(true);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [gameID]);

  async function handleSave() {
    setIsLoading(true);

    const parsedTargetPrice = targetPrice ? parseFloat(targetPrice) / rate : null;
    const newItem = {
      id: `local_${Date.now()}`,
      gameID,
      title,
      thumb,
      steamAppID,
      cheapestPriceEver: cheapestPriceEver ? parseFloat(cheapestPriceEver) : 0,
      currentBestPrice: currentBestPrice ? parseFloat(currentBestPrice) : 0,
      targetPrice: parsedTargetPrice,
      email: email || undefined,
      discordWebhook: discordWebhook || undefined,
      createdAt: new Date().toISOString(),
    };

    // 1. Salvar no localStorage primeiro (resiliência offline)
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const updated = Array.isArray(list)
        ? [newItem, ...list.filter((i) => i.gameID !== gameID)]
        : [newItem];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setIsSaved(true);
    } catch (e) {
      console.error('Erro ao salvar localmente:', e);
    }

    // 2. Sincronizar com o backend
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameID,
          title,
          thumb,
          steamAppID,
          cheapestPriceEver,
          currentBestPrice,
          targetPrice: parsedTargetPrice,
          email,
          discordWebhook,
        }),
      });
    } catch (e) {
      console.warn('API de banco offline ou efêmera, mantendo no localStorage:', e);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsOpen(false), 1200);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition shadow-sm ${
          isSaved
            ? 'bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400'
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

          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs text-zinc-400">Preço Alvo Desejado (R$):</label>
              <input
                type="number"
                placeholder="Ex: 50.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500">
                Avisaremos assim que alguma loja atingir ou baixar desse valor.
              </span>
            </div>

            <div>
              <label className="text-xs text-zinc-400">Webhook do Discord (Opcional):</label>
              <input
                type="url"
                placeholder="https://discord.com/api/webhooks/..."
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400">E-mail para Notificação (Opcional):</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando Alerta...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Ativar Monitoramento</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
