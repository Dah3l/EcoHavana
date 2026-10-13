import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

const CATEGORIES_STORAGE_KEY = 'ecohavana_categories';

// Categorías por defecto
const defaultCategories: Category[] = [
  { id: '1', name: 'Estaciones de Energía', slug: 'estaciones', icon: '🔋' },
  { id: '2', name: 'Plantas Eléctricas', slug: 'plantas', icon: '⚙️' },
  { id: '3', name: 'Paneles Solares', slug: 'paneles', icon: '☀️' },
  { id: '4', name: 'Combos', slug: 'combos', icon: '📦' },
];

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  loading: boolean;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

// Guardar en localStorage
const saveToLocalStorage = (categories: Category[]) => {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Error guardando categorías en localStorage:', e);
  }
};

// Cargar desde localStorage
const loadFromLocalStorage = (): Category[] | null => {
  try {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error cargando categorías desde localStorage:', e);
  }
  return null;
};

// Cargar desde Supabase
const loadFromSupabase = async (): Promise<Category[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error('Error cargando categorías desde Supabase:', err);
    return [];
  }
};

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar categorías al montar
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);

    try {
      // Intentar cargar desde Supabase primero
      if (isSupabaseConfigured()) {
        const supabaseCategories = await loadFromSupabase();
        
        if (supabaseCategories.length > 0) {
          setCategories(supabaseCategories);
          saveToLocalStorage(supabaseCategories);
          setLoading(false);
          return;
        }
      }

      // Fallback a localStorage
      const localCategories = loadFromLocalStorage();
      if (localCategories && localCategories.length > 0) {
        setCategories(localCategories);
        setLoading(false);
        return;
      }

      // Fallback a categorías por defecto
      setCategories(defaultCategories);
      saveToLocalStorage(defaultCategories);
    } catch (err) {
      console.error('Error cargando categorías:', err);
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    await loadCategories();
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    // Generar ID temporal
    const tempId = `cat-${Date.now()}`;
    const newCategory: Category = { ...category, id: tempId };

    // Agregar al estado inmediatamente
    setCategories(prev => {
      const updated = [...prev, newCategory];
      saveToLocalStorage(updated);
      return updated;
    });

    // Guardar en Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert(category)
          .select()
          .single();

        if (error) throw error;

        // Actualizar con el ID real
        setCategories(prev => {
          const updated = prev.map(c => c.id === tempId ? data : c);
          saveToLocalStorage(updated);
          return updated;
        });
      } catch (err) {
        console.error('Error agregando categoría:', err);
      }
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    // Actualizar estado inmediatamente
    setCategories(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      saveToLocalStorage(updated);
      return updated;
    });

    // Guardar en Supabase
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('categories')
          .update(updates)
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('Error actualizando categoría:', err);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    // Eliminar del estado inmediatamente
    setCategories(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveToLocalStorage(updated);
      return updated;
    });

    // Eliminar de Supabase
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error('Error eliminando categoría:', err);
      }
    }
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      loading,
      refreshCategories,
    }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories debe usarse dentro de CategoryProvider');
  }
  return context;
}
