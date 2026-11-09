'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PromoCraft] Service Worker ativo com escopo:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PromoCraft] Falha ao registrar Service Worker:', error);
          });
      });
    }
  }, []);

  return null;
}
