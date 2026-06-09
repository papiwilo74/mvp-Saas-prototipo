# FastFood MVP Comercial

MVP comercial mobile-first para demostrar una solucion de pedidos online a restaurantes de comida rapida. La prioridad es mostrar una experiencia profesional en celular y permitir personalizacion rapida por restaurante mediante configuracion.

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

1. Configura variables de entorno:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Instala dependencias:

```bash
cd backend && npm install
cd ../frontend && npm install
```

3. Inicializa Prisma:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

4. Ejecuta en desarrollo:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Credenciales seed

- Admin: `admin@demo.com` / `Admin123!`
- Cliente: `cliente@demo.com` / `Cliente123!`

## Pantallas MVP

- Cliente: landing, login, registro, menu con busqueda/filtros, detalle de producto, carrito, confirmacion, historial y perfil.
- Admin: dashboard, productos, pedidos y configuracion del restaurante.

## Personalizacion por restaurante

La entidad `RestaurantConfig` controla nombre, logo, colores, telefono, WhatsApp, direccion, email y redes sociales. El frontend consume esta configuracion desde `/api/restaurant-config`.

## Pagos

No hay pagos reales en esta etapa. El checkout simula pago por `Efectivo`, `Nequi` o `Tarjeta`, crea el pedido y lo deja en estado `Pendiente`.

## Despliegue

- Frontend en Vercel usando `frontend` como root directory.
- Backend en Railway usando `backend` como root directory.
- PostgreSQL en Supabase usando la cadena `DATABASE_URL`.
