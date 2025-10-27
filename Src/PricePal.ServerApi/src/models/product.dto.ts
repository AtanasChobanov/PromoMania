export interface ProductOverviewDto {
  publicId: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  imageUrl: string | null;
  unit: string | null;
  priceBgn: string | null;
  priceEur: string | null;
  discount: number | null;
}
