import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container py-16">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-9xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">Sayfa Bulunamadı</h2>
        <p className="text-lg text-gray-600 mb-8">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </p>
        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
          <Link
            to="/products"
            className="block w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;