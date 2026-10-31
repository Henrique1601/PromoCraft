import { MetadataRoute } from 'next';
import { fetchDeals } from '@/lib/cheapshark';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://promocraft.netlify.app';

  // Rotas estáticas principais
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    // Buscar as principais ofertas para indexação dinâmica
    const deals = await fetchDeals({ pageSize: 50, sortBy: 'Deal Rating' });
    const dealRoutes: MetadataRoute.Sitemap = deals.map((deal) => ({
      url: `${baseUrl}/game/${deal.gameID}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }));

    return [...routes, ...dealRoutes];
  } catch (e) {
    return routes;
  }
}
