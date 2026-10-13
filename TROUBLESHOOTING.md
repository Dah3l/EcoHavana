# 🔧 Guía Completa de Solución de Problemas

## Problema Reportado
- ❌ Los productos que agregas en el admin no aparecen en la web
- ❌ Al recargar la página, los productos desaparecen

## Causa Probable
Las políticas RLS (Row Level Security) de Supabase están bloqueando las operaciones de escritura, O hay un problema de sincronización entre localStorage y Supabase.

---

## 🎯 Solución Paso a Paso

### PASO 1: Ejecutar Diagnóstico

1. Abre tu aplicación en el navegador
2. Presiona `F12` para abrir las DevTools
3. Ve a la pestaña **Console**
4. Escribe y ejecuta:

```javascript
window.supabaseDiagnostic.runFull()
```

5. **Copia TODO el resultado** y guárdalo

Esto te dirá exactamente qué está fallando.

---

### PASO 2: Reparar Políticas RLS

Este es el paso MÁS IMPORTANTE. Las políticas RLS pueden estar bloqueando las operaciones.

1. Ve a **Supabase Dashboard**
2. Navega a **SQL Editor** (menú lateral)
3. Click en **"New Query"**
4. Copia y pega TODO el contenido de `fix_rls.sql`
5. Click en **"Run"** (botón verde)

Deberías ver:
```
✅ Políticas RLS reparadas exitosamente
```

---

### PASO 3: Verificar Bucket de Storage

1. Ve a **Supabase Dashboard** → **Storage**
2. Verifica que exista el bucket llamado `products`
3. Si NO existe:
   - Click en **"New bucket"**
   - Nombre: `products`
   - ✅ Activa **"Public bucket"**
   - Click en **"Create bucket"**

---

### PASO 4: Probar la Conexión

1. Ve a tu aplicación: `http://localhost:5173/admin`
2. Inicia sesión con tu usuario admin
3. Abre la consola del navegador (F12)
4. Intenta agregar un producto nuevo
5. **Observa los logs en la consola**

Deberías ver:
```
➕ Agregando producto: [nombre]
📤 Enviando a Supabase: {...}
✅ Producto creado en Supabase con ID: [uuid]
💾 Productos guardados en localStorage: [número]
```

---

### PASO 5: Verificar que Funciona

1. Después de agregar el producto, ve al catálogo o inicio
2. El producto nuevo debe aparecer
3. Recarga la página (F5)
4. El producto debe seguir ahí
5. En la consola, deberías ver:
```
🌐 Cargando productos desde Supabase...
✅ Productos cargados desde Supabase: [número]
```

---

## 🔍 Diagnóstico de Errores Comunes

### Error: "new row violates row-level security policy"

**Causa**: Las políticas RLS están bloqueando la inserción

**Solución**:
1. Ejecuta `fix_rls.sql` en Supabase → SQL Editor
2. Verifica que estás autenticado en `/admin`

---

### Error: "category_id not found"

**Causa**: La categoría no existe en la base de datos

**Solución**:
1. Ejecuta `seed.sql` para crear las categorías
2. O crea manualmente las categorías en Supabase → Table Editor → categories

---

### Error: "relation does not exist"

**Causa**: Las tablas no existen

**Solución**:
1. Ejecuta `setup_complete.sql` en Supabase → SQL Editor

---

### Error: "column is_featured does not exist"

**Causa**: Falta la columna is_featured

**Solución**:
1. Ejecuta `migration_add_featured.sql` en Supabase → SQL Editor

---

### Los productos no aparecen después de recargar

**Causa**: Problema de sincronización localStorage ↔ Supabase

**Solución**:
1. Abre la consola (F12)
2. Ejecuta: `localStorage.clear()`
3. Recarga la página
4. Los productos se cargarán desde Supabase

---

### Error: "bucket not found" o imágenes no cargan

**Causa**: El bucket `products` no existe o no es público

**Solución**:
1. Ve a Supabase → Storage
2. Crea el bucket `products` si no existe
3. Asegúrate de que sea **público**
4. Ejecuta `fix_rls.sql` para crear las políticas correctas

---

## 🧪 Prueba Manual de Supabase

Si quieres probar directamente en Supabase:

1. Ve a **Supabase Dashboard** → **Table Editor**
2. Selecciona la tabla `products`
3. Click en **"Insert row"**
4. Llena los campos:
   - name: "Producto de prueba"
   - price: 100
   - category_id: (selecciona una categoría)
   - is_visible: true
5. Click en **"Save"**

Si funciona aquí pero no en la app, el problema está en el código frontend.
Si NO funciona aquí, el problema está en Supabase (permisos/RLS).

---

## 📋 Checklist de Verificación

Antes de pedir ayuda, verifica:

- [ ] Ejecutaste `fix_rls.sql` en Supabase
- [ ] El bucket `products` existe y es público
- [ ] Creaste un usuario admin en Authentication
- [ ] Puedes iniciar sesión en `/admin`
- [ ] Las tablas `products` y `categories` existen
- [ ] La columna `is_featured` existe en la tabla `products`
- [ ] Ejecutaste el diagnóstico: `window.supabaseDiagnostic.runFull()`
- [ ] Revisaste la consola del navegador (F12)

---

## 🆘 Si Nada Funciona

### Opción 1: Reset Completo

1. Ejecuta `reset_database.sql` en Supabase (⚠️ borra todo)
2. Ejecuta `setup_complete.sql`
3. Ejecuta `seed.sql`
4. Ejecuta `fix_rls.sql`
5. Crea un usuario admin
6. Limpia localStorage: `localStorage.clear()` en la consola
7. Recarga la página

### Opción 2: Modo Offline (sin Supabase)

Si solo quieres que funcione localmente:

1. Edita `.env.local` y comenta las variables:
```env
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

2. Recarga la página
3. La app usará solo localStorage
4. Los productos se guardarán localmente

**Nota**: En modo offline, los datos no se sincronizan entre dispositivos.

---

## 📊 Logs Esperados

### Al cargar la página:
```
🔄 Loading products...
🌐 Cargando productos desde Supabase...
✅ Productos cargados desde Supabase: 14
💾 Productos guardados en localStorage: 14
```

### Al agregar un producto:
```
➕ Agregando producto: Nuevo Producto
📤 Enviando a Supabase: {...}
✅ Producto creado en Supabase con ID: abc-123-def
💾 Productos guardados en localStorage: 15
```

### Al actualizar un producto:
```
🔄 Actualizando producto: abc-123-def
📤 Actualizando en Supabase: {...}
✅ Producto actualizado en Supabase
💾 Productos guardados en localStorage: 15
```

### Al eliminar un producto:
```
🗑️ Eliminando producto: abc-123-def
✅ Producto eliminado de Supabase
💾 Productos guardados en localStorage: 14
```

---

## 🎯 Resumen de Archivos SQL

| Archivo | Cuándo usar |
|---------|-------------|
| `fix_rls.sql` | **PRIMERO** - Repara políticas RLS |
| `setup_complete.sql` | Si las tablas no existen |
| `seed.sql` | Para cargar productos iniciales |
| `migration_add_featured.sql` | Si falta la columna is_featured |
| `reset_database.sql` | ⚠️ Solo si quieres empezar de cero |

---

## 💡 Consejos

1. **Siempre revisa la consola** (F12) - Los logs te dirán qué está pasando
2. **Ejecuta el diagnóstico** - `window.supabaseDiagnostic.runFull()`
3. **Prueba en Supabase primero** - Si funciona en Table Editor pero no en la app, el problema es frontend
4. **Limpia localStorage** - `localStorage.clear()` puede resolver problemas de cache
5. **Verifica autenticación** - Asegúrate de estar logueado en `/admin`

---

## 📞 Soporte

Si después de seguir todos los pasos sigues teniendo problemas:

1. Ejecuta el diagnóstico completo
2. Copia TODO el output de la consola
3. Describe exactamente qué hiciste paso a paso
4. Comparte la información para diagnóstico

---

**Última actualización**: 2024
**Estado**: ✅ Sistema de diagnóstico y reparación completo
