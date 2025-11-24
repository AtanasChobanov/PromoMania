import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "./useAuth";

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

export interface PricePair {
  discounted: ProductPrice;
  original: ProductPrice | null;
}

export interface PricesByChain {
  [chainName: string]: PricePair;
}

const API_BASE_URL = "https://pricepal-9scz.onrender.com";

// Fetch function
const fetchProductDetails = async (
  productId: string,
  token: string | null,
  logout: () => Promise<void>
): Promise<ProductDetails> => {
  const url = `${API_BASE_URL}/products/${productId}`;
  
  if (!token) {
    throw new Error('Authentication required. Please login.');
  }
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.trim()}`,
    };

    const { data } = await axios.get<ProductDetails>(url, { headers });
    return data;
    
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await logout();
      throw new Error('Session expired. Please login again.');
    }
    throw error;
  }
};

interface UseProductDetailsReturn {
  product: ProductDetails | null;
  pricesByChain: PricesByChain | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useProductDetails = (
  productId: string | null,
  enabled: boolean = true
): UseProductDetailsReturn => {
  const queryClient = useQueryClient();
  const { accessToken, logout, isAuthenticated, isLoading: authLoading } = useAuth();

  const shouldFetch = enabled && productId !== null && !authLoading && !!accessToken;

  const {
    data,
    isLoading,
    error,
    refetch: queryRefetch
  } = useQuery({
    queryKey: ['product', productId, accessToken],
    queryFn: () => fetchProductDetails(productId!, accessToken, logout),
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ['product', productId] });
    await queryRefetch();
  };

  // Extract and organize prices by chain
  const pricesByChain = data ? extractPricesByChain(data.prices) : null;

  return {
    product: data ?? null,
    pricesByChain,
    loading: isLoading || authLoading,
    error: error as Error | null,
    refetch
  };
};

/**
 * Extract prices organized by store chain, sorted by lowest price first.
 */
export const extractPricesByChain = (prices: ProductPrice[]): PricesByChain => {
  const chainMap = new Map<string, ProductPrice[]>();

  // 1. Group prices by chain name
  prices.forEach(price => {
    const chainName = price.storeChain.name;
    if (!chainMap.has(chainName)) {
      chainMap.set(chainName, []);
    }
    chainMap.get(chainName)!.push(price);
  });

  // 2. Create a temporary array to hold the pairs so we can sort them
  const calculatedPairs: { chainName: string; pair: PricePair }[] = [];

  chainMap.forEach((chainPrices, chainName) => {
    // Find discounted price (discount > 0)
    const discountedPrice = chainPrices.find(p => p.discount !== null && p.discount > 0);
    // Find original price (discount === 0)
    const originalPrice = chainPrices.find(p => p.discount === 0);

    let pair: PricePair | null = null;

    if (discountedPrice && originalPrice) {
      pair = { discounted: discountedPrice, original: originalPrice };
    } else if (originalPrice) {
      pair = { discounted: originalPrice, original: null };
    } else if (discountedPrice) {
      pair = { discounted: discountedPrice, original: null };
    }

    if (pair) {
      calculatedPairs.push({ chainName, pair });
    }
  });

  // 3. Sort the array by price (Lowest to Highest)
  calculatedPairs.sort((a, b) => a.pair.discounted.priceBgn - b.pair.discounted.priceBgn);

  // 4. Construct the result object in sorted order
  // Modern JS engines respect insertion order for string keys
  const result: PricesByChain = {};
  
  calculatedPairs.forEach((item) => {
    result[item.chainName] = item.pair;
  });

  return result;
};

//  Utility funcs

export const getCurrentPriceWithOriginal = (
  prices: ProductPrice[],
  chainName: string
): PricePair | null => {
  const chainPrices = prices.filter(price => price.storeChain.name === chainName);
  
  if (!chainPrices.length) return null;
  
  const discounted = chainPrices.find(p => p.discount !== null && p.discount !== 0);
  const original = chainPrices.find(p => p.discount === 0 && p.validTo === null);
  
  if (discounted && original) {
    return { discounted, original };
  }
  
  return {
    discounted: chainPrices[0],
    original: null
  };
};  

export const getAllCurrentPricesWithOriginals = (
  prices: ProductPrice[]
): Map<string, PricePair> => {
  //return a Map sorted by price
  const tempArray: { chain: string; pair: PricePair }[] = [];
  const chainNames = [...new Set(prices.map(p => p.storeChain.name))];
  
  chainNames.forEach(chainName => {
    const pricePair = getCurrentPriceWithOriginal(prices, chainName);
    if (pricePair) {
      tempArray.push({ chain: chainName, pair: pricePair });
    }
  });

  // Sort by lowest price
  tempArray.sort((a, b) => a.pair.discounted.priceBgn - b.pair.discounted.priceBgn);
  
  const priceMap = new Map<string, PricePair>();
  tempArray.forEach(item => priceMap.set(item.chain, item.pair));

  return priceMap;
};

export const getBestPrice = (prices: ProductPrice[]): ProductPrice | null => {
  if (!prices.length) return null;
  return prices.reduce((best, current) => {
    return current.priceBgn < best.priceBgn ? current : best;
  });
};

export const getBestPriceWithOriginal = (prices: ProductPrice[]): PricePair | null => {
  const allPricesMap = getAllCurrentPricesWithOriginals(prices);
  
  if (!allPricesMap.size) return null;
  
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

export const getCurrentPriceForChain = (
  prices: ProductPrice[],
  chainName: string
): ProductPrice | null => {
  const currentPrice = prices.find(price => price.storeChain.name === chainName);
  return currentPrice || null;
};

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