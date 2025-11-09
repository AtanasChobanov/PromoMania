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

interface UpdateCartItemRequest {
  publicItemId: string;
  quantity: number;
}

interface RemoveFromCartResponse {
  message: string;
  item: CartItem;
}

interface SuggestedProduct {
  productPublicId: string;
  quantity: number;
  priceBgn: number;
  priceEur: number;
}

interface StoreOffer {
  storeChain: string;
  products: SuggestedProduct[];
  totalPriceBgn: number;
  totalPriceEur: number;
}

export interface CartSuggestions {
  bestOffer: StoreOffer;
  otherOffers: StoreOffer[];
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

const updateCartItem = async ({ publicItemId, quantity }: UpdateCartItemRequest): Promise<CartItem> => {
  const userId = await getUserId();
  const url = `${API_BASE_URL}/users/${userId}/shopping-cart/items/${publicItemId}`;
  
  console.log(`Updating cart item: ${publicItemId}, new quantity: ${quantity}`);
  
  const params = new URLSearchParams();
  params.append('quantity', quantity.toString());
  
  const { data } = await axios.patch<CartItem>(url, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  console.log(`Item quantity updated successfully`);
  
  return data;
};

const removeFromCart = async (publicItemId: string): Promise<RemoveFromCartResponse> => {
  const userId = await getUserId();
  const url = `${API_BASE_URL}/users/${userId}/shopping-cart/items/${publicItemId}`;
  
  console.log(`Removing item from cart: ${publicItemId}`);
  
  const { data } = await axios.delete<RemoveFromCartResponse>(url);
  console.log(`Item removed from cart successfully`);
  
  return data;
};

const fetchCartSuggestions = async (): Promise<CartSuggestions> => {
  const userId = await getUserId();
  const url = `${API_BASE_URL}/users/${userId}/shopping-cart/suggest`;
  
  console.log(`Fetching cart suggestions for user: ${userId}`);
  const { data } = await axios.get<CartSuggestions>(url);
  console.log(`Cart suggestions loaded: ${data.otherOffers.length} other offers`);
  
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
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
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
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  // Add to cart mutation
  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      // Invalidate both cart and suggestions
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-suggestions'] });
    },
    onError: (error) => {
      console.error('Failed to add item to cart:', error);
    }
  });

  // Update cart item mutation
  const updateMutation = useMutation({
    mutationFn: updateCartItem,
    onMutate: async ({ publicItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-cart'] });
      
      const previousCart = queryClient.getQueryData<ShoppingCart>(['shopping-cart']);
      
      if (previousCart) {
        queryClient.setQueryData<ShoppingCart>(['shopping-cart'], {
          ...previousCart,
          items: previousCart.items.map(item =>
            item.publicId === publicItemId
              ? { ...item, quantity }
              : item
          )
        });
      }
      
      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['shopping-cart'], context.previousCart);
      }
      console.error('Failed to update item quantity:', error);
    },
    onSettled: () => {
      // Invalidate both cart and suggestions after update
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-suggestions'] });
    }
  });

  // Remove from cart mutation
  const removeMutation = useMutation({
    mutationFn: removeFromCart,
    onMutate: async (publicItemId) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-cart'] });
      
      const previousCart = queryClient.getQueryData<ShoppingCart>(['shopping-cart']);
      
      if (previousCart) {
        queryClient.setQueryData<ShoppingCart>(['shopping-cart'], {
          ...previousCart,
          items: previousCart.items.filter(item => item.publicId !== publicItemId)
        });
      }
      
      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['shopping-cart'], context.previousCart);
      }
      console.error('Failed to remove item from cart:', error);
    },
    onSettled: () => {
      // Invalidate both cart and suggestions after removal
      queryClient.invalidateQueries({ queryKey: ['shopping-cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart-suggestions'] });
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

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    await updateMutation.mutateAsync({
      publicItemId: itemId,
      quantity
    });
  };

  const removeItem = async (itemId: string) => {
    await removeMutation.mutateAsync(itemId);
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
    updateItemQuantity,
    removeItem,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending
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

// Hook to fetch cart suggestions
export const useCartSuggestions = () => {
  const {
    data: suggestions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cart-suggestions'],
    queryFn: fetchCartSuggestions,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });

  return {
    suggestions,
    bestOffer: suggestions?.bestOffer,
    otherOffers: suggestions?.otherOffers ?? [],
    isLoading,
    error: error as Error | null,
    refresh: refetch
  };
};