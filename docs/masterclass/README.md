# Plan Maestro de Aprendizaje: OrderFlow SaaS Full-Stack

Esta carpeta contiene la serie curricular completa de **7 módulos Markdown (.md)** que explican desde cero y a nivel de ingeniería avanzada toda la arquitectura, seguridad, bases de datos, flujos de pago, DevOps y negocio de **OrderFlow**.

## 📑 Índice de Módulos

1. [01_Arquitectura_SaaS_y_MultiTenant.md](01_Arquitectura_SaaS_y_MultiTenant.md)
   - Concepto de SaaS Multi-Tenant y aislamiento lógico por `tenantId`.
   - El viaje de una petición: resolución de slugs en frontend (`?restaurant=slug`) y backend.
   - Desacoplamiento SPA (React/Vite) vs REST API (Node/Express).
   - Prevención de Cross-Tenant Data Leaks.

2. [02_Base_de_Datos_y_Modelado_Prisma.md](02_Base_de_Datos_y_Modelado_Prisma.md)
   - PostgreSQL en Neon Serverless y garantías ACID.
   - Esquema relacional completo: Restaurants, Users, Categories, Products, Orders, Customers.
   - Por qué Prisma ORM previene de forma nativa SQL Injection (Prepared Statements).
   - Índices de rendimiento y migraciones seguras con `prisma migrate deploy`.

3. [03_Seguridad_Autenticacion_y_RBAC.md](03_Seguridad_Autenticacion_y_RBAC.md)
   - Hashing con bcrypt y Salt Rounds.
   - Autenticación Stateless con JSON Web Tokens (JWT) y firma HMAC-SHA256.
   - Matriz de Control de Acceso Basado en Roles (RBAC): `CUSTOMER`, `ADMIN`, `SUPERADMIN`.
   - Middlewares de protección en Express.
   - Cabeceras HTTP estrictas de producción (CSP, HSTS, X-Frame-Options, COOP).

4. [04_Flujo_de_Pedidos_y_Tiempo_Real_WebSockets.md](04_Flujo_de_Pedidos_y_Tiempo_Real_WebSockets.md)
   - La máquina de estados de un pedido (`PENDING` -> `PREPARING` -> `ON_THE_WAY` -> `DELIVERED`).
   - Lógica del carrito en el cliente: zonas de entrega, tarifas y cupones de descuento.
   - WebSockets bidireccionales con Socket.io: túneles TCP y aislamiento por Rooms (`restaurant:id`, `kitchen:id`).
   - La pantalla de Cocina (KDS) y alertas visuales/sonoras.

5. [05_Pasarelas_de_Pago_y_Webhooks_Colombia.md](05_Pasarelas_de_Pago_y_Webhooks_Colombia.md)
   - Métodos de pago en Colombia: Efectivo, Nequi, Bre-B y Wompi (Bancolombia).
   - Tokenización y cumplimiento PCI-DSS sin tocar datos de tarjetas.
   - Webhooks seguros: validación de firmas criptográficas HMAC SHA-256 y protección contra Timing Attacks (`timingSafeEqual`).
   - Idempotencia y conciliación atómica para evitar pedidos duplicados.

6. [06_Infraestructura_Cloud_DevOps_y_Sentry.md](06_Infraestructura_Cloud_DevOps_y_Sentry.md)
   - La Triada Cloud: Vercel (Edge CDN) + Render (Node.js 24 activo) + Neon (Serverless Postgres).
   - Solución al arranque en frío (Cold Start) y diferencia entre planes Free y Starter ($7/mes).
   - Pipeline de CI/CD automático desde GitHub (`main` -> Vercel & Render).
   - Monitoreo en vivo de excepciones y observabilidad con Sentry.

7. [07_Estrategia_Comercial_y_Venta_a_Restaurantes.md](07_Estrategia_Comercial_y_Venta_a_Restaurantes.md)
   - El dolor real: la comisión del 25% de Rappi y el desorden de WhatsApp.
   - Modelo de suscripción plana ($79.000 COP/mes) y el cálculo de ahorro para el restaurante.
   - La estrategia de prospección del "Caballo de Troya": demo personalizada en 5 minutos y cierre por WhatsApp.
   - Manejo de objeciones y métricas clave de SaaS (MRR, CAC, LTV, Churn).

---

## 🎙️ Cómo usar estos documentos en NotebookLM para crear Podcasts / Videos

1. Entra a [NotebookLM](https://notebooklm.google.com).
2. Crea un nuevo Notebook llamado **"OrderFlow SaaS Masterclass"**.
3. Sube los archivos `.md` de esta carpeta como fuentes de información (*Sources*).
4. Haz clic en **"Audio Overview / Deep Dive"** para generar un podcast o debate entre dos locutores IA que te explicarán cada módulo con analogías claras.
5. Puedes hacerle preguntas interactivas a NotebookLM sobre cualquier parte del código para estudiar para entrevistas o preparar presentaciones de venta.
