export interface ProductOverviewDto {
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
