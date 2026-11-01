/**
 * Utilitário para resolver o link direto da loja ou fallback amigável.
 * Quando o jogo tem steamAppID e a loja é Steam (storeID === '1'), vai direto para a Steam Store.
 * Para GamersGate, GOG, Epic, GMG, etc., resolve para a URL direta ou busca oficial da loja.
 */
export function getDirectStoreUrl(dealID: string, storeID?: string, steamAppID?: string, gameTitle?: string): string {
  // Steam Direto
  if (storeID === '1' && steamAppID && steamAppID !== '0') {
    return `https://store.steampowered.com/app/${steamAppID}/`;
  }

  // GamersGate Direto (storeID: 2)
  if (storeID === '2' && gameTitle) {
    return `https://www.gamersgate.com/apps/?q=${encodeURIComponent(gameTitle)}`;
  }

  // Green Man Gaming Direto (storeID: 3)
  if (storeID === '3' && gameTitle) {
    return `https://www.greenmangaming.com/search?query=${encodeURIComponent(gameTitle)}`;
  }

  // GOG Direto (storeID: 7)
  if (storeID === '7' && gameTitle) {
    return `https://www.gog.com/en/games?query=${encodeURIComponent(gameTitle)}`;
  }

  // Humble Store Direto (storeID: 11)
  if (storeID === '11' && gameTitle) {
    return `https://www.humblebundle.com/store/search?sort=bestselling&search=${encodeURIComponent(gameTitle)}`;
  }

  // Fanatical Direto (storeID: 15)
  if (storeID === '15' && gameTitle) {
    return `https://www.fanatical.com/en/search?search=${encodeURIComponent(gameTitle)}`;
  }

  // Epic Games Direto (storeID: 25)
  if (storeID === '25' && gameTitle) {
    return `https://store.epicgames.com/pt-BR/browse?q=${encodeURIComponent(gameTitle)}`;
  }

  // Nuuvem Direto
  if (storeID === '35' || (gameTitle && storeID === 'nuuvem')) {
    return `https://www.nuuvem.com/br-pt/catalog/search/${encodeURIComponent(gameTitle || '')}`;
  }

  // Se tiver steamAppID conhecido
  if (steamAppID && steamAppID !== '0') {
    return `https://store.steampowered.com/app/${steamAppID}/`;
  }

  // Fallback seguro via CheapShark Redirect oficial
  return `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealID)}`;
}

export interface MarketplaceOption {
  name: string;
  type: 'official' | 'marketplace';
  badge: string;
  description: string;
  url: string;
}

/**
 * Retorna lojas e marketplaces externos não agregados nativamente pela CheapShark
 * (como Eneba, Kinguin e Nuuvem) com links diretos de busca.
 */
export function getExternalMarketplaces(gameTitle: string): MarketplaceOption[] {
  return [
    {
      name: 'Eneba',
      type: 'marketplace',
      badge: 'Marketplace de Chaves',
      description: 'Vendedores de chaves globais com preços competitivos e promoções da comunidade.',
      url: `https://www.eneba.com/store/all?text=${encodeURIComponent(gameTitle)}`,
    },
    {
      name: 'Nuuvem',
      type: 'official',
      badge: 'Revendedor Oficial Brasil',
      description: 'Loja oficial brasileira com suporte a Pix, parcelamento sem juros e suporte em português.',
      url: `https://www.nuuvem.com/br-pt/catalog/search/${encodeURIComponent(gameTitle)}`,
    },
    {
      name: 'Kinguin',
      type: 'marketplace',
      badge: 'Marketplace Global',
      description: 'Catálogo de distribuidores internacionais com proteção ao comprador.',
      url: `https://www.kinguin.net/listing?active=1&hide_out_of_stock=1&phrase=${encodeURIComponent(gameTitle)}`,
    },
  ];
}
