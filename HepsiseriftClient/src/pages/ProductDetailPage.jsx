import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { getProductById, getProductReviews, addProductReview, isProductInWishlist, addToWishlist, removeFromWishlist } from '../services/productService';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { ShoppingCartIcon, StarIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import 'swiper/css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  // State management
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Fetch product data and reviews
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get product details
        const productData = await getProductById(id);
        setProduct(productData);
        
        // Get product reviews
        const reviewsData = await getProductReviews(id);
        setReviews(reviewsData);
        
        // Check if product is in wishlist
        if (isAuthenticated) {
          const inWishlist = await isProductInWishlist(id);
          setIsInWishlist(inWishlist);
        }
        
        // Get related products (products in the same category)
        if (productData.categoryId) {
          // This would typically be a separate API call to get related products
          // For now, we'll just use the same product as placeholder
          setRelatedProducts([productData]);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Ürün detayları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stockQuantity || 1)) {
      setQuantity(value);
    }
  };

  // Handle increment and decrement
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < (product?.stockQuantity || 1)) {
      setQuantity(quantity + 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    
    setAddingToCart(true);
    const result = await addItem(product.id, quantity);
    setAddingToCart(false);
    
    if (result.success) {
      toast.success('Ürün sepete eklendi');
    } else {
      toast.error(result.message || 'Ürün sepete eklenemedi');
    }
  };

  // Toggle wishlist
  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    
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
    }
  };

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    
    if (!reviewComment.trim()) {
      toast.error('Lütfen bir yorum yazın');
      return;
    }
    
    setSubmittingReview(true);
    
    try {
      const newReview = await addProductReview(product.id, {
        rating,
        comment: reviewComment
      });
      
      setReviews([newReview, ...reviews]);
      setRating(5);
      setReviewComment('');
      setShowReviewForm(false);
      toast.success('Yorumunuz başarıyla eklendi');
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Yorum eklenirken bir hata oluştu');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <div className="bg-gray-200 rounded-lg aspect-square mb-4"></div>
            </div>
            <div className="md:w-1/2">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-24 bg-gray-200 rounded w-full mb-8"></div>
              <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="container py-12">
        <div className="bg-red-50 text-red-500 p-6 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">Bir Hata Oluştu</h2>
          <p>{error || 'Ürün bulunamadı'}</p>
          <Link to="/products" className="mt-4 inline-block text-primary-500 hover:underline">
            Ürünlere Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <nav className="flex mb-6 text-sm">
        <Link to="/" className="text-gray-500 hover:text-primary-500">Ana Sayfa</Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to="/products" className="text-gray-500 hover:text-primary-500">Ürünler</Link>
        {product.category && (
          <>
            <span className="mx-2 text-gray-400">/</span>
            <Link to={`/products/category/${product.categoryId}`} className="text-gray-500 hover:text-primary-500">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-700">{product.name}</span>
      </nav>

      {/* Product Info */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Product Image */}
        <div className="md:w-1/2">
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full object-contain aspect-square"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="md:w-1/2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          
          {/* Category */}
          {product.category && (
            <Link
              to={`/products/category/${product.categoryId}`}
              className="inline-block text-primary-500 hover:underline mb-4"
            >
              {product.category.name}
            </Link>
          )}
          
          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex mr-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400'
                      : i < product.rating
                      ? 'text-yellow-300'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600 text-sm">
              {product.rating.toFixed(1)} ({reviews.length} yorum)
            </span>
          </div>
          
          {/* Price */}
          <div className="mb-6">
            {product.isOnSale && product.salePrice ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold text-accent-500">
                  {product.salePrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
                <span className="ml-2 text-gray-500 line-through">
                  {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </span>
                <span className="ml-2 text-white bg-accent-500 text-xs font-semibold px-2 py-1 rounded">
                  {Math.round((1 - product.salePrice / product.price) * 100)}% İndirim
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Ürün Açıklaması</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          {/* Stock Status */}
          <div className="mb-6">
            {product.stockQuantity > 0 ? (
              <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-sm">
                Stokta {product.stockQuantity} adet var
              </span>
            ) : (
              <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-sm">
                Stokta Yok
              </span>
            )}
          </div>
          
          {/* Quantity Selector */}
          {product.stockQuantity > 0 && (
            <div className="flex items-center mb-6">
              <label htmlFor="quantity" className="mr-2 text-gray-700">
                Adet:
              </label>
              <div className="flex">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="px-3 py-2 border border-gray-300 bg-gray-100 rounded-l-md hover:bg-gray-200"
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  max={product.stockQuantity}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 border-y border-gray-300 py-2 text-center focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="px-3 py-2 border border-gray-300 bg-gray-100 rounded-r-md hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stockQuantity === 0}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {addingToCart ? (
                <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></div>
              ) : (
                <>
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  Sepete Ekle
                </>
              )}
            </button>
            
            <button
              onClick={handleToggleWishlist}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {isInWishlist ? (
                <>
                  <HeartIconSolid className="w-5 h-5 mr-2 text-accent-500" />
                  Favorilerden Çıkar
                </>
              ) : (
                <>
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Favorilere Ekle
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Ürün Değerlendirmeleri ({reviews.length})
          </h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              {showReviewForm ? 'İptal' : 'Değerlendirme Yap'}
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-lg shadow-card mb-6">
            <h3 className="text-lg font-semibold mb-4">Ürünü Değerlendir</h3>
            
            {/* Rating Input */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Puan</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-gray-400 hover:text-yellow-400 focus:outline-none"
                  >
                    <StarIcon
                      className={`h-8 w-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Comment Input */}
            <div className="mb-4">
              <label htmlFor="comment" className="block text-gray-700 mb-2">
                Yorumunuz
              </label>
              <textarea
                id="comment"
                rows="4"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Bu ürün hakkında düşüncelerinizi paylaşın..."
                required
              ></textarea>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={submittingReview}
              className="px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {submittingReview ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-600">Bu ürün için henüz değerlendirme yapılmamış.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="rounded-full bg-primary-100 w-10 h-10 flex items-center justify-center text-primary-700 font-bold mr-3">
                      {review.user?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {review.user?.firstName} {review.user?.lastName?.charAt(0) || ''}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Benzer Ürünler</h2>
          <Swiper
            slidesPerView={1}
            spaceBetween={16}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 }
            }}
            className="pb-8"
          >
            {relatedProducts.map(product => (
              <SwiperSlide key={product.id}>
                <div className="bg-white rounded-lg shadow-card overflow-hidden">
                  <Link to={`/products/${product.id}`}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full aspect-square object-cover"
                    />
                  </Link>
                  <div className="p-4">
                    <Link
                      to={`/products/${product.id}`}
                      className="block text-gray-900 font-semibold hover:text-primary-500 mb-2"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">
                        {product.isOnSale && product.salePrice
                          ? product.salePrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                          : product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </span>
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;