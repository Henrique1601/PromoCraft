/**
 * PromoCraft - Utilitários de Integração Steam Web API
 * Suporte moderno a Vanity URLs, perfis SteamID64 numéricos (17 dígitos)
 * e importação resiliente via IWishlistService (Steam Web API oficial)
 */

export interface ParsedSteamInput {
  identifier: string;
  isSteamId64: boolean;
  rawInput: string;
}

export interface SteamWishlistEndpoints {
  primaryUrl: string;
  fallbackUrl: string;
  identifier: string;
  isSteamId64: boolean;
}

export interface SteamWishlistItem {
  appid: number;
  priority?: number;
  date_added?: number;
}

/**
 * Normaliza o input do usuário (link completo, vanity name ou SteamID64)
 */
export function parseSteamInput(input: string): ParsedSteamInput {
  if (!input || typeof input !== 'string') {
    return { identifier: '', isSteamId64: false, rawInput: '' };
  }

  const rawInput = input.trim();

  // Limpa prefixos de URLs Steam comunitárias ou de loja, incluindo subpastas como /wishlist
  let cleaned = rawInput
    .replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, '')
    .replace(/^https?:\/\/(www\.)?store\.steampowered\.com\/wishlist\/(id|profiles)\//i, '')
    .replace(/\/wishlist\/?$/i, '')
    .replace(/\/.*$/, '')
    .trim();

  // Remove query params e hashes
  cleaned = cleaned.replace(/[?#].*$/, '').trim();

  // SteamID64 é um inteiro de 17 dígitos iniciado tipicamente em 7656...
  const isSteamId64 = /^\d{17}$/.test(cleaned);

  return {
    identifier: cleaned,
    isSteamId64,
    rawInput,
  };
}

/**
 * Extrai o SteamID64 de 17 dígitos a partir de payload XML retornado pela Steam Community
 */
export function extractSteamId64FromXml(xmlText: string): string | null {
  if (!xmlText || typeof xmlText !== 'string') return null;
  const match = xmlText.match(/<steamID64>(\d{17})<\/steamID64>/i);
  return match ? match[1] : null;
}

/**
 * Faz parsing seguro da resposta do serviço oficial IWishlistService da Steam
 */
export function parseSteamWishlistApiResponse(data: any): SteamWishlistItem[] {
  if (!data || typeof data !== 'object') return [];
  const items = data?.response?.items;
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && typeof item.appid === 'number' && item.appid > 0)
    .map((item) => ({
      appid: item.appid,
      priority: typeof item.priority === 'number' ? item.priority : undefined,
      date_added: typeof item.date_added === 'number' ? item.date_added : undefined,
    }));
}

/**
 * Resolve um identificador Steam (vanity name ou URL) para um SteamID64 numérico de 17 dígitos
 */
export async function resolveSteamId64(identifier: string, isSteamId64?: boolean): Promise<string | null> {
  const cleanId = (identifier || '').trim();
  if (!cleanId) return null;

  if (isSteamId64 || /^\d{17}$/.test(cleanId)) {
    return cleanId;
  }

  const userAgent = 'PromoCraft/2.1 (https://promocraft.netlify.app; contact@promocraft.app)';

  // 1ª Tentativa: Consulta perfil comunitário com flag XML
  try {
    const vanityUrl = `https://steamcommunity.com/id/${encodeURIComponent(cleanId)}/?xml=1`;
    const res = await fetch(vanityUrl, {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(7000),
    });
    if (res.ok) {
      const xml = await res.text();
      const resolved = extractSteamId64FromXml(xml);
      if (resolved) return resolved;
    }
  } catch (err) {
    console.warn(`Tentativa de resolver SteamID via /id/${cleanId} falhou:`, err);
  }

  // 2ª Tentativa: Fallback via /profiles/ caso o usuário tenha passado numérico diferente
  try {
    const profileUrl = `https://steamcommunity.com/profiles/${encodeURIComponent(cleanId)}/?xml=1`;
    const res = await fetch(profileUrl, {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(7000),
    });
    if (res.ok) {
      const xml = await res.text();
      const resolved = extractSteamId64FromXml(xml);
      if (resolved) return resolved;
    }
  } catch (err) {
    console.warn(`Tentativa de resolver SteamID via /profiles/${cleanId} falhou:`, err);
  }

  return null;
}

/**
 * Consulta a wishlist oficial pública do usuário via IWishlistService (Steam Web API)
 */
export async function fetchSteamWishlistAppIds(steamId64: string): Promise<SteamWishlistItem[]> {
  if (!steamId64 || !/^\d{17}$/.test(steamId64)) return [];

  const apiKey = process.env.STEAM_API_KEY ? `&key=${encodeURIComponent(process.env.STEAM_API_KEY)}` : '';
  const userAgent = 'PromoCraft/2.1 (https://promocraft.netlify.app; contact@promocraft.app)';

  // 1. Endpoint oficial moderno IWishlistService/GetWishlist/v1
  try {
    const url = `https://api.steampowered.com/IWishlistService/GetWishlist/v1/?steamid=${steamId64}${apiKey}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      const items = parseSteamWishlistApiResponse(data);
      if (items.length > 0) return items;
    }
  } catch (err) {
    console.warn(`Consulta IWishlistService/GetWishlist falhou para ${steamId64}:`, err);
  }

  // 2. Fallback oficial alternativo IWishlistService/GetWishlistSortedFiltered/v1
  try {
    const fallbackUrl = `https://api.steampowered.com/IWishlistService/GetWishlistSortedFiltered/v1/?steamid=${steamId64}${apiKey}`;
    const res = await fetch(fallbackUrl, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      const items = parseSteamWishlistApiResponse(data);
      if (items.length > 0) return items;
    }
  } catch (err) {
    console.warn(`Consulta IWishlistService/GetWishlistSortedFiltered falhou para ${steamId64}:`, err);
  }

  return [];
}

/**
 * Gera a URL primária e a de fallback para consulta legada (mantido para compatibilidade retroativa)
 */
export function getSteamWishlistUrls(input: string): SteamWishlistEndpoints {
  const { identifier, isSteamId64 } = parseSteamInput(input);

  if (!identifier) {
    return {
      primaryUrl: '',
      fallbackUrl: '',
      identifier: '',
      isSteamId64: false,
    };
  }

  const encoded = encodeURIComponent(identifier);

  if (isSteamId64) {
    return {
      primaryUrl: `https://store.steampowered.com/wishlist/profiles/${encoded}/wishlistdata/?p=0`,
      fallbackUrl: `https://store.steampowered.com/wishlist/id/${encoded}/wishlistdata/?p=0`,
      identifier,
      isSteamId64: true,
    };
  }

  return {
    primaryUrl: `https://store.steampowered.com/wishlist/id/${encoded}/wishlistdata/?p=0`,
    fallbackUrl: `https://store.steampowered.com/wishlist/profiles/${encoded}/wishlistdata/?p=0`,
    identifier,
    isSteamId64: false,
  };
}

/**
 * Faz parsing seguro de JSON retornado pela Steam Store API (mantido para compatibilidade retroativa)
 */
export function parseSteamWishlistJson(rawText: string): Record<string, any> {
  if (!rawText || typeof rawText !== 'string') {
    return {};
  }

  const trimmed = rawText.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return {};
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
}
