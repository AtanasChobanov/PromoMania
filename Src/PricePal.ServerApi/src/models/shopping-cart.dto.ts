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
