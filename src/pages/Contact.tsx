import { MessageCircle, Clock, MapPin, Phone, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Contacto</h1>
        <p className="text-gray-500 text-sm">Estamos aquí para ayudarte</p>
      </div>

      {/* WhatsApp CTA */}
      <a
        href="https://wa.me/5355072322"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-[#25D366] rounded-2xl p-6 mb-6 text-white hover:bg-[#1da851] transition-all shadow-lg shadow-[#25D366]/20 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageCircle size={28} />
          </div>
          <div>
            <h2 className="font-bold text-lg">WhatsApp</h2>
            <p className="text-white/80 text-sm">+53 55072322</p>
            <p className="text-white/60 text-xs mt-1">Respuesta rápida • Lun-Sáb</p>
          </div>
        </div>
      </a>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#16A34A]/10 rounded-xl flex items-center justify-center">
              <Clock className="text-[#16A34A]" size={20} />
            </div>
            <h3 className="font-semibold text-[#111827]">Horario</h3>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
            <p>Sábados: 9:00 AM - 2:00 PM</p>
            <p>Domingos: Cerrado</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#16A34A]/10 rounded-xl flex items-center justify-center">
              <MapPin className="text-[#16A34A]" size={20} />
            </div>
            <h3 className="font-semibold text-[#111827]">Zona de entrega</h3>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>La Habana y alrededores</p>
            <p>Envíos a otras provincias</p>
            <p>Consultar disponibilidad</p>
          </div>
        </div>
      </div>

      {/* Additional info */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#16A34A]/10 rounded-xl flex items-center justify-center">
            <Phone className="text-[#16A34A]" size={20} />
          </div>
          <h3 className="font-semibold text-[#111827]">Información adicional</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Todos los precios en USD</p>
          <p>• Garantía en todos los productos</p>
          <p>• Transporte disponible (costo según zona)</p>
          <p>• Asesoría personalizada sin compromiso</p>
          <p>• Métodos de pago: efectivo, transferencia</p>
        </div>
      </div>

      {/* Quick message */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-[#111827] mb-3">Envíanos un mensaje rápido</h3>
        <a
          href={`https://wa.me/5355072322?text=${encodeURIComponent('Hola, necesito información sobre sus productos de energía.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-[#16A34A] text-white hover:bg-[#15803D] transition-colors"
        >
          <Send size={18} /> Escribir por WhatsApp
        </a>
      </div>
    </div>
  );
}
