'use client';

import React, { useState, useEffect } from 'react';
import { Gamepad2, X } from 'lucide-react';

export function GamepadControllerListener() {
  const [gamepadName, setGamepadName] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGamepadConnected = (e: GamepadEvent) => {
      const name = e.gamepad.id || 'Controle';
      setGamepadName(name.split('(')[0].trim());
      setShowNotification(true);

      // Auto-oculta notificação após 5s
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    };

    const handleGamepadDisconnected = () => {
      setGamepadName(null);
      setShowNotification(false);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Checa se já havia algum controle conectado
    try {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const gp of gamepads) {
        if (gp) {
          setGamepadName(gp.id.split('(')[0].trim());
          break;
        }
      }
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  if (!gamepadName || !showNotification) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-zinc-950/95 p-3.5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        <Gamepad2 className="h-5 w-5 animate-pulse" />
      </div>

      <div className="text-xs">
        <span className="font-extrabold text-white block">
          Modo Controle Ativo (Steam Deck / Console)
        </span>
        <span className="text-[11px] text-zinc-400 block">
          {gamepadName} conectado e sincronizado
        </span>
      </div>

      <button
        onClick={() => setShowNotification(false)}
        className="ml-2 rounded-lg p-1 text-zinc-500 hover:text-white transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
