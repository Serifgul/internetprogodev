import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getUserAddresses, addAddress } from '../services/userService';
import { createOrder } from '../services/orderService';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cart, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Türkiye',
    phoneNumber: '',
    isDefault: false
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Calculate totals
  const shippingCost = subtotal > 500 ? 0 : 30;
  const total = subtotal + shippingCost;

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getUserAddresses();
        setAddresses(data);
        
        // Select default address if available
        const defaultAddress = data.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (data.length > 0) {
          setSelectedAddressId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError('Adresler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  // Handle new address form input changes
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add new address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    
    try {
      const requiredFields = ['fullName', 'addressLine1', 'city', 'state', 'postalCode', 'country'];
      
      for (const field of requiredFields) {
        if (!newAddress[field]) {
          toast.error(`Lütfen ${field} alanını doldurun`);
          return;
        }
      }
      
      const addedAddress = await addAddress(newAddress);
      setAddresses(prev => [...prev, addedAddress]);
      setSelectedAddressId(addedAddress.id);
      setShowAddressForm(false);
      toast.success('Adres başarıyla eklendi');
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Adres eklenirken bir hata oluştu');
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Lütfen bir teslimat adresi seçin');
      return;
    }
    
    if (!paymentMethod) {
      toast.error('Lütfen bir ödeme yöntemi seçin');
      return;
    }
    
    if (cart.length === 0) {
      toast.error('Sepetiniz boş');
      navigate('/cart');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // In a real app, you would first process payment and then create the order
      // Here we're just creating the order directly
      const orderData = {
        shippingAddressId: selectedAddressId,
        paymentMethod,
        // In a real implementation, you would include paymentId from the payment processor
        paymentId: 'demo-payment-' + Date.now()
      };
      
      const order = await createOrder(orderData);
      
      // Clear the cart
      await clearCart();
      
      // Redirect to order confirmation
      toast.success('Siparişiniz başarıyla oluşturuldu!');
      navigate(`/orders/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (cart.length === 0 && !loading) {
      navigate('/cart');
    }
  }, [cart, loading, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Ödeme</h1>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-96 rounded-lg mb-6"></div>
          <div className="bg-gray-200 h-48 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Ödeme</h1>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Form */}
        <div className="lg:w-2/3">
          {/* Shipping Address Section */}
          <div className="bg-white rounded-lg shadow-card overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Teslimat Adresi</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                >
                  {showAddressForm ? 'İptal' : '+ Yeni Adres Ekle'}
                </button>
              </div>
              
              {/* Address Form */}
              {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={newAddress.fullName}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={newAddress.phoneNumber}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                      Adres Satırı 1 *
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      value={newAddress.addressLine1}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                      Adres Satırı 2
                    </label>
                    <input
                      type="text"
                      id="addressLine2"
                      name="addressLine2"
                      value={newAddress.addressLine2}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Şehir *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={newAddress.city}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        İlçe *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={newAddress.state}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Posta Kodu *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={newAddress.postalCode}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Ülke *
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={newAddress.country}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={newAddress.isDefault}
                        onChange={handleAddressChange}
                        className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Varsayılan adres olarak belirle
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 mr-2"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600"
                    >
                      Adresi Kaydet
                    </button>
                  </div>
                </form>
              ) : addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Kayıtlı adresiniz bulunmamaktadır.</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600"
                  >
                    Adres Ekle
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map(address => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer ${
                        selectedAddressId === address.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                      onClick={() => setSelectedAddressId(address.id)}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 mt-1"
                        />
                        <div className="ml-3">
                          <p className="font-medium">
                            {address.fullName}
                            {address.isDefault && (
                              <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                Varsayılan
                              </span>
                            )}
                          </p>
                          <p className="text-gray-600 text-sm">{address.addressLine1}</p>
                          {address.addressLine2 && (
                            <p className="text-gray-600 text-sm">{address.addressLine2}</p>
                          )}
                          <p className="text-gray-600 text-sm">
                            {address.state}, {address.city}, {address.postalCode}
                          </p>
                          <p className="text-gray-600 text-sm">{address.country}</p>
                          {address.phoneNumber && (
                            <p className="text-gray-600 text-sm">{address.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Payment Method Section */}
          <div className="bg-white rounded-lg shadow-card overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ödeme Yöntemi</h2>
              
              <div className="space-y-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer ${
                    paymentMethod === 'creditCard'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => setPaymentMethod('creditCard')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="creditCard"
                      checked={paymentMethod === 'creditCard'}
                      onChange={() => setPaymentMethod('creditCard')}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="font-medium">Kredi Kartı / Banka Kartı</p>
                      <p className="text-gray-600 text-sm">
                        Tüm kredi kartları ve banka kartları ile güvenli ödeme yapabilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div
                  className={`border rounded-lg p-4 cursor-pointer ${
                    paymentMethod === 'payAtDoor'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => setPaymentMethod('payAtDoor')}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="payAtDoor"
                      checked={paymentMethod === 'payAtDoor'}
                      onChange={() => setPaymentMethod('payAtDoor')}
                      className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="font-medium">Kapıda Ödeme</p>
                      <p className="text-gray-600 text-sm">
                        Siparişinizi teslim alırken nakit veya kredi kartı ile ödeyebilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Information (Credit Card) */}
          {paymentMethod === 'creditCard' && (
            <div className="bg-white rounded-lg shadow-card overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Kart Bilgileri</h2>
                
                <form className="space-y-4">
                  <div>
                    <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                      Kart Üzerindeki İsim
                    </label>
                    <input
                      type="text"
                      id="cardHolder"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Kart üzerindeki ismi giriniz"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Kart Numarası
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Son Kullanma Tarihi
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV/CVC
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </form>
                
                <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Not:</strong> Bu bir demo uygulamasıdır. Gerçek kart bilgilerinizi girmeyiniz.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-card overflow-hidden sticky top-20">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Sipariş Özeti</h2>
              
              {/* Order Items */}
              <div className="mb-4 max-h-60 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center py-2 border-b border-gray-200 last:border-b-0">
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                      <p className="text-gray-900 font-medium">{item.product.name}</p>
                      <p className="text-gray-500 text-sm">
                        {item.quantity} x{' '}
                        {(item.product.isOnSale && item.product.salePrice
                          ? item.product.salePrice
                          : item.product.price
                        ).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {((item.product.isOnSale && item.product.salePrice
                          ? item.product.salePrice
                          : item.product.price) * item.quantity
                        ).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Totals */}
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
                
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Toplam</span>
                  <span className="text-lg font-bold text-gray-900">
                    {total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </span>
                </div>
              </div>
              
              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={submitting || !selectedAddressId || !paymentMethod}
                className="w-full py-3 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? 'İşleniyor...' : 'Siparişi Tamamla'}
              </button>
              
              <div className="mt-4 text-sm text-gray-500 text-center">
                <p>
                  "Siparişi Tamamla" düğmesine tıklayarak, şartları ve koşulları kabul etmiş olursunuz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;