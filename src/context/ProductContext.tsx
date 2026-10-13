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
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Cargar productos desde Supabase o localStorage
const loadProducts = async (): Promise<Product[]> => {
  console.log('Loading products...');
  console.log('Supabase configured:', isSupabaseConfigured());
  
  // Intentar cargar desde Supabase primero
  if (isSupabaseConfigured()) {
    try {
      console.log('Fetching from Supabase...');
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            slug
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`Loaded ${data.length} products from Supabase`);
        // Mapear datos de Supabase al formato de Product
        return data.map((row: any) => ({
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
      } else {
        console.log('No products found in Supabase, using initial products');
      }
    } catch (err) {
      console.error('Error loading from Supabase:', err);
      console.log('Falling back to localStorage...');
    }
  }

  // Fallback: cargar desde localStorage
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Product[];
      console.log(`Loaded ${parsed.length} products from localStorage`);
      
      // Crear un mapa de productos de localStorage
      const storedMap = new Map(parsed.map(p => [p.id, p]));
      
      // Combinar: productos iniciales + productos nuevos de localStorage
      const combined = new Map<string, Product>();
      
      // Agregar productos iniciales (pueden ser sobrescritos por localStorage)
      initialProducts.forEach(p => {
        combined.set(p.id, storedMap.get(p.id) || p);
      });
      
      // Agregar productos nuevos que están en localStorage pero no en initialProducts
      parsed.forEach(p => {
        if (!combined.has(p.id)) {
          combined.set(p.id, p);
        }
      });
      
      return Array.from(combined.values());
    }
  } catch (e) {
    console.error('Error loading products from localStorage:', e);
  }
  
  // Si no hay datos guardados, usar productos iniciales
  console.log('Using initial products');
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
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, skipping save');
    return;
  }

  try {
    console.log(`Saving product to Supabase: ${product.name} (isNew: ${isNew})`);

    // Obtener el category_id
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', product.category)
      .single();

    if (categoryError) {
      console.error('Error fetching category:', categoryError);
      throw new Error(`Category not found: ${product.category}`);
    }

    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: categoryData?.id,
      specs: product.specs,
      images: product.images,
      warranty: product.warranty,
      transport: product.transport,
      is_offer: product.offer || false,
      is_new: product.isNew || false,
      is_featured: product.featured || false,
      is_visible: product.visible !== false,
    };

    if (isNew) {
      // Para nuevos productos, NO incluir el id (Supabase lo genera)
      const { data, error } = await supabase.from('products').insert(productData).select();
      if (error) {
        console.error('Error inserting product:', error);
        throw error;
      }
      console.log('Product inserted successfully:', data);
      return data?.[0]?.id; // Retornar el nuevo ID generado por Supabase
    } else {
      const { error } = await supabase.from('products').update(productData).eq('id', product.id);
      if (error) {
        console.error('Error updating product:', error);
        throw error;
      }
      console.log('Product updated successfully');
    }
  } catch (err) {
    console.error('Error saving to Supabase:', err);
    throw err; // Re-lanzar para que el componente pueda manejarlo
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
    // Actualizar estado local inmediatamente
    setProducts(prev => {
      const updated = prev.map(p => (p.id === id ? { ...p, ...updates } : p));
      return updated;
    });
    
    // Guardar en Supabase
    try {
      const updatedProduct = { ...updates, id } as Product;
      // Necesitamos el producto completo, no solo los updates
      const currentProduct = products.find(p => p.id === id);
      if (currentProduct) {
        const fullProduct = { ...currentProduct, ...updates };
        await saveProductToSupabase(fullProduct, false);
        console.log('Product updated in Supabase');
      }
    } catch (err) {
      console.error('Failed to update product in Supabase:', err);
      // El producto ya está actualizado en el estado local
    }
  };

  const addProduct = async (product: Product) => {
    // Agregar temporalmente al estado
    setProducts(prev => [...prev, product]);
    
    try {
      // Guardar en Supabase y obtener el ID real
      const newId = await saveProductToSupabase(product, true);
      
      // Si Supabase retornó un ID, actualizar el producto en el estado
      if (newId && newId !== product.id) {
        setProducts(prev => 
          prev.map(p => p.id === product.id ? { ...p, id: newId } : p)
        );
      }
      
      console.log('Product added successfully');
    } catch (err) {
      console.error('Failed to add product to Supabase:', err);
      // El producto ya está en el estado local, pero no se guardó en Supabase
      // El usuario verá el producto pero se perderá al recargar
    }
  };

  const deleteProduct = async (id: string) => {
    // Eliminar del estado local inmediatamente
    setProducts(prev => prev.filter(p => p.id !== id));
    
    // Eliminar de Supabase
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          console.error('Error deleting from Supabase:', error);
          throw error;
        }
        console.log('Product deleted from Supabase');
      } catch (err) {
        console.error('Failed to delete product from Supabase:', err);
        // El producto ya está eliminado del estado local
      }
    }
  };

  const getProduct = (id: string) => {
    return products.find(p => p.id === id);
  };

  const refreshProducts = async () => {
    console.log('Refreshing products...');
    setLoading(true);
    try {
      const loaded = await loadProducts();
      setProducts(loaded);
      console.log(`Refreshed: ${loaded.length} products`);
    } catch (err) {
      console.error('Error refreshing products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider value={{ products, updateProduct, addProduct, deleteProduct, getProduct, loading, refreshProducts }}>
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
