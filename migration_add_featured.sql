-- =============================================
-- MIGRACIÓN: Agregar columna is_featured
-- Ejecutar este script si la tabla products ya existe
-- =============================================

-- Agregar columna is_featured si no existe
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Crear índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- Actualizar productos existentes que deben ser destacados
-- (Opcional: descomenta y ajusta según necesites)
-- UPDATE products SET is_featured = TRUE WHERE id IN (
--   'product-id-1',
--   'product-id-2'
-- );

-- =============================================
-- Verificar que la columna se agregó correctamente
-- =============================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'is_featured';
