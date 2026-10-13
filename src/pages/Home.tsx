import { useNavigate } from 'react-router-dom';
import { Zap, Shield, Truck, ArrowRight, Battery, Sun, Settings, Package } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCategories } from '../context/CategoryContext';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../lib/storage';
import { FeaturedGridSkeleton, CategoryCardSkeleton } from '../components/Skeletons';

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  // Productos destacados: prioriza los marcados como featured, luego isNew y offer
  const featured = products
    .filter(p => p.featured || p.isNew || p.offer)
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    })
    .slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#111827] text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#16A34A] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#16A34A] rounded-full blur-[150px]"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-[#16A34A]" size={24} />
            <span className="text-[#16A34A] font-medium text-sm uppercase tracking-wider">EcoHavana</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Energía para tu hogar,<br />
            <span className="text-[#22C55E]">sin apagones</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-xl">
            Estaciones de energía, plantas eléctricas y paneles solares. Soluciones completas para mantener tu hogar funcionando.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/catalogo')}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all shadow-lg shadow-[#16A34A]/30"
            >
              Ver catálogo <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/contacto')}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-medium backdrop-blur transition-all border border-white/20"
            >
              Contáctanos
            </button>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-md">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#22C55E]">14+</div>
              <div className="text-xs text-gray-400">Productos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#22C55E]">24h</div>
              <div className="text-xs text-gray-400">Entrega</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#22C55E]">100%</div>
              <div className="text-xs text-gray-400">Garantía</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-[#16A34A]/10 rounded-xl flex items-center justify-center">
              <Shield className="text-[#16A34A]" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827]">Garantía</h3>
              <p className="text-sm text-gray-500">En todos los productos</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-[#16A34A]/10 rounded-xl flex items-center justify-center">
              <Truck className="text-[#16A34A]" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827]">Transporte</h3>
              <p className="text-sm text-gray-500">Entrega a domicilio</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-[#16A34A]/10 rounded-xl flex items-center justify-center">
              <Zap className="text-[#16A34A]" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-[#111827]">Soporte</h3>
              <p className="text-sm text-gray-500">WhatsApp directo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <h2 className="text-2xl font-bold text-[#111827] mb-6">Categorías</h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const icons: Record<string, any> = {
                estaciones: Battery,
                plantas: Settings,
                paneles: Sun,
                combos: Package,
              };
              const Icon = icons[cat.slug] || Zap;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/catalogo?cat=${cat.slug}`)}
                  className="bg-white rounded-2xl p-5 text-left hover:shadow-md transition-all group border border-transparent hover:border-[#16A34A]/20"
                >
                  <div className="w-10 h-10 bg-[#16A34A]/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#16A34A]/20 transition-colors text-xl">
                    {cat.icon}
                  </div>
                  <h3 className="font-semibold text-[#111827] text-sm">{cat.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {products.filter(p => p.category === cat.slug).length} productos
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#111827]">Destacados</h2>
          <button onClick={() => navigate('/catalogo')} className="text-[#16A34A] text-sm font-medium flex items-center gap-1">
            Ver todos <ArrowRight size={14} />
          </button>
        </div>
        {loading ? (
          <FeaturedGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="relative h-40 bg-gray-100 overflow-hidden">
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
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-[#111827] mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-[#16A34A] font-bold text-lg">${product.price} USD</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/producto/${product.id}`)}
                      className="flex-1 text-xs bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Ver más
                    </button>
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 text-xs bg-[#16A34A] text-white py-2 rounded-lg hover:bg-[#15803D] transition-colors"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
