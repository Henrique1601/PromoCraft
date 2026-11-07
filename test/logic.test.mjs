import { test, describe } from 'node:test';
import assert from 'node:assert';

// Teste de formatação BRL
function formatBRL(priceUSD, rate = 5.75) {
  const brl = priceUSD * rate;
  return brl.toFixed(2).replace('.', ',');
}

// Teste de resolução de URLs diretas
function getDirectStoreUrl(dealID, storeID, steamAppID, gameTitle) {
  if (storeID === '1' && steamAppID && steamAppID !== '0') {
    return `https://store.steampowered.com/app/${steamAppID}/`;
  }
  if (storeID === '2' && gameTitle) {
    return `https://www.gamersgate.com/apps/?q=${encodeURIComponent(gameTitle)}`;
  }
  if (storeID === '7' && gameTitle) {
    return `https://www.gog.com/en/games?query=${encodeURIComponent(gameTitle)}`;
  }
  if (storeID === '11' && gameTitle) {
    return `https://www.humblebundle.com/store/search?sort=bestselling&search=${encodeURIComponent(gameTitle)}`;
  }
  if (storeID === '25' && gameTitle) {
    return `https://store.epicgames.com/pt-BR/browse?q=${encodeURIComponent(gameTitle)}`;
  }
  if (storeID === '3' && gameTitle) {
    return `https://www.greenmangaming.com/search?query=${encodeURIComponent(gameTitle)}`;
  }
  if (storeID === '15' && gameTitle) {
    return `https://www.fanatical.com/en/search?search=${encodeURIComponent(gameTitle)}`;
  }
  if (storeID === '35' || (gameTitle && storeID === 'nuuvem')) {
    return `https://www.nuuvem.com/br-pt/catalog/search/${encodeURIComponent(gameTitle || '')}`;
  }
  if (steamAppID && steamAppID !== '0') {
    return `https://store.steampowered.com/app/${steamAppID}/`;
  }
  return `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealID)}`;
}

// Resolução de marketplaces externos
function getExternalMarketplaces(gameTitle) {
  return [
    {
      name: 'Eneba',
      type: 'marketplace',
      url: `https://www.eneba.com/store/all?text=${encodeURIComponent(gameTitle)}`,
    },
    {
      name: 'Nuuvem',
      type: 'official',
      url: `https://www.nuuvem.com/br-pt/catalog/search/${encodeURIComponent(gameTitle)}`,
    },
    {
      name: 'Kinguin',
      type: 'marketplace',
      url: `https://www.kinguin.net/listing?active=1&hide_out_of_stock=1&phrase=${encodeURIComponent(gameTitle)}`,
    },
  ];
}

// Funções de regionalização de pagamento
function getPixPrice(priceBRL, discountPercent = 10) {
  const finalPrice = Math.max(0, priceBRL * (1 - discountPercent / 100));
  return {
    discountPercent,
    finalPriceBRL: finalPrice,
    formatted: finalPrice.toFixed(2).replace('.', ','),
  };
}

function getInstallmentInfo(priceBRL, maxInstallments = 3) {
  if (priceBRL < 30) return null;
  const installments = Math.min(maxInstallments, Math.floor(priceBRL / 15));
  if (installments <= 1) return null;
  const valuePerInstallment = (priceBRL / installments).toFixed(2).replace('.', ',');
  return { installments, valuePerInstallment };
}

function getMarketplaceFeeEstimate(priceBRL) {
  const serviceFee = priceBRL * 0.07 + 2.5;
  const total = priceBRL + serviceFee;
  return {
    serviceFeeBRL: serviceFee,
    formattedFee: serviceFee.toFixed(2).replace('.', ','),
    formattedTotal: total.toFixed(2).replace('.', ','),
  };
}

// Lógica de parsing e endpoints Steam
function parseSteamInput(input) {
  if (!input || typeof input !== 'string') {
    return { identifier: '', isSteamId64: false };
  }
  const rawInput = input.trim();
  let cleaned = rawInput
    .replace(/^https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//i, '')
    .replace(/^https?:\/\/(www\.)?store\.steampowered\.com\/wishlist\/(id|profiles)\//i, '')
    .replace(/\/.*$/, '')
    .trim();
  cleaned = cleaned.replace(/[?#].*$/, '').trim();
  const isSteamId64 = /^\d{17}$/.test(cleaned);
  return { identifier: cleaned, isSteamId64 };
}

function getSteamWishlistUrls(input) {
  const { identifier, isSteamId64 } = parseSteamInput(input);
  if (!identifier) {
    return { primaryUrl: '', fallbackUrl: '', identifier: '', isSteamId64: false };
  }
  const encoded = encodeURIComponent(identifier);
  if (isSteamId64) {
    return {
      primaryUrl: `https://store.steampowered.com/wishlist/profiles/${encoded}/wishlistdata/?p=0`,
      fallbackUrl: `https://store.steampowered.com/wishlist/id/${encoded}/wishlistdata/?p=0`,
      identifier,
      isSteamId64: true,
    };
  }
  return {
    primaryUrl: `https://store.steampowered.com/wishlist/id/${encoded}/wishlistdata/?p=0`,
    fallbackUrl: `https://store.steampowered.com/wishlist/profiles/${encoded}/wishlistdata/?p=0`,
    identifier,
    isSteamId64: false,
  };
}

function parseSteamWishlistJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return {};
  const trimmed = rawText.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return {};
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
}

// Funções de métricas da Wishlist 2.0 e Giveaways
function calculateWishlistMetrics(items, rate = 5.75) {
  const totalCurrentPriceBRL = items.reduce((acc, i) => acc + (i.currentBestPrice || 0) * rate, 0);
  const estimatedFullPriceBRL = items.reduce((acc, i) => {
    const base = i.currentBestPrice ? i.currentBestPrice * 1.85 : 0;
    return acc + base * rate;
  }, 0);
  const totalSavingsBRL = Math.max(0, estimatedFullPriceBRL - totalCurrentPriceBRL);
  const savingsPercent = estimatedFullPriceBRL > 0 ? Math.round((totalSavingsBRL / estimatedFullPriceBRL) * 100) : 0;

  return {
    totalCurrentPriceBRL,
    estimatedFullPriceBRL,
    totalSavingsBRL,
    savingsPercent,
    formattedCurrent: totalCurrentPriceBRL.toFixed(2).replace('.', ','),
    formattedSavings: totalSavingsBRL.toFixed(2).replace('.', ','),
  };
}

function isFreeGiveaway(deal) {
  const price = parseFloat(deal.salePrice ?? '0');
  const savings = parseFloat(deal.savings ?? '0');
  return price === 0 || savings >= 99.9;
}

// Lógica de veredito do assistente de compra
function getDealVerdict(currentPrice, cheapestEverPrice, retailPrice) {
  const savingsPercent = retailPrice > 0 ? Math.round(((retailPrice - currentPrice) / retailPrice) * 100) : 0;
  const isHistoricLow = cheapestEverPrice > 0 && currentPrice <= cheapestEverPrice * 1.05;
  const isGoodDeal = !isHistoricLow && savingsPercent >= 30;

  if (isHistoricLow) {
    return 'MUST_BUY';
  }
  if (isGoodDeal) {
    return 'GOOD_DEAL';
  }
  return 'WAIT';
}

describe('PromoCraft - Testes Unitários de Regra de Negócio & Clean Code', () => {
  describe('Formatação Cambial BRL', () => {
    test('deve formatar valor corretamente com separador decimal em vírgula', () => {
      const formatted = formatBRL(10.0, 5.5);
      assert.strictEqual(formatted, '55,00');
    });

    test('deve utilizar taxa padrão 5.75 quando rate não for especificado', () => {
      const formatted = formatBRL(20.0);
      assert.strictEqual(formatted, '115,00');
    });

    test('deve formatar valores fracionados com 2 casas decimais', () => {
      const formatted = formatBRL(4.99, 5.0);
      assert.strictEqual(formatted, '24,95');
    });
  });

  describe('Resolução de Links Oficiais de Lojas', () => {
    test('deve resolver link direto da Steam quando storeID é 1 e possui steamAppID', () => {
      const url = getDirectStoreUrl('deal123', '1', '1091500', 'Cyberpunk 2077');
      assert.strictEqual(url, 'https://store.steampowered.com/app/1091500/');
    });

    test('deve resolver link de busca da Nuuvem quando storeID é 35', () => {
      const url = getDirectStoreUrl('deal123', '35', null, 'Elden Ring');
      assert.strictEqual(url, 'https://www.nuuvem.com/br-pt/catalog/search/Elden%20Ring');
    });

    test('deve resolver link de busca do GOG quando storeID é 7', () => {
      const url = getDirectStoreUrl('deal123', '7', null, 'The Witcher 3');
      assert.strictEqual(url, 'https://www.gog.com/en/games?query=The%20Witcher%203');
    });

    test('deve resolver link de busca da GamersGate quando storeID é 2', () => {
      const url = getDirectStoreUrl('deal123', '2', null, 'Hollow Knight');
      assert.strictEqual(url, 'https://www.gamersgate.com/apps/?q=Hollow%20Knight');
    });

    test('deve resolver link de busca da Humble Store quando storeID é 11', () => {
      const url = getDirectStoreUrl('deal123', '11', null, 'Hades');
      assert.strictEqual(url, 'https://www.humblebundle.com/store/search?sort=bestselling&search=Hades');
    });

    test('deve retornar fallback oficial do CheapShark quando não houver mapeamento direto', () => {
      const url = getDirectStoreUrl('abc_deal_999');
      assert.strictEqual(url, 'https://www.cheapshark.com/redirect?dealID=abc_deal_999');
    });
  });

  describe('Integração de Marketplaces Externos (Eneba, Nuuvem, Kinguin)', () => {
    test('deve gerar URLs corretas de busca para marketplaces externos', () => {
      const marketplaces = getExternalMarketplaces('Cyberpunk 2077');
      assert.strictEqual(marketplaces.length, 3);
      
      const eneba = marketplaces.find((m) => m.name === 'Eneba');
      assert.ok(eneba);
      assert.strictEqual(eneba.url, 'https://www.eneba.com/store/all?text=Cyberpunk%202077');
      assert.strictEqual(eneba.type, 'marketplace');

      const nuuvem = marketplaces.find((m) => m.name === 'Nuuvem');
      assert.ok(nuuvem);
      assert.strictEqual(nuuvem.url, 'https://www.nuuvem.com/br-pt/catalog/search/Cyberpunk%202077');
      assert.strictEqual(nuuvem.type, 'official');
    });
  });

  describe('Assistente de Compra Inteligente (Vereditos)', () => {
    test('deve indicar MUST_BUY quando o preço estiver dentro de 5% do menor preço histórico', () => {
      const verdict = getDealVerdict(10.0, 10.0, 60.0);
      assert.strictEqual(verdict, 'MUST_BUY');
    });

    test('deve indicar GOOD_DEAL quando houver mais de 30% de desconto mesmo não sendo recorde', () => {
      const verdict = getDealVerdict(30.0, 15.0, 60.0); // 50% de desconto
      assert.strictEqual(verdict, 'GOOD_DEAL');
    });

    test('deve indicar WAIT quando o desconto for baixo ou preço próximo do de tabela', () => {
      const verdict = getDealVerdict(55.0, 20.0, 60.0); // apenas ~8% de desconto
      assert.strictEqual(verdict, 'WAIT');
    });
  });

  describe('Conversão de Tópicos e Faixas de Preço BRL', () => {
    test('deve converter teto de R$ 30 para o equivalente em USD baseado na taxa', () => {
      const rate = 5.75;
      const usdMax = Math.round(30 / rate).toString();
      assert.strictEqual(usdMax, '5');
    });

    test('deve converter teto de R$ 60 para o equivalente em USD baseado na taxa', () => {
      const rate = 6.0;
      const usdMax = Math.round(60 / rate).toString();
      assert.strictEqual(usdMax, '10');
    });

    test('deve identificar negócios classificados como Super Desconto (75%+ ou score alto)', () => {
      const isSuperDeal = (savings, rating) => savings >= 75 || parseFloat(rating) >= 9.5;
      assert.strictEqual(isSuperDeal(80, '8.0'), true);
      assert.strictEqual(isSuperDeal(50, '9.7'), true);
      assert.strictEqual(isSuperDeal(40, '7.0'), false);
    });
  });

  describe('Regionalização Financeira Gamer (Pix, Parcelamento & Taxas)', () => {
    test('deve calcular corretamente 10% de desconto à vista no Pix', () => {
      const pix = getPixPrice(100.0);
      assert.strictEqual(pix.finalPriceBRL, 90.0);
      assert.strictEqual(pix.formatted, '90,00');
    });

    test('deve calcular parcelas em até 3x sem juros para valores acima de R$ 30', () => {
      const plan = getInstallmentInfo(90.0, 3);
      assert.ok(plan);
      assert.strictEqual(plan.installments, 3);
      assert.strictEqual(plan.valuePerInstallment, '30,00');
    });

    test('não deve gerar parcelamento para compras inferiores a R$ 30', () => {
      const plan = getInstallmentInfo(25.0);
      assert.strictEqual(plan, null);
    });

    test('deve estimar taxas de intermediação de marketplace de forma transparente', () => {
      const fee = getMarketplaceFeeEstimate(100.0);
      // 100 * 0.07 + 2.5 = 9.5
      assert.strictEqual(fee.serviceFeeBRL, 9.5);
      assert.strictEqual(fee.formattedFee, '9,50');
      assert.strictEqual(fee.formattedTotal, '109,50');
    });
  });

  describe('Integração e Normalização Steam (Vanity URL & SteamID64)', () => {
    test('deve extrair identificador de link com Vanity URL', () => {
      const parsed = parseSteamInput('https://steamcommunity.com/id/gaben/');
      assert.strictEqual(parsed.identifier, 'gaben');
      assert.strictEqual(parsed.isSteamId64, false);
    });

    test('deve extrair SteamID64 numérico de 17 dígitos a partir de link profiles', () => {
      const parsed = parseSteamInput('https://steamcommunity.com/profiles/76561198012345678/');
      assert.strictEqual(parsed.identifier, '76561198012345678');
      assert.strictEqual(parsed.isSteamId64, true);
    });

    test('deve reconhecer input direto de SteamID64 de 17 dígitos sem protocolo', () => {
      const parsed = parseSteamInput('76561198000000001');
      assert.strictEqual(parsed.identifier, '76561198000000001');
      assert.strictEqual(parsed.isSteamId64, true);
    });

    test('deve reconhecer input direto de Vanity username sem protocolo', () => {
      const parsed = parseSteamInput('henrique_gamer');
      assert.strictEqual(parsed.identifier, 'henrique_gamer');
      assert.strictEqual(parsed.isSteamId64, false);
    });

    test('deve gerar URLs corretas para SteamID64 priorizando /profiles/ com fallback /id/', () => {
      const urls = getSteamWishlistUrls('76561198012345678');
      assert.strictEqual(
        urls.primaryUrl,
        'https://store.steampowered.com/wishlist/profiles/76561198012345678/wishlistdata/?p=0'
      );
      assert.strictEqual(
        urls.fallbackUrl,
        'https://store.steampowered.com/wishlist/id/76561198012345678/wishlistdata/?p=0'
      );
    });

    test('deve gerar URLs corretas para Vanity priorizando /id/ com fallback /profiles/', () => {
      const urls = getSteamWishlistUrls('https://steamcommunity.com/id/gaben');
      assert.strictEqual(
        urls.primaryUrl,
        'https://store.steampowered.com/wishlist/id/gaben/wishlistdata/?p=0'
      );
      assert.strictEqual(
        urls.fallbackUrl,
        'https://store.steampowered.com/wishlist/profiles/gaben/wishlistdata/?p=0'
      );
    });

    test('deve fazer parsing seguro de JSON da Steam sem quebrar em caso de HTML de login ou página privada', () => {
      const htmlResponse = '<!DOCTYPE html><html><head><title>Steam Community</title></head><body>Login required</body></html>';
      const parsedHtml = parseSteamWishlistJson(htmlResponse);
      assert.deepStrictEqual(parsedHtml, {});

      const validJson = JSON.stringify({
        '105600': { name: 'Terraria', capsule: 'https://cdn.steam.com/header.jpg' },
        '730': { name: 'Counter-Strike 2', capsule: 'https://cdn.steam.com/cs2.jpg' },
      });
      const parsedJson = parseSteamWishlistJson(validJson);
      assert.strictEqual(parsedJson['105600'].name, 'Terraria');
      assert.strictEqual(parsedJson['730'].name, 'Counter-Strike 2');
    });
  });

  describe('Wishlist 2.0 & Inteligência Financeira Gamer', () => {
    test('deve calcular corretamente a economia agregada da lista de desejos', () => {
      const wishlistMock = [
        { gameID: '1', currentBestPrice: 10.0 }, // R$ 57,50
        { gameID: '2', currentBestPrice: 20.0 }, // R$ 115,00
      ];
      const rate = 5.75;
      const metrics = calculateWishlistMetrics(wishlistMock, rate);

      assert.strictEqual(metrics.totalCurrentPriceBRL, 172.5); // 30 * 5.75
      assert.strictEqual(metrics.formattedCurrent, '172,50');
      assert.ok(metrics.totalSavingsBRL > 0);
      assert.strictEqual(metrics.savingsPercent, 46); // (1.85 - 1) / 1.85 = 45.9% -> 46%
    });

    test('deve retornar métricas zeradas quando a wishlist estiver vazia', () => {
      const metrics = calculateWishlistMetrics([]);
      assert.strictEqual(metrics.totalCurrentPriceBRL, 0);
      assert.strictEqual(metrics.totalSavingsBRL, 0);
      assert.strictEqual(metrics.savingsPercent, 0);
      assert.strictEqual(metrics.formattedCurrent, '0,00');
    });

    test('deve identificar corretamente ofertas 100% grátis e giveaways', () => {
      assert.strictEqual(isFreeGiveaway({ salePrice: '0.00', savings: '100' }), true);
      assert.strictEqual(isFreeGiveaway({ salePrice: '0', savings: '0' }), true);
      assert.strictEqual(isFreeGiveaway({ salePrice: '19.99', savings: '50' }), false);
    });
  });

  describe('Câmbio Global Multi-Moedas (Frente D)', () => {
    function formatCurrencyPrice(priceUSD, currency = 'BRL', rate = 5.75) {
      if (currency === 'USD') {
        const formatted = priceUSD.toFixed(2);
        return { formatted, symbol: '$', full: `$ ${formatted}` };
      }
      if (currency === 'EUR') {
        const formatted = (priceUSD * 0.92).toFixed(2).replace('.', ',');
        return { formatted, symbol: '€', full: `€ ${formatted}` };
      }
      const formatted = (priceUSD * rate).toFixed(2).replace('.', ',');
      return { formatted, symbol: 'R$', full: `R$ ${formatted}` };
    }

    test('deve formatar valores em USD com ponto decimal e símbolo $', () => {
      const res = formatCurrencyPrice(19.99, 'USD');
      assert.strictEqual(res.symbol, '$');
      assert.strictEqual(res.formatted, '19.99');
      assert.strictEqual(res.full, '$ 19.99');
    });

    test('deve formatar valores em EUR com taxa aproximada e símbolo €', () => {
      const res = formatCurrencyPrice(10.0, 'EUR');
      assert.strictEqual(res.symbol, '€');
      assert.strictEqual(res.formatted, '9,20');
      assert.strictEqual(res.full, '€ 9,20');
    });

    test('deve formatar valores em BRL por padrão com taxa parametrizada', () => {
      const res = formatCurrencyPrice(10.0, 'BRL', 6.0);
      assert.strictEqual(res.symbol, 'R$');
      assert.strictEqual(res.formatted, '60,00');
      assert.strictEqual(res.full, 'R$ 60,00');
    });
  });

  describe('Gamificação da Wishlist & Economia Gamer (Frente B)', () => {
    function calculateWishlistLevel(items, totalSavingsBRL) {
      const hasHistoricLow = items.some(
        (i) => i.currentBestPrice != null && i.cheapestPriceEver != null && i.currentBestPrice <= i.cheapestPriceEver * 1.05
      );
      const hasHighSavings = totalSavingsBRL >= 100;
      const steamCount = items.filter((i) => Boolean(i.steamAppID)).length;
      const isValveCitizen = steamCount >= 3;
      const hasFiveItems = items.length >= 5;
      const hasAlertSet = items.some((i) => Boolean(i.targetPrice && i.targetPrice > 0));

      let unlockedCount = 0;
      if (hasHistoricLow) unlockedCount++;
      if (hasHighSavings) unlockedCount++;
      if (isValveCitizen) unlockedCount++;
      if (hasFiveItems) unlockedCount++;
      if (hasAlertSet) unlockedCount++;

      let level = 1;
      if (unlockedCount >= 4) level = 4;
      else if (unlockedCount >= 3) level = 3;
      else if (unlockedCount >= 2) level = 2;

      return { unlockedCount, level };
    }

    test('deve subir de nível conforme o gamer desbloqueia conquistas financeiras', () => {
      const itemsMock = [
        { gameID: '1', currentBestPrice: 10, cheapestPriceEver: 10, steamAppID: '100' },
        { gameID: '2', currentBestPrice: 20, cheapestPriceEver: 25, steamAppID: '200' },
        { gameID: '3', currentBestPrice: 15, cheapestPriceEver: 20, steamAppID: '300' },
        { gameID: '4', currentBestPrice: 5, cheapestPriceEver: 10, targetPrice: 4 },
        { gameID: '5', currentBestPrice: 8, cheapestPriceEver: 12 },
      ];
      // 5 conquistas ativas: historic low, >100 savings, 3 steam, 5 items, alert set
      const stats = calculateWishlistLevel(itemsMock, 150);
      assert.strictEqual(stats.unlockedCount, 5);
      assert.strictEqual(stats.level, 4);
    });

    test('deve manter nível inicial 1 quando poucas conquistas forem atendidas', () => {
      const stats = calculateWishlistLevel([{ gameID: '1', currentBestPrice: 50 }], 20);
      assert.strictEqual(stats.unlockedCount, 0);
      assert.strictEqual(stats.level, 1);
    });
  });

  describe('Comparador Lado a Lado / Modo Versus (Frente C)', () => {
    function calculateVersusDuel(game1PriceUSD, game2PriceUSD, rate = 5.75) {
      const g1BRL = game1PriceUSD * rate;
      const g2BRL = game2PriceUSD * rate;
      const diffBRL = Math.abs(g1BRL - g2BRL);
      const winner = g1BRL < g2BRL ? 'game1' : g2BRL < g1BRL ? 'game2' : 'tie';
      return { g1BRL, g2BRL, diffBRL, winner };
    }

    test('deve calcular corretamente a vantagem de preço no modo versus', () => {
      const duel = calculateVersusDuel(10.0, 15.0, 5.0);
      assert.strictEqual(duel.winner, 'game1');
      assert.strictEqual(duel.g1BRL, 50.0);
      assert.strictEqual(duel.g2BRL, 75.0);
      assert.strictEqual(duel.diffBRL, 25.0);
    });

    test('deve detectar empate de preços no duelo', () => {
      const duel = calculateVersusDuel(20.0, 20.0, 5.0);
      assert.strictEqual(duel.winner, 'tie');
      assert.strictEqual(duel.diffBRL, 0.0);
    });
  });

  describe('Inteligência Gamer: Custo por Hora & Duração (Pilar 2)', () => {
    function estimateHours(title) {
      const t = title.toLowerCase();
      if (t.includes('the witcher 3')) return 52;
      if (t.includes('elden ring')) return 58;
      if (t.includes('hades')) return 22;
      if (t.includes('rpg')) return 35;
      return 15;
    }

    function calcCostPerHour(priceBRL, title) {
      const hours = estimateHours(title);
      const cost = priceBRL / hours;
      let label = 'Padrão';
      if (cost <= 1.2) label = 'Lendário';
      else if (cost <= 2.5) label = 'Excelente';
      else if (cost <= 5.0) label = 'Bom';
      return { hours, cost, label };
    }

    test('deve identificar títulos de custo-benefício Lendário (< R$ 1,20/h)', () => {
      // The Witcher 3 por R$ 30 (52h) = R$ 0,57/h
      const res = calcCostPerHour(30.0, 'The Witcher 3: Wild Hunt');
      assert.strictEqual(res.hours, 52);
      assert.ok(res.cost < 1.0);
      assert.strictEqual(res.label, 'Lendário');
    });

    test('deve estimar duração por heurística de gênero quando título não estiver indexado', () => {
      const res = calcCostPerHour(70.0, 'Epic Fantasy RPG Adventure');
      assert.strictEqual(res.hours, 35);
      assert.strictEqual(res.label, 'Excelente');
    });
  });

  describe('IA Preditiva de Promoções: Sazonalidade (Pilar 3)', () => {
    function predictTiming(currentUSD, cheapestUSD, savingsPercent, daysToSale = 30) {
      const isHistoricLow = cheapestUSD > 0 && currentUSD <= cheapestUSD * 1.05;
      if (isHistoricLow || savingsPercent >= 75) {
        return { verdict: 'BUY_NOW', confidence: 95 };
      }
      if (daysToSale <= 25 && savingsPercent < 35) {
        return { verdict: 'WAIT_SALE', confidence: 84 };
      }
      return { verdict: 'CONSIDER', confidence: 70 };
    }

    test('deve recomendar BUY_NOW com 95% de confiança no menor preço histórico', () => {
      const pred = predictTiming(9.99, 9.99, 70);
      assert.strictEqual(pred.verdict, 'BUY_NOW');
      assert.strictEqual(pred.confidence, 95);
    });

    test('deve recomendar WAIT_SALE quando a sale estiver iminente e o desconto for fraco', () => {
      const pred = predictTiming(45.0, 20.0, 20, 10);
      assert.strictEqual(pred.verdict, 'WAIT_SALE');
      assert.strictEqual(pred.confidence, 84);
    });
  });

  describe('Detecção de Edições Especiais (Pilar 2)', () => {
    function detectEdition(title) {
      const t = title.toLowerCase();
      if (t.includes('goty') || t.includes('complete edition')) return 'GOTY / Complete';
      if (t.includes('ultimate')) return 'Ultimate';
      if (t.includes('deluxe')) return 'Deluxe';
      return 'Standard';
    }

    test('deve classificar corretamente edições GOTY, Ultimate e Deluxe', () => {
      assert.strictEqual(detectEdition('The Witcher 3: Complete Edition'), 'GOTY / Complete');
      assert.strictEqual(detectEdition('Cyberpunk 2077: Ultimate Edition'), 'Ultimate');
      assert.strictEqual(detectEdition('Resident Evil 4 Deluxe Edition'), 'Deluxe');
      assert.strictEqual(detectEdition('Hollow Knight'), 'Standard');
    });
  });

  describe('Cache Offline-First com TTL (Pilar 1)', () => {
    function checkCacheAge(timestamp, maxAgeMs = 900000) {
      const age = Date.now() - timestamp;
      return age <= maxAgeMs;
    }

    test('deve validar como ativo cache recente dentro do TTL', () => {
      const recent = Date.now() - 5000;
      assert.strictEqual(checkCacheAge(recent), true);
    });

    test('deve expirar cache com timestamp além do TTL máximo', () => {
      const expired = Date.now() - 1000000;
      assert.strictEqual(checkCacheAge(expired), false);
    });
  });

  describe('Hero Showcase & Imagens de Capa Widescreen', () => {
    function resolveHeroBanner(deal) {
      if (deal.steamAppID && deal.steamAppID !== '0') {
        return `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${deal.steamAppID}/header.jpg`;
      }
      return deal.thumb;
    }

    test('deve resolver arte widescreen Steam em alta resolução quando houver steamAppID', () => {
      const deal = {
        steamAppID: '1091500',
        thumb: 'https://images.cheapshark.com/thumb_cyberpunk.jpg',
      };
      const banner = resolveHeroBanner(deal);
      assert.strictEqual(
        banner,
        'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg'
      );
    });

    test('deve utilizar fallback thumb quando steamAppID for inexistente ou 0', () => {
      const deal = {
        steamAppID: '0',
        thumb: 'https://images.cheapshark.com/thumb_epic.jpg',
      };
      assert.strictEqual(resolveHeroBanner(deal), 'https://images.cheapshark.com/thumb_epic.jpg');
    });
  });

  describe('Sidebar Global & Mapeamento de Tópicos do Catálogo', () => {
    function mapTopicToFilters(topic, rate = 5.75) {
      switch (topic) {
        case 'super_savings':
          return { sortBy: 'Savings', onlyFree: false, underPrice: '' };
        case 'historic_low':
          return { sortBy: 'Deal Rating', minRating: '80' };
        case 'under_30':
          return { underPrice: Math.round(30 / rate).toString(), onlyFree: false };
        case 'aaa':
          return { onlyAAA: true };
        case 'steam_deck':
          return { sortBy: 'Deal Rating', minRating: '75' };
        case 'free':
          return { onlyFree: true, underPrice: '' };
        default:
          return { onlyFree: false, underPrice: '', onlyAAA: false };
      }
    }

    test('deve mapear corretamente o tópico under_30 para o teto em USD', () => {
      const filters = mapTopicToFilters('under_30', 5.75);
      assert.strictEqual(filters.underPrice, '5');
      assert.strictEqual(filters.onlyFree, false);
    });

    test('deve mapear tópico super_savings com ordenação por economia', () => {
      const filters = mapTopicToFilters('super_savings');
      assert.strictEqual(filters.sortBy, 'Savings');
    });

    test('deve mapear tópico free para ofertas 100% gratuitas', () => {
      const filters = mapTopicToFilters('free');
      assert.strictEqual(filters.onlyFree, true);
    });

    test('deve calcular corretamente a quantidade de filtros ativos', () => {
      function countActiveFilters(filters) {
        return [
          Boolean(filters.search && filters.search.trim()),
          Boolean(filters.store),
          Boolean(filters.underPrice),
          Boolean(filters.onlyFree),
          Boolean(filters.minRating),
          Boolean(filters.onlyAAA),
          Boolean(filters.topic && filters.topic !== 'all'),
        ].filter(Boolean).length;
      }

      assert.strictEqual(countActiveFilters({}), 0);
      assert.strictEqual(
        countActiveFilters({ search: 'cyberpunk', store: '1', topic: 'aaa' }),
        3
      );
      assert.strictEqual(
        countActiveFilters({ topic: 'all' }),
        0
      );
    });
  });
});
