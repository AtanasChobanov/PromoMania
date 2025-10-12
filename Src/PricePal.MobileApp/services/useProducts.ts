import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

// Types for the new structure
interface Product {
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
  chain?: string; // Optional: store chain (kaufland, lidl, billa, tmarket)
}

interface ProductSection {
  title: string;
  products: Product[];
}

// Global cache - persists across component mounts/unmounts
class ProductCache {
  private sections: ProductSection[] = [];
  private productMap = new Map<string, Product>();
  private productIdMap = new Map<number, Product>();
  private isLoaded = false;
  private loadPromise: Promise<ProductSection[]> | null = null;

  async loadProducts(): Promise<ProductSection[]> {
    // If already loaded, return cached data
    if (this.isLoaded) {
      return this.sections;
    }

    // If currently loading, return the existing promise
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Start loading
    this.loadPromise = this.fetchFromAPI();
    
    try {
      const sections = await this.loadPromise;
      this.sections = sections;
      this.isLoaded = true;
      
      // Build product maps for quick lookups
      this.productMap.clear();
      this.productIdMap.clear();
      
      sections.forEach((section) => {
        section.products.forEach((product) => {
          this.productMap.set(product.name, product);
          this.productIdMap.set(product.id, product);
        });
      });
      
      return sections;
    } finally {
      this.loadPromise = null;
    }
  }

  private async fetchFromAPI(): Promise<ProductSection[]> {
    const response = await axios.get("https://pricepal-9scz.onrender.com/products/overview");
    return response.data;
  }

  getProduct(productName: string): Product | null {
    return this.productMap.get(productName) || null;
  }

  getProductById(productId: number): Product | null {
    return this.productIdMap.get(productId) || null;
  }

  getAllSections(): ProductSection[] {
    return this.sections;
  }

  getAllProducts(): Product[] {
    return this.sections.flatMap(section => section.products);
  }

  isDataLoaded(): boolean {
    return this.isLoaded;
  }

  // Force refresh cache
  async refresh(): Promise<ProductSection[]> {
    this.isLoaded = false;
    this.loadPromise = null;
    return this.loadProducts();
  }

  // Clear cache (for logout, etc.)
  clear() {
    this.sections = [];
    this.productMap.clear();
    this.productIdMap.clear();
    this.isLoaded = false;
    this.loadPromise = null;
  }
}

// Single global instance
const productCache = new ProductCache();

export const useProducts = () => {
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const loadData = async () => {
      // If data is already loaded, set it immediately
      if (productCache.isDataLoaded()) {
        if (mountedRef.current) {
          setSections(productCache.getAllSections());
          setLoading(false);
        }
        return;
      }

      try {
        const data = await productCache.loadProducts();
        
        if (mountedRef.current) {
          setSections(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (mountedRef.current) {
          if (err instanceof Error) {
            setError(err);
          } else {
            setError(new Error("Unknown error occurred"));
          }
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Get all products as flat array (for backward compatibility)
  const products = sections.flatMap(section => section.products);

  // Get single product by name - INSTANT if cached
  const getProduct = useCallback((productName: string): Product | null => {
    return productCache.getProduct(productName);
  }, []);

  // Get single product by ID - INSTANT if cached
  const getProductById = useCallback((productId: number): Product | null => {
    return productCache.getProductById(productId);
  }, []);

  // Refresh data manually
  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await productCache.refresh();
      if (mountedRef.current) {
        setSections(data);
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("Unknown error occurred"));
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Check if data is available without loading
  const isDataAvailable = useCallback(() => {
    return productCache.isDataLoaded();
  }, []);

  return { 
    sections,        // NEW: Sections with titles
    products,        // Flat array of all products (backward compatible)
    loading, 
    error, 
    getProduct,      // Get single product by name
    getProductById,  // NEW: Get single product by ID
    refreshProducts, // Manual refresh
    isDataAvailable  // Check if data is ready
  };
};

// Hook specifically for product pages - NO LOADING STATE
export const useProduct = (productName: string) => {
  const { getProduct, isDataAvailable } = useProducts();
  
  const product = getProduct(productName);
  const dataReady = isDataAvailable();

  return {
    product,
    found: !!product,
    dataReady
  };
};

// Hook for getting product by ID
export const useProductById = (productId: number) => {
  const { getProductById, isDataAvailable } = useProducts();
  
  const product = getProductById(productId);
  const dataReady = isDataAvailable();

  return {
    product,
    found: !!product,
    dataReady
  };
};

// Export cache manager for advanced usage
export const clearProductCache = () => productCache.clear();
export const refreshProductCache = () => productCache.refresh();