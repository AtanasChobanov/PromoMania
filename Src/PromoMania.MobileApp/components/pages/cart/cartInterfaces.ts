export interface ProductBoxProps {
  publicId: string;
  name: string;
  brand: string | null;
  price: number;
  priceEur: number;
  unit: string;
  imageUrl: string;
  quantity: number;
  discount: number | null;
  onDelete?: () => void;
  onViewDetails?: () => void;
  onSaveForLater?: () => void;
}



export interface OverviewPriceProps {
  priceBgn: number;
  priceEur: number;
  isExpanded: boolean;
  basePrice: number;
  basePriceEur: number;
  saves: number;
  savesEur:number;
  bestOfferStore?: string;
  onToggle: () => void;
}

export interface OptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onViewDetails: () => void;
  onDelete: () => void;
  onSaveForLater: () => void;
}