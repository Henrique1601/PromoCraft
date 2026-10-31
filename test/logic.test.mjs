import { test, describe } from 'node:test';
import assert from 'node:assert';

// Teste de resolução de URLs diretas
function getDirectStoreUrl(dealID, storeID, steamAppID, gameTitle) {
  if (storeID === '1' && steamAppID && steamAppID !== '0') {
    return `https://store.steampowered.com/app/${steamAppID}/`;
  }
  if (storeID === '7' && gameTitle) {
    return `https://www.gog.com/en/games?query=${encodeURIComponent(gameTitle)}`;
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

describe('PromoCraft - Testes Unitários de Regra de Negócio', () => {
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

    test('deve retornar fallback oficial do CheapShark quando não houver mapeamento direto', () => {
      const url = getDirectStoreUrl('abc_deal_999');
      assert.strictEqual(url, 'https://www.cheapshark.com/redirect?dealID=abc_deal_999');
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
});
