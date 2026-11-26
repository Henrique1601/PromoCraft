export interface StoreCoupon {
  storeID: string;
  code: string;
  discountText: string;
}

const ACTIVE_COUPONS: Record<string, StoreCoupon> = {
  '3': { storeID: '3', code: 'PROMOCRAFT10', discountText: '+10% OFF' },
  '15': { storeID: '15', code: 'OMEN10', discountText: '+10% OFF' },
  'nuuvem': { storeID: 'nuuvem', code: 'NUUVEM10', discountText: '+10% OFF' },
  'eneba': { storeID: 'eneba', code: 'ENEBA5', discountText: '+5% OFF' },
  '27': { storeID: '27', code: 'GP5', discountText: '+5% OFF' },
};

export function getStoreCoupon(storeID: string): StoreCoupon | null {
  return ACTIVE_COUPONS[storeID] || null;
}
