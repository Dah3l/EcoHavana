import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid3X3, Tag, ShoppingCart, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useEffect, useState, useRef } from 'react';

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
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const navRef = useRef<HTMLDivElement>(null);

  // Calcular posición del indicador deslizante
  useEffect(() => {
    const activeIndex = navItems.findIndex(
      (item) =>
        location.pathname === item.path ||
        (item.path === '/catalogo' && location.pathname.startsWith('/producto/'))
    );

    if (activeIndex >= 0 && itemRefs.current[activeIndex] && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = itemRefs.current[activeIndex]!.getBoundingClientRect();
      setIndicatorStyle({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
      });
    }
  }, [location.pathname]);

  const handleNavigate = (path: string, index: number) => {
    setPressedIndex(index);
    setTimeout(() => setPressedIndex(null), 300);
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 nav-fade-in">
      <div
        ref={navRef}
        className="relative bg-white/90 backdrop-blur-lg rounded-full shadow-lg shadow-black/10 px-3 py-3 flex items-center gap-2"
      >
        {/* Indicador deslizante (pill verde que se mueve al ítem activo) */}
        <div
          className="absolute top-3 h-10 rounded-full bg-[#16A34A] shadow-md shadow-[#16A34A]/30 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />

        {navItems.map((item, index) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/catalogo' && location.pathname.startsWith('/producto/'));
          const Icon = item.icon;
          const isPressed = pressedIndex === index;

          return (
            <button
              key={item.path}
              ref={(el) => { itemRefs.current[index] = el; }}
              onClick={() => handleNavigate(item.path, index)}
              className={`nav-icon-btn relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-gray-600'
              } ${isPressed ? 'nav-icon-press' : ''}`}
              aria-label={item.label}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="transition-all duration-300"
                style={{
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              />
              {item.path === '/carrito' && totalItems > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 min-w-[18px] min-h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-[#16A34A] badge-pop'
                      : 'bg-[#16A34A] text-white'
                  }`}
                >
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
