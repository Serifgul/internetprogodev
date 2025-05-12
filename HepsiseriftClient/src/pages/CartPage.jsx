import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cart, loading, error, updateItem, removeItem, subtotal, cartItemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [updatingItem, setUpdatingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);

  // Shipping cost and total calculation
  const shippingCost = subtotal > 500 ? 0 : 30;
  const total = subtotal + shippingCost;

  // Handle quantity update
  const handleUpdateQuantity = async (cartItemId, quantity) => {
    if (quantity < 1) return;
    
    setUpdatingItem(cartItemId);
    await updateItem(cartItemId, quantity);
    setUpdatingItem(null);
  };

  // Handle item removal
  const handleRemoveItem = async (cartItemId) => {
    setRemovingItem(cartItemId);
    await removeItem(cartItemId);
    toast.success('Ürün sepetten çıkarıldı');
    setRemovingItem(null);
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Lütfen önce giriş yapın');
      navigate('/login');
      return;
    }
    
    if (cart.length === 0) {
      toast.error('Sepetiniz boş');
      return;
    }
    
    navigate('/checkout');
  };

  // Empty cart message
  if (!loading && cart.length === 0) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Alışveriş Sepetim</h1>
        <div className="bg-white p-8 rounded-lg shadow-card text-center">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Sepetiniz Boş</h2>
          <p className="text-gray-600 mb-6">
            Sepetinizde ürün bulunmuyor. Alışverişe devam etmek için ürünleri keşfedin.
          </p>
          <Link
            to="/products"
            className="px-6 py-3 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Alışveriş Sepetim</h1>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-96 rounded-lg mb-6"></div>
          <div className="bg-gray-200 h-48 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Alışveriş Sepetim</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Alışveriş Sepetim</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Sepetteki Ürünler ({cartItemCount})</h2>
              
              {/* Cart Item List */}
              <div className="divide-y divide-gray-200">
                {cart.map(item => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row">
                    {/* Product Image */}
                    <div className="sm:w-24 h-24 flex-shrink-0 mb-4 sm:mb-0">
                      <Link to={`/products/${item.product.id}`}>
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </Link>
                    </div>
                    
                    {/* Product Details */}
                    <div className="sm:ml-4 flex-grow">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div>
                          <Link
                            to={`/products/${item.product.id}`}
                            className="text-gray-900 font-medium hover:text-primary-500"
                          >
                            {item.product.name}
                          </Link>
                          {item.product.category && (
                            <p className="text-gray-500 text-sm">
                              {item.product.category.name}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-2 sm:mt-0 sm:text-right">
                          {item.product.isOnSale && item.product.salePrice ? (
                            <div>
                              <span className="text-accent-500 font-bold">
                                {item.product.salePrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                              </span>
                              <span className="block text-gray-500 text-sm line-through">
                                {item.product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-900 font-bold">
                              {item.product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingItem === item.id}
                            className="px-2 py-1 border border-gray-300 bg-gray-100 rounded-l-md hover:bg-gray-200 disabled:opacity-50"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                            min="1"
                            max={item.product.stockQuantity}
                            className="w-12 text-center border-y border-gray-300 py-1 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stockQuantity || updatingItem === item.id}
                            className="px-2 py-1 border border-gray-300 bg-gray-100 rounded-r-md hover:bg-gray-200 disabled:opacity-50"
                          >
                            +
                          </button>
                          
                          {updatingItem === item.id && (
                            <span className="ml-2 text-sm text-gray-600">Güncelleniyor...</span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removingItem === item.id}
                          className="text-gray-500 hover:text-red-500"
                          aria-label="Remove item"
                        >
                          {removingItem === item.id ? (
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-t-transparent border-red-500"></div>
                          ) : (
                            <TrashIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      
                      {/* Subtotal */}
                      <div className="mt-2 text-right">
                        <span className="text-sm text-gray-600">
                          Toplam: {' '}
                          <span className="font-bold text-gray-900">
                            {((item.product.isOnSale && item.product.salePrice ? item.product.salePrice : item.product.price) * item.quantity).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Sipariş Özeti</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-medium text-gray-900">
                    {subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Kargo</span>
                  {shippingCost > 0 ? (
                    <span className="font-medium text-gray-900">
                      {shippingCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </span>
                  ) : (
                    <span className="font-medium text-green-600">Ücretsiz</span>
                  )}
                </div>
                
                {shippingCost > 0 && (
                  <div className="text-sm text-gray-500">
                    <p>{500 - subtotal} TL daha alışveriş yaparak ücretsiz kargo fırsatından yararlanabilirsiniz.</p>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Toplam</span>
                  <span className="text-lg font-bold text-gray-900">
                    {total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors"
              >
                Ödemeye Geç
              </button>
              
              <div className="mt-4">
                <Link
                  to="/products"
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium flex justify-center"
                >
                  Alışverişe Devam Et
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;