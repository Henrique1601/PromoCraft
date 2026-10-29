/**
 * Utilitário para resolver o link direto da loja ou fallback amigável.
 * Quando o jogo tem steamAppID e a loja é Steam (storeID === '1'), vai direto para a Steam Store.
 * Para GOG, Epic, GMG, etc., resolve para a URL direta ou busca oficial da loja.
 */
export function getDirectStoreUrl(dealID: string, storeID?: string, steamAppID?: string, gameTitle?: string): string {
  // Steam Direto
  if (storeID === '1' && steamAppID && steamAppID !== '0') {
    return `https://store.steampowered.com/app/${steamAppID}/`;
  }

  // GOG Direto
  if (storeID === '7' && gameTitle) {
    return `https://www.gog.com/en/games?query=${encodeURIComponent(gameTitle)}`;
  }

  // Epic Games Direto
  if (storeID === '25' && gameTitle) {
    return `https://store.epicgames.com/pt-BR/browse?q=${encodeURIComponent(gameTitle)}`;
  }

  // Green Man Gaming Direto
  if (storeID === '3' && gameTitle) {
    return `https://www.greenmangaming.com/search?query=${encodeURIComponent(gameTitle)}`;
  }

  // Fanatical Direto
  if (storeID === '15' && gameTitle) {
    return `https://www.fanatical.com/en/search?search=${encodeURIComponent(gameTitle)}`;
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
