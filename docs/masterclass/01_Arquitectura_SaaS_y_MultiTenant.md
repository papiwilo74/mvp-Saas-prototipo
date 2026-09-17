# Módulo 1: Arquitectura SaaS Multi-Tenant y Diseño del Sistema

## 1. Introducción y Visión General
**OrderFlow** es una plataforma SaaS (*Software as a Service*) de comercio electrónico directo diseñada para el sector gastronómico (restaurantes, cadenas de comida rápida, pizzerías, cafeterías y dark kitchens). Su misión principal es transformar el modelo de comercialización de los restaurantes, permitiéndoles tener su propia tienda online de pedidos directa, rápida y optimizada para dispositivos móviles.

Tradicionalmente, un restaurante se ve atrapado entre dos extremos:
1. **Pagar comisiones asfixiantes (20% al 30%)** a plataformas intermediarias como Rappi o UberEats, donde el restaurante no es dueño de la relación con el cliente ni de sus datos.
2. **Pagar millones de pesos por un desarrollo a medida**, con altos costos de servidores, mantenimiento técnico y actualizaciones complejas.

OrderFlow resuelve este dilema mediante una **arquitectura Multi-Tenant moderna**: una sola plataforma en la nube capaz de atender a cientos o miles de comercios diferentes, dándole a cada uno su propio catálogo, marca, colores, personal y flujo de pedidos, con un costo de mantenimiento marginal para el operador del SaaS.

---

## 2. ¿Qué es Multi-Tenancy y por qué Aislamiento Lógico?

En ingeniería de software existen tres formas clásicas de construir un sistema multi-cliente:

### A. Base de Datos Separada por Cliente (Aislamiento Físico)
Cada restaurante tiene su propio servidor de base de datos o instancia independiente.
* **Ventaja:** Máximo aislamiento de datos.
* **Desventaja fatal para un SaaS emergente:** Costos prohibitivos. Si tienes 100 restaurantes, pagarías 100 bases de datos. Las migraciones requieren actualizar 100 bases de datos una por una.

### B. Esquema Separado por Cliente (Schema-based Multi-Tenancy)
Una sola base de datos física, pero con esquemas separados (	enant_restaurante1, 	enant_restaurante2).
* **Ventaja:** Datos aislados a nivel de esquema.
* **Desventaja:** Agota el pool de conexiones en arquitecturas Serverless y complica herramientas automáticas de migración.

### C. Base de Datos Compartida con Aislamiento Lógico por 	enantId (Modelo OrderFlow)
Todos los comercios comparten la misma base de datos relacional y las mismas tablas maestras (Product, Order, Category, User), pero **cada registro lleva una columna obligatoria 
estaurantId (clave foránea)**.
* **Ventajas del enfoque de OrderFlow:**
  * **Costo-Eficiencia Extrema:** Permite correr sobre tiers serverless como Neon PostgreSQL, reduciendo el costo mensual de infraestructura prácticamente a cero en fases iniciales.
  * **Migraciones Atómicas:** Al actualizar una tabla o añadir una columna, se ejecuta una sola migración con Prisma ORM (prisma migrate deploy) y todos los restaurantes reciben la mejora instantáneamente.
  * **Analítica Global y Agilidad:** El SuperAdmin puede consultar métricas agregadas del ecosistema con simples consultas SQL sin tener que conectar a múltiples bases de datos.

---

## 3. El Viaje de una Petición (Request Lifecycle)

¿Cómo sabe el sistema si el usuario que entra está pidiendo una hamburguesa en 'Demo Burger' o en 'Aura Skin'?

`
                  [ Navegador del Cliente ]
                             │
                             ▼ Accede a: orderflowapp.online/menu?restaurant=aura-skin
                [ Frontend SPA en Vercel (React) ]
                             │
                             │ 1. useLocation() y searchParams extraen: 'aura-skin'
                             │ 2. Realiza petición HTTP: GET /api/menu?restaurant=aura-skin
                             ▼
               [ Backend API en Render (Node.js/Express) ]
                             │
                             ▼ [ Middleware: tenantMiddleware ]
                             │ 1. Busca el slug 'aura-skin' en la tabla Restaurant
                             │ 2. Obtiene el UUID interno (ej: 'c4b8e1a2-...')
                             │ 3. Inyecta req.restaurantId = 'c4b8e1a2-...'
                             ▼
              [ Controladores y Servicios (Prisma ORM) ]
                             │ 1. prisma.product.findMany({ where: { restaurantId: req.restaurantId, isAvailable: true } })
                             ▼
              [ Base de Datos PostgreSQL en Neon ]
                             │ Devuelve únicamente los productos de ese comercio
                             ▼
             [ JSON de Respuesta formateado -> Cliente ]
`

### Resolución en el Frontend (rontend/src/config/env.js)
El frontend analiza la URL con una cascada jerárquica de 3 niveles:
1. Parámetro de búsqueda explícito: ?restaurant=slug.
2. Ruta canónica: /aura-skin/menu.
3. Valor por defecto de entorno (VITE_RESTAURANT_SLUG) que funciona como respaldo.

Cuando el contexto detecta el slug, descarga la configuración visual del restaurante: colores primarios (--color-primary), colores secundarios (--color-secondary), banners, horarios y logo, transformando la interfaz visual dinámicamente.

---

## 4. Separación de Responsabilidades: Frontend vs Backend

OrderFlow implementa el principio de **desacoplamiento total**:

| Capa | Responsabilidad | Tecnologías Principales | Hosting |
| :--- | :--- | :--- | :--- |
| **Frontend (Cliente)** | Interfaz de usuario, animaciones, gestión del carrito, responsive mobile, PWA | React 18, Vite, Tailwind CSS, Lucide Icons, TanStack Query | Vercel Edge CDN |
| **Backend (API)** | Autenticación, reglas de negocio, validación de stock, cálculos de precios, websockets | Node.js 24, Express, Prisma ORM, Socket.io | Render Web Service |
| **Persistencia** | Integridad referencial, transacciones ACID, índices | PostgreSQL con pooling de conexiones | Neon Serverless |

### La Ventaja de la Arquitectura SPA + API REST:
Si el frontend se actualiza (por ejemplo, cambiando un botón o agregando un nuevo banner), no requiere reiniciar el servidor backend. Y si el backend escala en más instancias o cambia de proveedor cloud, el frontend no sufre interrupción alguna.

---

## 5. Prevención de Brechas entre Comercios (Cross-Tenant Leakage)

En un SaaS multi-inquilino, el riesgo de seguridad número uno es el **Cross-Tenant Data Leak** (que el dueño del Restaurante A pueda ver las ventas o modificar los precios del Restaurante B).

OrderFlow aplica una estrategia de **Defensa en Profundidad (Defense in Depth)** con 3 barreras:
1. **Firma Criptográfica en JWT:** El token de sesión de un administrador contiene de forma inmutable su 
estaurantId. El usuario no puede alterar este valor en su navegador sin invalidar la firma criptográfica HMAC SHA-256.
2. **Middleware 
equireTenantAccess:** En cada endpoint sensible (crear producto, cambiar estado de pedido, editar configuración), Express verifica que el recurso que se intenta modificar pertenezca al 
estaurantId presente en el token.
3. **Filtro Mandatorio en el ORM:** Las consultas de Prisma nunca hacen prisma.order.findMany() global. Siempre incorporan { where: { restaurantId } }.

---

## 6. Resumen Pedagógico para Audio/Video
* **Concepto Central:** Multi-Tenancy es compartir la casa (servidores y base de datos) pero teniendo cada quien su propia habitación con cerradura blindada (
estaurantId).
* **Valor para el Negocio:** Permite operar con costos mínimos fijos y máxima escalabilidad.
* **Lección de Ingeniería:** El aislamiento no depende de tener servidores separados, sino de una arquitectura estricta de validación en los middlewares de la API.
