/**
 * Módulo de Inteligência de Métricas Gamer & IA Preditiva
 * Custo por Hora de Jogo (HowLongToBeat), Previsor de Promoções Sazonal e Detecção de Edições.
 */

export interface GameLengthEstimate {
  mainStoryHours: number;
  mainExtraHours: number;
  completionistHours: number;
  source: 'database' | 'heuristic';
}

export interface CostPerHourResult {
  hours: number;
  costPerHourBRL: number;
  formattedCost: string;
  verdictLabel: 'Lendário' | 'Excelente' | 'Bom' | 'Padrão';
  badgeColor: string;
}

export interface SalePrediction {
  verdict: 'BUY_NOW' | 'WAIT_SALE' | 'CONSIDER';
  confidencePercent: number;
  title: string;
  reason: string;
  nextMajorSaleName: string;
  daysToNextSale: number;
}

export type GameEditionType = 'Standard' | 'Deluxe' | 'Gold' | 'Ultimate' | 'GOTY / Complete' | 'Bundle';

// Base de conhecimento com durações médias dos títulos mais populares de PC
const KNOWN_GAME_LENGTHS: Record<string, { main: number; extra: number; completionist: number }> = {
  'the witcher 3': { main: 52, extra: 104, completionist: 175 },
  'cyberpunk 2077': { main: 25, extra: 60, completionist: 105 },
  'elden ring': { main: 58, extra: 100, completionist: 134 },
  'red dead redemption 2': { main: 50, extra: 80, completionist: 180 },
  'baldurs gate 3': { main: 65, extra: 110, completionist: 160 },
  'hades': { main: 22, extra: 48, completionist: 98 },
  'hollow knight': { main: 27, extra: 42, completionist: 63 },
  'god of war': { main: 21, extra: 33, completionist: 52 },
  'terraria': { main: 50, extra: 90, completionist: 190 },
  'stardew valley': { main: 53, extra: 95, completionist: 150 },
  'grand theft auto v': { main: 32, extra: 48, completionist: 82 },
  'monster hunter: world': { main: 48, extra: 102, completionist: 380 },
  'fallout 4': { main: 27, extra: 82, completionist: 160 },
  'the elder scrolls v: skyrim': { main: 34, extra: 110, completionist: 232 },
  'resident evil 4': { main: 16, extra: 21, completionist: 32 },
  'dead cells': { main: 15, extra: 35, completionist: 90 },
  'celeste': { main: 8, extra: 14, completionist: 38 },
  'sekiro: shadows die twice': { main: 30, extra: 44, completionist: 70 },
  'persona 5 royal': { main: 100, extra: 124, completionist: 143 },
  'doom eternal': { main: 14, extra: 19, completionist: 26 },
};

/**
 * Estima a duração da campanha do jogo baseando-se no título ou gênero.
 */
export function estimateGameLength(title: string): GameLengthEstimate {
  const normalized = title.toLowerCase().trim();

  // 1. Busca direta na base conhecida
  for (const [key, val] of Object.entries(KNOWN_GAME_LENGTHS)) {
    if (normalized.includes(key)) {
      return {
        mainStoryHours: val.main,
        mainExtraHours: val.extra,
        completionistHours: val.completionist,
        source: 'database',
      };
    }
  }

  // 2. Heurística baseada em termos no título
  if (normalized.includes('rpg') || normalized.includes('fantasy') || normalized.includes('chronicles')) {
    return { mainStoryHours: 35, mainExtraHours: 65, completionistHours: 110, source: 'heuristic' };
  }
  if (normalized.includes('simulator') || normalized.includes('tycoon') || normalized.includes('strategy')) {
    return { mainStoryHours: 25, mainExtraHours: 50, completionistHours: 100, source: 'heuristic' };
  }
  if (normalized.includes('rogue') || normalized.includes('survivor') || normalized.includes('dungeon')) {
    return { mainStoryHours: 18, mainExtraHours: 35, completionistHours: 75, source: 'heuristic' };
  }
  if (normalized.includes('remaster') || normalized.includes('edition') || normalized.includes('collection')) {
    return { mainStoryHours: 20, mainExtraHours: 35, completionistHours: 60, source: 'heuristic' };
  }

  // Padrão de jogo de ação/aventura indie/AA
  return { mainStoryHours: 15, mainExtraHours: 26, completionistHours: 45, source: 'heuristic' };
}

/**
 * Calcula a métrica psicológica gamer de "Custo por Hora Jogada".
 */
export function calculateCostPerHour(priceBRL: number, title: string): CostPerHourResult {
  const estimate = estimateGameLength(title);
  const hours = estimate.mainStoryHours || 15;
  const costPerHour = Math.max(0, priceBRL / hours);

  let verdictLabel: CostPerHourResult['verdictLabel'] = 'Padrão';
  let badgeColor = 'text-zinc-300 border-zinc-700 bg-zinc-800/60';

  if (costPerHour <= 1.20) {
    verdictLabel = 'Lendário';
    badgeColor = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  } else if (costPerHour <= 2.50) {
    verdictLabel = 'Excelente';
    badgeColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  } else if (costPerHour <= 5.00) {
    verdictLabel = 'Bom';
    badgeColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
  }

  return {
    hours,
    costPerHourBRL: costPerHour,
    formattedCost: costPerHour.toFixed(2).replace('.', ','),
    verdictLabel,
    badgeColor,
  };
}

/**
 * Calendário sazonal das grandes promoções anuais de PC Gaming (Steam / Epic / Nuuvem)
 */
interface MajorSaleDate {
  name: string;
  month: number; // 0-11
  day: number;
}

const MAJOR_SALES: MajorSaleDate[] = [
  { name: 'Steam Spring Sale', month: 2, day: 14 },   // Março
  { name: 'Steam Summer Sale', month: 5, day: 26 },   // Junho
  { name: 'Steam Autumn Sale (Black Friday)', month: 10, day: 25 }, // Novembro
  { name: 'Steam Winter Sale (Natal)', month: 11, day: 19 }, // Dezembro
];

function getNextMajorSale(now: Date = new Date()): { name: string; daysLeft: number } {
  const currentYear = now.getFullYear();

  let closest: { name: string; date: Date } | null = null;
  let minDiff = Infinity;

  for (const sale of MAJOR_SALES) {
    let saleDate = new Date(currentYear, sale.month, sale.day);
    if (saleDate.getTime() < now.getTime()) {
      saleDate = new Date(currentYear + 1, sale.month, sale.day);
    }
    const diff = saleDate.getTime() - now.getTime();
    if (diff < minDiff) {
      minDiff = diff;
      closest = { name: sale.name, date: saleDate };
    }
  }

  const daysLeft = Math.max(1, Math.round(minDiff / (1000 * 60 * 60 * 24)));
  return {
    name: closest?.name || 'Próxima Grande Sale',
    daysLeft,
  };
}

/**
 * Motor Preditivo de Promoções: "Compro Agora ou Espero?"
 */
export function predictSaleTiming(
  currentPriceUSD: number,
  cheapestEverPriceUSD: number,
  savingsPercent: number
): SalePrediction {
  const nextSale = getNextMajorSale();

  // 1. Está no menor preço histórico ou a menos de 5% dele
  const isHistoricLow = cheapestEverPriceUSD > 0 && currentPriceUSD <= cheapestEverPriceUSD * 1.05;

  if (isHistoricLow || savingsPercent >= 75) {
    return {
      verdict: 'BUY_NOW',
      confidencePercent: 95,
      title: 'Compre Agora Sem Medo!',
      reason: `Este jogo está no menor preço histórico registrado (-${savingsPercent}% OFF). Dificilmente ficará mais barato na ${nextSale.name}.`,
      nextMajorSaleName: nextSale.name,
      daysToNextSale: nextSale.daysLeft,
    };
  }

  // 2. Se a próxima grande sale está muito próxima (< 20 dias) e o desconto atual é mediano (< 35%)
  if (nextSale.daysLeft <= 25 && savingsPercent < 35) {
    return {
      verdict: 'WAIT_SALE',
      confidencePercent: 84,
      title: `Aguarde a ${nextSale.name}`,
      reason: `Faltam apenas ${nextSale.daysLeft} dias para o evento e o desconto atual é discreto (-${savingsPercent}%). A probabilidade de corte maior é alta.`,
      nextMajorSaleName: nextSale.name,
      daysToNextSale: nextSale.daysLeft,
    };
  }

  // 3. Bom desconto (50%+), mas não é o menor histórico absoluto
  if (savingsPercent >= 50) {
    return {
      verdict: 'BUY_NOW',
      confidencePercent: 80,
      title: 'Excelente Oportunidade',
      reason: `Desconto muito agressivo de ${savingsPercent}%. Mesmo que caia mais na ${nextSale.name}, a diferença será de poucos reais.`,
      nextMajorSaleName: nextSale.name,
      daysToNextSale: nextSale.daysLeft,
    };
  }

  // 4. Desconto baixo a moderado
  return {
    verdict: 'CONSIDER',
    confidencePercent: 68,
    title: 'Preço Moderado',
    reason: `Desconto de ${savingsPercent}%. Se estiver ansioso para jogar agora, vale a pena; caso contrário, espere a ${nextSale.name} em ${nextSale.daysLeft} dias.`,
    nextMajorSaleName: nextSale.name,
    daysToNextSale: nextSale.daysLeft,
  };
}

/**
 * Detecta a edição do jogo baseando-se no título da oferta.
 */
export function detectGameEdition(title: string): GameEditionType {
  const t = title.toLowerCase();
  if (t.includes('goty') || t.includes('game of the year') || t.includes('complete edition') || t.includes('definitive edition')) {
    return 'GOTY / Complete';
  }
  if (t.includes('ultimate')) {
    return 'Ultimate';
  }
  if (t.includes('gold')) {
    return 'Gold';
  }
  if (t.includes('deluxe') || t.includes('special edition')) {
    return 'Deluxe';
  }
  if (t.includes('bundle') || t.includes('pack') || t.includes('trilogy') || t.includes('collection')) {
    return 'Bundle';
  }
  return 'Standard';
}
