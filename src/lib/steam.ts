/**
 * PromoCraft - Utilitários de Integração Steam
 * Suporte a Vanity URLs, perfis SteamID64 numéricos (17 dígitos) e listas de desejos públicas
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

/**
 * Normaliza o input do usuário (link completo, vanity name ou SteamID64)
 */
export function parseSteamInput(input: string): ParsedSteamInput {
  if (!input || typeof input !== 'string') {
    return { identifier: '', isSteamId64: false, rawInput: '' };
  }

  const rawInput = input.trim();

  // Limpa prefixos de URLs Steam comunitárias ou de loja
  let cleaned = rawInput
    .replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, '')
    .replace(/^https?:\/\/(www\.)?store\.steampowered\.com\/wishlist\/(id|profiles)\//i, '')
    .replace(/\/.*$/, '')
    .trim();

  // Remove caracteres especiais não permitidos em identificadores Steam
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
 * Gera a URL primária e a de fallback para consulta de wishlist pública na Steam Store API
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
 * Faz parsing seguro de JSON retornado pela Steam Store API
 * Previne falhas de SyntaxError caso a Steam responda com HTML (página privada, login ou redirect)
 */
export function parseSteamWishlistJson(rawText: string): Record<string, any> {
  if (!rawText || typeof rawText !== 'string') {
    return {};
  }

  const trimmed = rawText.trim();
  // Se não começar e terminar com chaves de objeto JSON válido, ignora
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
