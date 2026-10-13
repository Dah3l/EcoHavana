import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { products as initialProducts, Product } from '../data/products';
import { resolveImageUrl } from '../lib/storage';

const PRODUCTS_STORAGE_KEY = 'energicuba_products';

interface ProductContextType {
  products: Product[];
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Cargar productos desde localStorage o usar iniciales
const loadProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Product[];
      // Merge: mantener productos iniciales + añadir/modificar los guardados
      const storedMap = new Map(parsed.map(p => [p.id, p]));
      return initialProducts.map(p => storedMap.get(p.id) || p);
    }
  } catch (e) {
    console.error('Error loading products from localStorage:', e);
  }
  return initialProducts;
};

// Guardar productos en localStorage
const saveProducts = (products: Product[]) => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products to localStorage:', e);
  }
};

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(loadProducts);

  // Persistir cambios
  useEffect(() => {
    saveProducts(products);
  }, [products]);

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProduct = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{ products, updateProduct, addProduct, deleteProduct, getProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within ProductProvider');
  return context;
}

// Hook para resolver URLs de imágenes
export function useResolvedImages(images: string[]): string[] {
  return images.map(resolveImageUrl);
}
