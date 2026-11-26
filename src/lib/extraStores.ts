export interface ExtraStorePrice {
  id: string;
  name: string;
  activation: string;
  priceBRL: string | null;
  url: string;
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function fetchNuuvemPrice(gameTitle: string): Promise<{ priceBRL: string | null; url: string }> {
  const q = encodeURIComponent(gameTitle);
  const searchUrl = `https://www.nuuvem.com/br-pt/catalog/search/${q}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'pt-BR,pt;q=0.9' },
      signal: controller.signal,
      next: { revalidate: 1800 },
    });
    clearTimeout(timer);

    if (!res.ok) return { priceBRL: null, url: searchUrl };
    const html = await res.text();
    // Procura padrão de preço em BRL no HTML da Nuuvem (ex: R$ 49,99 ou data-price)
    const match = html.match(/R\$\s*(\d{1,4}(?:\.\d{3})*,\d{2})/);
    if (match && match[1]) {
      return { priceBRL: match[1], url: searchUrl };
    }
  } catch {
    // Timeout ou bloqueio silencioso
  }
  return { priceBRL: null, url: searchUrl };
}

async function fetchEnebaPrice(gameTitle: string): Promise<{ priceBRL: string | null; url: string }> {
  const q = encodeURIComponent(gameTitle);
  const searchUrl = `https://www.eneba.com/br/store/all?text=${q}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'pt-BR,pt;q=0.9' },
      signal: controller.signal,
      next: { revalidate: 1800 },
    });
    clearTimeout(timer);

    if (!res.ok) return { priceBRL: null, url: searchUrl };
    const html = await res.text();
    const match = html.match(/R\$\s*(\d{1,4}(?:\.\d{3})*,\d{2})/);
    if (match && match[1]) {
      return { priceBRL: match[1], url: searchUrl };
    }
  } catch {
    // Timeout ou bloqueio silencioso
  }
  return { priceBRL: null, url: searchUrl };
}

export async function fetchExtraStorePrices(gameTitle: string): Promise<ExtraStorePrice[]> {
  const q = encodeURIComponent(gameTitle);

  const [nuuvem, eneba] = await Promise.all([
    fetchNuuvemPrice(gameTitle),
    fetchEnebaPrice(gameTitle),
  ]);

  return [
    {
      id: 'nuuvem',
      name: 'Nuuvem (BR)',
      activation: 'Steam / PC',
      priceBRL: nuuvem.priceBRL,
      url: nuuvem.url,
    },
    {
      id: 'eneba',
      name: 'Eneba',
      activation: 'Global / Key',
      priceBRL: eneba.priceBRL,
      url: eneba.url,
    },
    {
      id: 'ubisoft',
      name: 'Ubisoft Store',
      activation: 'Ubisoft Connect',
      priceBRL: null,
      url: `https://store.ubisoft.com/search?q=${q}`,
    },
    {
      id: 'ea',
      name: 'EA App Store',
      activation: 'EA App',
      priceBRL: null,
      url: `https://www.ea.com/games/library/pc-download?search=${q}`,
    },
  ];
}
