import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Types
export interface StoreChain {
  publicId: string;
  name: string;
}

export interface Category {
  publicId: string;
  name: string;
}

export interface ProductPrice {
  priceBgn: number;
  priceEur: number;
  validFrom: string;
  validTo: string | null;
  discount: number | null;
  storeChain: StoreChain;
}

export interface ProductDetails {
  publicId: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  imageUrl: string;
  unit: string;
  category: Category;
  prices: ProductPrice[];
}

// Interface for price pair (discounted + original)
export interface PricePair {
  discounted: ProductPrice;
  original: ProductPrice | null;
}

const API_BASE_URL = "https://pricepal-9scz.onrender.com";

// Fetch function for a single product
const fetchProductDetails = async (productId: string): Promise<ProductDetails> => {
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
 * @param productId - The publicId of the product to fetch
 * @param enabled - Whether the query should run (default: true)
 */
export const useProductDetails = (
  productId: string | null,
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

// Get current price with both discounted and original prices for a chain
export const getCurrentPriceWithOriginal = (
  prices: ProductPrice[],
  chainName: string
): PricePair | null => {
  // Filter prices for the specific chain - database already filtered by date
  const chainPrices = prices.filter(price => price.storeChain.name === chainName);
  
  if (!chainPrices.length) return null;
  
  // Find discounted price (has discount value)
  const discounted = chainPrices.find(p => p.discount !== null);
  
  // Find original price (no discount, no validTo - the base price)
  const original = chainPrices.find(p => p.discount === null && p.validTo === null);
  
  // If there's a discounted price, return both
  if (discounted && original) {
    return {
      discounted,
      original
    };
  }
  
  // If no discount, return the regular price as "discounted" (current price)
  return {
    discounted: chainPrices[0],
    original: null
  };
};

// Get all current prices with originals grouped by chain
export const getAllCurrentPricesWithOriginals = (
  prices: ProductPrice[]
): Map<string, PricePair> => {
  const priceMap = new Map<string, PricePair>();
  
  // Get unique chain names - database already filtered by date
  const chainNames = [...new Set(prices.map(p => p.storeChain.name))];
  
  chainNames.forEach(chainName => {
    const pricePair = getCurrentPriceWithOriginal(prices, chainName);
    if (pricePair) {
      priceMap.set(chainName, pricePair);
    }
  });
  
  return priceMap;
};

// Helper function to get the best price (lowest current price) for a product
export const getBestPrice = (prices: ProductPrice[]): ProductPrice | null => {
  if (!prices.length) return null;

  // Database already filtered by date, so just find the lowest price
  return prices.reduce((best, current) => {

    return current.priceBgn < best.priceBgn ? current : best;
  });
};

// Get best price with original (for showing discount)
export const getBestPriceWithOriginal = (prices: ProductPrice[]): PricePair | null => {
  const allPricesMap = getAllCurrentPricesWithOriginals(prices);
  
  if (!allPricesMap.size) return null;
  
  // Find the chain with the lowest current price
  let bestPair: PricePair | null = null;
  let lowestPrice = Infinity;
  
allPricesMap.forEach((pricePair) => {
  const currentPrice = pricePair.discounted.priceBgn;
  if (currentPrice < lowestPrice) {
    lowestPrice = currentPrice;
    bestPair = pricePair;
  }
});
  
  return bestPair;
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
  // Database already filtered by date
  const currentPrice = prices.find(price => price.storeChain.name === chainName);
  
  return currentPrice || null;
};

// Clear product details cache
export const clearProductCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  productId?: string
): void => {
  if (productId) {
    queryClient.removeQueries({ queryKey: ['product', productId] });
  } else {
    queryClient.removeQueries({ queryKey: ['product'] });
  }
};