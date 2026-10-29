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
