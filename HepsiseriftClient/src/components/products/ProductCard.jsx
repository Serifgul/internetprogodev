import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { addToWishlist, removeFromWishlist, isProductInWishlist } from '../../services/productService';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [isInWishlist, setIsInWishlist] = useState(product.isInWishlist || false);
  const [isLoading, setIsLoading] = useState(false);

  // Add to cart handler
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    setIsLoading(true);
    const result = await addItem(product.id, 1);
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Ürün sepete eklendi');
    } else {
      toast.error(result.message || 'Ürün sepete eklenemedi');
    }
  };

  // Toggle wishlist handler
  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
        setIsInWishlist(false);
        toast.success('Ürün favorilerden çıkarıldı');
      } else {
        await addToWishlist(product.id);
        setIsInWishlist(true);
        toast.success('Ürün favorilere eklendi');
      }
    } catch (error) {
      toast.error('İşlem başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if product is in wishlist when component mounts
  useState(() => {
    const checkWishlistStatus = async () => {
      if (isAuthenticated) {
        try {
          const inWishlist = await isProductInWishlist(product.id);
          setIsInWishlist(inWishlist);
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        }
      }
    };

    checkWishlistStatus();
  }, [isAuthenticated, product.id]);

  return (
    <div className="product-card bg-white rounded-lg shadow-card overflow-hidden">
      {/* Wishlist button */}
      <button
        onClick={handleToggleWishlist}
        disabled={isLoading}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
      >
        {isInWishlist ? (
          <HeartIconSolid className="w-5 h-5 text-accent-500" />
        ) : (
          <HeartIcon className="w-5 h-5 text-gray-500 hover:text-accent-500" />
        )}
      </button>

      {/* Product link with image */}
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="relative pb-[100%] overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        
        {/* Sale badge */}
        {product.isOnSale && (
          <div className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-semibold px-2 py-1 rounded">
            İndirim
          </div>
        )}
      </Link>

      {/* Product details */}
      <div className="p-4">
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="text-gray-900 font-semibold text-sm mb-1 hover:text-primary-500 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-500 text-xs mb-2">
            {product.category?.name || 'Kategori'}
          </p>
          
          {/* Price */}
          <div className="flex items-center mb-3">
            {product.isOnSale && product.salePrice ? (
              <>
                <span className="text-accent-500 font-bold">
                  {product.salePrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
                <span className="ml-2 text-gray-400 text-sm line-through">
                  {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
              </>
            ) : (
              <span className="text-gray-900 font-bold">
                {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
            )}
          </div>
          
          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex mr-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400'
                      : i < product.rating
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
            <span className="text-xs text-gray-500">({product.rating})</span>
          </div>
        </Link>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="w-full py-2 px-3 bg-primary-500 text-white text-sm font-medium rounded hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70"
        >
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></div>
            </div>
          ) : (
            'Sepete Ekle'
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;