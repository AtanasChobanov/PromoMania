import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

// Types
export interface Product {
  id: number;
  name: string;
  brand: string | null;
  categoryId: number;
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

interface SectionData {
  title: string;
  products: Product[];
  pagination: PaginationInfo;
}

// Available section types
export type SectionType = "top" | "our-choice" | "kaufland" | "lidl" | "billa" | "tmarket";

// Cache for individual sections
class SectionCache {
  private data = new Map<SectionType, SectionData>();

  setSection(section: SectionType, data: SectionResponse): void {
    const existing = this.data.get(section);
    
    if (existing) {
      // Append new products to existing ones
      this.data.set(section, {
        title: data.title,
        products: [...existing.products, ...data.products],
        pagination: data.pagination
      });
    } else {
      // First load
      this.data.set(section, {
        title: data.title,
        products: data.products,
        pagination: data.pagination
      });
    }
  }

  getSection(section: SectionType): SectionData | undefined {
    return this.data.get(section);
  }

  hasMore(section: SectionType): boolean {
    const data = this.data.get(section);
    return data?.pagination.hasMore ?? true;
  }

  getNextOffset(section: SectionType): number {
    const data = this.data.get(section);
    if (!data) return 0;
    return data.pagination.offset + data.pagination.limit;
  }

  clear(section?: SectionType): void {
    if (section) {
      this.data.delete(section);
    } else {
      this.data.clear();
    }
  }
}

const sectionCache = new SectionCache();

interface UseProductSectionReturn {
  products: Product[];
  title: string;
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Hook for a single product section with lazy loading
export const useProductSection = (
  section: SectionType, 
  initialLimit: number = 4
): UseProductSectionReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const mountedRef = useRef<boolean>(true);
  const isInitialLoad = useRef<boolean>(true);

  // Load initial data
  useEffect(() => {
    mountedRef.current = true;
    
    const loadInitial = async (): Promise<void> => {
      // Check cache first
      const cached = sectionCache.getSection(section);
      if (cached) {
        setProducts(cached.products);
        setTitle(cached.title);
        setHasMore(cached.pagination.hasMore);
        isInitialLoad.current = false;
        return;
      }

      // Load from API
      setLoading(true);
      try {
        const url = `https://pricepal-9scz.onrender.com/products?section=${section}&limit=${initialLimit}&offset=0`;
        console.log(`Loading section "${section}" from:`, url);
        
        const response = await axios.get<SectionResponse>(url);
        
        console.log(`Section "${section}" loaded:`, response.data.products.length, 'products');
        
        if (mountedRef.current) {
          sectionCache.setSection(section, response.data);
          setProducts(response.data.products);
          setTitle(response.data.title);
          setHasMore(response.data.pagination.hasMore);
          isInitialLoad.current = false;
        }
      } catch (err) {
        if (mountedRef.current) {
          console.error(`Error loading section "${section}":`, err);
          if (axios.isAxiosError(err)) {
            const statusCode = err.response?.status;
            const errorMsg = `Failed to load products (${statusCode || 'Network Error'}): ${err.message}`;
            setError(new Error(errorMsg));
          } else {
            setError(err instanceof Error ? err : new Error("Failed to load products"));
          }
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      mountedRef.current = false;
    };
  }, [section, initialLimit]);

  // Load more products
  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const offset = sectionCache.getNextOffset(section);
      const response = await axios.get<SectionResponse>(
        `https://pricepal-9scz.onrender.com/products?section=${section}&limit=${initialLimit}&offset=${offset}`
      );

      if (mountedRef.current) {
        sectionCache.setSection(section, response.data);
        const cached = sectionCache.getSection(section);
        
        if (cached) {
          setProducts(cached.products);
          setHasMore(cached.pagination.hasMore);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error("Failed to load more products"));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [section, initialLimit, hasMore, loading]);

  // Refresh section (clear cache and reload)
  const refresh = useCallback(async (): Promise<void> => {
    sectionCache.clear(section);
    isInitialLoad.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<SectionResponse>(
        `https://pricepal-9scz.onrender.com/products?section=${section}&limit=${initialLimit}&offset=0`
      );

      if (mountedRef.current) {
        sectionCache.setSection(section, response.data);
        setProducts(response.data.products);
        setTitle(response.data.title);
        setHasMore(response.data.pagination.hasMore);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error("Failed to refresh products"));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [section, initialLimit]);

  return {
    products,
    title,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
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
  loadMoreForSection: (section: SectionType) => Promise<void>;
}

// Hook for multiple sections at once
export const useProductSections = (
  sections: SectionType[], 
  initialLimit: number = 4
): UseProductSectionsReturn => {
  const [sectionsData, setSectionsData] = useState<Map<SectionType, SectionDataMap>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;

    const loadAllSections = async (): Promise<void> => {
      setLoading(true);
      const newData = new Map<SectionType, SectionDataMap>();

      try {
        const promises = sections.map(async (section: SectionType) => {
          // Check cache first
          const cached = sectionCache.getSection(section);
          if (cached) {
            return { section, data: cached };
          }

          // Load from API
          const response = await axios.get<SectionResponse>(
            `https://pricepal-9scz.onrender.com/products?section=${section}&limit=${initialLimit}&offset=0`
          );
          
          sectionCache.setSection(section, response.data);
          return { section, data: response.data };
        });

        const results = await Promise.all(promises);

        if (mountedRef.current) {
          results.forEach(({ section, data }) => {
            newData.set(section, {
              products: data.products,
              title: data.title,
              hasMore: data.pagination.hasMore
            });
          });
          setSectionsData(newData);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error("Failed to load sections"));
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadAllSections();

    return () => {
      mountedRef.current = false;
    };
  }, [sections.join(","), initialLimit]);

  const loadMoreForSection = useCallback(async (section: SectionType): Promise<void> => {
    if (!sectionCache.hasMore(section)) return;

    try {
      const offset = sectionCache.getNextOffset(section);
      const response = await axios.get<SectionResponse>(
        `https://pricepal-9scz.onrender.com/products?section=${section}&limit=${initialLimit}&offset=${offset}`
      );

      sectionCache.setSection(section, response.data);
      const cached = sectionCache.getSection(section);

      if (mountedRef.current && cached) {
        setSectionsData(prev => {
          const newMap = new Map(prev);
          newMap.set(section, {
            products: cached.products,
            title: cached.title,
            hasMore: cached.pagination.hasMore
          });
          return newMap;
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error("Failed to load more products"));
      }
    }
  }, [initialLimit]);

  return {
    sectionsData,
    loading,
    error,
    loadMoreForSection
  };
};

// Clear all cached data
export const clearSectionCache = (section?: SectionType): void => {
  sectionCache.clear(section);
};