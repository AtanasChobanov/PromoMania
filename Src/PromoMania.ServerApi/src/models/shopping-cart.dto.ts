import type { StoreChainName } from "./store-chain.model.js";

export interface ProductPriceDto {
  priceBgn: number | null;
  priceEur: number | null;
  discount: number | null;
  validFrom?: Date;
  validTo?: Date | null;
  storeChain?: {
    publicId: string;
    name: string;
  };
}

export interface ShoppingCartProductDto {
  publicId: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  imageUrl: string | null;
  unit: string | null;
  prices: ProductPriceDto[];
}

export interface ShoppingCartItemDto {
  publicId: string;
  quantity: number;
  product: ShoppingCartProductDto;
}

export interface ShoppingCartDto {
  publicId: string;
  createdAt: Date;
  items: ShoppingCartItemDto[];
}

export interface StoreProductPrice {
  productPublicId: string;
  quantity: number;
  priceBgn: number;
  priceEur: number;
}

export interface StorePrices {
  storeChain: StoreChainName;
  products: StoreProductPrice[];
  totalPriceBgn: number;
  totalPriceEur: number;
}
