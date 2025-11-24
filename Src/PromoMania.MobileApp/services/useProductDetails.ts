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

// New interface to structure prices by store chain
export interface PricesByChain {
  [chainName: string]: PricePair;
}

const API_BASE_URL = "https://pricepal-9scz.onrender.com";

// Fetch function with authentication
const fetchProductDetails = async (
  productId: string,
  token: string | null,
  logout: () => Promise<void>
): Promise<ProductDetails> => {
  const url = `${API_BASE_URL}/products/${productId}`;
  
  console.log('=== fetchProductDetails called ===');
  console.log('Product ID:', productId);
  console.log('Token exists:', !!token);
  console.log('Token value:', token ? `${token.substring(0, 20)}...` : 'NULL');
  
  // Fail early if no token
  if (!token) {
    console.error('❌ No token available - cannot make authenticated request');
    throw new Error('Authentication required. Please login.');
  }
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.trim()}`,
    };

    console.log('Making request to:', url);
    console.log('Authorization header:', `Bearer ${token.substring(0, 15)}...`);

    const { data } = await axios.get<ProductDetails>(url, { headers });
    
    console.log('✅ Product details loaded successfully:', data.name);
    return data;
    
  } catch (error) {
    // Handle 401 Unauthorized - token expired or invalid
    if (axios.isAxiosError(error)) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        url: url,
      });

      if (error.response?.status === 401) {
        console.log('Token expired/invalid - logging out');
        await logout();
        throw new Error('Session expired. Please login again.');
      }
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

/**
 * Hook for fetching a single product with full details including prices across all store chains
 * Automatically handles JWT authentication
 * Extracts both original and discounted prices for each store
 * @param productId - The publicId of the product to fetch
 * @param enabled - Whether the query should run (default: true)
 */
export const useProductDetails = (
  productId: string | null,
  enabled: boolean = true
): UseProductDetailsReturn => {
  const queryClient = useQueryClient();
  const { accessToken, logout, isAuthenticated, isLoading: authLoading } = useAuth();

  // Debug logging
  console.log('=== useProductDetails hook ===');
  console.log('Product ID:', productId);
  console.log('Enabled:', enabled);
  console.log('Auth Loading:', authLoading);
  console.log('Is Authenticated:', isAuthenticated);
  console.log('Access Token exists:', !!accessToken);
  console.log('Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NULL');

  const shouldFetch = enabled && productId !== null && !authLoading && !!accessToken;
  console.log('Should Fetch:', shouldFetch);

  const {
    data,
    isLoading,
    error,
    refetch: queryRefetch
  } = useQuery({
    queryKey: ['product', productId, accessToken], // Include token in key
    queryFn: () => {
      console.log('Query function executing...');
      return fetchProductDetails(productId!, accessToken, logout);
    },
    enabled: shouldFetch, // Only run if authenticated and token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const refetch = async () => {
    console.log('Manual refetch triggered');
    await queryClient.invalidateQueries({ queryKey: ['product', productId] });
    await queryRefetch();
  };

  // Extract and organize prices by chain
  const pricesByChain = data ? extractPricesByChain(data.prices) : null;

  return {
    product: data ?? null,
    pricesByChain,
    loading: isLoading || authLoading, // Include auth loading
    error: error as Error | null,
    refetch
  };
};

/**
 * Extract prices organized by store chain with original and discounted prices
 * For each chain: looks for a discounted price (discount !== 0) and original price (discount === 0)
 */
export const extractPricesByChain = (prices: ProductPrice[]): PricesByChain => {
  const chainMap = new Map<string, ProductPrice[]>();

  // Group prices by chain name
  prices.forEach(price => {
    const chainName = price.storeChain.name;
    if (!chainMap.has(chainName)) {
      chainMap.set(chainName, []);
    }
    chainMap.get(chainName)!.push(price);
  });

  // Extract original and discounted for each chain
  const result: PricesByChain = {};

  chainMap.forEach((chainPrices, chainName) => {
    // Find discounted price (discount > 0, not just !== 0)
    const discountedPrice = chainPrices.find(p => p.discount !== null && p.discount > 0);
    // Find original price (discount === 0)
    const originalPrice = chainPrices.find(p => p.discount === 0);

    if (discountedPrice && originalPrice) {
      // Case 1: Both discounted and original exist - show both
      result[chainName] = {
        discounted: discountedPrice,
        original: originalPrice
      };
    } else if (originalPrice) {
      // Case 2: Only original price exists - show as discounted, no original
      result[chainName] = {
        discounted: originalPrice,
        original: null
      };
    } else if (discountedPrice) {
      // Case 3: Only discounted exists (edge case) - show as discounted
      result[chainName] = {
        discounted: discountedPrice,
        original: null
      };
    }
  });

  return result;
};
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
  const priceMap = new Map<string, PricePair>();
  const chainNames = [...new Set(prices.map(p => p.storeChain.name))];
  
  chainNames.forEach(chainName => {
    const pricePair = getCurrentPriceWithOriginal(prices, chainName);
    if (pricePair) {
      priceMap.set(chainName, pricePair);
    }
  });
  
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