export interface Deal {
  internalName: string;
  title: string;
  metacriticLink?: string;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText?: string;
  steamRatingPercent?: string;
  steamRatingCount?: string;
  steamAppID?: string;
  releaseDate?: number;
  lastChange?: number;
  dealRating: string;
  thumb: string;
}

export interface Store {
  storeID: string;
  storeName: string;
  isActive: number;
  images: {
    banner: string;
    logo: string;
    icon: string;
  };
}

export interface GameLookup {
  info: {
    title: string;
    steamAppID?: string;
    thumb: string;
  };
  cheapestPriceEver: {
    price: string;
    date: number;
  };
  deals: Array<{
    storeID: string;
    dealID: string;
    price: string;
    retailPrice: string;
    savings: string;
  }>;
}
