import { getUserId } from '@/components/utils/UUID';
import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = "https://pricepal-9scz.onrender.com";

// Types
interface ProductPrice {
  priceBgn: number | null;
  priceEur: number | null;
  discount: number | null;
}

interface CartProduct {
  publicId: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  imageUrl: string;
  unit: string;
  prices: ProductPrice[];
}

export interface CartItem {
  publicId: string;
  quantity: number;
  product: CartProduct;
}

export interface ShoppingCart {
  publicId: string;
  createdAt: string;
  items: CartItem[];
}

interface AddToCartRequest {
  publicProductId: string;
  quantity: number;
}

// API functions
const fetchShoppingCart = async (): Promise<ShoppingCart> => {
  const userId = await getUserId();
  const url = `${API_BASE_URL}/users/${userId}/shopping-cart`;
  
  console.log(`Fetching shopping cart for user: ${userId}`);
  const { data } = await axios.get<ShoppingCart>(url);
  console.log(`Shopping cart loaded: ${data.items.length} items`);
  
  return data;
};

const addToCart = async ({ publicProductId, quantity }: AddToCartRequest): Promise<CartItem> => {
  const userId = await getUserId();
  const url = `${API_BASE_URL}/users/${userId}/shopping-cart/items`;
  
  console.log(`Adding to cart: ${publicProductId}, quantity: ${quantity}`);
  
  // Create URL-encoded form data
  const params = new URLSearchParams();
  params.append('publicProductId', publicProductId);
  params.append('quantity', quantity.toString());
  
  const { data } = await axios.post<CartItem>(url, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  console.log(`Item added to cart successfully`);
  
  return data;
};

// Hook return type
interface UseShoppingCartReturn {
  cart: ShoppingCart | undefined;
  items: CartItem[];
  itemCount: number;
  totalPrice: { bgn: number; eur: number };
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  isAdding: boolean;
}

// Main shopping cart hook
export const useShoppingCart = (): UseShoppingCartReturn => {
  const queryClient = useQueryClient();

  // Fetch cart data
  const {
    data: cart,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['shopping-cart'],
    queryFn: fetchShoppingCart,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  // Add to cart mutation
  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      // Invalidate and refetch cart data after successful addition
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
    },
    onError: (error) => {
      console.error('Failed to add item to cart:', error);
    }
  });

  // Calculate totals
  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (totals, item) => {
      const price = item.product.prices[0];
      if (price) {
        totals.bgn += (price.priceBgn || 0) * item.quantity;
        totals.eur += (price.priceEur || 0) * item.quantity;
      }
      return totals;
    },
    { bgn: 0, eur: 0 }
  );

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
    await refetch();
  };

  const addItem = async (productId: string, quantity: number) => {
    await addMutation.mutateAsync({
      publicProductId: productId,
      quantity
    });
  };

  return {
    cart,
    items,
    itemCount,
    totalPrice,
    isLoading,
    error: error as Error | null,
    refresh,
    addItem,
    isAdding: addMutation.isPending
  };
};

// Helper hook to check if a product is in cart
export const useIsInCart = (productPublicId: string): {
  isInCart: boolean;
  quantity: number;
  cartItem: CartItem | undefined;
} => {
  const { items } = useShoppingCart();
  
  const cartItem = items.find(
    item => item.product.publicId === productPublicId
  );
  
  return {
    isInCart: !!cartItem,
    quantity: cartItem?.quantity ?? 0,
    cartItem
  };
};