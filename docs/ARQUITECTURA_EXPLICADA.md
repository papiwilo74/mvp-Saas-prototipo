# Arquitectura explicada

## Vision general

El proyecto esta dividido en dos aplicaciones:

- `backend/`: API REST y logica de negocio
- `frontend/`: interfaz React para clientes y administradores

## Flujo principal de pedidos

1. El cliente entra al menu publico
2. El frontend consulta `/api/menu`
3. El cliente agrega productos al carrito
4. En checkout se hace `POST /api/orders`
5. El backend valida productos, calcula total, crea/actualiza cliente CRM y guarda el pedido
6. El frontend redirige a WhatsApp

## Backend por capas

### `routes/`
Define URLs y middlewares por endpoint.

### `controllers/`
Reciben la request y delegan trabajo a servicios.

### `services/`
Aqui vive la logica real:

- autenticacion
- pedidos
- productos
- clientes
- reportes

### `validators/`
Usan Zod para validar `body`, `params` y `query`.

### `middlewares/`
Controlan autenticacion, errores, validacion y rate limiting.

## Frontend por capas

### `pages/`
Pantallas completas.

### `components/`
Bloques reutilizables.

### `context/`
Estado global:

- autenticacion
- carrito
- configuracion del restaurante

### `services/api.js`
Cliente Axios centralizado.

## Autenticacion

1. Login en `/api/auth/login`
2. El backend devuelve `token`
3. El frontend lo guarda en `localStorage`
4. Axios lo manda en `Authorization: Bearer ...`
5. Las rutas protegidas usan `ProtectedRoute`

## Paginacion

Ahora productos, pedidos y clientes no cargan todo de una sola vez.

Eso mejora:

- rendimiento
- escalabilidad
- experiencia admin

## Seguridad

Actualmente tienes:

- Helmet
- CORS restringido
- JWT
- bcrypt
- validacion con Zod
- rate limiting
- CSP en Vercel

## Recomendacion de siguiente fase

Si despues quieres una version mas profesional, el orden recomendado es:

1. tests
2. cookies httpOnly
3. subida de imagenes
4. notificaciones reales
5. PWA