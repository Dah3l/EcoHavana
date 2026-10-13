-- =============================================
-- FIX RLS: Reparar Políticas de Seguridad
-- Ejecuta este script en Supabase → SQL Editor
-- =============================================

-- =============================================
-- 1. DESACTIVAR RLS TEMPORALMENTE (para pruebas)
-- =============================================
-- Si necesitas probar sin RLS, descomenta estas líneas:
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. ELIMINAR POLÍTICAS EXISTENTES
-- =============================================
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Auth write categories" ON categories;
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Auth write products" ON products;
DROP POLICY IF EXISTS "Auth read orders" ON orders;
DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Public read products bucket" ON storage.objects;
DROP POLICY IF EXISTS "Auth write products bucket" ON storage.objects;

-- =============================================
-- 3. CREAR POLÍTICAS CORRECTAS
-- =============================================

-- CATEGORIES
-- Lectura pública
CREATE POLICY "Enable read for all users" ON categories
  FOR SELECT
  USING (true);

-- Escritura solo para autenticados
CREATE POLICY "Enable write for authenticated users only" ON categories
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- PRODUCTS
-- Lectura pública
CREATE POLICY "Enable read for all users" ON products
  FOR SELECT
  USING (true);

-- Escritura solo para autenticados
CREATE POLICY "Enable write for authenticated users only" ON products
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ORDERS
-- Lectura solo para autenticados
CREATE POLICY "Enable read for authenticated users only" ON orders
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Escritura pública (para crear pedidos)
CREATE POLICY "Enable insert for all users" ON orders
  FOR INSERT
  WITH CHECK (true);

-- =============================================
-- 4. STORAGE BUCKET
-- =============================================

-- Lectura pública del bucket products
CREATE POLICY "Public Access for products bucket" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'products');

-- Escritura solo para autenticados
CREATE POLICY "Authenticated users can upload to products bucket" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update products bucket" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete from products bucket" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'products' 
    AND auth.role() = 'authenticated'
  );

-- =============================================
-- 5. VERIFICAR
-- =============================================

-- Ver políticas de products
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('products', 'categories', 'orders')
ORDER BY tablename, policyname;

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS reparadas exitosamente';
  RAISE NOTICE '📊 Ahora puedes:';
  RAISE NOTICE '   - Leer productos sin autenticación';
  RAISE NOTICE '   - Escribir productos solo con autenticación';
  RAISE NOTICE '   - Subir imágenes al bucket products';
END $$;
