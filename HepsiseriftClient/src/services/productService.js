import api from './api';

// Get all products
export const getProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};

// Search products
export const searchProducts = async (term) => {
  try {
    const response = await api.get(`/products/search?term=${encodeURIComponent(term)}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching products with term "${term}":`, error);
    throw error;
  }
};

// Get featured products
export const getFeaturedProducts = async () => {
  try {
    const response = await api.get('/products/featured');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

// Get on-sale products
export const getOnSaleProducts = async () => {
  try {
    const response = await api.get('/products/on-sale');
    return response.data;
  } catch (error) {
    console.error('Error fetching on-sale products:', error);
    throw error;
  }
};

// Get product reviews
export const getProductReviews = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    throw error;
  }
};

// Add product review
export const addProductReview = async (productId, reviewData) => {
  try {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error(`Error adding review for product ${productId}:`, error);
    throw error;
  }
};

// Check if product is in wishlist
export const isProductInWishlist = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/wishlist`);
    return response.data.isInWishlist;
  } catch (error) {
    console.error(`Error checking wishlist status for product ${productId}:`, error);
    return false;
  }
};

// Add product to wishlist
export const addToWishlist = async (productId) => {
  try {
    const response = await api.post(`/products/${productId}/wishlist`);
    return response.data;
  } catch (error) {
    console.error(`Error adding product ${productId} to wishlist:`, error);
    throw error;
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (productId) => {
  try {
    await api.delete(`/products/${productId}/wishlist`);
    return true;
  } catch (error) {
    console.error(`Error removing product ${productId} from wishlist:`, error);
    throw error;
  }
};