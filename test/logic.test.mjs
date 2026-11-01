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
});
