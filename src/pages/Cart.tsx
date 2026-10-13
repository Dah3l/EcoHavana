import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../lib/storage';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();

  const generateWhatsAppMessage = () => {
    let msg = '🛒 *Nuevo Pedido - EnergíaCuba*\n\n';
    items.forEach((item, i) => {
      msg += `${i + 1}. *${item.product.name}*\n`;
      msg += `   Cantidad: ${item.quantity}\n`;
      msg += `   Precio unitario: $${item.product.price} USD\n`;
      msg += `   Subtotal: $${item.product.price * item.quantity} USD\n\n`;
    });
    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `💰 *Total: $${totalPrice} USD*\n\n`;
    msg += `📍 Enviar a: (indicar dirección)\n`;
    msg += `📞 Contacto: (indicar teléfono)\n`;
    return encodeURIComponent(msg);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="text-gray-300" size={36} />
        </div>
        <h2 className="text-xl font-bold text-[#111827] mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 text-sm mb-6">Añade productos para comenzar tu pedido</p>
        <button
          onClick={() => navigate('/catalogo')}
          className="bg-[#16A34A] text-white px-6 py-3 rounded-full font-medium hover:bg-[#15803D] transition-colors"
        >
          Ir al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Carrito</h1>
          <p className="text-gray-500 text-sm">{items.length} producto{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-500 hover:text-red-700 font-medium"
        >
          Vaciar carrito
        </button>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.product.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img src={resolveImageUrl(item.product.images[0])} alt={item.product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-[#111827] truncate">{item.product.name}</h3>
              <p className="text-[#16A34A] font-bold">${item.product.price} USD</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#111827]">${item.product.price * item.quantity} USD</span>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total & Checkout */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">${totalPrice} USD</span>
        </div>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <span className="text-gray-500">Transporte</span>
          <span className="text-sm text-[#16A34A] font-medium">Según destino</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-bold text-[#111827]">Total</span>
          <span className="text-2xl font-bold text-[#16A34A]">${totalPrice} USD</span>
        </div>
        <a
          href={`https://wa.me/5355072322?text=${generateWhatsAppMessage()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#1da851] transition-colors shadow-lg shadow-[#25D366]/20"
        >
          <MessageCircle size={20} /> Realizar pedido por WhatsApp
        </a>
        <p className="text-center text-xs text-gray-400 mt-3">
          Se abrirá WhatsApp con tu pedido pre-llenado
        </p>
      </div>
    </div>
  );
}
