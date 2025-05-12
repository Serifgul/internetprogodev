import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserAddresses, addAddress, updateAddress, deleteAddress } from '../services/userService';
import toast from 'react-hot-toast';

const AddressesPage = () => {
  const { user } = useAuth();
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState({
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
  
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getUserAddresses();
        setAddresses(data);
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError('Adresler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  // Handle address form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
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
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  // Start editing address
  const handleEditAddress = (address) => {
    setFormData({
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phoneNumber: address.phoneNumber || '',
      isDefault: address.isDefault
    });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  // Delete address
  const handleDeleteAddress = async (addressId) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    setDeleting(true);
    
    try {
      await deleteAddress(addressId);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      toast.success('Adres başarıyla silindi');
    } catch (err) {
      console.error('Error deleting address:', err);
      toast.error('Adres silinirken bir hata oluştu');
    } finally {
      setDeleting(false);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    
    try {
      // Validate required fields
      const requiredFields = ['fullName', 'addressLine1', 'city', 'state', 'postalCode', 'country'];
      
      for (const field of requiredFields) {
        if (!formData[field]) {
          toast.error(`Lütfen ${field} alanını doldurun`);
          setSubmitting(false);
          return;
        }
      }
      
      if (editingAddressId) {
        // Update existing address
        const updatedAddress = await updateAddress(editingAddressId, formData);
        setAddresses(prev => prev.map(addr => 
          addr.id === editingAddressId ? updatedAddress : addr
        ));
        toast.success('Adres başarıyla güncellendi');
      } else {
        // Add new address
        const newAddress = await addAddress(formData);
        setAddresses(prev => [...prev, newAddress]);
        toast.success('Adres başarıyla eklendi');
      }
      
      resetForm();
    } catch (err) {
      console.error('Error saving address:', err);
      toast.error('Adres kaydedilirken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Adreslerim</h1>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg mb-6"></div>
          <div className="bg-gray-200 h-48 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Adreslerim</h1>
      
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
                  className="block py-2 px-3 rounded-md bg-primary-50 text-primary-700 font-medium"
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
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-card overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Kayıtlı Adreslerim</h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600"
                  >
                    Yeni Adres Ekle
                  </button>
                )}
              </div>
              
              {/* Address Form */}
              {showAddressForm && (
                <div className="mb-8 border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingAddressId ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          Ad Soyad *
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
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
                          value={formData.phoneNumber}
                          onChange={handleChange}
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
                        value={formData.addressLine1}
                        onChange={handleChange}
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
                        value={formData.addressLine2}
                        onChange={handleChange}
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
                          value={formData.city}
                          onChange={handleChange}
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
                          value={formData.state}
                          onChange={handleChange}
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
                          value={formData.postalCode}
                          onChange={handleChange}
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
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={formData.isDefault}
                          onChange={handleChange}
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
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 mr-2"
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 disabled:opacity-70"
                      >
                        {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Addresses List */}
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Adres Eklenmemiş</h3>
                  <p className="text-gray-600 mb-4">
                    Siparişlerinizin teslimatı için bir adres ekleyin.
                  </p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600"
                  >
                    Adres Ekle
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map(address => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 ${
                        address.isDefault ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">
                          {address.fullName}
                          {address.isDefault && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              Varsayılan
                            </span>
                          )}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-gray-600 hover:text-primary-500"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            disabled={deleting}
                            className="text-gray-600 hover:text-red-500"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-gray-600 text-sm">
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>
                          {address.state}, {address.city}, {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                        {address.phoneNumber && <p className="mt-1">{address.phoneNumber}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressesPage;