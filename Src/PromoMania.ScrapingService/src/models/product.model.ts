export interface ChainPrice {
  chain: string;
  priceBgn: number;
  priceEur: number;
  oldPriceBgn: number;
  oldPriceEur: number;
  validFrom: string;
  validTo: string;
  discount: number;
}

export interface UnifiedProduct {
  chainPrices: ChainPrice[];
  category: string;
  name: string;
  brand?: string;
  unit: string;
  imageUrl?: string;
}
