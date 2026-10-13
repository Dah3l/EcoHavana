# EnergíaCuba - E-commerce de Estaciones de Energía

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
cd energicuba

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local con tus credenciales de Supabase
```

## 🗄 Configuración de Base de Datos

### 1. Crear tablas

Ejecuta `schema.sql` en el SQL Editor de Supabase:

```sql
-- Copia y pega el contenido de schema.sql
```

Esto creará:
- `categories` - Categorías de productos
- `products` - Catálogo de productos
- `orders` - Registro de pedidos
- RLS policies (lectura pública, escritura solo autenticados)
- Storage bucket "products" (público para lectura)

### 2. Cargar datos iniciales

Ejecuta `seed.sql` en el SQL Editor:

```sql
-- Copia y pega el contenido de seed.sql
```

### 3. Crear usuario admin

En Supabase → Authentication → Users, crea un usuario con email y contraseña. Este usuario tendrá acceso al panel de administración.

### 4. Configurar Storage Bucket

En Supabase → Storage, crea un bucket llamado `products`:
- **Público:** Sí (para lectura de imágenes)
- **Políticas:** Escritura solo para usuarios autenticados

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
npx wrangler pages deploy dist --project-name=energicuba
```

### Variables de entorno en Cloudflare Pages

Añade en Cloudflare Pages → Settings → Environment variables:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## 📂 Estructura del Proyecto

```
├── src/
│   ├── components/
│   │   └── BottomNav.tsx      # Navegación flotante tipo píldora
│   ├── context/
│   │   └── CartContext.tsx     # Estado del carrito
│   ├── data/
│   │   └── products.ts        # Catálogo de productos
│   ├── pages/
│   │   ├── Home.tsx           # Página de inicio
│   │   ├── Catalog.tsx        # Catálogo con filtros
│   │   ├── ProductDetail.tsx  # Detalle de producto
│   │   ├── Cart.tsx           # Carrito + checkout WhatsApp
│   │   ├── Contact.tsx        # Contacto
│   │   ├── Offers.tsx         # Ofertas
│   │   └── Admin.tsx          # Panel admin
│   ├── App.tsx                # Router principal
│   ├── main.tsx               # Entry point
│   └── index.css              # Estilos + Tailwind
├── schema.sql                 # Schema de base de datos
├── seed.sql                   # Datos iniciales
├── .env.example               # Variables de entorno
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
| `/admin` | Panel de administración (requiere auth) |

## 🔐 Seguridad

- **RLS activado** en todas las tablas
- **Lectura pública:** Cualquier usuario puede ver productos
- **Escritura restringida:** Solo usuarios autenticados (admin)
- **Sin registro público:** Solo login para administradores
- **Storage:** Bucket público para lectura, escritura solo auth

## 📞 WhatsApp Integration

- Número: +53 55072322
- Link: `https://wa.me/5355072322`
- El checkout genera un mensaje pre-llenado con el detalle del pedido

## 📝 Notas

- Todos los precios en USD
- Transporte según zona (La Habana principalmente)
- Garantía variable por producto (7 días a 1 mes)
- El panel admin permite CRUD completo de productos
- Las imágenes se almacenan en Supabase Storage bucket "products"

## 🐛 Troubleshooting

**Error de CORS en Supabase:**
Verifica que tu dominio esté en Supabase → Authentication → URL Configuration

**Imágenes no cargan:**
Verifica que el bucket "products" existe y tiene políticas de lectura pública.

**Build falla:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📄 Licencia

Privado - EnergíaCuba 2024
