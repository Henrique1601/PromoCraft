export interface StoreSeoInfo {
  slug: string;
  storeID: string;
  name: string;
  tagline: string;
  description: string;
  activationBadge: string;
  iconUrl?: string;
  features: string[];
}

export const STORES_SEO_DATA: Record<string, StoreSeoInfo> = {
  steam: {
    slug: 'steam',
    storeID: '1',
    name: 'Steam',
    tagline: 'A Maior Plataforma de Jogos do Mundo',
    description: 'Encontre os menores preços históricos, descontos diários e promoções de temporada na Steam com conversão direta para Real (BRL).',
    activationBadge: 'Ativação Direta Steam',
    features: ['Nuvem Steam Cloud', 'Conquistas & Cartas', 'Compatível com Steam Deck', 'Oficina Steam Workshop'],
  },
  gamersgate: {
    slug: 'gamersgate',
    storeID: '2',
    name: 'GamersGate',
    tagline: 'Revendedor Digital Autorizado',
    description: 'Compre chaves oficiais de jogos com desconto garantido e ative diretamente na Steam, Ubisoft Connect ou EA Play.',
    activationBadge: 'Chaves Oficiais Autorizadas',
    features: ['100% Chaves Originais', 'Suporte Global', 'Ativação Instantânea', 'Parceiro de Grandes Publishers'],
  },
  greenmangaming: {
    slug: 'greenmangaming',
    storeID: '3',
    name: 'Green Man Gaming',
    tagline: 'Parceiro Oficial de Publishers Globais',
    description: 'Ofertas em lançamentos e pré-vendas de grandes estúdios como Sony PlayStation, Capcom e Square Enix com cupons exclusivos.',
    activationBadge: 'Parceiro Licenciado Oficial',
    features: ['Chaves Diretas das Distribuidoras', 'Descontos em Lançamentos', 'Programa de Fidelidade XP', 'Ativação Steam Oficial'],
  },
  gog: {
    slug: 'gog',
    storeID: '7',
    name: 'GOG (Good Old Games)',
    tagline: 'Jogos 100% Livres de DRM',
    description: 'O melhor acervo de clássicos imortais e grandes lançamentos modernos sem restrições ou travas de DRM. Você é o dono dos seus jogos.',
    activationBadge: '100% DRM-Free',
    features: ['Instaladores Offline', 'Sem Trava DRM', 'GOG Galaxy Opcional', 'Restauração de Clássicos PC'],
  },
  humblestore: {
    slug: 'humblestore',
    storeID: '11',
    name: 'Humble Store',
    tagline: 'Grandes Jogos & Apoio a Causas Sociais',
    description: 'Cada compra na Humble Store apoia instituições de caridade ao redor do planeta enquanto você garante os melhores jogos para PC.',
    activationBadge: 'Chaves Oficiais + Caridade',
    features: ['Doação para Caridade', 'Chaves Oficiais Steam', 'Humble Choice', 'Descontos Semanais'],
  },
  fanatical: {
    slug: 'fanatical',
    storeID: '15',
    name: 'Fanatical',
    tagline: 'Pacotes e Bundles Oficiais com Custo-Benefício Extremo',
    description: 'Pacotes de jogos selecionados a dedo e promoções relâmpago com ativação instantânea na Steam e garantia de autenticidade.',
    activationBadge: 'Revendedor Autorizado Licenciado',
    features: ['Star Deals Exclusivos', 'Bundles Customizáveis', '100% Licenciado', 'Entrega Digital Imediata'],
  },
  epicgames: {
    slug: 'epicgames',
    storeID: '25',
    name: 'Epic Games Store',
    tagline: 'Lançamentos Exclusivos & Jogos Gratuitos',
    description: 'Compare promoções da Epic Games Store, acompanhe jogos semanais gratuitos e encontre o melhor preço convertido em Reais.',
    activationBadge: 'Ativação Epic Launcher',
    features: ['Jogos Semanais Grátis', 'Unreal Engine Integrada', 'Exclusividades AAA', 'Preços Regionais em Reais'],
  },
  gamesplanet: {
    slug: 'gamesplanet',
    storeID: '27',
    name: 'Gamesplanet',
    tagline: 'Distribuidor Digital Europeu Oficial',
    description: 'Distribuidor europeu licenciado com excelente histórico de atendimento, chaves diretas sem trava de região e ofertas agressivas.',
    activationBadge: 'Revendedor Oficial Licenciado',
    features: ['Chaves Region-Free', 'Atendimento Gamer Dedicado', 'Parceiro Oficial de Publishers', 'Ativação Segura'],
  },
  nuuvem: {
    slug: 'nuuvem',
    storeID: '1', // Deals populares com foco no público brasileiro
    name: 'Nuuvem',
    tagline: 'A Maior Loja de Jogos Digitais da América Latina',
    description: 'Promoções em Reais com suporte a PIX, parcelamento sem juros no cartão de crédito e ativação oficial imediata na Steam e Epic.',
    activationBadge: 'Loja Oficial Brasileira',
    features: ['Pagamento via PIX e Boleto', 'Parcelamento sem Juros', 'Chaves 100% Oficiais', 'Moedas Drops de Cashback'],
  },
};

export function getStoreBySlug(slug: string): StoreSeoInfo {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (STORES_SEO_DATA[normalized]) {
    return STORES_SEO_DATA[normalized];
  }
  // Fallback genérico
  return {
    slug,
    storeID: '1',
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    tagline: 'Loja Oficial e Parceira',
    description: `Confira os menores preços e ofertas de jogos para PC com ativação garantida e comparação em tempo real no PromoCraft.`,
    activationBadge: 'Parceiro Autorizado',
    features: ['Chaves Oficiais', 'Menor Preço Histórico', 'Conversão BRL', 'Alertas de Preço'],
  };
}
