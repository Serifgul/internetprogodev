import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOrderById } from '../services/orderService';

const OrderStatusBadge = ({ status }) => {
  let color;
  let label;
  
  switch (status) {
    case 0: // Pending
      color = 'bg-yellow-100 text-yellow-800';
      label = 'Beklemede';
      break;
    case 1: // Processing
      color = 'bg-blue-100 text-blue-800';
      label = 'İşleniyor';
      break;
    case 2: // Shipped
      color = 'bg-indigo-100 text-indigo-800';
      label = 'Kargoya Verildi';
      break;
    case 3: // Delivered
      color = 'bg-green-100 text-green-800';
      label = 'Teslim Edildi';
      break;
    case 4: // Cancelled
      color = 'bg-red-100 text-red-800';
      label = 'İptal Edildi';
      break;
    case 5: // Returned
      color = 'bg-gray-100 text-gray-800';
      label = 'İade Edildi';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
      label = 'Bilinmiyor';
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Sipariş detayları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Sipariş Detayları</h1>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg mb-6"></div>
          <div className="bg-gray-200 h-64 rounded-lg mb-6"></div>
          <div className="bg-gray-200 h-32 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Sipariş Detayları</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p>{error || 'Sipariş bulunamadı'}</p>
          <Link to="/orders" className="mt-4 inline-block text-primary-500 hover:underline">
            Siparişlere Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Sipariş #{order.id}</h1>
        <Link to="/orders" className="text-primary-500 hover:text-primary-600 mt-2 md:mt-0">
          &larr; Siparişlere Dön
        </Link>
      </div>
      
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Sipariş Özeti</h2>
              <p className="text-gray-600">
                Sipariş Tarihi: {new Date(order.orderDate).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              <div className="mb-2">
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-gray-600">
                Ödeme Durumu: {order.isPaid ? (
                  <span className="text-green-600">Ödendi</span>
                ) : (
                  <span className="text-red-600">Ödenmedi</span>
                )}
              </p>
            </div>
          </div>
          
          {/* Order Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Sipariş Durumu</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>
              
              <div className="relative flex items-start mb-4">
                <div className={`absolute left-0 rounded-full h-8 w-8 flex items-center justify-center ${
                  order.status >= 0 ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-12">
                  <h4 className="text-sm font-medium">Sipariş Alındı</h4>
                  <p className="text-xs text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString('tr-TR', { 
                      day: 'numeric',
                      month: 'long', 
                      year: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start mb-4">
                <div className={`absolute left-0 rounded-full h-8 w-8 flex items-center justify-center ${
                  order.status >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}>
                  {order.status >= 1 ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-gray-500">2</span>
                  )}
                </div>
                <div className="ml-12">
                  <h4 className="text-sm font-medium">Sipariş Hazırlanıyor</h4>
                  {order.status >= 1 && (
                    <p className="text-xs text-gray-500">
                      Siparişiniz hazırlanıyor
                    </p>
                  )}
                </div>
              </div>
              
              <div className="relative flex items-start mb-4">
                <div className={`absolute left-0 rounded-full h-8 w-8 flex items-center justify-center ${
                  order.status >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}>
                  {order.status >= 2 ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-gray-500">3</span>
                  )}
                </div>
                <div className="ml-12">
                  <h4 className="text-sm font-medium">Kargoya Verildi</h4>
                  {order.shippedDate && (
                    <p className="text-xs text-gray-500">
                      {new Date(order.shippedDate).toLocaleDateString('tr-TR', { 
                        day: 'numeric',
                        month: 'long', 
                        year: 'numeric'
                      })}
                    </p>
                  )}
                  {order.status >= 2 && order.trackingNumber && (
                    <p className="text-xs text-gray-700 mt-1">
                      Takip No: {order.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className={`absolute left-0 rounded-full h-8 w-8 flex items-center justify-center ${
                  order.status >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200'
                }`}>
                  {order.status >= 3 ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-gray-500">4</span>
                  )}
                </div>
                <div className="ml-12">
                  <h4 className="text-sm font-medium">Teslim Edildi</h4>
                  {order.deliveredDate && (
                    <p className="text-xs text-gray-500">
                      {new Date(order.deliveredDate).toLocaleDateString('tr-TR', { 
                        day: 'numeric',
                        month: 'long', 
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sipariş Edilen Ürünler</h2>
          
          <div className="divide-y divide-gray-200">
            {order.orderItems.map(item => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row">
                <div className="sm:w-24 h-24 flex-shrink-0 mb-4 sm:mb-0">
                  <Link to={`/products/${item.product.id}`}>
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                    />
                  </Link>
                </div>
                
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
                      <p className="text-gray-900 font-bold">
                        {item.unitPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-between">
                    <p className="text-gray-600 text-sm">
                      Miktar: {item.quantity}
                    </p>
                    
                    <p className="text-gray-900 font-medium">
                      Toplam: {item.subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                  </div>
                  
                  {order.status === 3 && ( // Delivered
                    <div className="mt-3">
                      <Link
                        to={`/products/${item.product.id}`}
                        className="text-sm text-primary-500 hover:text-primary-600"
                      >
                        Ürünü Değerlendir
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Shipping & Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Teslimat Adresi</h2>
            
            {order.shippingAddress && (
              <div>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.state}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phoneNumber && (
                  <p className="mt-2">{order.shippingAddress.phoneNumber}</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ödeme Bilgileri</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ödeme Yöntemi</span>
                <span className="font-medium text-gray-900">
                  {order.paymentMethod === 'creditCard' ? 'Kredi Kartı' : 'Kapıda Ödeme'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Ödeme Durumu</span>
                <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                  {order.isPaid ? 'Ödendi' : 'Ödenmedi'}
                </span>
              </div>
              
              {order.isPaid && order.paidDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Ödeme Tarihi</span>
                  <span className="font-medium text-gray-900">
                    {new Date(order.paidDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Sipariş Toplamı</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Ara Toplam</span>
              <span className="font-medium text-gray-900">
                {(order.totalAmount - 30).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Kargo</span>
              <span className="font-medium text-gray-900">
                {(order.totalAmount >= 500 ? 0 : 30).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
            </div>
            
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Toplam</span>
              <span className="text-lg font-bold text-gray-900">
                {order.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </span>
            </div>
          </div>
          
          {order.status === 0 && ( // Pending
            <div className="mt-6">
              <button className="w-full py-2 px-4 border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                Siparişi İptal Et
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;