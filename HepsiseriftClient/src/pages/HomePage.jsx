import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { getCategories } from '../services/categoryService';
import { getFeaturedProducts, getOnSaleProducts } from '../services/productService';
import ProductGrid from '../components/products/ProductGrid';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [onSaleProducts, setOnSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [categoriesData, featuredData, onSaleData] = await Promise.all([
          getCategories(),
          getFeaturedProducts(),
          getOnSaleProducts()
        ]);
        
        setCategories(categoriesData);
        setFeaturedProducts(featuredData);
        setOnSaleProducts(onSaleData);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hero banner slides
  const heroSlides = [
    {
      id: 1,
      image: 'https://source.unsplash.com/random/1600x500/?electronics',
      title: 'En İyi Elektronik Ürünler',
      description: 'Yeni teknolojiler ve fırsatlarla dolu elektronik ürünler',
      buttonText: 'Alışverişe Başla',
      buttonLink: '/products/category/1'
    },
    {
      id: 2,
      image: 'https://source.unsplash.com/random/1600x500/?fashion',
      title: 'Moda Trendleri',
      description: 'Yeni sezon ürünleri ile stilinizi yenileyin',
      buttonText: 'Keşfet',
      buttonLink: '/products/category/2'
    },
    {
      id: 3,
      image: 'https://source.unsplash.com/random/1600x500/?home',
      title: 'Ev & Yaşam',
      description: 'Eviniz için ihtiyacınız olan her şey burada',
      buttonText: 'İncele',
      buttonLink: '/products/category/4'
    }
  ];

  // Display error if loading fails
  if (error) {
    return (
      <div className="container py-12">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Slider */}
      <section className="mb-12">
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="hero-swiper"
        >
          {heroSlides.map(slide => (
            <SwiperSlide key={slide.id}>
              <div className="relative h-[300px] md:h-[400px] lg:h-[500px]">
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <div className="max-w-3xl mx-auto">
                    <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
                      {slide.title}
                    </h1>
                    <p className="text-white text-base md:text-lg mb-6 animate-slide-up">
                      {slide.description}
                    </p>
                    <Link
                      to={slide.buttonLink}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-lg transition-colors animate-slide-up"
                    >
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Categories */}
      <section className="container mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-gray-900">Kategoriler</h2>
          <Link to="/products" className="text-primary-500 hover:text-primary-600 font-medium">
            Tümünü Gör
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg aspect-square mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          console.log("Categories:", categories);s
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/products/category/${category.id}`}
                className="block group"
              >
                <div className="overflow-hidden rounded-lg mb-2 bg-gray-100 aspect-square">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-center text-gray-800 font-medium group-hover:text-primary-500 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="container mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-gray-900">Öne Çıkan Ürünler</h2>
          <Link to="/products" className="text-primary-500 hover:text-primary-600 font-medium">
            Tümünü Gör
          </Link>
        </div>
        
        <ProductGrid products={featuredProducts} loading={loading} />
      </section>

      {/* Sale Banner */}
      <section className="container mb-12">
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row items-center">
            <div className="p-8 md:p-12 md:w-1/2">
              <h2 className="text-white text-2xl md:text-3xl font-bold mb-4">
                İndirim Fırsatları
              </h2>
              <p className="text-white text-opacity-90 mb-6">
                Büyük yaz indirimi başladı! Sezon ürünlerinde %50'ye varan indirimler sizi bekliyor. Fırsatları kaçırmayın!
              </p>
              <Link
                to="/products"
                className="inline-block bg-white text-primary-500 hover:text-primary-600 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Fırsatları Keşfet
              </Link>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://source.unsplash.com/random/600x400/?sale"
                alt="İndirim Fırsatları"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* On Sale Products */}
      <section className="container mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-gray-900">İndirimli Ürünler</h2>
          <Link to="/products" className="text-primary-500 hover:text-primary-600 font-medium">
            Tümünü Gör
          </Link>
        </div>
        
        <ProductGrid products={onSaleProducts} loading={loading} />
      </section>

      {/* Features */}
      <section className="container mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-card text-center">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Hızlı Teslimat</h3>
            <p className="text-gray-600">Siparişleriniz aynı gün kargoya verilir ve en hızlı şekilde size ulaştırılır.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-card text-center">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Güvenli Ödeme</h3>
            <p className="text-gray-600">Tüm ödeme işlemleriniz güvenli bir şekilde gerçekleştirilir.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-card text-center">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Kolay İade</h3>
            <p className="text-gray-600">14 gün içerisinde koşulsuz iade garantisi ile güvenle alışveriş yapın.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-card text-center">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">7/24 Destek</h3>
            <p className="text-gray-600">Müşteri hizmetlerimiz 7 gün 24 saat size yardımcı olmak için hazır.</p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mb-12">
        <div className="bg-gray-100 rounded-lg p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Fırsatlardan Haberdar Olun
            </h2>
            <p className="text-gray-600 mb-6">
              Yeni ürünler, özel indirimler ve kampanyalardan ilk siz haberdar olmak için bültenimize kaydolun.
            </p>
            <form className="flex flex-col md:flex-row gap-2">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
              >
                Abone Ol
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;