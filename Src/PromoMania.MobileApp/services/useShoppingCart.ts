import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios, { AxiosInstance } from "axios";
import { useAuth } from "./useAuth";

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

// Create axios instance with auth token
const createAxiosInstance = (token: string | null): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });

  if (token) {
    instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  // Add error logging
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error.response?.status, error.response?.data);
      return Promise.reject(error);
    }
  );

  return instance;
};

// API functions
const fetchShoppingCart = async (token: string | null): Promise<ShoppingCart> => {
  if (!token) {
    throw new Error("No authentication token available");
  }

  const api = createAxiosInstance(token);

  try {
    // console.log("Fetching from:", `${API_BASE_URL}/shopping-cart/`);
    const { data } = await api.get<ShoppingCart>("/shopping-cart/");
    // console.log("Cart data received:", data.items.length, "items");
    return data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

const addToCart = async (
  { publicProductId, quantity }: AddToCartRequest,
  token: string | null
): Promise<CartItem> => {
  if (!token) {
    throw new Error("No authentication token available");
  }

  const api = createAxiosInstance(token);

  console.log(`Adding to cart: ${publicProductId}, quantity: ${quantity}`);

  const params = new URLSearchParams();
  params.append("publicProductId", publicProductId);
  params.append("quantity", quantity.toString());

  const { data } = await api.post<CartItem>("/shopping-cart/items", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  console.log(`Item added to cart successfully`);

  return data;
};

const updateCartItem = async (
  { publicItemId, quantity }: UpdateCartItemRequest,
  token: string | null
): Promise<CartItem> => {
  if (!token) {
    throw new Error("No authentication token available");
  }

  const api = createAxiosInstance(token);

  console.log(`Updating cart item: ${publicItemId}, new quantity: ${quantity}`);

  const params = new URLSearchParams();
  params.append("quantity", quantity.toString());

  const { data } = await api.patch<CartItem>(
    `/shopping-cart/items/${publicItemId}`,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  console.log(`Item quantity updated successfully`);

  return data;
};

const removeFromCart = async (
  publicItemId: string,
  token: string | null
): Promise<RemoveFromCartResponse> => {
  if (!token) {
    throw new Error("No authentication token available");
  }

  const api = createAxiosInstance(token);

  console.log(`Removing item from cart: ${publicItemId}`);

  const { data } = await api.delete<RemoveFromCartResponse>(
    `/shopping-cart/items/${publicItemId}`
  );
  console.log(`Item removed from cart successfully`);

  return data;
};

const fetchCartSuggestions = async (token: string | null): Promise<CartSuggestions> => {
  if (!token) {
    throw new Error("No authentication token available");
  }

  const api = createAxiosInstance(token);

  // console.log(`Fetching cart suggestions`);
  const { data } = await api.get<CartSuggestions>("/shopping-cart/suggest");
  // console.log(`Cart suggestions loaded: ${data.otherOffers.length} other offers`);

  return data;
};

// Main shopping cart hook
export const useShoppingCart = (): UseShoppingCartReturn => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  // Fetch cart data
  const {
    data: cart,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["shopping-cart", accessToken],
    queryFn: () => fetchShoppingCart(accessToken),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
    enabled: !!accessToken,
  });

  // Add to cart mutation
  const addMutation = useMutation({
    mutationFn: (variables: AddToCartRequest) =>
      addToCart(variables, accessToken),
    onSuccess: async (data) => {
      console.log("Item added successfully, refreshing cart...", data);
      
      // 1. Invalidate the main cart
      await queryClient.invalidateQueries({ 
        queryKey: ["shopping-cart", accessToken],
        refetchType: 'active'
      });

      // 2. IMPORTANT: Invalidate suggestions so the price updates
      await queryClient.invalidateQueries({
        queryKey: ["cart-suggestions"],
      });
      
      // Force refetch
      await refetch();
      
      console.log("Cart refreshed");
    },
    onError: (error) => {
      console.error("Failed to add item to cart:", error);
    },
  });

  // Update cart item mutation
  const updateMutation = useMutation({
    mutationFn: (variables: UpdateCartItemRequest) =>
      updateCartItem(variables, accessToken),
    onMutate: async ({ publicItemId, quantity }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["shopping-cart"] });

      // Snapshot previous data
      const previousCart = queryClient.getQueryData<ShoppingCart>([
        "shopping-cart",
        accessToken,
      ]);

      // Optimistically update
      if (previousCart) {
        queryClient.setQueryData<ShoppingCart>(
          ["shopping-cart", accessToken],
          {
            ...previousCart,
            items: previousCart.items.map((item) =>
              item.publicId === publicItemId
                ? { ...item, quantity }
                : item
            ),
          }
        );
      }

      return { previousCart };
    },
    onError: (error, variables, context) => {
      // Revert on error
      if (context?.previousCart) {
        queryClient.setQueryData(
          ["shopping-cart", accessToken],
          context.previousCart
        );
      }
      console.error("Failed to update item quantity:", error);
    },
    onSettled: () => {
      // Refetch cart AND suggestions after mutation
      queryClient.invalidateQueries({ queryKey: ["shopping-cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-suggestions"] });
    },
  });

  // Remove from cart mutation
  const removeMutation = useMutation({
    mutationFn: (publicItemId: string) =>
      removeFromCart(publicItemId, accessToken),
    onMutate: async (publicItemId) => {
      await queryClient.cancelQueries({ queryKey: ["shopping-cart"] });

      const previousCart = queryClient.getQueryData<ShoppingCart>([
        "shopping-cart",
        accessToken,
      ]);

      if (previousCart) {
        queryClient.setQueryData<ShoppingCart>(
          ["shopping-cart", accessToken],
          {
            ...previousCart,
            items: previousCart.items.filter(
              (item) => item.publicId !== publicItemId
            ),
          }
        );
      }

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(
          ["shopping-cart", accessToken],
          context.previousCart
        );
      }
      console.error("Failed to remove item from cart:", error);
    },
    onSettled: () => {
      // Refetch cart AND suggestions after mutation
      queryClient.invalidateQueries({ queryKey: ["shopping-cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-suggestions"] });
    },
  });

  // Calculate totals (fallback if suggestions aren't ready)
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
    await queryClient.invalidateQueries({ queryKey: ["shopping-cart"] });
    await queryClient.invalidateQueries({ queryKey: ["cart-suggestions"] });
    await refetch();
  };

  const addItem = async (productId: string, quantity: number) => {
    // console.log("addItem called with:", { productId, quantity });
    try {
      await addMutation.mutateAsync({
        publicProductId: productId,
        quantity,
      });
      // console.log("addItem completed successfully");
    } catch (error) {
      console.error("addItem failed:", error);
      throw error;
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    await updateMutation.mutateAsync({
      publicItemId: itemId,
      quantity,
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
    isRemoving: removeMutation.isPending,
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
    (item) => item.product.publicId === productPublicId
  );

  return {
    isInCart: !!cartItem,
    quantity: cartItem?.quantity ?? 0,
    cartItem,
  };
};

// Hook to fetch cart suggestions
export const useCartSuggestions = () => {
  const { accessToken } = useAuth();

  const {
    data: suggestions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["cart-suggestions", accessToken],
    queryFn: () => fetchCartSuggestions(accessToken),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    enabled: !!accessToken,
  });

  return {
    suggestions,
    bestOffer: suggestions?.bestOffer,
    otherOffers: suggestions?.otherOffers ?? [],
    isLoading,
    error: error as Error | null,
    refresh: refetch,
  };
};