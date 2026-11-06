export type CurrencyCode = 'BRL' | 'USD' | 'EUR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  BRL: { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', flag: '🇧🇷' },
  USD: { code: 'USD', symbol: '$', name: 'Dólar Americano', flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro Europeu', flag: '🇪🇺' },
};

let cachedRate: number | null = null;
let lastFetched = 0;

export async function getUSDtoBRLRate(): Promise<number> {
  const now = Date.now();
  // Cache de 1 hora (3600000 ms)
  if (cachedRate && now - lastFetched < 3600000) {
    return cachedRate;
  }

  try {
    const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL', {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const bid = parseFloat(data.USDBRL?.bid);
      if (!isNaN(bid) && bid > 0) {
        cachedRate = bid;
        lastFetched = now;
        return bid;
      }
    }
  } catch (error) {
    console.error('Falha ao buscar cotação USD-BRL, utilizando fallback:', error);
  }

  // Fallback seguro caso a API de cotação oscile
  return 5.75;
}

/**
 * Utilitário centralizado para formatar valor em dólar para Reais (BRL).
 */
export function formatBRL(priceUSD: number, rate: number = 5.75): string {
  const brl = priceUSD * rate;
  return brl.toFixed(2).replace('.', ',');
}

/**
 * Utilitário multi-moeda universal (BRL, USD, EUR)
 */
export function formatCurrencyPrice(
  priceUSD: number,
  currency: CurrencyCode = 'BRL',
  rateUSDToBRL: number = 5.75
): { formatted: string; symbol: string; full: string } {
  const cfg = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.BRL;

  if (currency === 'USD') {
    const formatted = priceUSD.toFixed(2);
    return {
      formatted,
      symbol: cfg.symbol,
      full: `${cfg.symbol} ${formatted}`,
    };
  }

  if (currency === 'EUR') {
    // Taxa de conversão aproximada USD -> EUR (~0.92)
    const priceEUR = priceUSD * 0.92;
    const formatted = priceEUR.toFixed(2).replace('.', ',');
    return {
      formatted,
      symbol: cfg.symbol,
      full: `${cfg.symbol} ${formatted}`,
    };
  }

  // BRL Padrão
  const formatted = (priceUSD * rateUSDToBRL).toFixed(2).replace('.', ',');
  return {
    formatted,
    symbol: cfg.symbol,
    full: `${cfg.symbol} ${formatted}`,
  };
}
