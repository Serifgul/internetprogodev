import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../services/cartService';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate cart totals
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => {
    const price = item.product.isOnSale && item.product.salePrice 
      ? item.product.salePrice 
      : item.product.price;
    return total + (price * item.quantity);
  }, 0);

  // Fetch cart items
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const cartItems = await getCart();
      setCart(cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load your cart. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Add item to cart
  const addItem = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to add items to your cart' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await addToCart(productId, quantity);
      await fetchCart();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateItem = async (cartItemId, quantity) => {
    if (quantity < 1) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await updateCartItem(cartItemId, quantity);
      await fetchCart();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update item quantity';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (cartItemId) => {
    setLoading(true);
    setError(null);
    
    try {
      await removeFromCart(cartItemId);
      await fetchCart();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item from cart';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const emptyCart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await clearCart();
      setCart([]);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated, fetchCart]);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      error,
      cartItemCount,
      subtotal,
      fetchCart,
      addItem,
      updateItem,
      removeItem,
      clearCart: emptyCart
    }}>
      {children}
    </CartContext.Provider>
  );
};