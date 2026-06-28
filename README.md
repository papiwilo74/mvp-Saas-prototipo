# FastFood MVP Comercial

MVP comercial mobile-first para demostrar una solucion de pedidos online a restaurantes de comida rapida. La prioridad es mostrar una experiencia profesional en celular y permitir personalizacion rapida por restaurante mediante configuracion. El flujo publico no requiere cuenta de cliente: el pedido se guarda y se envia por WhatsApp al restaurante.

## Stack

- Frontend: React, Vite, TailwindCSS, React Router, Axios
- Backend: Node.js, Express, JWT, Prisma
- Base de datos: PostgreSQL, compatible con Supabase
- Email transaccional: Resend

## Estructura

```txt
frontend/   Aplicacion web mobile-first para clientes y administradores
backend/    API REST, Prisma, autenticacion, pedidos, configuracion y correos
```

## Inicio rapido

1. Configura variables de entorno para local:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

2. Ajusta el backend local para que apunte a localhost:

```env
FRONTEND_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173"
DATABASE_URL="postgresql://postgres:password@localhost:5432/fastfood_saas?schema=public"
```

3. Instala dependencias:

```powershell
cd backend; npm install
cd ../frontend; npm install
```

4. Inicializa Prisma:

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Ejecuta en desarrollo:

```powershell
cd backend; npm run dev
cd ../frontend; npm run dev
```

## Variables de produccion

Cuando lo subas a GitHub y luego despliegues:

```env
# backend/.env
NODE_ENV=production
PORT=4000
DATABASE_URL="postgresql://postgres:TU_PASSWORD@TU_POOLER_HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:TU_PASSWORD@db.TU_REF.supabase.co:5432/postgres?sslmode=require"
JWT_SECRET="un-secreto-largo-y-seguro"
FRONTEND_URL="https://tu-frontend.vercel.app"
ALLOWED_ORIGINS="https://tu-frontend.vercel.app"
RESEND_API_KEY="re_xxxxxxxxx"
EMAIL_FROM="FastFood SaaS <pedidos@tu-dominio.com>"

# frontend/.env
VITE_API_URL="https://tu-backend.up.railway.app/api"
VITE_RESTAURANT_SLUG="demo-burger"
VITE_ENABLE_ORDER_HISTORY="true"
```

## Credenciales seed

- Admin: `admin@demo.com` / `Admin123!`

## Pantallas MVP

- Cliente: landing, menu con busqueda/filtros, detalle de producto, carrito, confirmacion y redireccion a WhatsApp sin crear cuenta.
- Admin: dashboard, productos, pedidos y configuracion del restaurante.

## Personalizacion por restaurante

La entidad `RestaurantConfig` controla nombre, logo, colores, telefono, WhatsApp, direccion, email y redes sociales. El frontend consume esta configuracion desde `/api/restaurant-config`.

## Pagos

No hay pagos reales en esta etapa. El checkout registra metodo `Efectivo`, `Nequi` o `Tarjeta`, crea el pedido, lo deja en estado `Pendiente` y abre WhatsApp con el mensaje listo para el restaurante.

## Despliegue

- Frontend en Vercel usando `frontend` como root directory.
- Backend en Railway usando `backend` como root directory.
- PostgreSQL en Supabase usando la cadena `DATABASE_URL`.

## Correos y dominio

Resend es opcional en el prototipo. Si no hay dominio/DNS verificado, el pedido no falla: WhatsApp y el panel admin son el canal principal. Cuando tengas dominio, configura `RESEND_API_KEY` y `EMAIL_FROM` con un remitente verificado para activar correos reales.


## Acceso

El registro publico de clientes esta deshabilitado. El cliente compra sin cuenta y el login queda para el administrador del restaurante.

## Mini CRM

Cada pedido crea o actualiza un cliente por restaurante. El administrador puede revisar clientes en /admin/customers, ver historial de pedidos, total comprado, datos de contacto, notas internas y abrir WhatsApp para seguimiento.

## Mejoras recientes

- Paginacion en productos, pedidos y clientes del panel admin
- Cache del menu publico en frontend
- Rate limiting en login y endpoints publicos
- Health check con verificacion de base de datos
- Rutas activas para `/orders` y `/profile`
- Demo publica con mejor presentacion visual para ventas
- Cards de producto mas premium
- Landing mas enfocada en valor comercial
- Menu publico con filtros y aspecto mas vendible

## Documentacion extra

- `docs/MEJORAS.md`
- `docs/ARQUITECTURA_EXPLICADA.md`
