import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid3X3, Tag, ShoppingCart, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  { path: '/catalogo', label: 'Catálogo', icon: Grid3X3 },
  { path: '/ofertas', label: 'Ofertas', icon: Tag },
  { path: '/carrito', label: 'Carrito', icon: ShoppingCart },
  { path: '/contacto', label: 'Contacto', icon: Phone },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-full shadow-lg shadow-black/10 px-2 py-2 flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/catalogo' && location.pathname.startsWith('/producto/'));
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-[#16A34A] text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {isActive && (
                <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
              )}
              {item.path === '/carrito' && totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  isActive ? 'bg-white text-[#16A34A]' : 'bg-[#16A34A] text-white'
                }`}>
                  {totalItems}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
