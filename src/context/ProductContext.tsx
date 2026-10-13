import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { products as initialProducts, Product } from '../data/products';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const PRODUCTS_STORAGE_KEY = 'energicuba_products';

interface ProductContextType {
  products: Product[];
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  loading: boolean;
  refreshProducts: () => Promise<void>;
  error: string | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Guardar productos en localStorage
const saveToLocalStorage = (products: Product[]) => {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    console.log('💾 Productos guardados en localStorage:', products.length);
  } catch (e) {
    console.error('Error guardando en localStorage:', e);
  }
};

// Cargar productos desde localStorage
const loadFromLocalStorage = (): Product[] | null => {
  try {
    const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (stored) {
      const products = JSON.parse(stored);
      console.log('📦 Productos cargados desde localStorage:', products.length);
      return products;
    }
  } catch (e) {
    console.error('Error cargando desde localStorage:', e);
  }
  return null;
};

// Cargar productos desde Supabase
const loadFromSupabase = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) {
    console.log('⚠️ Supabase no configurado');
    return [];
  }

  try {
    console.log('🌐 Cargando productos desde Supabase...');
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories!inner(slug)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error cargando desde Supabase:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No hay productos en Supabase');
      return [];
    }

    console.log('✅ Productos cargados desde Supabase:', data.length);

    // Mapear al formato de Product
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
  } catch (err) {
    console.error('❌ Error en loadFromSupabase:', err);
    return [];
  }
};

// Obtener category_id por slug
const getCategoryId = async (slug: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error obteniendo category_id:', error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('Error en getCategoryId:', err);
    return null;
  }
};

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos al montar
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      // ESTRATEGIA: Cargar primero desde Supabase
      if (isSupabaseConfigured()) {
        console.log('🌐 Cargando productos desde Supabase...');
        const supabaseProducts = await loadFromSupabase();
        
        if (supabaseProducts.length > 0) {
          console.log('✅ Productos cargados desde Supabase:', supabaseProducts.length);
          setProducts(supabaseProducts);
          saveToLocalStorage(supabaseProducts); // Guardar en cache
          setLoading(false);
          return;
        }
      }

      // Fallback: Si Supabase falla o está vacío, usar localStorage
      console.log('⚠️ Supabase vacío o error, usando localStorage...');
      const localProducts = loadFromLocalStorage();
      
      if (localProducts && localProducts.length > 0) {
        console.log('📦 Productos cargados desde localStorage:', localProducts.length);
        setProducts(localProducts);
        setLoading(false);
        return;
      }

      // Último fallback: productos iniciales
      console.log('📋 Usando productos iniciales');
      setProducts(initialProducts);
      saveToLocalStorage(initialProducts);
      setLoading(false);
      
    } catch (err: any) {
      console.error('❌ Error cargando productos:', err);
      setError(err.message || 'Error cargando productos');
      
      // Fallback a localStorage
      const localProducts = loadFromLocalStorage();
      if (localProducts && localProducts.length > 0) {
        setProducts(localProducts);
      } else {
        setProducts(initialProducts);
      }
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isSupabaseConfigured()) {
        console.log('🔄 Recargando productos desde Supabase...');
        const supabaseProducts = await loadFromSupabase();
        
        if (supabaseProducts.length > 0) {
          setProducts(supabaseProducts);
          saveToLocalStorage(supabaseProducts);
          console.log('✅ Productos recargados:', supabaseProducts.length);
        } else {
          // Si Supabase está vacío, usar localStorage o iniciales
          const localProducts = loadFromLocalStorage();
          if (localProducts && localProducts.length > 0) {
            setProducts(localProducts);
          } else {
            setProducts(initialProducts);
            saveToLocalStorage(initialProducts);
          }
        }
      } else {
        // Sin Supabase, usar localStorage o iniciales
        const localProducts = loadFromLocalStorage();
        if (localProducts && localProducts.length > 0) {
          setProducts(localProducts);
        } else {
          setProducts(initialProducts);
          saveToLocalStorage(initialProducts);
        }
      }
    } catch (err: any) {
      console.error('❌ Error recargando productos:', err);
      setError(err.message || 'Error recargando productos');
      
      // Fallback a localStorage
      const localProducts = loadFromLocalStorage();
      if (localProducts) {
        setProducts(localProducts);
      }
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Product) => {
    console.log('➕ Agregando producto:', product.name);

    // Agregar al estado inmediatamente
    setProducts(prev => {
      const updated = [...prev, product];
      saveToLocalStorage(updated);
      return updated;
    });

    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado, producto guardado solo en localStorage');
      return;
    }

    try {
      // Obtener category_id
      const categoryId = await getCategoryId(product.category);
      
      if (!categoryId) {
        throw new Error(`Categoría no encontrada: ${product.category}`);
      }

      // Preparar datos para Supabase
      const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: categoryId,
        specs: product.specs,
        images: product.images,
        warranty: product.warranty,
        transport: product.transport,
        is_offer: product.offer || false,
        is_new: product.isNew || false,
        is_featured: product.featured || false,
        is_visible: product.visible !== false,
      };

      console.log('📤 Enviando a Supabase:', productData);

      // Insertar en Supabase
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error insertando en Supabase:', error);
        throw error;
      }

      console.log('✅ Producto creado en Supabase con ID:', data.id);

      // Actualizar el producto con el ID real de Supabase
      setProducts(prev => {
        const updated = prev.map(p => 
          p.id === product.id ? { ...p, id: data.id } : p
        );
        saveToLocalStorage(updated);
        return updated;
      });

    } catch (err: any) {
      console.error('❌ Error en addProduct:', err);
      setError(err.message || 'Error agregando producto');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    console.log('🔄 Actualizando producto:', id);

    // Actualizar el estado inmediatamente
    setProducts(prev => {
      const updated = prev.map(p => 
        p.id === id ? { ...p, ...updates } : p
      );
      saveToLocalStorage(updated);
      return updated;
    });

    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado, producto actualizado solo en localStorage');
      return;
    }

    try {
      // Obtener el producto actual
      const currentProduct = products.find(p => p.id === id);
      if (!currentProduct) {
        throw new Error('Producto no encontrado');
      }

      // Si cambió la categoría, obtener el nuevo category_id
      let categoryId = null;
      if (updates.category && updates.category !== currentProduct.category) {
        categoryId = await getCategoryId(updates.category);
      }

      // Preparar datos para Supabase
      const productData: any = {};
      
      if (updates.name !== undefined) productData.name = updates.name;
      if (updates.description !== undefined) productData.description = updates.description;
      if (updates.price !== undefined) productData.price = updates.price;
      if (updates.specs !== undefined) productData.specs = updates.specs;
      if (updates.images !== undefined) productData.images = updates.images;
      if (updates.warranty !== undefined) productData.warranty = updates.warranty;
      if (updates.transport !== undefined) productData.transport = updates.transport;
      if (updates.offer !== undefined) productData.is_offer = updates.offer;
      if (updates.isNew !== undefined) productData.is_new = updates.isNew;
      if (updates.featured !== undefined) productData.is_featured = updates.featured;
      if (updates.visible !== undefined) productData.is_visible = updates.visible;
      if (categoryId) productData.category_id = categoryId;

      console.log('📤 Actualizando en Supabase:', productData);

      // Actualizar en Supabase
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (error) {
        console.error('❌ Error actualizando en Supabase:', error);
        throw error;
      }

      console.log('✅ Producto actualizado en Supabase');

    } catch (err: any) {
      console.error('❌ Error en updateProduct:', err);
      setError(err.message || 'Error actualizando producto');
    }
  };

  const deleteProduct = async (id: string) => {
    console.log('🗑️ Eliminando producto:', id);

    // Eliminar del estado inmediatamente
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });

    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase no configurado, producto eliminado solo de localStorage');
      return;
    }

    try {
      // Eliminar de Supabase
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error eliminando de Supabase:', error);
        throw error;
      }

      console.log('✅ Producto eliminado de Supabase');

    } catch (err: any) {
      console.error('❌ Error en deleteProduct:', err);
      setError(err.message || 'Error eliminando producto');
    }
  };

  const getProduct = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{
      products,
      updateProduct,
      addProduct,
      deleteProduct,
      getProduct,
      loading,
      refreshProducts,
      error,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts debe usarse dentro de ProductProvider');
  }
  return context;
}
