import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Types
export interface StoreChain {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  publicId: string;
  name: string;
}

export interface ProductPrice {
  id: number;
  productId: number;
  chainId: number;
  priceBgn: string;
  priceEur: string;
  validFrom: string;
  validTo: string | null;
  discount: number | null;
  storeChain: StoreChain;
}

export interface ProductDetails {
  id: number;
  publicId: string;
  name: string;
  brand: string | null;
  categoryId: number;
  barcode: string | null;
  imageUrl: string;
  unit: string;
  category: Category;
  prices: ProductPrice[];
}

const API_BASE_URL = "https://pricepal-9scz.onrender.com";

// Fetch function for a single product
const fetchProductDetails = async (productId: number): Promise<ProductDetails> => {
  const url = `${API_BASE_URL}/products/${productId}`;
  console.log(`Loading product details for ID ${productId} from:`, url);
  
  const { data } = await axios.get<ProductDetails>(url);
  console.log(`Product details loaded:`, data);
  
  return data;
};

interface UseProductDetailsReturn {
  product: ProductDetails | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single product with full details including prices across all store chains
 * @param productId - The ID of the product to fetch
 * @param enabled - Whether the query should run (default: true)
 */
export const useProductDetails = (
  productId: number | null,
  enabled: boolean = true
): UseProductDetailsReturn => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch: queryRefetch
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductDetails(productId!),
    enabled: enabled && productId !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ['product', productId] });
    await queryRefetch();
  };

  return {
    product: data ?? null,
    loading: isLoading,
    error: error as Error | null,
    refetch
  };
};

// Helper function to get the best price (lowest current price) for a product
export const getBestPrice = (prices: ProductPrice[]): ProductPrice | null => {
  if (!prices.length) return null;

  const currentPrices = prices.filter(price => {
    const now = new Date();
    const validFrom = new Date(price.validFrom);
    const validTo = price.validTo ? new Date(price.validTo) : null;
    
    return validFrom <= now && (!validTo || validTo >= now);
  });

  if (!currentPrices.length) return null;

  return currentPrices.reduce((best, current) => {
    const bestPrice = parseFloat(best.priceBgn);
    const currentPrice = parseFloat(current.priceBgn);
    return currentPrice < bestPrice ? current : best;
  });
};

// Helper function to get prices grouped by store chain
export const getPricesByChain = (prices: ProductPrice[]): Map<string, ProductPrice[]> => {
  const priceMap = new Map<string, ProductPrice[]>();
  
  prices.forEach(price => {
    const chainName = price.storeChain.name;
    if (!priceMap.has(chainName)) {
      priceMap.set(chainName, []);
    }
    priceMap.get(chainName)!.push(price);
  });
  
  return priceMap;
};

// Helper function to get current (active) price for a specific chain
export const getCurrentPriceForChain = (
  prices: ProductPrice[],
  chainName: string
): ProductPrice | null => {
  const now = new Date();
  
  const currentPrice = prices.find(price => {
    if (price.storeChain.name !== chainName) return false;
    
    const validFrom = new Date(price.validFrom);
    const validTo = price.validTo ? new Date(price.validTo) : null;
    
    return validFrom <= now && (!validTo || validTo >= now);
  });
  
  return currentPrice || null;
};

// Clear product details cache
export const clearProductCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  productId?: number
): void => {
  if (productId) {
    queryClient.removeQueries({ queryKey: ['product', productId] });
  } else {
    queryClient.removeQueries({ queryKey: ['product'] });
  }
};