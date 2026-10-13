-- =============================================
-- EcoHavana - Seed SQL (Safe Version)
-- Datos iniciales de productos
-- Este script es seguro para ejecutar múltiples veces
-- =============================================

-- =============================================
-- CATEGORÍAS (solo insertar si no existen)
-- =============================================
INSERT INTO categories (name, slug, icon) VALUES
  ('Estaciones de Energía', 'estaciones', '🔋'),
  ('Plantas Eléctricas', 'plantas', '⚙️'),
  ('Paneles Solares', 'paneles', '☀️'),
  ('Combos', 'combos', '📦')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- ESTACIONES DE ENERGÍA
-- =============================================
INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_visible)
SELECT 
  'EcoFlow Delta 3 Plus',
  'Estación de energía portátil de alta capacidad, ideal para el hogar. Con capacidad de 1024Wh y picos de hasta 3600W, perfecta para alimentar electrodomésticos esenciales durante apagones.',
  700.00,
  (SELECT id FROM categories WHERE slug = 'estaciones'),
  '["1024Wh capacidad", "Picos 3600W", "2 paneles 500W compatibles", "Salidas múltiples", "Carga rápida 80min"]'::jsonb,
  '7 días',
  'Transporte incluido',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'EcoFlow Delta 3 Plus');

INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_new, is_visible)
SELECT 
  'EcoFlow Delta 3 Max',
  'La estación de energía más potente de la línea Delta 3. Con 2048Wh de capacidad, ideal para uso prolongado y equipos de mayor consumo.',
  1100.00,
  (SELECT id FROM categories WHERE slug = 'estaciones'),
  '["2048Wh capacidad", "Picos 4000W", "Paneles solares compatibles", "Salida USB-C 100W", "Pantalla LED"]'::jsonb,
  '7 días',
  'Transporte incluido',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'EcoFlow Delta 3 Max');

INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_visible)
SELECT 
  'EcoFlow Delta 3 Classic',
  'Versión clásica y accesible de la Delta 3. 1024Wh de potencia con todas las funcionalidades esenciales para tu hogar.',
  590.00,
  (SELECT id FROM categories WHERE slug = 'estaciones'),
  '["1024Wh capacidad", "Picos 1800W", "Compatible paneles solares", "Puertos múltiples", "Diseño compacto"]'::jsonb,
  '7 días',
  'Transporte gratis',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'EcoFlow Delta 3 Classic');

-- =============================================
-- PLANTAS ELÉCTRICAS
-- =============================================
INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_visible)
SELECT 
  'Sigma 6500W Súper Silenciosa',
  'Planta eléctrica de alta potencia y bajo ruido. Funciona con gas de la calle, ideal para uso residencial prolongado.',
  1270.00,
  (SELECT id FROM categories WHERE slug = 'plantas'),
  '["6500W potencia máxima", "Gas de la calle", "Súper silenciosa", "Arranque eléctrico", "Tanque gran capacidad"]'::jsonb,
  '1 mes',
  'Transporte en La Habana',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sigma 6500W Súper Silenciosa');

INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_visible)
SELECT 
  'Sigma Inverter 4000W',
  'Planta inverter silenciosa de 4000W pico / 3300W continuos. Funciona con gasolina o gas. Tecnología inverter para equipos sensibles.',
  1020.00,
  (SELECT id FROM categories WHERE slug = 'plantas'),
  '["4000W pico / 3300W continuos", "Gasolina y gas de balita", "Silenciosa inverter", "Protección sobrecarga", "Bajo consumo"]'::jsonb,
  '7 días (solo gasolina y gas de balita)',
  'Transporte gratis en lugares céntricos',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sigma Inverter 4000W');

INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_visible)
SELECT 
  'Planta 1200W Inverter',
  'Planta eléctrica compacta inverter de 1200W. Perfecta para equipos electrónicos y uso básico del hogar.',
  360.00,
  (SELECT id FROM categories WHERE slug = 'plantas'),
  '["1200W potencia", "Tecnología inverter", "Compacta y portátil", "Bajo ruido", "Arranque manual"]'::jsonb,
  '7 días',
  'Transporte incluido',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Planta 1200W Inverter');

INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_visible)
SELECT 
  'Planta 950W',
  'Planta eléctrica económica de 950W. Ideal para necesidades básicas y equipos de bajo consumo.',
  195.00,
  (SELECT id FROM categories WHERE slug = 'plantas'),
  '["950W potencia", "Gasolina", "Compacta", "Ligera", "Fácil mantenimiento"]'::jsonb,
  '7 días',
  'Transporte incluido',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Planta 950W');

-- =============================================
-- PANELES SOLARES
-- =============================================
INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_offer, is_visible)
SELECT 
  'LDK Solar Hi-Tech 720W',
  'Panel solar de alta eficiencia de 720W. Tecnología Hi-Tech para máxima producción energética. ¡REBAJA!',
  245.00,
  (SELECT id FROM categories WHERE slug = 'paneles'),
  '["720W potencia", "Tecnología Hi-Tech", "Alta eficiencia", "Resistente a intemperie", "Garantía rendimiento"]'::jsonb,
  '1 mes',
  'Transporte incluido',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'LDK Solar Hi-Tech 720W');

INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_visible)
SELECT 
  'Messi Panel 450W',
  'Panel solar de 450W, ideal para cargar estaciones EcoFlow. Excelente relación calidad-precio.',
  175.00,
  (SELECT id FROM categories WHERE slug = 'paneles'),
  '["450W potencia", "Ideal para EcoFlow", "Monocristalino", "Marco aluminio", "Conectores MC4"]'::jsonb,
  '1 mes',
  'Transporte incluido',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Messi Panel 450W');

-- =============================================
-- COMBOS
-- =============================================
INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_visible)
SELECT 
  'Combo Delta 3 Classic + Panel 450W + Cable 10m',
  'Kit completo con estación Delta 3 Classic, panel solar de 450W y cable de 10 metros. Todo lo necesario para empezar.',
  900.00,
  (SELECT id FROM categories WHERE slug = 'combos'),
  '["Delta 3 Classic 1024Wh", "Panel 450W", "Cable 10m", "Listo para usar", "Ahorro vs compra individual"]'::jsonb,
  '7 días',
  'Transporte incluido',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Delta 3 Classic + Panel 450W + Cable 10m');

INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_visible)
SELECT 
  'Combo Delta 3 + Panel 450W + Cable 10m',
  'Kit con estación Delta 3, panel solar de 450W y cable de 10 metros. Potencia y autonomía para tu hogar.',
  960.00,
  (SELECT id FROM categories WHERE slug = 'combos'),
  '["Delta 3 1024Wh", "Panel 450W", "Cable 10m", "Carga solar", "Ahorro combinado"]'::jsonb,
  '7 días',
  'Transporte incluido',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Delta 3 + Panel 450W + Cable 10m');

INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_visible)
SELECT 
  'Combo Delta 3 Plus + Panel 450W + Cable 10m',
  'Kit premium con Delta 3 Plus, panel solar 450W y cable 10m. Mayor potencia con picos de 3600W.',
  1020.00,
  (SELECT id FROM categories WHERE slug = 'combos'),
  '["Delta 3 Plus 1024Wh", "Picos 3600W", "Panel 450W", "Cable 10m", "Máximo rendimiento"]'::jsonb,
  '7 días',
  'Transporte incluido',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Delta 3 Plus + Panel 450W + Cable 10m');

INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_visible)
SELECT 
  'Combo Delta 3 Classic + Cable 10m + Panel 450W + Kit Torre',
  'Kit completo con estación, panel, cable y kit de torre para instalación del panel. Solución integral.',
  1060.00,
  (SELECT id FROM categories WHERE slug = 'combos'),
  '["Delta 3 Classic 1024Wh", "Panel 450W", "Cable 10m", "Kit torre incluido", "Instalación completa"]'::jsonb,
  '7 días',
  'Transporte incluido',
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Delta 3 Classic + Cable 10m + Panel 450W + Kit Torre');

INSERT INTO products (name, description, price, category_id, specs, warranty, transport, is_new, is_visible)
SELECT 
  'Combo Delta 3 Plus + 2 Cables 10m + 2 Paneles 450W',
  'Kit doble para máxima carga solar. Delta 3 Plus con dos paneles de 450W y dos cables de 10m.',
  1330.00,
  (SELECT id FROM categories WHERE slug = 'combos'),
  '["Delta 3 Plus 1024Wh", "2x Paneles 450W", "2x Cables 10m", "Carga solar doble", "Máxima autonomía"]'::jsonb,
  '7 días',
  'Transporte incluido',
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Combo Delta 3 Plus + 2 Cables 10m + 2 Paneles 450W');

-- =============================================
-- VERIFICACIÓN
-- =============================================
DO $$
DECLARE
  product_count INTEGER;
  category_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO category_count FROM categories;
  
  RAISE NOTICE '✅ Seed completado exitosamente';
  RAISE NOTICE '📊 Categorías: %', category_count;
  RAISE NOTICE '📦 Productos: %', product_count;
END $$;
