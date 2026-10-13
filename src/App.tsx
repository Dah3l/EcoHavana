import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { ThemeProvider } from './context/ThemeContext';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import ProductLoader from './components/ProductLoader';
import Onboarding from './components/Onboarding';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import Offers from './pages/Offers';
import Admin from './pages/Admin';

function AppLayout() {
  const location = useLocation();
  const hideNav = location.pathname === '/admin';

  return (
    <>
      <ScrollToTop />
      <Onboarding />
      <div className={`min-h-screen bg-[#F3F4F6] dark:bg-[#0B0F14] transition-colors duration-300 ${hideNav ? '' : 'pb-24'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/ofertas" element={<Offers />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        {!hideNav && <BottomNav />}
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <CategoryProvider>
          <ProductProvider>
            <CartProvider>
              <ProductLoader>
                <AppLayout />
              </ProductLoader>
            </CartProvider>
          </ProductProvider>
        </CategoryProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
