import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Shield, Truck, Check } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCategories } from '../context/CategoryContext';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../lib/storage';
import { ProductDetailSkeleton } from '../components/Skeletons';
import { useState, useMemo } from 'react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getProduct, loading } = useProducts();
  const { categories } = useCategories();
  const [added, setAdded] = useState(false);

  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(cat => {
      map[cat.slug] = cat.name;
    });
    return map;
  }, [categories]);

  const product = getProduct(id || '');

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 dark:text-slate-400 text-lg">Producto no encontrado</p>
        <button onClick={() => navigate('/catalogo')} className="mt-4 text-[#16A34A] dark:text-[#22C55E] font-medium">
          Volver al catálogo
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-500 dark:text-slate-400 hover:text-[#111827] dark:hover:text-slate-200 mb-4 text-sm transition-colors"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="bg-white dark:bg-[#151B24] rounded-2xl overflow-hidden aspect-square border border-transparent dark:border-white/10">
            <img
              src={resolveImageUrl(product.images[0])}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.offer && (
            <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              🔥 OFERTA ESPECIAL
            </span>
          )}
          {product.isNew && (
            <span className="inline-block bg-[#16A34A] dark:bg-[#22C55E] text-white text-xs font-bold px-3 py-1 rounded-full ml-2">
              ✨ NUEVO
            </span>
          )}
        </div>

        <div>
          <span className="text-xs font-medium text-[#16A34A] dark:text-[#22C55E] uppercase tracking-wider">
            {categoryNameMap[product.category] || product.category}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827] dark:text-slate-100 mt-1 mb-2">{product.name}</h1>
          <p className="text-3xl font-bold text-[#16A34A] dark:text-[#22C55E] mb-4">${product.price} <span className="text-base font-normal text-gray-400 dark:text-slate-500">USD</span></p>
          <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-6">{product.description}</p>

          <div className="bg-white dark:bg-[#151B24] rounded-2xl p-4 mb-4 border border-transparent dark:border-white/10 transition-colors">
            <h3 className="font-semibold text-[#111827] dark:text-slate-100 mb-3 text-sm">Especificaciones</h3>
            <div className="space-y-2">
              {product.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={14} className="text-[#16A34A] dark:text-[#22C55E] flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-slate-300">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white dark:bg-[#151B24] rounded-xl p-3 flex items-center gap-2 border border-transparent dark:border-white/10 transition-colors">
              <Shield size={18} className="text-[#16A34A] dark:text-[#22C55E]" />
              <div>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase">Garantía</p>
                <p className="text-xs font-medium text-[#111827] dark:text-slate-200">{product.warranty}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#151B24] rounded-xl p-3 flex items-center gap-2 border border-transparent dark:border-white/10 transition-colors">
              <Truck size={18} className="text-[#16A34A] dark:text-[#22C55E]" />
              <div>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase">Transporte</p>
                <p className="text-xs font-medium text-[#111827] dark:text-slate-200">{product.transport}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              added
                ? 'bg-green-100 dark:bg-green-900/30 text-[#16A34A] dark:text-[#22C55E] border border-[#16A34A] dark:border-[#22C55E]'
                : 'bg-[#16A34A] dark:bg-[#22C55E] text-white hover:bg-[#15803D] dark:hover:bg-[#16A34A] shadow-lg shadow-[#16A34A]/20 dark:shadow-[#22C55E]/20'
            }`}
          >
            {added ? (
              <>✓ Añadido al carrito</>
            ) : (
              <><ShoppingCart size={18} /> Añadir al carrito</>
            )}
          </button>

          <a
            href={`https://wa.me/5355072322?text=${encodeURIComponent(`Hola, me interesa el producto: ${product.name} ($${product.price} USD)`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-3 py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#1da851] transition-colors"
          >
            💬 Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
