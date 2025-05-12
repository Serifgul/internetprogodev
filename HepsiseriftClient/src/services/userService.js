import api from './api';

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user addresses
export const getUserAddresses = async () => {
  try {
    const response = await api.get('/users/addresses');
    return response.data;
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    throw error;
  }
};

// Get address by ID
export const getAddressById = async (addressId) => {
  try {
    const response = await api.get(`/users/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching address ${addressId}:`, error);
    throw error;
  }
};

// Add new address
export const addAddress = async (addressData) => {
  try {
    const response = await api.post('/users/addresses', addressData);
    return response.data;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

// Update address
export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await api.put(`/users/addresses/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    console.error(`Error updating address ${addressId}:`, error);
    throw error;
  }
};

// Delete address
export const deleteAddress = async (addressId) => {
  try {
    await api.delete(`/users/addresses/${addressId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting address ${addressId}:`, error);
    throw error;
  }
};

// Get user wishlist
export const getWishlist = async () => {
  try {
    const response = await api.get('/users/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};