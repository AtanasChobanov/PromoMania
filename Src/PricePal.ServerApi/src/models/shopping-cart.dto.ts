export interface ShoppingCartProductDto {
  publicId: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  imageUrl: string | null;
  unit: string | null;
  priceBgn: number | null;
  priceEur: number | null;
  discount: number | null;
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
