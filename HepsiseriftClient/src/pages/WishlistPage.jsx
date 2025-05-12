import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getWishlist } from '../services/userService';
import { removeFromWishlist } from '../services/productService';
import { HeartIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getWishlist();
        setWishlist(data);
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Favoriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // Remove from wishlist
  const handleRemoveFromWishlist = async (item) => {
    setRemovingItem(item.id);
    
    try {
      await removeFromWishlist(item.product.id);
      setWishlist(prev => prev.filter(i => i.id !== item.id));
      toast.success('Ürün favorilerden çıkarıldı');
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      toast.error('Ürün favorilerden çıkarılırken bir hata oluştu');
    } finally {
      setRemovingItem(null);
    }
  };

  // Add to cart
  const handleAddToCart = async (item) => {
    setAddingToCart(item.id);
    
    try {
      const result = await addItem(item.product.id, 1);
      
      if (result.success) {
        toast.success('Ürün sepete eklendi');
      } else {
        toast.error(result.message || 'Ürün sepete eklenemedi');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Ürün sepete eklenirken bir hata oluştu');
    } finally {
      setAddingToCart(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Favorilerim</h1>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Favorilerim</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Empty wishlist
  if (wishlist.length === 0) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Favorilerim</h1>
        <div className="bg-white p-8 rounded-lg shadow-card text-center">
          <div className="flex justify-center mb-4">
            <HeartIcon className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Favori Listeniz Boş</h2>
          <p className="text-gray-600 mb-6">
            Favori listenizde henüz bir ürün bulunmuyor. Beğendiğiniz ürünleri favorilere ekleyebilirsiniz.
          </p>
          <Link
            to="/products"
            className="px-6 py-3 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors"
          >
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Favorilerim</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-gray-600 text-sm">{user?.email}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                <Link
                  to="/account"
                  className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Hesap Bilgilerim
                </Link>
                <Link
                  to="/orders"
                  className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Siparişlerim
                </Link>
                <Link
                  to="/addresses"
                  className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Adreslerim
                </Link>
                <Link
                  to="/wishlist"
                  className="block py-2 px-3 rounded-md bg-primary-50 text-primary-700 font-medium"
                >
                  Favorilerim
                </Link>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Wishlist Items */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Favori Ürünlerim ({wishlist.length})</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="relative">
                      <Link to={`/products/${item.product.id}`}>
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-48 object-cover"
                        />
                      </Link>
                      <button
                        onClick={() => handleRemoveFromWishlist(item)}
                        disabled={removingItem === item.id}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full hover:bg-red-50 transition-colors"
                      >
                        {removingItem === item.id ? (
                          <div className="w-5 h-5 animate-spin rounded-full border-2 border-t-transparent border-red-500"></div>
                        ) : (
                          <TrashIcon className="w-5 h-5 text-red-500" />
                        )}
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <Link
                        to={`/products/${item.product.id}`}
                        className="block text-gray-900 font-medium hover:text-primary-500 mb-1"
                      >
                        {item.product.name}
                      </Link>
                      
                      <div className="mb-3">
                        {item.product.isOnSale && item.product.salePrice ? (
                          <div className="flex items-center">
                            <span className="text-accent-500 font-bold">
                              {item.product.salePrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </span>
                            <span className="ml-2 text-gray-500 line-through text-sm">
                              {item.product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-900 font-bold">
                            {item.product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(item.product.rating)
                                  ? 'text-yellow-400'
                                  : i < item.product.rating
                                  ? 'text-yellow-300'
                                  : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {item.product.stockQuantity > 0 ? 'Stokta var' : 'Stokta yok'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={addingToCart === item.id || item.product.stockQuantity === 0}
                        className="w-full mt-3 py-2 px-3 bg-primary-500 text-white text-sm font-medium rounded hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70"
                      >
                        {addingToCart === item.id ? (
                          <div className="flex justify-center">
                            <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></div>
                          </div>
                        ) : item.product.stockQuantity === 0 ? (
                          'Stokta Yok'
                        ) : (
                          'Sepete Ekle'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;