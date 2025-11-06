import {
  useInfiniteQuery,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import axios from "axios";

// Types
export interface Product {
  publicId: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  imageUrl: string;
  unit: string;
  priceBgn: string;
  priceEur: string;
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
  offset: number
): Promise<SectionResponse> => {
  const url = `${API_BASE_URL}/products?section=${section}&limit=${limit}&offset=${offset}`;
  console.log(`Loading section "${section}" from:`, url);
  
  const { data } = await axios.get<SectionResponse>(url);
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

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: ['products', section],
    queryFn: ({ pageParam = 0 }) => 
      fetchProductSection(section, initialLimit, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.offset + lastPage.pagination.limit;
      }
      return undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Flatten all pages into a single products array
  const products = data?.pages.flatMap(page => page.products) ?? [];
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
  // Use useQueries to fetch multiple sections in parallel
  const queries = sections.map(section => ({
    queryKey: ['products', section],
    queryFn: () => fetchProductSection(section, initialLimit, 0),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  }));

  const results = useQuery({
    queryKey: ['products', 'multiple', sections.join(',')],
    queryFn: async () => {
      const promises = sections.map(section => 
        fetchProductSection(section, initialLimit, 0)
      );
      return Promise.all(promises);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Build sectionsData map
  const sectionsData = new Map<SectionType, SectionDataMap>();
  if (results.data) {
    results.data.forEach((sectionData, index) => {
      sectionsData.set(sections[index], {
        products: sectionData.products,
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