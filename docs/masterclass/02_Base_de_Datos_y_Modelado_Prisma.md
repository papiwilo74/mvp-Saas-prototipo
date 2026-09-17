# Módulo 2: Base de Datos, Modelado Relacional y Prisma ORM

## 1. Introducción al Motor de Persistencia
En el corazón de **OrderFlow** reside una base de datos relacional **PostgreSQL**, gestionada a través del proveedor Serverless **Neon** y operada en el backend mediante **Prisma ORM**.

A diferencia de las bases de datos NoSQL basadas en documentos (como MongoDB), un sistema de pedidos y transacciones financieras exige **garantías ACID** (Atomicidad, Consistencia, Aislamiento y Durabilidad):
* Si un cliente paga un pedido, el registro del pago, la creación de la comanda y la reducción del stock deben completarse con éxito juntos; si uno falla, toda la transacción debe revertirse (*Rollback*) para evitar descuadres contables.
* Las relaciones entre comercios, productos, categorías y pedidos deben mantener **integridad referencial estricta** (no pueden existir pedidos huérfanos sin restaurante ni productos asociados a categorías inexistentes).

---

## 2. El Esquema Relacional de OrderFlow (schema.prisma)

El modelo de datos se estructura en torno a la entidad raíz Restaurant:

`
                 ┌──────────────┐
                 │  Restaurant  │ (Tenant Principal)
                 └──────┬───────┘
         ┌──────────────┼──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
┌────────────────┐┌───────────┐┌──────────────┐┌──────────────┐
│RestaurantConfig││   User    ││   Category   ││   Customer   │
└────────────────┘└─────┬─────┘└──────┬───────┘└──────┬───────┘
                        │             ▼               │
                        │      ┌──────────────┐       │
                        │      │   Product    │       │
                        │      └──────┬───────┘       │
                        ▼             ▼               ▼
                       ┌───────────────────────────────┐
                       │             Order             │
                       └──────────────┬────────────────┘
                                      ▼
                               ┌─────────────┐
                               │  OrderItem  │
                               └─────────────┘
`

### Entidades Centrales y sus Funciones:

1. **Restaurant:** La raíz de cada negocio. Define el id (UUID/CUID), 
ame y el slug único (ej. ura-skin, demo-burger) que se usa en la URL pública.
2. **RestaurantConfig (Relación 1 a 1 con Restaurant):** Almacena las configuraciones dinámicas:
   * Colores de marca (primaryColor, secondaryColor).
   * Zonas de reparto con tarifas y tiempos estimados (deliveryZones en formato JSONB).
   * Cupones activos de descuento (coupons en JSONB).
   * Credenciales de pago de Wompi (wompiPublicKey, etc.) y números de Nequi/Bre-B.
3. **User:** Administradores, empleados y clientes autenticados. Maneja roles (SUPERADMIN, ADMIN, CUSTOMER), hashes de contraseña bcrypt y tokens de reseteo.
4. **Category & Product:** Catálogo del menú. Cada producto tiene price con precisión decimal fija (Decimal(10, 2)), control de inventario (stock, 	rackStock), imágenes y soporte para variantes (tamaños, salsas, ingredientes extra).
5. **Order & OrderItem:**
   * Order: Número de pedido incremental por restaurante (OrderCounter), estado (PENDING, PREPARING, ON_THE_WAY, DELIVERED, CANCELLED), método de pago (CASH, NEQUI, CARD, WOMPI), subtotal, costo de envío, propina y total.
   * OrderItem: Almacena el price unitario en el instante exacto de la compra. Si el restaurante sube el precio de la hamburguesa mañana, el pedido histórico no se altera.
6. **Customer & LoyaltyTier:** CRM y programa de fidelización del restaurante. Guarda puntos acumulados y niveles (BRONCE, PLATA, ORO, DIAMANTE).

---

## 3. ¿Por qué Prisma ORM y cómo combate Inyecciones SQL (SQLi)?

En Node.js existen tres formas de consultar una base de datos:
1. **Drivers SQL nativos (pg):** Escribir SELECT * FROM products WHERE id = ' + id + '.
   * *Riesgo mortal:* Altamente vulnerable a SQL Injection si se olvida parametrizar una variable.
2. **Constructores de consultas (Knex):** Menor riesgo pero sin tipado estricto.
3. **Prisma ORM (El estándar moderno de OrderFlow):**
   * **Tipado Seguro en Tiempo de Compilación:** Si intentas consultar una columna que no existe o enviar un texto donde se espera un número, el linter y TypeScript/Vitest marcan error antes de ejecutar el código.
   * **Inmunidad Nativa a SQL Injection:** Prisma nunca concatena cadenas en bruto. Cada consulta enviada a PostgreSQL utiliza consultas preparadas (*Prepared Statements*) parametrizadas a nivel de protocolo binario:
     `javascript
     // Seguro 100% contra SQLi:
     const products = await prisma.product.findMany({
       where: {
         restaurantId: tenantId,
         name: { contains: userInput, mode: 'insensitive' }
       }
     });
     `
   * **Relaciones Atómicas:** Permite crear una orden completa con sus 5 items en una sola llamada estructurada sin escribir engorrosos INSERT INTO:
     `javascript
     await prisma.order.create({
       data: {
         restaurantId,
         total,
         orderItems: {
           create: items.map(item => ({ productId: item.id, quantity: item.quantity, unitPrice: item.price }))
         }
       }
     });
     `

---

## 4. Índices y Rendimiento en PostgreSQL

A medida que los pedidos crecen a decenas de miles, buscar productos o pedidos sin índices obligaría a PostgreSQL a hacer un escaneo secuencial (*Sequential Scan*), leyendo todo el disco.

OrderFlow define índices estratégicos en el schema:
* @@index([restaurantId]): Crucial para que cualquier filtro por comercio sea inmediato (O(log n)).
* @@unique([restaurantId, slug]) / @@unique([restaurantId, name]): Garantiza que dos categorías o productos no se dupliquen dentro del mismo restaurante.
* @@index([restaurantId, status]): Acelera la pantalla de cocina (AdminKitchenPage), que consulta únicamente los pedidos PENDING o PREPARING.

---

## 5. Migraciones en Producción (prisma migrate deploy)

En entornos cloud con CI/CD (como Render y Neon):
* **Nunca se usa prisma db push en producción** (podría borrar tablas o perder datos por accidente).
* Se utiliza el comando profesional:
  `ash
  npx prisma migrate deploy
  `
  Este comando compara el historial de migraciones registradas en la tabla interna _prisma_migrations y aplica de forma atómica y ordenada únicamente los archivos SQL pendientes. Si una migración falla, se detiene antes de dañar la base de datos viva.

---

## 6. Resumen Pedagógico para Audio/Video
* **Analogía:** La base de datos es la cocina central y Prisma es el chef ejecutivo que traduce las órdenes sin equivocarse de plato ni dejar entrar ingredientes extraños (SQL Injection).
* **Lección:** Guardar precios históricos en OrderItem es obligatorio en e-commerce; de lo contrario, al cambiar el precio del menú en el admin, cambiarían retroactivamente los balances de pedidos de meses anteriores.
