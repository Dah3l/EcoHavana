import { useNavigate } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../lib/storage';
import { ProductGridSkeleton } from '../components/Skeletons';

export default function Offers() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  const offerProducts = products.filter(p => p.visible && (p.offer || p.price < 300));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="text-[#16A34A] dark:text-[#22C55E]" size={24} />
          <h1 className="text-2xl font-bold text-[#111827] dark:text-slate-100">Ofertas</h1>
        </div>
        <p className="text-gray-500 dark:text-slate-400 text-sm">Productos con precios especiales</p>
      </div>

      <div className="bg-gradient-to-r from-[#16A34A] dark:from-[#22C55E] to-[#22C55E] dark:to-[#16A34A] rounded-2xl p-6 mb-6 text-white">
        <h2 className="text-xl font-bold mb-1">🔥 Ofertas Especiales</h2>
        <p className="text-white/80 text-sm">Aprovecha nuestros precios reducidos en productos seleccionados</p>
      </div>

      {loading ? (
        <ProductGridSkeleton count={6} />
      ) : offerProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 dark:text-slate-500">No hay ofertas disponibles en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offerProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-[#151B24] rounded-2xl overflow-hidden shadow-sm dark:shadow-none border border-transparent dark:border-white/10 hover:shadow-md dark:hover:border-white/20 transition-all group">
              <div
                className="relative h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/producto/${product.id}`)}
              >
                <img
                  src={resolveImageUrl(product.images[0])}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.offer && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    🔥 REBAJA
                  </span>
                )}
                <span className="absolute top-2 right-2 bg-[#16A34A] dark:bg-[#22C55E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  OFERTA
                </span>
              </div>
              <div className="p-4">
                <h3
                  className="font-semibold text-[#111827] dark:text-slate-100 mb-1 cursor-pointer hover:text-[#16A34A] dark:hover:text-[#22C55E] transition-colors line-clamp-2"
                  onClick={() => navigate(`/producto/${product.id}`)}
                >
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[#16A34A] dark:text-[#22C55E] font-bold text-lg">${product.price} USD</span>
                  {product.offer && (
                    <span className="text-xs text-gray-400 dark:text-slate-500 line-through">
                      ${Math.round(product.price * 1.2)} USD
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{product.transport}</p>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full mt-3 bg-[#16A34A] dark:bg-[#22C55E] text-white text-sm font-medium py-2 rounded-lg hover:bg-[#15803D] dark:hover:bg-[#16A34A] transition-colors"
                >
                  Añadir al carrito
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
