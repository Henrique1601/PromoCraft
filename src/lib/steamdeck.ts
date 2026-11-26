export type SteamDeckStatus = 'verified' | 'playable' | 'unsupported' | 'unknown';

export interface SteamDeckInfo {
  status: SteamDeckStatus;
  label: string;
  colorClass: string;
}

export async function fetchSteamDeckStatus(steamAppID?: string): Promise<SteamDeckInfo | null> {
  if (!steamAppID || steamAppID === '0') return null;

  try {
    const res = await fetch(
      `https://store.steampowered.com/saleaction/ajaxgetdeckappcompatibilityreport?nAppID=${encodeURIComponent(
        steamAppID
      )}`,
      {
        headers: { 'User-Agent': 'PromoCraft/1.0' },
        next: { revalidate: 86400 }, // Cache 24h
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const category = data?.results?.resolved_category;

    if (category === 3) {
      return {
        status: 'verified',
        label: 'Steam Deck: Verificado',
        colorClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      };
    }
    if (category === 2) {
      return {
        status: 'playable',
        label: 'Steam Deck: Jogável',
        colorClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
    }
    if (category === 1) {
      return {
        status: 'unsupported',
        label: 'Steam Deck: Não Suportado',
        colorClass: 'bg-red-500/15 text-red-300 border-red-500/30',
      };
    }
    return null;
  } catch {
    return null;
  }
}
