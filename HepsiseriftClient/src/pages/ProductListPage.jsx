import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getProducts, getProductsByCategory, searchProducts } from '../services/productService';
import { getCategoryById, getCategories } from '../services/categoryService';
import ProductGrid from '../components/products/ProductGrid';

const ProductListPage = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('search');

  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and sorting
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showOnSale, setShowOnSale] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(categoryId ? [parseInt(categoryId)] : []);
  
  // Fetch data based on route params
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let productsData;
        
        // Get all categories for the filter
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Fetch products based on route
        if (categoryId) {
          productsData = await getProductsByCategory(categoryId);
          const categoryData = await getCategoryById(categoryId);
          setCategory(categoryData);
          setSelectedCategories([parseInt(categoryId)]);
        } else if (searchTerm) {
          productsData = await searchProducts(searchTerm);
        } else {
          productsData = await getProducts();
        }
        
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Ürünler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, searchTerm]);

  // Apply filters and sorting to products
  const filteredAndSortedProducts = () => {
    let result = [...products];
    
    // Filter by selected categories (if not already filtered by route)
    if (selectedCategories.length > 0 && !categoryId) {
      result = result.filter(product => selectedCategories.includes(product.categoryId));
    }
    
    // Filter by price range
    if (priceRange.min !== '') {
      result = result.filter(product => {
        const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
        return price >= Number(priceRange.min);
      });
    }
    
    if (priceRange.max !== '') {
      result = result.filter(product => {
        const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
        return price <= Number(priceRange.max);
      });
    }
    
    // Filter by sale status
    if (showOnSale) {
      result = result.filter(product => product.isOnSale);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => {
          const priceA = a.isOnSale && a.salePrice ? a.salePrice : a.price;
          const priceB = b.isOnSale && b.salePrice ? b.salePrice : b.price;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        result.sort((a, b) => {
          const priceA = a.isOnSale && a.salePrice ? a.salePrice : a.price;
          const priceB = b.isOnSale && b.salePrice ? b.salePrice : b.price;
          return priceB - priceA;
        });
        break;
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // Default sorting (featured)
        break;
    }
    
    return result;
  };

  // Handle category filter change
  const handleCategoryChange = (id) => {
    setSelectedCategories(prev => {
      if (prev.includes(id)) {
        return prev.filter(catId => catId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle price range change
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setSortBy('default');
    setPriceRange({ min: '', max: '' });
    setShowOnSale(false);
    setSelectedCategories(categoryId ? [parseInt(categoryId)] : []);
  };

  // Get page title
  const getPageTitle = () => {
    if (category) {
      return category.name;
    } else if (searchTerm) {
      return `"${searchTerm}" için arama sonuçları`;
    } else {
      return 'Tüm Ürünler';
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-heading font-bold mb-8">{getPageTitle()}</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow-card mb-4">
            <h2 className="font-bold text-lg mb-4">Filtreler</h2>
            
            {/* Categories Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Kategoriler</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-primary-500 rounded focus:ring-primary-500"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => handleCategoryChange(cat.id)}
                      disabled={categoryId && parseInt(categoryId) === cat.id}
                    />
                    <span className="ml-2 text-gray-700">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Fiyat Aralığı</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  name="min"
                  value={priceRange.min}
                  onChange={handlePriceChange}
                  placeholder="Min"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <span>-</span>
                <input
                  type="number"
                  name="max"
                  value={priceRange.max}
                  onChange={handlePriceChange}
                  placeholder="Max"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            {/* On Sale Filter */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-primary-500 rounded focus:ring-primary-500"
                  checked={showOnSale}
                  onChange={() => setShowOnSale(!showOnSale)}
                />
                <span className="ml-2 text-gray-700">Sadece İndirimli Ürünler</span>
              </label>
            </div>
            
            {/* Reset Filters Button */}
            <button
              onClick={resetFilters}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
        
        {/* Products Section */}
        <div className="w-full md:w-3/4">
          {/* Sort Options */}
          <div className="bg-white p-4 rounded-lg shadow-card mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-2 sm:mb-0">
              <span className="text-gray-700 mr-2">Sıralama:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded p-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="default">Önerilen</option>
                <option value="price-asc">Fiyat (Artan)</option>
                <option value="price-desc">Fiyat (Azalan)</option>
                <option value="rating-desc">Puanı En Yüksek</option>
                <option value="newest">En Yeniler</option>
              </select>
            </div>
            <div>
              <span className="text-gray-700">
                {filteredAndSortedProducts().length} ürün bulundu
              </span>
            </div>
          </div>
          
          {/* Products Grid */}
          <ProductGrid
            products={filteredAndSortedProducts()}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;