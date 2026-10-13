import { useProducts } from '../context/ProductContext';
import { useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProductLoaderProps {
  children: ReactNode;
}

export default function ProductLoader({ children }: ProductLoaderProps) {
  const { loading, error, refreshProducts } = useProducts();
  const location = useLocation();
  
  // No mostrar loading en el admin
  const isAdminRoute = location.pathname === '/admin';

  if (loading && !isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error && !isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">Error al cargar productos</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={refreshProducts}
            className="bg-[#16A34A] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#15803D] transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
