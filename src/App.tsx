import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import Offers from './pages/Offers';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-[#F3F4F6]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalog />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/ofertas" element={<Offers />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <BottomNav />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
