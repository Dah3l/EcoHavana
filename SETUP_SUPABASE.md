# 🚀 Configuración de Supabase - EnergíaCuba

## ⚠️ Error: "column is_featured does not exist"

Si ves este error al ejecutar `seed.sql`, significa que la tabla `products` ya existe pero no tiene la columna `is_featured`.

### ✅ Solución Rápida

Ejecuta este script en **Supabase → SQL Editor**:

```sql
-- Agregar columna is_featured
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
```

Después de ejecutar esto, puedes volver a ejecutar `seed.sql` sin errores.

---

## 📋 Opciones de Configuración

### Opción 1: Setup Completo (Recomendado para bases de datos existentes)

Si ya tienes tablas creadas y quieres agregar las columnas faltantes sin perder datos:

1. Ve a **Supabase → SQL Editor**
2. Copia y ejecuta el contenido de `setup_complete.sql`
3. Luego ejecuta `seed.sql` para cargar los productos

**Ventajas:**
- ✅ No borra datos existentes
- ✅ Agrega columnas faltantes automáticamente
- ✅ Crea índices y políticas si no existen
- ✅ Seguro para ejecutar múltiples veces

### Opción 2: Migración Simple

Si solo necesitas agregar la columna `is_featured`:

1. Ve a **Supabase → SQL Editor**
2. Copia y ejecuta el contenido de `migration_add_featured.sql`
3. Luego ejecuta `seed.sql`

### Opción 3: Base de Datos Nueva

Si estás empezando desde cero:

1. Ve a **Supabase → SQL Editor**
2. Ejecuta `schema.sql` (crea todas las tablas)
3. Ejecuta `seed.sql` (carga los productos)

---

## 🔍 Verificación

Después de ejecutar los scripts, verifica que todo esté correcto:

```sql
-- Ver columnas de la tabla products
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

Deberías ver estas columnas:
- id
- name
- description
- price
- category_id
- specs
- images
- warranty
- transport
- is_offer
- is_new
- **is_featured** ← Esta es la que faltaba
- is_visible
- created_at
- updated_at

---

## 📦 Crear Usuario Admin

Después de configurar la base de datos:

1. Ve a **Supabase → Authentication → Users**
2. Click en **"Add user"** → **"Create new user"**
3. Ingresa email y contraseña
4. Este usuario podrá iniciar sesión en `/admin`

---

## 🖼️ Configurar Storage Bucket

Verifica que el bucket `products` exista:

1. Ve a **Supabase → Storage**
2. Deberías ver el bucket `products`
3. Si no existe, créalo:
   - Click en **"New bucket"**
   - Nombre: `products`
   - **Public bucket**: ✅ Activado
   - Click en **"Create bucket"**

---

## 🧪 Probar la Configuración

1. Inicia la aplicación: `npm run dev`
2. Ve a `http://localhost:5173/admin`
3. Inicia sesión con el usuario admin que creaste
4. Intenta crear un producto con imagen
5. Verifica que la imagen se suba correctamente al bucket `products`

---

## 🐛 Troubleshooting

### Error: "relation already exists"

**Causa:** Las tablas ya existen.

**Solución:** Usa `setup_complete.sql` en lugar de `schema.sql`. Este script usa `IF NOT EXISTS` y `ADD COLUMN IF NOT EXISTS`.

### Error: "permission denied"

**Causa:** RLS está bloqueando las operaciones.

**Solución:** 
1. Verifica que estás autenticado en Supabase
2. Ejecuta los scripts como usuario con permisos de admin (no como anon)
3. En Supabase → SQL Editor, asegúrate de estar conectado con tu usuario admin

### Error: "bucket not found"

**Causa:** El bucket `products` no existe.

**Solución:** Crea el bucket manualmente en Supabase → Storage (ver sección anterior).

### Las imágenes no se muestran

**Causa:** El bucket no es público o las políticas RLS están mal configuradas.

**Solución:**
1. Verifica que el bucket `products` sea público
2. Ejecuta `setup_complete.sql` para recrear las políticas

---

## 📚 Scripts Disponibles

| Archivo | Descripción | Cuándo usar |
|---------|-------------|-------------|
| `schema.sql` | Crea tablas desde cero | Base de datos nueva |
| `seed.sql` | Carga productos iniciales (seguro) | Después de crear tablas |
| `setup_complete.sql` | Setup completo + migración | Base de datos existente |
| `migration_add_featured.sql` | Solo agrega is_featured | Si solo falta esa columna |
| `reset_database.sql` | ⚠️ Limpia toda la base de datos | Solo si quieres empezar de cero |

### ✅ Seed Seguro

El archivo `seed.sql` ahora es **seguro para ejecutar múltiples veces**:
- Usa `ON CONFLICT DO NOTHING` para categorías
- Usa `WHERE NOT EXISTS` para productos
- No duplica datos si ya existen
- Puedes ejecutarlo cuantas veces quieras sin problemas

---

## ✅ Checklist de Configuración

- [ ] Ejecutar `setup_complete.sql` o `schema.sql`
- [ ] Ejecutar `seed.sql`
- [ ] Verificar que la columna `is_featured` existe
- [ ] Crear usuario admin en Authentication
- [ ] Verificar bucket `products` en Storage
- [ ] Probar login en `/admin`
- [ ] Probar subida de imágenes
- [ ] Verificar que los productos aparecen en la tienda

---

## 🆘 Necesitas Ayuda?

Si sigues teniendo problemas:

1. Verifica la consola del navegador (F12) para ver errores detallados
2. Revisa los logs en Supabase → Logs
3. Asegúrate de que las variables de entorno en `.env.local` sean correctas
4. Verifica que el usuario admin esté activo en Supabase → Authentication

---

**Última actualización:** 2024
