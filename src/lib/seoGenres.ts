export interface GenreSeoInfo {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  searchQuery: string;
  badge: string;
  tags: string[];
}

export const GENRES_SEO_DATA: Record<string, GenreSeoInfo> = {
  rpg: {
    slug: 'rpg',
    name: 'RPG (Role Playing Games)',
    tagline: 'Mundos Vastas, Histórias Profundas & Personagens Marcantes',
    description: 'Encontre as melhores ofertas e menores preços em jogos de RPG: de grandes épicos como The Witcher, Baldur\'s Gate e Elden Ring a clássicos do JRPG.',
    searchQuery: 'RPG',
    badge: 'Mundos Épicos & Histórias',
    tags: ['Baldur\'s Gate', 'The Witcher', 'Final Fantasy', 'Cyberpunk 2077', 'Elden Ring', 'Dark Souls'],
  },
  terror: {
    slug: 'terror',
    name: 'Terror & Sobrevivência (Horror)',
    tagline: 'Tensão Psicológica, Suspense e Puzzles Aterrorizantes',
    description: 'Promoções imperdíveis nos melhores jogos de Terror, Survival Horror e Terror Psicológico para PC. Compare Resident Evil, Silent Hill, Dead Space e indies aterrorizantes.',
    searchQuery: 'Dead',
    badge: 'Tensão & Sobrevivência',
    tags: ['Resident Evil', 'Silent Hill', 'Dead Space', 'Outlast', 'Amnesia', 'Alan Wake'],
  },
  acao: {
    slug: 'acao',
    name: 'Ação & Aventura',
    tagline: 'Combate Dinâmico, Tiro e Momentos Cinematográficos',
    description: 'Jogos de ação frenética, tiro em primeira e terceira pessoa, hack and slash e mundos abertos cheios de adrenalina com os menores preços do mercado.',
    searchQuery: 'War',
    badge: 'Frenético & Adrenalina',
    tags: ['Doom', 'God of War', 'Spider-Man', 'Grand Theft Auto', 'Devil May Cry', 'Monster Hunter'],
  },
  roguelike: {
    slug: 'roguelike',
    name: 'Roguelike & Roguelite',
    tagline: 'Masmorras Procedurais, Desafios Infinitos & Morte Permanente',
    description: 'Jogos com rejogabilidade infinita: Hades, Dead Cells, Slay the Spire, The Binding of Isaac e os melhores lançamentos independentes com super descontos.',
    searchQuery: 'Rogue',
    badge: 'Rejogabilidade Infinita',
    tags: ['Hades', 'Dead Cells', 'Slay the Spire', 'Vampire Survivors', 'Risk of Rain', 'Enter the Gungeon'],
  },
  soulslike: {
    slug: 'soulslike',
    name: 'Souls-like & Desafios Hardcore',
    tagline: 'Combate Metódico, Chefes Colossais e Recompensas Reais',
    description: 'Para jogadores que buscam superação: explore ofertas em Elden Ring, Dark Souls, Sekiro, Lies of P, Nioh e os melhores títulos do gênero com os maiores descontos.',
    searchQuery: 'Souls',
    badge: 'Dificuldade Hardcore',
    tags: ['Elden Ring', 'Dark Souls', 'Lies of P', 'Sekiro', 'Nioh', 'Lords of the Fallen'],
  },
  estrategia: {
    slug: 'estrategia',
    name: 'Estratégia & Tática',
    tagline: 'Gestão de Recursos, Planejamento Militar e Conquista',
    description: 'Grandes jogos de estratégia 4X, RTS, tática por turnos e simulação de cidades com os menores preços históricos para PC.',
    searchQuery: 'Empire',
    badge: 'Mente Tática & 4X',
    tags: ['Civilization', 'Age of Empires', 'Total War', 'Stellaris', 'Crusader Kings', 'XCOM'],
  },
  indie: {
    slug: 'indie',
    name: 'Jogos Independentes (Indies)',
    tagline: 'Criatividade Sem Limites, Arte Única e Inovação',
    description: 'As joias do desenvolvimento independente: Hollow Knight, Celeste, Stardew Valley, Sea of Stars e experiências inovadoras com preços acessíveis.',
    searchQuery: 'Knight',
    badge: 'Criatividade & Arte',
    tags: ['Hollow Knight', 'Celeste', 'Stardew Valley', 'Sea of Stars', 'Blasphemous', 'Ori'],
  },
  coop: {
    slug: 'coop',
    name: 'Cooperativo & Multiplayer',
    tagline: 'Jogue com Amigos: Sobrevivência, Caçadas e Diversão em Grupo',
    description: 'Jogos co-op locais e online para zerar em dupla ou em esquadrão com amigos. Ofertas com conversão em Reais para montar seu grupo.',
    searchQuery: 'Party',
    badge: 'Jogue em Galera',
    tags: ['It Takes Two', 'Helldivers 2', 'Monster Hunter', 'Deep Rock Galactic', 'Left 4 Dead', 'Overcooked'],
  },
};

export function getGenreBySlug(slug: string): GenreSeoInfo {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (GENRES_SEO_DATA[normalized]) {
    return GENRES_SEO_DATA[normalized];
  }
  // Mapeamentos alternativos
  if (normalized === 'horror') return GENRES_SEO_DATA.terror;
  if (normalized === 'action') return GENRES_SEO_DATA.acao;
  if (normalized === 'strategy') return GENRES_SEO_DATA.estrategia;
  if (normalized === 'cooperativo') return GENRES_SEO_DATA.coop;

  return {
    slug,
    name: slug.toUpperCase(),
    tagline: 'Promoções Selecionadas',
    description: `As melhores promoções e menores preços históricos em jogos de ${slug} para PC.`,
    searchQuery: slug,
    badge: 'Gênero Gamer',
    tags: ['Ofertas Especiais', 'Menor Preço', 'PC Gaming'],
  };
}
