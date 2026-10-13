import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { categories, categoryNames } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../lib/storage';

export default function Catalog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { products } = useProducts();
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
  }, [category, showOffersOnly, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Catálogo</h1>
        <p className="text-gray-500 text-sm">Encuentra la solución energética ideal</p>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2.5 rounded-xl border transition-colors ${
            showFilters ? 'bg-[#16A34A] text-white border-[#16A34A]' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#111827]">Filtros</span>
            <button
              onClick={() => { setCategory('all'); setShowOffersOnly(false); }}
              className="text-xs text-[#16A34A] font-medium"
            >
              Limpiar
            </button>
          </div>
          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === cat.id
                    ? 'bg-[#16A34A] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
          {/* Offers toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOffersOnly}
              onChange={(e) => setShowOffersOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#16A34A] focus:ring-[#16A34A]"
            />
            <span className="text-sm text-gray-700">Solo ofertas</span>
          </label>
        </div>
      )}

      {/* Category quick filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              category === cat.id
                ? 'bg-[#16A34A] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#16A34A]/30'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No se encontraron productos</p>
          <p className="text-gray-400 text-sm">Intenta con otros filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div
                className="relative h-44 bg-gray-100 overflow-hidden cursor-pointer"
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
                  <span className="absolute top-2 left-2 bg-[#16A34A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    NUEVO
                  </span>
                )}
                <span className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[10px] font-medium px-2 py-0.5 rounded-full text-gray-600">
                  {categoryNames[product.category]}
                </span>
              </div>
              <div className="p-4">
                <h3
                  className="font-semibold text-[#111827] mb-1 cursor-pointer hover:text-[#16A34A] transition-colors line-clamp-2"
                  onClick={() => navigate(`/producto/${product.id}`)}
                >
                  {product.name}
                </h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {product.specs.slice(0, 2).map((spec, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {spec}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[#16A34A] font-bold text-lg">${product.price} USD</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-[#16A34A] text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-[#15803D] transition-colors"
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
