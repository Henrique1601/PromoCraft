export interface ActivationInfo {
  platform: 'Steam' | 'Epic Games' | 'GOG (DRM-Free)' | 'Ubisoft Connect' | 'EA App' | 'DRM-Free / Outra';
  colorClass: string;
}

/**
 * Infere a plataforma de ativação da chave com base na loja e no steamAppID.
 */
export function getActivationPlatform(storeID?: string, steamAppID?: string): ActivationInfo {
  if (storeID === '25') {
    return {
      platform: 'Epic Games',
      colorClass: 'bg-zinc-800 text-zinc-200 border-zinc-700',
    };
  }
  if (storeID === '7') {
    return {
      platform: 'GOG (DRM-Free)',
      colorClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    };
  }
  if (storeID === '13') {
    return {
      platform: 'Ubisoft Connect',
      colorClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    };
  }
  if (storeID === '8' || storeID === 'ea') {
    return {
      platform: 'EA App',
      colorClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    };
  }
  if (storeID === '1' || (steamAppID && steamAppID !== '0')) {
    return {
      platform: 'Steam',
      colorClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    };
  }
  return {
    platform: 'DRM-Free / Outra',
    colorClass: 'bg-zinc-800/80 text-zinc-400 border-zinc-700',
  };
}

/**
 * Resolve a URL direta da loja vendedora sem passar pelo redirect do CheapShark
 * e sem redirecionar outras lojas para a Steam.
 */
export function getDirectStoreUrl(
  _dealID: string,
  storeID?: string,
  steamAppID?: string,
  gameTitle?: string
): string {
  const q = encodeURIComponent(gameTitle || '');

  switch (storeID) {
    case '1': // Steam
      return steamAppID && steamAppID !== '0'
        ? `https://store.steampowered.com/app/${steamAppID}/`
        : `https://store.steampowered.com/search/?term=${q}`;
    case '2': // GamersGate
      return `https://www.gamersgate.com/games/?query=${q}`;
    case '3': // GreenManGaming
      return `https://www.greenmangaming.com/search?query=${q}`;
    case '7': // GOG
      return `https://www.gog.com/en/games?query=${q}`;
    case '8': // EA App (Origin)
    case 'ea':
      return `https://www.ea.com/games/library/pc-download?search=${q}`;
    case '11': // Humble Store
      return `https://www.humblebundle.com/store/search?sort=bestselling&search=${q}`;
    case '13': // Ubisoft Connect (Uplay)
    case 'ubisoft':
      return `https://store.ubisoft.com/search?q=${q}`;
    case '15': // Fanatical
      return `https://www.fanatical.com/en/search?search=${q}`;
    case '21': // WinGameStore
      return `https://www.wingamestore.com/search/?SearchWord=${q}`;
    case '23': // GameBillet
      return `https://www.gamebillet.com/search?q=${q}`;
    case '25': // Epic Games Store
      return `https://store.epicgames.com/pt-BR/browse?q=${q}`;
    case '27': // Gamesplanet
      return `https://us.gamesplanet.com/search?query=${q}`;
    case '28': // Gamesload
      return `https://www.gamesload.com/results.html?search=${q}`;
    case '30': // IndieGala
      return `https://www.indiegala.com/store/search?type=games&key=${q}`;
    case '35': // DreamGame
      return `https://www.dreamgame.com/en/catalogsearch/result/?q=${q}`;
    case 'nuuvem':
      return `https://www.nuuvem.com/br-pt/catalog/search/${q}`;
    case 'eneba':
      return `https://www.eneba.com/br/store/all?text=${q}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(`${gameTitle || ''} PC key`)}`;
  }
}

export interface ExternalMarketplace {
  id: string;
  name: string;
  url: string;
  badge: string;
  type: 'official' | 'marketplace';
  description: string;
}

export function getExternalMarketplaces(gameTitle: string): ExternalMarketplace[] {
  const q = encodeURIComponent(gameTitle || '');
  return [
    { id: 'nuuvem', name: 'Nuuvem', url: `https://www.nuuvem.com/br-pt/catalog/search/${q}`, badge: 'BR / BRL', type: 'official', description: 'Loja oficial brasileira em Reais (BRL)' },
    { id: 'eneba', name: 'Eneba', url: `https://www.eneba.com/br/store/all?text=${q}`, badge: 'Keys Globais', type: 'marketplace', description: 'Marketplace global de chaves digitais' },
    { id: 'ubisoft', name: 'Ubisoft Store', url: `https://store.ubisoft.com/search?q=${q}`, badge: 'Ubisoft Connect', type: 'official', description: 'Loja oficial da Ubisoft' },
    { id: 'ea', name: 'EA App', url: `https://www.ea.com/games/library/pc-download?search=${q}`, badge: 'EA App', type: 'official', description: 'Loja oficial da Electronic Arts' },
  ];
}
