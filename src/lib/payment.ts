/**
 * Módulo de Pagamento e Regionalização Financeira Gamer Brasileira
 * Calcula descontos à vista no Pix, parcelamento sem juros e estimativas de taxas em marketplaces.
 */

export interface PixPricing {
  discountPercent: number;
  finalPriceBRL: number;
  formatted: string;
  savingsBRL: string;
}

export interface InstallmentPlan {
  installments: number;
  valuePerInstallment: string;
  totalFormatted: string;
}

export interface MarketplaceFeeEstimate {
  serviceFeeBRL: number;
  totalWithFeesBRL: number;
  formattedFee: string;
  formattedTotal: string;
}

/**
 * Calcula o valor com desconto especial à vista no Pix (Padrão e-commerce gamer Brasil: 10% OFF).
 */
export function getPixPrice(priceBRL: number, discountPercent = 10): PixPricing {
  const finalPrice = Math.max(0, priceBRL * (1 - discountPercent / 100));
  const savings = Math.max(0, priceBRL - finalPrice);

  return {
    discountPercent,
    finalPriceBRL: finalPrice,
    formatted: finalPrice.toFixed(2).replace('.', ','),
    savingsBRL: savings.toFixed(2).replace('.', ','),
  };
}

/**
 * Calcula o parcelamento sem juros em até 3x para compras acima de R$ 30.
 */
export function getInstallmentInfo(priceBRL: number, maxInstallments = 3): InstallmentPlan | null {
  if (priceBRL < 30) return null;

  const installments = Math.min(maxInstallments, Math.floor(priceBRL / 15));
  if (installments <= 1) return null;

  const valuePerInstallment = (priceBRL / installments).toFixed(2).replace('.', ',');

  return {
    installments,
    valuePerInstallment,
    totalFormatted: priceBRL.toFixed(2).replace('.', ','),
  };
}

/**
 * Estima taxas de intermediação e IOF de marketplaces P2P internacionais (como Eneba e Kinguin).
 * Média de mercado: taxa de serviço (~7% + R$ 2,50).
 */
export function getMarketplaceFeeEstimate(priceBRL: number): MarketplaceFeeEstimate {
  const serviceFee = priceBRL * 0.07 + 2.5;
  const total = priceBRL + serviceFee;

  return {
    serviceFeeBRL: serviceFee,
    totalWithFeesBRL: total,
    formattedFee: serviceFee.toFixed(2).replace('.', ','),
    formattedTotal: total.toFixed(2).replace('.', ','),
  };
}
