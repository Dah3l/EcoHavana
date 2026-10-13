import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCategories } from '../context/CategoryContext';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../lib/storage';
import { ProductGridSkeleton } from '../components/Skeletons';

export default function Catalog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('cat') || 'all');
  const [showOffersOnly, setShowOffersOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (!p.visible) return false;
      if (category !== 'all' && p.category !== category) return false;
      if (showOffersOnly && !p.offer) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && 
          !p.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, category, showOffersOnly, search]);

  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(cat => {
      map[cat.slug] = cat.name;
    });
    return map;
  }, [categories]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827] dark:text-slate-100">Catálogo</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">Encuentra la solución energética ideal</p>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#151B24] rounded-xl border border-gray-200 dark:border-white/10 text-sm text-[#111827] dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#16A34A] dark:focus:border-[#22C55E] focus:ring-1 focus:ring-[#16A34A]/20 dark:focus:ring-[#22C55E]/20 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2.5 rounded-xl border transition-colors ${
            showFilters 
              ? 'bg-[#16A34A] dark:bg-[#22C55E] text-white border-[#16A34A] dark:border-[#22C55E]' 
              : 'bg-white dark:bg-[#151B24] text-gray-600 dark:text-slate-400 border-gray-200 dark:border-white/10'
          }`}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-[#151B24] rounded-2xl p-4 mb-4 shadow-sm dark:shadow-none border border-transparent dark:border-white/10 animate-slide-up transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#111827] dark:text-slate-100">Filtros</span>
            <button
              onClick={() => { setCategory('all'); setShowOffersOnly(false); }}
              className="text-xs text-[#16A34A] dark:text-[#22C55E] font-medium"
            >
              Limpiar
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === 'all'
                  ? 'bg-[#16A34A] dark:bg-[#22C55E] text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              ⚡ Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === cat.slug
                    ? 'bg-[#16A34A] dark:bg-[#22C55E] text-white'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOffersOnly}
              onChange={(e) => setShowOffersOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-white/20 text-[#16A34A] dark:text-[#22C55E] focus:ring-[#16A34A] dark:focus:ring-[#22C55E] bg-white dark:bg-[#0B0F14]"
            />
            <span className="text-sm text-gray-700 dark:text-slate-300">Solo ofertas</span>
          </label>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            category === 'all'
              ? 'bg-[#16A34A] dark:bg-[#22C55E] text-white shadow-sm'
              : 'bg-white dark:bg-[#151B24] text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-white/10 hover:border-[#16A34A]/30 dark:hover:border-[#22C55E]/30'
          }`}
        >
          ⚡ Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.slug)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              category === cat.slug
                ? 'bg-[#16A34A] dark:bg-[#22C55E] text-white shadow-sm'
                : 'bg-white dark:bg-[#151B24] text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-white/10 hover:border-[#16A34A]/30 dark:hover:border-[#22C55E]/30'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <ProductGridSkeleton count={9} />
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 dark:text-slate-500 text-lg">No se encontraron productos</p>
          <p className="text-gray-400 dark:text-slate-500 text-sm">Intenta con otros filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
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
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    OFERTA
                  </span>
                )}
                {product.isNew && (
                  <span className="absolute top-2 left-2 bg-[#16A34A] dark:bg-[#22C55E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    NUEVO
                  </span>
                )}
                <span className="absolute top-2 right-2 bg-white/90 dark:bg-[#151B24]/90 backdrop-blur text-[10px] font-medium px-2 py-0.5 rounded-full text-gray-600 dark:text-slate-400 border border-transparent dark:border-white/10">
                  {categoryNameMap[product.category] || product.category}
                </span>
              </div>
              <div className="p-4">
                <h3
                  className="font-semibold text-[#111827] dark:text-slate-100 mb-1 cursor-pointer hover:text-[#16A34A] dark:hover:text-[#22C55E] transition-colors line-clamp-2"
                  onClick={() => navigate(`/producto/${product.id}`)}
                >
                  {product.name}
                </h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {product.specs.slice(0, 2).map((spec, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                      {spec}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[#16A34A] dark:text-[#22C55E] font-bold text-lg">${product.price} USD</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-[#16A34A] dark:bg-[#22C55E] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#15803D] dark:hover:bg-[#16A34A] transition-colors"
                  >
                    Añadir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
