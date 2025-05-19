import api from './api';

// Get all categories
// getCategories.js içinde
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    console.log('API Response:', response.data);

    // Eğer response.data doğrudan dizi değilse şunu döndür:
    return response.data.categories || []; 
  } catch (error) {
    console.error('Error fetching categories:', error);
    return []; // Hata durumunda boş dizi döndür
  }
};

// Get category by ID
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
};