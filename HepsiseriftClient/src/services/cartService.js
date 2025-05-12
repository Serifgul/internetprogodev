import api from './api';

// Get cart items
export const getCart = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  } catch (error) {
    console.error(`Error adding product ${productId} to cart:`, error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItem = async (cartItemId, quantity) => {
  try {
    const response = await api.put(`/cart/${cartItemId}`, { quantity });
    return response.data;
  } catch (error) {
    console.error(`Error updating cart item ${cartItemId}:`, error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (cartItemId) => {
  try {
    await api.delete(`/cart/${cartItemId}`);
    return true;
  } catch (error) {
    console.error(`Error removing item ${cartItemId} from cart:`, error);
    throw error;
  }
};

// Clear cart
export const clearCart = async () => {
  try {
    await api.delete('/cart');
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};