import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getCategories } from '../../services/categoryService';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  HeartIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Handle scroll event to change header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setIsMobileMenuOpen(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white bg-opacity-95'}`}>
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center mr-2">
              <span className="text-white font-bold">HS</span>
            </div>
            <span className="text-xl font-heading font-bold text-gray-900">HepsiSerift</span>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:block flex-grow mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ne aramıştınız?"
                className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-600 hover:text-primary-500">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <div className="relative group">
              <button 
                className="flex items-center space-x-1 text-gray-800 hover:text-primary-500"
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              >
                <span>Kategoriler</span>
              </button>
              {isCategoryMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products/category/${category.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsCategoryMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/cart" className="relative flex items-center space-x-1 text-gray-800 hover:text-primary-500">
              <ShoppingCartIcon className="w-6 h-6" />
              <span>Sepetim</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 text-gray-800 hover:text-primary-500"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <UserIcon className="w-6 h-6" />
                  <span className="hidden lg:inline-block">{user?.firstName || 'Hesabım'}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Hesabım
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Siparişlerim
                      </Link>
                      <Link
                        to="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Favorilerim
                      </Link>
                      <Link
                        to="/addresses"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Adreslerim
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 text-gray-800 hover:text-primary-500">
                <UserIcon className="w-6 h-6" />
                <span>Giriş Yap</span>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-800 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white">
            {/* Search - Mobile */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ne aramıştınız?"
                className="w-full py-2 pl-4 pr-10 rounded-full border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-600 hover:text-primary-500">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </form>

            {/* Nav Links - Mobile */}
            <nav className="flex flex-col space-y-3 pb-4">
              <div>
                <button 
                  className="flex items-center justify-between w-full py-2 text-gray-800 hover:text-primary-500"
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                >
                  <span>Kategoriler</span>
                  <span>{isCategoryMenuOpen ? '−' : '+'}</span>
                </button>
                {isCategoryMenuOpen && (
                  <div className="mt-2 pl-4 border-l-2 border-gray-200">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products/category/${category.id}`}
                        className="block py-2 text-gray-700 hover:text-primary-500"
                        onClick={() => {
                          setIsCategoryMenuOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link 
                to="/cart" 
                className="flex items-center justify-between py-2 text-gray-800 hover:text-primary-500"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <ShoppingCartIcon className="w-5 h-5" />
                  <span>Sepetim</span>
                </div>
                {cartItemCount > 0 && (
                  <span className="bg-accent-500 text-white text-xs px-2 py-1 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <>
                  <Link 
                    to="/account" 
                    className="flex items-center space-x-2 py-2 text-gray-800 hover:text-primary-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Hesabım</span>
                  </Link>
                  <Link 
                    to="/orders" 
                    className="py-2 text-gray-800 hover:text-primary-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Siparişlerim
                  </Link>
                  <Link 
                    to="/wishlist" 
                    className="flex items-center space-x-2 py-2 text-gray-800 hover:text-primary-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HeartIcon className="w-5 h-5" />
                    <span>Favorilerim</span>
                  </Link>
                  <Link 
                    to="/addresses" 
                    className="py-2 text-gray-800 hover:text-primary-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Adreslerim
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left py-2 text-red-600 hover:text-red-800"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="flex items-center space-x-2 py-2 text-gray-800 hover:text-primary-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Giriş Yap</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;