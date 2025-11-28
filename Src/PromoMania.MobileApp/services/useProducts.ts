import { useAuth } from "@/services/useAuth"; // Adjust the path as needed
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import axios from "axios";
import React from "react";

// Types
export interface Product {
  publicId: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  imageUrl: string;
  unit: string;
  priceBgn: number;
  priceEur: number;
  discount: number;
}

interface PaginationInfo {
  offset: number;
  limit: number;
  hasMore: boolean;
}

interface SectionResponse {
  title: string;
  products: Product[];
  pagination: PaginationInfo;
}

// Available section types
export type SectionType = "top" | "our-choice" | "kaufland" | "lidl" | "billa" | "tmarket";

const API_BASE_URL = "https://pricepal-9scz.onrender.com";

// Fetch function for a single page
const fetchProductSection = async (
  section: SectionType,
  limit: number,
  offset: number,
  accessToken: string | null
): Promise<SectionResponse> => {
  const url = `${API_BASE_URL}/products?section=${section}&limit=${limit}&offset=${offset}`;
  console.log(`Loading section "${section}" from:`, url);
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if token exists
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  
  const { data } = await axios.get<SectionResponse>(url, { headers });
  console.log(`Section "${section}" loaded:`, data.products.length, 'products');
  
  return data;
};

interface UseProductSectionReturn {
  products: Product[];
  title: string;
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => Promise<void>;
  isFetchingMore: boolean;
}

// Hook for a single product section with infinite loading
export const useProductSection = (
  section: SectionType,
  initialLimit: number = 4
): UseProductSectionReturn => {
  const queryClient = useQueryClient();
  const { accessToken, logout } = useAuth();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: ['products', section, accessToken],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        return await fetchProductSection(section, initialLimit, pageParam, accessToken);
      } catch (error: any) {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
          console.log('Token expired or invalid, logging out...');
          await logout();
        }
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.offset + lastPage.pagination.limit;
      }
      return undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    enabled: !!accessToken, // Only fetch if user is authenticated
  });

  // Flatten all pages into a single products array and remove duplicates by publicId
  const products = React.useMemo(() => {
    const allProducts = data?.pages.flatMap(page => page.products) ?? [];
    const seenIds = new Set<string>();
    return allProducts.filter(product => {
      if (seenIds.has(product.publicId)) {
        return false;
      }
      seenIds.add(product.publicId);
      return true;
    });
  }, [data?.pages]);
  const title = data?.pages[0]?.title ?? "";

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['products', section] });
    await refetch();
  };

  return {
    products,
    title,
    loading: isLoading,
    error: error as Error | null,
    hasMore: hasNextPage ?? false,
    loadMore,
    refresh,
    isFetchingMore: isFetchingNextPage
  };
};

interface SectionDataMap {
  products: Product[];
  title: string;
  hasMore: boolean;
}

interface UseProductSectionsReturn {
  sectionsData: Map<SectionType, SectionDataMap>;
  loading: boolean;
  error: Error | null;
  loadMoreForSection: (section: SectionType) => void;
}

// Hook for multiple sections at once
export const useProductSections = (
  sections: SectionType[],
  initialLimit: number = 4
): UseProductSectionsReturn => {
  const { accessToken, logout } = useAuth();

  const results = useQuery({
    queryKey: ['products', 'multiple', sections.join(','), accessToken],
    queryFn: async () => {
      try {
        const promises = sections.map(section => 
          fetchProductSection(section, initialLimit, 0, accessToken)
        );
        return Promise.all(promises);
      } catch (error: any) {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
          console.log('Token expired or invalid, logging out...');
          await logout();
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!accessToken, // Only fetch if user is authenticated
  });

  // Build sectionsData map and remove duplicates by publicId
  const sectionsData = new Map<SectionType, SectionDataMap>();
  if (results.data) {
    results.data.forEach((sectionData, index) => {
      const seenIds = new Set<string>();
      const uniqueProducts = sectionData.products.filter(product => {
        if (seenIds.has(product.publicId)) {
          return false;
        }
        seenIds.add(product.publicId);
        return true;
      });
      
      sectionsData.set(sections[index], {
        products: uniqueProducts,
        title: sectionData.title,
        hasMore: sectionData.pagination.hasMore
      });
    });
  }

  // For loadMore, we need to track individual sections
  // This is a simplified version - in production you'd want useInfiniteQuery for each
  const loadMoreForSection = (section: SectionType) => {
    console.log(`Load more for section: ${section}`);
    // You'd need to implement this with useInfiniteQuery per section
    // or use a different approach
  };

  return {
    sectionsData,
    loading: results.isLoading,
    error: results.error as Error | null,
    loadMoreForSection
  };
};

// Clear specific section or all sections from cache
export const clearSectionCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  section?: SectionType
): void => {
  if (section) {
    queryClient.removeQueries({ queryKey: ['products', section] });
  } else {
    queryClient.removeQueries({ queryKey: ['products'] });
  }
};