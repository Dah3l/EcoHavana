-- =============================================
-- EnergíaCuba - Reset Database
-- ⚠️ ADVERTENCIA: Este script elimina TODOS los datos
-- Úsalo solo si quieres empezar desde cero
-- =============================================

-- Desactivar RLS temporalmente para poder borrar
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Eliminar datos (en orden por dependencias)
DELETE FROM products;
DELETE FROM orders;
DELETE FROM categories;

-- Resetear secuencias de IDs
ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 1;

-- Reactivar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '🗑️ Base de datos limpiada exitosamente';
  RAISE NOTICE '📝 Ahora puedes ejecutar seed.sql para cargar datos iniciales';
END $$;
