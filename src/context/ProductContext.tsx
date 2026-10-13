import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { products as initialProducts, Product } from '../data/products';
import { resolveImageUrl } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const PRODUCTS_STORAGE_KEY = 'energicuba_products';

interface ProductContextType {
  products: Product[];
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Cargar productos desde Supabase o localStorage
const loadProducts = async (): Promise<Product[]> => {
  // Intentar cargar desde Supabase primero
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            slug
          )
        `);
      
      if (!error && data && data.length > 0) {
        // Mapear datos de Supabase al formato de Product
        const supabaseProducts = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description || '',
          price: row.price,
          category: row.categories?.slug || 'estaciones',
          specs: row.specs || [],
          images: row.images || [],
          warranty: row.warranty || '',
          transport: row.transport || '',
          offer: row.is_offer || false,
          isNew: row.is_new || false,
          featured: row.is_featured || false,
          visible: row.is_visible !== false,
        }));
      }
    } catch (err) {
      console.warn('Error loading from Supabase, falling back to localStorage:', err);
    }
  } else {
    console.log('⚠️ Supabase not configured');
  }

  // Fallback: cargar desde localStorage
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
  
  // Si no hay datos guardados, usar productos iniciales
  return initialProducts;
};

// Guardar productos en localStorage (fallback)
const saveProductsToLocal = (products: Product[]) => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products to localStorage:', e);
  }
};

// Guardar producto en Supabase
const saveProductToSupabase = async (product: Product, isNew: boolean = false) => {
  if (!isSupabaseConfigured()) return;

  try {
    // Obtener el category_id
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', product.category)
      .single();

    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: categoryData?.id,
      specs: product.specs,
      images: product.images,
      warranty: product.warranty,
      transport: product.transport,
      is_offer: product.offer,
      is_new: product.isNew,
      is_featured: product.featured,
      is_visible: product.visible,
    };

    if (isNew) {
      const { error } = await supabase.from('products').insert({ ...productData, id: product.id });
      if (error) throw error;
    } else {
      const { error } = await supabase.from('products').update(productData).eq('id', product.id);
      if (error) throw error;
    }
  } catch (err) {
    console.warn('Error saving to Supabase:', err);
  }
};

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos al montar
  useEffect(() => {
    loadProducts().then((loaded) => {
      setProducts(loaded);
      setLoading(false);
    });
  }, []);

  // Persistir cambios en localStorage (fallback)
  useEffect(() => {
    if (products.length > 0) {
      saveProductsToLocal(products);
    }
  }, [products]);

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === id ? { ...p, ...updates } : p));
      const updatedProduct = updated.find(p => p.id === id);
      if (updatedProduct) {
        saveProductToSupabase(updatedProduct, false);
      }
      return updated;
    });
  };

  const addProduct = async (product: Product) => {
    setProducts(prev => [...prev, product]);
    await saveProductToSupabase(product, true);
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Error deleting from Supabase:', err);
      }
    }
  };

  const getProduct = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{ products, updateProduct, addProduct, deleteProduct, getProduct, loading }}>
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
