'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '@/lib/sound';

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(sound.isEnabled());

    const handleToggle = () => {
      setEnabled(sound.isEnabled());
    };

    window.addEventListener('promocraft-sound-toggle', handleToggle);
    return () => window.removeEventListener('promocraft-sound-toggle', handleToggle);
  }, []);

  if (!mounted) return null;

  const toggle = () => {
    const next = !enabled;
    sound.setEnabled(next);
    setEnabled(next);
    if (next) {
      sound.playSuccess();
    }
  };

  return (
    <button
      onClick={toggle}
      title={enabled ? 'Efeitos sonoros ativados (clique para mutar)' : 'Efeitos sonoros desativados (clique para ativar)'}
      className={`rounded-xl p-2 transition border ${
        enabled
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/10'
          : 'border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
      }`}
      aria-label="Alternar efeitos sonoros"
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
