import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/config';

export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  addedAt: string;
  product: {
    productId: number;
    supplierId: number;
    name: string;
    description: string;
    price: number;
    sku: string;
    unit: string;
    imgName: string;
    discount?: number;
  };
}

export interface Cart {
  cartId: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartData {
  cart: Cart;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

interface CartContextType {
  cartData: CartData | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

// Generate a user ID for cart functionality (in a real app, this would come from authentication)
const getUserId = (): string => {
  let userId = localStorage.getItem('cartUserId');
  if (!userId) {
    userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('cartUserId', userId);
  }
  return userId;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = getUserId();

  // Fetch cart data from API
  const fetchCart = async (): Promise<CartData | null> => {
    try {
      const response = await fetch(`${api.baseURL}/api/cart/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      return await response.json();
    } catch (err) {
      console.error('Error fetching cart:', err);
      throw err;
    }
  };

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      try {
        const data = await fetchCart();
        setCartData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load cart');
        console.error('Error loading cart:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [userId]);

  const refreshCart = async () => {
    try {
      const data = await fetchCart();
      setCartData(data);
      setError(null);
    } catch (err) {
      setError('Failed to refresh cart');
      throw err;
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${api.baseURL}/api/cart/${userId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      await refreshCart();
      setError(null);
    } catch (err) {
      setError('Failed to add item to cart');
      console.error('Error adding to cart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (cartItemId: number, quantity: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${api.baseURL}/api/cart/${userId}/items/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }

      await refreshCart();
      setError(null);
    } catch (err) {
      setError('Failed to update cart item');
      console.error('Error updating cart item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${api.baseURL}/api/cart/${userId}/items/${cartItemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      await refreshCart();
      setError(null);
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error('Error removing from cart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${api.baseURL}/api/cart/${userId}/clear`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      await refreshCart();
      setError(null);
    } catch (err) {
      setError('Failed to clear cart');
      console.error('Error clearing cart:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: CartContextType = {
    cartData,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};