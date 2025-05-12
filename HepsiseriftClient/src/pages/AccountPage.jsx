import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { changePassword } from '../services/authService';
import toast from 'react-hot-toast';

const AccountPage = () => {
  const { user, logout } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getUserProfile();
        setProfile(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber || ''
        });
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Profil bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    setUpdating(true);
    
    try {
      const updatedProfile = await updateUserProfile(formData);
      setProfile(updatedProfile);
      setEditMode(false);
      toast.success('Profil bilgileriniz güncellendi');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Profil güncellenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Şifre en az 8 karakter olmalıdır');
      return;
    }
    
    setChangingPassword(true);
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setChangePasswordMode(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Şifreniz başarıyla değiştirildi');
    } catch (err) {
      console.error('Error changing password:', err);
      
      if (err.message) {
        toast.error(err.message);
      } else {
        toast.error('Şifre değiştirilirken bir hata oluştu');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    toast.success('Çıkış yapıldı');
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Hesabım</h1>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg mb-6"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Hesabım</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6">Hesabım</h1>
      
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
                  className="block py-2 px-3 rounded-md bg-primary-50 text-primary-700 font-medium"
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
                  className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Favorilerim
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 px-3 rounded-md text-red-600 hover:bg-red-50"
                >
                  Çıkış Yap
                </button>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Hesap Bilgilerim</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                  >
                    Düzenle
                  </button>
                )}
              </div>
              
              {editMode ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Ad
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Soyad
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleProfileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta Adresi
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profile.email}
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                      disabled
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      E-posta adresinizi değiştirmek için müşteri hizmetleriyle iletişime geçin.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon Numarası
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          firstName: profile.firstName,
                          lastName: profile.lastName,
                          phoneNumber: profile.phoneNumber || ''
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 mr-2"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 disabled:opacity-70"
                    >
                      {updating ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Ad</h3>
                      <p className="mt-1">{profile.firstName}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Soyad</h3>
                      <p className="mt-1">{profile.lastName}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">E-posta Adresi</h3>
                    <p className="mt-1">{profile.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Telefon Numarası</h3>
                    <p className="mt-1">{profile.phoneNumber || '-'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Üyelik Tarihi</h3>
                    <p className="mt-1">
                      {new Date(profile.registeredAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Password Section */}
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Şifre</h2>
                {!changePasswordMode && (
                  <button
                    onClick={() => setChangePasswordMode(true)}
                    className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                  >
                    Şifre Değiştir
                  </button>
                )}
              </div>
              
              {changePasswordMode ? (
                <form onSubmit={handleChangePassword}>
                  <div className="mb-4">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Mevcut Şifre
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Şifreniz en az 8 karakter uzunluğunda olmalıdır.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Yeni Şifre Tekrar
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setChangePasswordMode(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 mr-2"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="px-4 py-2 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 disabled:opacity-70"
                    >
                      {changingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-600">
                  Şifrenizi değiştirmek için "Şifre Değiştir" düğmesine tıklayın.
                </p>
              )}
            </div>
          </div>
          
          {/* Account Links */}
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Hesap Yönetimi</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium">Siparişlerim</h3>
                    <p className="text-sm text-gray-600">Önceki siparişlerinizi görüntüleyin</p>
                  </div>
                  <Link to="/orders" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                    Görüntüle
                  </Link>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium">Adreslerim</h3>
                    <p className="text-sm text-gray-600">Kayıtlı adreslerinizi yönetin</p>
                  </div>
                  <Link to="/addresses" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                    Yönet
                  </Link>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium">Favorilerim</h3>
                    <p className="text-sm text-gray-600">Favori ürünlerinizi görüntüleyin</p>
                  </div>
                  <Link to="/wishlist" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                    Görüntüle
                  </Link>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium text-red-600">Hesabı Kapat</h3>
                    <p className="text-sm text-gray-600">Hesabınızı kalıcı olarak kapatın</p>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Hesabı Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;