<div align="center">

# 🍔 BcaXen — SaaS de Pedidos Online para Restaurantes

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-Queue-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com/)
[![Tests](https://img.shields.io/badge/Tests-138%20passing-brightgreen?logo=vitest&logoColor=white)](#-testing)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#-licencia)

**Plataforma SaaS multitenant que permite a restaurantes de comida rápida tener su propia página de pedidos online con marca propia, sin comisiones por pedido, y sin que el cliente necesite crear cuenta.**

[Demo en Vivo](#) · [Documentación](#-arquitectura) · [Instalación](#-inicio-rápido)

</div>

---

## 📋 Tabla de Contenidos

- [El Problema](#-el-problema)
- [La Solución](#-la-solución)
- [Arquitectura](#-arquitectura)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Inicio Rápido](#-inicio-rápido)
- [Variables de Entorno](#-variables-de-entorno)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [API Documentation](#-api-documentation)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)
- [Autor](#-autor)

---

## 🎯 El Problema

Los restaurantes pequeños en Colombia pagan **comisiones del 20-30%** a plataformas como Rappi o Didi Food. No tienen su propia presencia digital y dependen completamente de terceros para recibir pedidos online.

## 💡 La Solución

**BcaXen** les da su propia página de pedidos online con:
- **0% comisión** por pedido
- **Marca propia** (logo, colores, dominio)
- **Menú QR** para mesas
- **Pagos directos** (Nequi QR/Bre-B, Efectivo, Wompi)
- **Cocina en tiempo real** con pantalla KDS
- Suscripción mensual accesible ($80.000 - $150.000 COP)

---

## 🏗 Arquitectura

```mermaid
graph TB
    subgraph Cliente["🌐 Cliente - Vercel"]
        A[React 18 + Vite] --> B[TailwindCSS]
        A --> C[React Router v6]
        A --> D[Socket.io Client]
    end

    subgraph Servidor["☁️ Servidor - Azure VM"]
        E[Express.js API] --> F[Prisma ORM]
        E --> G[Socket.io Server]
        E --> H[BullMQ Workers]
        F --> I[(PostgreSQL 16)]
        H --> J[(Redis)]
        K[Nginx Reverse Proxy] --> E
    end

    A -- "HTTPS REST API" --> K
    D -- "WebSocket" --> G
    
    subgraph Servicios["🔌 Servicios Externos"]
        L[Cloudinary - Imágenes]
        M[Resend - Emails]
        N[Wompi - Pagos con Tarjeta]
        O[WhatsApp - Notificaciones]
    end

    E --> L
    E --> M
    E --> N
    E --> O
```

### Flujo de un Pedido

```mermaid
sequenceDiagram
    actor C as Cliente
    participant F as Frontend
    participant B as Backend API
    participant DB as PostgreSQL
    participant WS as WebSocket
    participant K as Cocina KDS

    C->>F: Navega al menú sin crear cuenta
    F->>B: GET /api/menu?restaurant=slug
    B->>DB: Query productos + categorías
    DB-->>B: Datos del menú
    B-->>F: JSON con menú completo
    
    C->>F: Agrega productos al carrito
    C->>F: Selecciona pago Nequi o Efectivo
    F->>B: POST /api/orders
    B->>DB: Crear pedido + actualizar cliente
    B->>WS: Emitir new-order
    WS-->>K: Notificación con audio
    B-->>F: Pedido confirmado con número
    
    F->>C: Pantalla de éxito + QR Nequi + WhatsApp
```

---

## 🛠 Tech Stack

<table>
<tr>
<td align="center" width="50%">

### Frontend
| Tecnología | Uso |
|:---|:---|
| **React 18** | UI components y SPA |
| **Vite 5** | Build tool y HMR |
| **TailwindCSS 3** | Utility-first styling |
| **React Router 6** | Client-side routing |
| **Socket.io Client** | Real-time updates |
| **Recharts** | Gráficas de analíticas |
| **Lucide React** | Iconografía |

</td>
<td align="center" width="50%">

### Backend
| Tecnología | Uso |
|:---|:---|
| **Node.js 22** | Runtime |
| **Express 4** | HTTP server y middleware |
| **Prisma 6** | ORM y migrations |
| **PostgreSQL 16** | Base de datos relacional |
| **Redis + BullMQ** | Colas de trabajo |
| **Socket.io** | WebSocket bidireccional |
| **Zod** | Validación de schemas |
| **Pino** | Structured logging |

</td>
</tr>
<tr>
<td align="center">

### DevOps y Calidad
| Tecnología | Uso |
|:---|:---|
| **Docker** | Containerización |
| **Nginx** | Reverse proxy y SSL |
| **Vitest** | Unit e integration tests |
| **Swagger/OpenAPI** | Documentación de API |
| **Helmet** | Security headers |
| **GitHub Actions** | CI/CD pipeline |

</td>
<td align="center">

### Servicios Externos
| Servicio | Uso |
|:---|:---|
| **Cloudinary** | Almacenamiento de imágenes |
| **Resend** | Emails transaccionales |
| **Wompi** | Pasarela de pagos |
| **WhatsApp API** | Notificaciones |
| **Mapbox/Google Maps** | Geocoding y zonas |

</td>
</tr>
</table>

---

## ✨ Features

### 🛒 Para el Cliente (Público)
- ✅ Menú digital responsive con búsqueda y filtros por categoría
- ✅ Detalle de producto con extras, combos y personalización
- ✅ Carrito inteligente con cálculo de domicilio por geolocalización
- ✅ **Checkout sin crear cuenta** — nombre, teléfono y dirección
- ✅ Pagos con **Nequi** (QR / Llave Bre-B / número), **Efectivo**, **Tarjeta** (Wompi)
- ✅ Botón de **enviar comprobante por WhatsApp** tras pago Nequi
- ✅ Seguimiento del pedido en tiempo real
- ✅ Cupones de descuento
- ✅ Historial de pedidos

### 👨‍🍳 Para el Restaurante (Admin)
- ✅ **Dashboard** con métricas: ventas del día, ticket promedio, pedidos por hora
- ✅ **Gestión de productos** con imágenes (Cloudinary), categorías y disponibilidad
- ✅ **Panel de pedidos** en tiempo real con cambio de estados
- ✅ **Pantalla KDS (Kitchen Display)** con alertas de audio y temporizador
- ✅ **Analíticas avanzadas** con gráficas de ingresos, productos top y horas pico
- ✅ **CRM de clientes** con historial, total gastado y contacto directo
- ✅ **Gestión de staff** con roles (Admin, Cajero, Cocina, Domiciliario)
- ✅ **Configuración completa**: colores, logo, horarios, zonas de delivery, cupones
- ✅ **Configuración de Nequi**: número, QR y Llave Bre-B

### 🏢 Para el SuperAdmin (SaaS)
- ✅ Dashboard global con todos los restaurantes
- ✅ Crear nuevos restaurantes con admin dedicado en un clic
- ✅ Ver métricas agregadas por restaurante
- ✅ Gestión centralizada de la plataforma

### 🔒 Seguridad y Producción
- ✅ JWT con refresh token rotation y revocación
- ✅ Rate limiting por IP y por endpoint
- ✅ Helmet CSP, CORS configurado, bcrypt hashing
- ✅ Validación de inputs con Zod en cada endpoint
- ✅ Graceful shutdown (SIGTERM/SIGINT)
- ✅ Health check endpoint (`/api/health`)
- ✅ Structured logging con Pino
- ✅ Cookie consent banner (GDPR / Habeas Data)
- ✅ Páginas legales: Términos de Servicio y Política de Privacidad

---

## 📂 Estructura del Proyecto

```
bcaxen/
├── 📁 backend/
│   ├── prisma/
│   │   ├── schema.prisma          # 15+ modelos (Restaurant, Order, Product...)
│   │   ├── seed.js                # Datos de demo
│   │   └── seed-demo-restaurants.js
│   ├── src/
│   │   ├── __tests__/             # 15 archivos de test (138 tests)
│   │   ├── controllers/           # Auth, Order, Product, Restaurant, Staff...
│   │   ├── middlewares/           # Auth JWT, Rate Limit, Validation, Upload
│   │   ├── routes/                # RESTful routes organizadas por recurso
│   │   ├── services/              # Business logic, Payment, Maps, Push, Socket
│   │   ├── validators/            # Zod schemas para cada endpoint
│   │   ├── queues/                # BullMQ workers (email, notificaciones)
│   │   ├── app.js                 # Express app config (Helmet, CORS, Routes)
│   │   └── server.js              # HTTP + WebSocket server startup
│   ├── Dockerfile                 # Multi-stage production build
│   └── package.json
│
├── 📁 frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # CookieBanner, DemoBanner, EmptyState...
│   │   │   └── product/           # ProductCard, CategoryFilter
│   │   ├── contexts/              # AuthContext, CartContext, ToastContext
│   │   ├── hooks/                 # useMenu, useApiQuery, useApiMutation
│   │   ├── layouts/               # AppLayout, AdminLayout, SuperAdminLayout
│   │   ├── pages/
│   │   │   ├── MenuPage.jsx       # Catálogo público
│   │   │   ├── CartPage.jsx       # Carrito + checkout
│   │   │   ├── CheckoutSuccessPage.jsx  # Confirmación + Nequi QR
│   │   │   ├── admin/             # 8 páginas de administración
│   │   │   └── superadmin/        # 4 páginas de gestión SaaS
│   │   ├── services/              # API client (Axios)
│   │   └── styles/                # TailwindCSS + animaciones custom
│   ├── index.html
│   └── package.json
│
├── 📁 docker/
│   └── nginx.conf                 # Reverse proxy config
├── docker-compose.yml             # Full stack containerizado
├── .github/workflows/             # CI/CD pipeline
└── README.md
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- [Node.js](https://nodejs.org/) >= 20.x
- [PostgreSQL](https://www.postgresql.org/) >= 14
- [Redis](https://redis.io/) (opcional, para colas)
- [Git](https://git-scm.com/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/papiwilo74/mvp-Saas-prototipo.git
cd mvp-Saas-prototipo
```

### 2. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales de PostgreSQL
```

### 3. Instalar dependencias

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Inicializar la base de datos

```bash
cd backend
npx prisma generate
npx prisma db push
node prisma/seed.js
node prisma/seed-demo-restaurants.js
```

### 5. Ejecutar en desarrollo

```bash
# Terminal 1 — Backend (http://localhost:4000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

### 6. Acceder

| Rol | URL | Credenciales |
|:---|:---|:---|
| **Cliente** | `http://localhost:5173/?restaurant=demo-burger` | Sin cuenta necesaria |
| **Admin** | `http://localhost:5173/login` | `admin@demo.com` / `Admin123!` |
| **SuperAdmin** | `http://localhost:5173/superadmin` | `superadmin@bcaxen.com` / `Super123!` |

---

## 🔐 Variables de Entorno

<details>
<summary><strong>Backend (.env)</strong></summary>

```env
# Server
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/fastfood_saas?schema=public"

# Authentication
JWT_SECRET="your-secret-key-min-32-chars-long!!"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars!!"
JWT_RESET_SECRET="your-reset-secret-min-32-chars!!"

# Frontend URL (CORS)
FRONTEND_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173"

# Image Upload (optional — falls back to local disk)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Email (optional)
RESEND_API_KEY=""
EMAIL_FROM="BcaXen <noreply@bcaxen.com>"

# Payments (optional)
WOMPI_PUBLIC_KEY=""
WOMPI_PRIVATE_KEY=""

# Maps (optional)
GOOGLE_MAPS_API_KEY=""

# Redis (optional)
REDIS_URL="redis://localhost:6379"
```

</details>

<details>
<summary><strong>Frontend (.env)</strong></summary>

```env
VITE_API_URL="http://localhost:4000/api"
VITE_RESTAURANT_SLUG="demo-burger"
VITE_ENABLE_ORDER_HISTORY="true"
```

</details>

---

## 🧪 Testing

El proyecto cuenta con **138 tests automatizados** organizados en 15 archivos:

```bash
cd backend && npm test
```

```
 ✓ src/__tests__/order.test.js              (10 tests)
 ✓ src/__tests__/payment.test.js            (8 tests)
 ✓ src/__tests__/payment.unit.test.js       (6 tests)
 ✓ src/__tests__/order.pricing.test.js      (45 tests)
 ✓ src/__tests__/token.test.js              (4 tests)
 ✓ src/__tests__/auth.integration.test.js   (7 tests)
 ... y 9 archivos más

 Test Files  15 passed (15)
      Tests  138 passed (138)
```

**Cobertura de tests:**
- 🔐 Autenticación: login, registro, refresh tokens, rate limiting
- 🛒 Pedidos: creación, pricing, descuentos, delivery, estados
- 💳 Pagos: Nequi, Efectivo, Wompi, validaciones
- 👥 Staff: CRUD, permisos por rol
- ⚙️ Config: validaciones de restaurante, multi-tenant

---

## 🌐 Despliegue

### Arquitectura de Producción

```
┌──────────────┐     HTTPS      ┌───────────────────────┐
│   Vercel     │ ──────────────▶│  Azure VM (Ubuntu)    │
│  (Frontend)  │                │                       │
│  React SPA   │                │  ┌─────────────────┐  │
└──────────────┘                │  │  Nginx (SSL)    │  │
                                │  │  :80 / :443     │  │
                                │  └────────┬────────┘  │
                                │           │           │
                                │  ┌────────▼────────┐  │
                                │  │  Express API    │  │
                                │  │  :4000          │  │
                                │  └────────┬────────┘  │
                                │           │           │
                                │  ┌────────▼────────┐  │
                                │  │  PostgreSQL 16  │  │
                                │  │  Redis          │  │
                                │  └─────────────────┘  │
                                └───────────────────────┘
```

### Con Docker Compose

```bash
# En el servidor Azure
git clone https://github.com/papiwilo74/mvp-Saas-prototipo.git
cd mvp-Saas-prototipo

# Configurar variables de producción
cp backend/.env.example backend/.env
# Editar con credenciales reales y JWT_SECRET de 32+ caracteres

# Levantar todo
docker compose up -d --build
```

---

## 📖 API Documentation

La API está documentada con **Swagger/OpenAPI** y disponible en:

```
http://localhost:4000/api-docs
```

### Endpoints principales

| Método | Endpoint | Descripción |
|:---|:---|:---|
| `GET` | `/api/menu` | Menú público del restaurante |
| `GET` | `/api/restaurant-config` | Configuración y branding |
| `POST` | `/api/orders` | Crear un pedido |
| `GET` | `/api/orders/:id` | Detalle de pedido |
| `PATCH` | `/api/orders/:id/status` | Cambiar estado (admin) |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `POST` | `/api/auth/refresh` | Renovar access token |
| `GET` | `/api/admin/dashboard` | Métricas del dashboard |
| `GET` | `/api/admin/analytics` | Analíticas detalladas |
| `GET` | `/api/health` | Health check |

---

## 🗺 Roadmap

- [x] MVP completo con pedidos, pagos y cocina
- [x] Multi-tenancy con slug por restaurante
- [x] Pantalla KDS con audio y temporizador
- [x] Analíticas avanzadas con gráficas
- [x] Pagos Nequi con QR, Bre-B y comprobante WhatsApp
- [x] Cookie consent y páginas legales
- [x] CI/CD con GitHub Actions
- [x] Docker + Docker Compose
- [x] 138 tests automatizados
- [ ] App móvil nativa (React Native)
- [ ] Integración con impresoras térmicas POS
- [ ] Programa de lealtad con puntos
- [ ] Notificaciones push al cliente
- [ ] Marketplace de restaurantes

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

## 👨‍💻 Autor

**Desarrollado por [@papiwilo74](https://github.com/papiwilo74)**

⭐ Si este proyecto te resulta útil, dale una estrella al repositorio.

</div>
