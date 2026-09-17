# Módulo 3: Seguridad, Autenticación y Control de Acceso (RBAC)

## 1. Filosofía de Seguridad en OrderFlow
En el comercio electrónico y plataformas SaaS B2B, la seguridad no es un parche posterior, sino una característica fundamental de la arquitectura. OrderFlow maneja contraseñas, catálogos de precios, información de clientes y transacciones monetarias reales.

La plataforma implementa el principio de **Mínimo Privilegio (PoLP)** y **Defensa en Profundidad**, combinando:
1. Almacenamiento criptográfico irreversible de credenciales.
2. Autenticación *Stateless* basada en estándares RFC (JSON Web Tokens).
3. Control de Acceso Basado en Roles (RBAC).
4. Hardening perimetral y cabeceras de seguridad HTTP de grado A+.

---

## 2. Gestión de Credenciales y Criptografía

### ¿Por qué nunca se guardan contraseñas en texto plano?
Si una base de datos sufre una filtración, las contraseñas en texto plano exponen a todos los usuarios. Incluso los algoritmos de hash antiguos como MD5 o SHA-1 son vulnerables a tablas arcoíris (*rainbow tables*) y ataques por fuerza bruta con GPUs modernas.

### La Solución en OrderFlow: `bcrypt` con Salt Rounds = 10
* **Salt Aleatorio:** Antes de calcular el hash, bcrypt genera una cadena aleatoria única (*Salt*). Esto garantiza que si dos usuarios tienen la misma contraseña ("admin123"), sus hashes resultantes en la base de datos serán completamente distintos.
* **Costo Computacional Ajustable:** bcrypt está diseñado intencionalmente para ser computacionalmente intensivo, haciendo inviables los ataques de diccionario masivos.
* En `backend/src/services/auth.service.js`:
  ```javascript
  const passwordHash = await bcrypt.hash(password, 10);
  const isValid = await bcrypt.compare(candidatePassword, user.passwordHash);
  ```

---

## 3. Autenticación con JSON Web Tokens (JWT)

OrderFlow utiliza autenticación **Stateless**: el servidor no almacena sesiones en memoria (lo que facilita escalar horizontalmente en múltiples contenedores de Render sin necesidad de un cluster de Redis para sesiones).

### La Estructura del JWT:
Un token JWT consta de 3 partes separadas por puntos (`header.payload.signature`):
1. **Header:** Algoritmo de firma (`HS256`).
2. **Payload:** Reivindicaciones públicas verificadas:
   * `sub`: ID único del usuario (CUID).
   * `role`: Rol asignado (`ADMIN`, `SUPERADMIN`, `CUSTOMER`).
   * `restaurantId`: ID del restaurante vinculado.
   * `exp`: Fecha de expiración (ej. 7 días).
3. **Signature:** Firma criptográfica calculada con la clave secreta del servidor `JWT_SECRET`:
   $$\text{HMAC-SHA256}(\text{base64UrlEncode}(\text{header}) + \text{"."} + \text{base64UrlEncode}(\text{payload}), \text{JWT\_SECRET})$$

Si un atacante modifica su payload para cambiarse el rol a `SUPERADMIN`, la firma deja de coincidir y el servidor rechaza la petición con error `401 Unauthorized`.

---

## 4. Matriz de Control de Acceso Basado en Roles (RBAC)

El sistema define 3 roles primarios en base de datos (`UserRole`):

| Rol | Alcance | Permisos Principales |
| :--- | :--- | :--- |
| **`CUSTOMER`** | Público / Cliente | Ver menú público, armar carrito, crear pedidos propios, ver historial personal de pedidos. |
| **`ADMIN`** | Local / Tenant | Crear/editar productos y categorías de su restaurante, gestionar estados de cocina, ver analíticas de ventas locales, configurar métodos de pago (Wompi/Nequi). No puede ver otros restaurantes. |
| **`SUPERADMIN`** | Global / Plataforma | Crear nuevos restaurantes, suspender comercios, auditar métricas globales, gestionar la facturación del SaaS. |

### Implementación mediante Middlewares de Express (`auth.middleware.js`):
Los endpoints se blindan mediante composición de funciones:
```javascript
// Ruta pública: cualquiera puede ver el menú
router.get('/menu', tenantMiddleware, menuController.getMenu);

// Ruta protegida para el restaurante: solo ADMIN o SUPERADMIN
router.post('/products', authenticate, requireAdmin, productController.create);

// Ruta exclusiva de plataforma: solo SUPERADMIN
router.post('/superadmin/restaurants', authenticate, requireSuperAdmin, superAdminController.createRestaurant);
```

---

## 5. Hardening Perimetral y Cabeceras HTTP (A+ en Auditorías)

En la auditoría de seguridad del frontend (`frontend/vercel.json`), se implementaron cabeceras estrictas para neutralizar vectores comunes de ataque web:

* **`Content-Security-Policy (CSP)`:** Restringe el origen de scripts, fuentes e imágenes. Impide ataques de **Cross-Site Scripting (XSS)** y la inyección de iframes maliciosos.
* **`Strict-Transport-Security (HSTS)`:** `max-age=31536000; includeSubDomains; preload`. Obliga al navegador a comunicarse exclusivamente a través de HTTPS cifrado, bloqueando ataques de *Man-In-The-Middle (MITM)* y *SSL Stripping*.
* **`X-Frame-Options: DENY`:** Impide que atacantes embeban OrderFlow dentro de un `<iframe` en otra web para realizar **Clickjacking** (hacer que el usuario haga clic en un botón invisible).
* **`X-Content-Type-Options: nosniff`:** Evita que el navegador intente adivinar el tipo MIME de archivos ejecutables disfrazados de imágenes.
* **`Cross-Origin-Opener-Policy: same-origin`:** Aísla el contexto de navegación en memoria contra ataques basados en temporización y fugas de espectro (*Spectre*).

---

## 6. Resumen Pedagógico para Audio/Video
* **Analogía del JWT:** El JWT es como el pasaporte con chip biométrico: el servidor no necesita guardar una copia física de ti; lee el pasaporte, valida el sello holográfico (firma) y sabe de inmediato a qué salas puedes entrar.
* **Lección de Seguridad:** La seguridad web se logra en capas: no basta con validar en el frontend; cada endpoint del backend debe verificar el rol y el `restaurantId` de forma autónoma.
