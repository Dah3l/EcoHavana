-- =============================================
-- SETUP COMPLETO: Base de datos para EnergíaCuba
-- Este script puede ejecutarse en una base de datos nueva o existente
-- =============================================

-- =============================================
-- 1. CREAR TABLAS (si no existen)
-- =============================================

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  specs JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  warranty TEXT,
  transport TEXT,
  is_offer BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  items JSONB NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. AGREGAR COLUMNAS FALTANTES (si la tabla ya existe)
-- =============================================

-- Agregar is_featured si no existe
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- =============================================
-- 3. CREAR ÍNDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_visible ON products(is_visible);
CREATE INDEX IF NOT EXISTS idx_products_offer ON products(is_offer);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- =============================================
-- 4. FUNCIÓN PARA ACTUALIZAR updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger solo si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_products_updated_at'
  ) THEN
    CREATE TRIGGER trigger_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Activar RLS en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Auth write categories" ON categories;
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Auth write products" ON products;
DROP POLICY IF EXISTS "Auth read orders" ON orders;
DROP POLICY IF EXISTS "Public insert orders" ON orders;

-- Crear políticas
-- Lectura pública (todos pueden leer)
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read products" ON products
  FOR SELECT USING (true);

-- Escritura solo para autenticados (admin)
CREATE POLICY "Auth write categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Auth write products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Auth read orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Public insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 6. STORAGE BUCKET: products
-- =============================================

-- Crear bucket público para imágenes de productos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas existentes del storage
DROP POLICY IF EXISTS "Public read products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Auth write products bucket" ON storage.objects;

-- Crear políticas de Storage
CREATE POLICY "Public read products bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Auth write products bucket" ON storage.objects
  FOR ALL USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- =============================================
-- 7. VERIFICACIÓN
-- =============================================

-- Verificar que todas las columnas existen
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '✅ Setup completado exitosamente';
  RAISE NOTICE '📊 Tablas creadas: categories, products, orders';
  RAISE NOTICE '🔐 RLS activado en todas las tablas';
  RAISE NOTICE '📦 Bucket "products" creado en Storage';
END $$;
