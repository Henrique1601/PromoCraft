import { Deal, Store, GameLookup } from '@/types/deals';

const CHEAPSHARK_BASE = 'https://www.cheapshark.com/api/1.0';
const USER_AGENT = 'PromoCraft/1.0 (contact@promocraft.local)';

export async function fetchStores(): Promise<Store[]> {
  try {
    const res = await fetch(`${CHEAPSHARK_BASE}/stores`, {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 86400 } // Cache 24 horas
    });
    if (!res.ok) throw new Error('Falha ao carregar lojas');
    const data: Store[] = await res.json();
    return data.filter(s => s.isActive === 1);
  } catch (error) {
    console.error('Erro ao buscar lojas:', error);
    return [];
  }
}

export interface DealsQueryParams {
  storeID?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'Deal Rating' | 'Title' | 'Savings' | 'Price' | 'Metacritic' | 'Reviews' | 'Release' | 'Store';
  desc?: boolean;
  lowerPrice?: number;
  upperPrice?: number;
  title?: string;
  steamRating?: number;
  AAA?: boolean;
}

export async function fetchDeals(params: DealsQueryParams = {}): Promise<Deal[]> {
  try {
    const query = new URLSearchParams();
    if (params.storeID) query.set('storeID', params.storeID);
    if (params.pageNumber !== undefined) query.set('pageNumber', params.pageNumber.toString());
    query.set('pageSize', (params.pageSize || 30).toString());
    query.set('sortBy', params.sortBy || 'Deal Rating');
    if (params.desc !== undefined) query.set('desc', params.desc ? '1' : '0');
    if (params.lowerPrice !== undefined) query.set('lowerPrice', params.lowerPrice.toString());
    if (params.upperPrice !== undefined) query.set('upperPrice', params.upperPrice.toString());
    if (params.title) query.set('title', params.title);
    if (params.steamRating !== undefined) query.set('steamRating', params.steamRating.toString());
    if (params.AAA) query.set('AAA', '1');

    const res = await fetch(`${CHEAPSHARK_BASE}/deals?${query.toString()}`, {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 300 } // Cache de 5 minutos
    });

    if (!res.ok) throw new Error(`Status HTTP ${res.status}`);
    const data: Deal[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    return [];
  }
}

export async function fetchGameDetails(gameID: string): Promise<GameLookup | null> {
  try {
    const res = await fetch(`${CHEAPSHARK_BASE}/games?id=${encodeURIComponent(gameID)}`, {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 600 } // 10 min
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Erro ao buscar detalhes do jogo:', error);
    return null;
  }
}
