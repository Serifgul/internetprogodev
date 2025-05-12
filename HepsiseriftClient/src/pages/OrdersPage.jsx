import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrders } from '../services/orderService';

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

const OrdersPage = () => {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Siparişler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Siparişlerim</h1>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-16 rounded-lg mb-4"></div>
          <div className="bg-gray-200 h-16 rounded-lg mb-4"></div>
          <div className="bg-gray-200 h-16 rounded-lg mb-4"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Siparişlerim</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Siparişlerim</h1>
        <div className="bg-white p-8 rounded-lg shadow-card text-center">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Henüz Siparişiniz Yok</h2>
          <p className="text-gray-600 mb-6">
            Siparişiniz bulunmamaktadır. Alışverişe başlamak için ürünleri keşfedin.
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
      <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Siparişlerim</h1>
      
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
                  className="block py-2 px-3 rounded-md bg-primary-50 text-primary-700 font-medium"
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
                  className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Favorilerim
                </Link>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Orders List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Tüm Siparişler</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sipariş No
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tutar
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.totalAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link
                            to={`/orders/${order.id}`}
                            className="text-primary-500 hover:text-primary-600"
                          >
                            Detaylar
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;