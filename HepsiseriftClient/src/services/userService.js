import api from './api';

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/api/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/api/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user addresses
export const getUserAddresses = async () => {
  try {
    const response = await api.get('/api/users/addresses');
    return response.data;
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    return [];
  }
};

// Get address by ID
export const getAddressById = async (addressId) => {
  try {
    const response = await api.get(`/api/users/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching address ${addressId}:`, error);
    return null;
  }
};

// Add new address
export const addAddress = async (addressData) => {
  try {
    const response = await api.post('/api/users/addresses', addressData);
    return response.data;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

// Update address
export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await api.put(`/api/users/addresses/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    console.error(`Error updating address ${addressId}:`, error);
    throw error;
  }
};

// Delete address
export const deleteAddress = async (addressId) => {
  try {
    await api.delete(`/api/users/addresses/${addressId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting address ${addressId}:`, error);
    throw error;
  }
};

// Get user wishlist
export const getWishlist = async () => {
  try {
    const response = await api.get('/api/users/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
};