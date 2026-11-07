/**
 * Gerenciador de Cache Offline-First & Resiliência Local (Pilar 1)
 * Armazena buscas e ofertas recentes no cliente com expiração automática.
 */

interface CacheEntry<T> {
  timestamp: number;
  data: T;
}

const CACHE_PREFIX = 'promocraft_cache_';
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutos

export function saveToOfflineCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = {
      timestamp: Date.now(),
      data,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // QuotaExceededError handling silencioso
  }
}

export function getFromOfflineCache<T>(key: string, maxAgeMs: number = DEFAULT_TTL_MS): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - entry.timestamp;

    if (age > maxAgeMs) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}
