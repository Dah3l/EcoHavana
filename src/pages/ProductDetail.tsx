import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Shield, Truck, Check } from 'lucide-react';
import { categoryNames } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../lib/storage';
import { ProductDetailSkeleton } from '../components/Skeletons';
import { useState } from 'react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { getProduct, loading } = useProducts();
  const [added, setAdded] = useState(false);

  const product = getProduct(id || '');

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg">Producto no encontrado</p>
        <button onClick={() => navigate('/catalogo')} className="mt-4 text-[#16A34A] font-medium">
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
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-500 hover:text-[#111827] mb-4 text-sm"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl overflow-hidden aspect-square">
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
            <span className="inline-block bg-[#16A34A] text-white text-xs font-bold px-3 py-1 rounded-full ml-2">
              ✨ NUEVO
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-xs font-medium text-[#16A34A] uppercase tracking-wider">
            {categoryNames[product.category]}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827] mt-1 mb-2">{product.name}</h1>
          <p className="text-3xl font-bold text-[#16A34A] mb-4">${product.price} <span className="text-base font-normal text-gray-400">USD</span></p>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

          {/* Specs */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <h3 className="font-semibold text-[#111827] mb-3 text-sm">Especificaciones</h3>
            <div className="space-y-2">
              {product.specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={14} className="text-[#16A34A] flex-shrink-0" />
                  <span className="text-sm text-gray-700">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warranty & Transport */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-xl p-3 flex items-center gap-2">
              <Shield size={18} className="text-[#16A34A]" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Garantía</p>
                <p className="text-xs font-medium text-[#111827]">{product.warranty}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 flex items-center gap-2">
              <Truck size={18} className="text-[#16A34A]" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Transporte</p>
                <p className="text-xs font-medium text-[#111827]">{product.transport}</p>
              </div>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              added
                ? 'bg-green-100 text-[#16A34A] border border-[#16A34A]'
                : 'bg-[#16A34A] text-white hover:bg-[#15803D] shadow-lg shadow-[#16A34A]/20'
            }`}
          >
            {added ? (
              <>✓ Añadido al carrito</>
            ) : (
              <><ShoppingCart size={18} /> Añadir al carrito</>
            )}
          </button>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/5355072322?text=${encodeURIComponent(`Hola, me interesa el producto: ${product.name} ($${product.price} USD)`)} `}
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
