# EcoHavana - E-commerce de Estaciones de Energía

E-commerce para venta de estaciones de energía, plantas eléctricas, paneles solares y combos en Cuba.

## 🛠 Stack Tecnológico

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Supabase (Postgres + Auth + Storage)
- **Despliegue:** Cloudflare Pages (static output)
- **Checkout:** WhatsApp API (+53 55072322)

## 📋 Requisitos

- Node.js 18+
- Cuenta en Supabase
- Cuenta en Cloudflare (para despliegue)

## 🚀 Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd ecohavana

# Instalar dependencias
npm install

# El archivo .env.local ya está configurado con las credenciales de Supabase
```

## 🗄 Configuración de Supabase

### ⚠️ ¿Error "column is_featured does not exist"?

Si ya tienes tablas creadas y ves este error, consulta **[SETUP_SUPABASE.md](./SETUP_SUPABASE.md)** para la solución rápida.

### Opción 1: Base de Datos Existente (Recomendado)

Si ya tienes tablas creadas, ejecuta `setup_complete.sql` en **Supabase → SQL Editor**:

```sql
-- Copia y pega el contenido de setup_complete.sql
```

Este script:
- ✅ Crea tablas si no existen
- ✅ Agrega columnas faltantes (is_featured)
- ✅ Crea índices y políticas RLS
- ✅ Configura el bucket de Storage
- ✅ Seguro para ejecutar múltiples veces

### Opción 2: Base de Datos Nueva

Si estás empezando desde cero:

1. Ejecuta `schema.sql` en **Supabase → SQL Editor**
2. Luego ejecuta `seed.sql` para cargar los productos

### 3. Crear Usuario Admin

En **Supabase → Authentication → Users**, crea un usuario con email y contraseña. Este usuario tendrá acceso al panel de administración.

### 4. Verificar Storage Bucket

Ve a **Supabase → Storage** y verifica que el bucket `products` existe:
- **Público:** Sí (para lectura de imágenes)
- **Políticas:** Ya configuradas en los scripts SQL

## 🔨 Desarrollo

```bash
npm run dev
```

Abre http://localhost:3000

## 📦 Build

```bash
npm run build
```

Los archivos estáticos se generan en `dist/`.

## 🌐 Despliegue en Cloudflare Pages

### Opción 1: Conexión directa con Git

1. Sube el código a GitHub/GitLab
2. En Cloudflare Pages → Create a project → Connect to Git
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy

### Opción 2: Deploy manual

```bash
npm run build
npx wrangler pages deploy dist --project-name=ecohavana
```

### Variables de entorno en Cloudflare Pages

Añade en Cloudflare Pages → Settings → Environment variables:

```
VITE_SUPABASE_URL=https://lehknggjclanufkdqxlj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📂 Estructura del Proyecto

```
├── src/
│   ├── components/
│   │   ├── BottomNav.tsx      # Navegación flotante tipo píldora
│   │   └── ScrollToTop.tsx    # Scroll al inicio en navegación
│   ├── context/
│   │   ├── CartContext.tsx     # Estado del carrito
│   │   └── ProductContext.tsx  # Estado de productos (Supabase/localStorage)
│   ├── data/
│   │   └── products.ts        # Catálogo inicial de productos
│   ├── lib/
│   │   ├── supabase.ts        # Cliente de Supabase
│   │   └── storage.ts         # Servicio de almacenamiento de imágenes
│   ├── pages/
│   │   ├── Home.tsx           # Página de inicio
│   │   ├── Catalog.tsx        # Catálogo con filtros
│   │   ├── ProductDetail.tsx  # Detalle de producto
│   │   ├── Cart.tsx           # Carrito + checkout WhatsApp
│   │   ├── Contact.tsx        # Contacto
│   │   ├── Offers.tsx         # Ofertas
│   │   └── Admin.tsx          # Panel admin (Supabase Auth)
│   ├── App.tsx                # Router principal
│   ├── main.tsx               # Entry point
│   └── index.css              # Estilos + Tailwind
├── schema.sql                 # Schema de base de datos + RLS
├── seed.sql                   # Datos iniciales
├── .env.local                 # Variables de entorno (configuradas)
└── README.md
```

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Verde Energía | `#16A34A` | Acentos, CTAs, activo |
| Carbón | `#111827` | Texto, títulos |
| Gris Claro | `#F3F4F6` | Fondos |
| Blanco | `#FFFFFF` | Cards, nav |

## 📱 Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio - Hero, destacados, categorías |
| `/catalogo` | Catálogo completo con filtros |
| `/producto/:id` | Detalle de producto |
| `/ofertas` | Productos en oferta |
| `/carrito` | Carrito + checkout WhatsApp |
| `/contacto` | Información de contacto |
| `/admin` | Panel de administración (requiere Supabase Auth) |

## 🔐 Seguridad

- **RLS activado** en todas las tablas
- **Lectura pública:** Cualquier usuario puede ver productos
- **Escritura restringida:** Solo usuarios autenticados (admin)
- **Supabase Auth:** Login seguro para administradores
- **Storage:** Bucket público para lectura, escritura solo auth

## 🖼 Sistema de Imágenes

Las imágenes se gestionan de forma híbrida:

1. **Con Supabase configurado:**
   - Las imágenes se suben al bucket `products` de Supabase Storage
   - Se comprimen automáticamente (max 800px, 80% calidad)
   - Se obtienen URLs públicas de Supabase

2. **Sin Supabase (fallback):**
   - Las imágenes se guardan en localStorage como base64
   - Límite de 20 imágenes (limpieza automática)

## 📞 WhatsApp Integration

- Número: +53 55072322
- Link: `https://wa.me/5355072322`
- El checkout genera un mensaje pre-llenado con el detalle del pedido

## 📝 Notas

- Todos los precios en USD
- Transporte según zona (La Habana principalmente)
- Garantía variable por producto (7 días a 1 mes)
- El panel admin permite CRUD completo de productos
- Las imágenes se suben automáticamente a Supabase Storage

## 🐛 Troubleshooting

**Error de CORS en Supabase:**
Verifica que tu dominio esté en Supabase → Authentication → URL Configuration

**Imágenes no cargan:**
- Verifica que el bucket "products" existe en Supabase → Storage
- Verifica las políticas del bucket (lectura pública)

**Error de autenticación:**
- Verifica que el usuario admin existe en Supabase → Authentication → Users
- Verifica que el email y contraseña son correctos

**Build falla:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📄 Licencia

Privado - EcoHavana 2024
