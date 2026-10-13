# 🐛 Guía de Debugging - EnergíaCuba

## Problemas Comunes y Soluciones

### 1. Los productos no se muestran después de agregarlos

**Causas posibles:**
- Error de permisos RLS en Supabase
- El usuario no está autenticado
- Error al guardar en Supabase

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Intenta agregar un producto
4. Busca mensajes como:
   - ✅ `Product inserted successfully` - Todo bien
   - ❌ `Error inserting product` - Hay un error

**Verificar permisos RLS:**
```sql
-- En Supabase SQL Editor, ejecuta:
SELECT * FROM products LIMIT 1;
```
Si da error de permisos, ejecuta:
```sql
-- Asegurar que las políticas RLS estén correctas
DROP POLICY IF EXISTS "Auth write products" ON products;
CREATE POLICY "Auth write products" ON products
  FOR ALL USING (auth.role() = 'authenticated');
```

### 2. Los productos desaparecen al recargar

**Causas posibles:**
- Los productos no se guardaron en Supabase
- Error al cargar desde Supabase
- Fallback a localStorage fallido

**Solución:**
1. Abre la consola del navegador (F12)
2. Recarga la página
3. Busca mensajes como:
   - ✅ `Loaded X products from Supabase` - Todo bien
   - ❌ `Supabase error` - Hay un error de conexión
   - ⚠️ `Falling back to localStorage` - Supabase falló

**Verificar que los productos están en Supabase:**
```sql
-- En Supabase SQL Editor:
SELECT id, name, price FROM products ORDER BY created_at DESC;
```

### 3. Error "column is_featured does not exist"

**Causa:** La tabla existe pero no tiene la columna `is_featured`

**Solución:** Ejecuta en Supabase SQL Editor:
```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
```

### 4. Las imágenes no se suben

**Causas posibles:**
- Bucket "products" no existe
- Permisos del bucket incorrectos
- Usuario no autenticado

**Solución:**
1. Ve a Supabase → Storage
2. Verifica que el bucket "products" existe
3. Si no existe, créalo:
   - Nombre: `products`
   - Public bucket: ✅ Activado
4. Verifica las políticas:
```sql
-- En Supabase SQL Editor:
DROP POLICY IF EXISTS "Auth write products bucket" ON storage.objects;
CREATE POLICY "Auth write products bucket" ON storage.objects
  FOR ALL USING (bucket_id = 'products' AND auth.role() = 'authenticated');
```

### 5. No puedo iniciar sesión en /admin

**Causas posibles:**
- Usuario no existe en Supabase
- Contraseña incorrecta
- Error de conexión

**Solución:**
1. Ve a Supabase → Authentication → Users
2. Verifica que el usuario existe
3. Si no existe, créalo:
   - Click en "Add user" → "Create new user"
   - Ingresa email y contraseña
   - **NO** marques "Auto Confirm User" (debe confirmar el email)
4. Confirma el email del usuario (Supabase envía un email de confirmación)

### 6. Los cambios no se reflejan en la tienda

**Causa:** El estado local no se está sincronizando con Supabase

**Solución:**
1. En el panel admin, busca el botón 🔄 (refresh)
2. Haz click para recargar los productos desde Supabase
3. Verifica en la consola que diga: `Refreshed: X products`

## 🔍 Comandos de Debugging en Consola

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver productos actuales en el estado
window.__products = document.querySelector('#root').__reactFiber$?.memoizedProps?.children?.props?.value?.products;
console.log(window.__products);

// Ver si Supabase está configurado
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

// Ver localStorage
console.log('LocalStorage products:', JSON.parse(localStorage.getItem('energicuba_products') || '[]'));
```

## 📊 Verificaciones en Supabase

### Verificar tablas y columnas:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

### Verificar productos:
```sql
SELECT 
  p.id,
  p.name,
  p.price,
  c.name as category,
  p.is_featured,
  p.is_offer,
  p.is_new,
  p.is_visible,
  p.images
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY p.created_at DESC;
```

### Verificar bucket de storage:
```sql
SELECT id, name, public
FROM storage.buckets
WHERE name = 'products';
```

### Verificar políticas RLS:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('products', 'categories', 'orders');
```

## 🧪 Test Completo

Ejecuta este script en Supabase SQL Editor para verificar que todo funciona:

```sql
-- 1. Verificar estructura
DO $$
BEGIN
  -- Verificar columna is_featured
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_featured'
  ) THEN
    RAISE EXCEPTION '❌ Columna is_featured no existe';
  ELSE
    RAISE NOTICE '✅ Columna is_featured existe';
  END IF;
  
  -- Verificar categorías
  IF (SELECT COUNT(*) FROM categories) < 4 THEN
    RAISE EXCEPTION '❌ Faltan categorías';
  ELSE
    RAISE NOTICE '✅ Categorías OK: %', (SELECT COUNT(*) FROM categories);
  END IF;
  
  -- Verificar productos
  IF (SELECT COUNT(*) FROM products) < 10 THEN
    RAISE WARNING '⚠️ Pocos productos: %', (SELECT COUNT(*) FROM products);
  ELSE
    RAISE NOTICE '✅ Productos OK: %', (SELECT COUNT(*) FROM products);
  END IF;
END $$;

-- 2. Probar insertar un producto de prueba
INSERT INTO products (name, description, price, category_id, specs, images, warranty, transport, is_offer, is_new, is_featured, is_visible)
VALUES (
  'Producto de Prueba',
  'Este es un producto de prueba',
  99.99,
  (SELECT id FROM categories WHERE slug = 'estaciones'),
  '["Spec 1", "Spec 2"]'::jsonb,
  '[]'::jsonb,
  '7 días',
  'Transporte incluido',
  false,
  false,
  false,
  true
)
RETURNING id, name, price;

-- 3. Eliminar el producto de prueba
DELETE FROM products WHERE name = 'Producto de Prueba';
```

## 🆘 Si nada funciona

1. **Limpia el caché del navegador:**
   - Chrome: Ctrl+Shift+Del → "Cached images and files"
   - O usa modo incógnito

2. **Limpia localStorage:**
   ```javascript
   // En la consola del navegador:
   localStorage.clear();
   location.reload();
   ```

3. **Verifica las variables de entorno:**
   - Asegúrate de que `.env.local` tenga las credenciales correctas
   - Reinicia el servidor de desarrollo: `npm run dev`

4. **Revisa los logs de Supabase:**
   - Ve a Supabase → Logs → API
   - Busca errores recientes

5. **Contacta soporte:**
   - Abre un issue en el repositorio
   - Incluye los logs de la consola del navegador
   - Incluye los logs de Supabase

## 📝 Checklist de Configuración

- [ ] Supabase URL configurada en `.env.local`
- [ ] Supabase Anon Key configurada en `.env.local`
- [ ] Tabla `products` creada con todas las columnas
- [ ] Tabla `categories` creada con 4 categorías
- [ ] Bucket `products` creado en Storage
- [ ] Políticas RLS configuradas correctamente
- [ ] Usuario admin creado en Authentication
- [ ] Email del usuario admin confirmado
- [ ] Servidor de desarrollo reiniciado después de cambios
- [ ] Caché del navegador limpiado

---

**Última actualización:** 2024
