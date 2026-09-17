# Módulo 6: Infraestructura Cloud, DevOps y Monitoreo con Sentry

## 1. La Filosofía DevOps en OrderFlow: La Triada Cloud Moderna
Muchos proyectos de desarrollo de software sufren el síndrome del *"En mi máquina local sí funcionaba"*. Llevar una aplicación a producción real con dominio personalizado, certificados SSL, múltiples clientes concurrentes y tolerancia a fallos requiere una arquitectura en la nube bien planificada.

En lugar de alquilar un servidor virtual monolítico (VPS) tradicional que requeriría mantenimiento constante de Linux, parches de seguridad manuales y configuraciones complejas de NGINX, OrderFlow utiliza una **estrategia multi-proveedor gestionada (Triada Cloud)**:

```
                            [ Tráfico Global de Internet ]
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
                   ▼ (orderflowapp.online)                     ▼ (/api/* y WebSockets)
       ┌────────────────────────┐                  ┌────────────────────────┐
       │     VERCEL EDGE CDN    │                  │   RENDER WEB SERVICE   │
       │    (Frontend React)    │                  │  (Backend Node/Express)│
       └────────────────────────┘                  └───────────┬────────────┘
         * 0 cold start                              * Node 24 runtime
         * Cache global en 300+ ciudades             * Activo 24/7 (Starter)
         * Headers de seguridad                      * WebSockets permanentes
                                                               │
                                                               ▼ (Conexión Prisma)
                                                   ┌────────────────────────┐
                                                   │    NEON SERVERLESS     │
                                                   │      (PostgreSQL)      │
                                                   └────────────────────────┘
                                                     * Auto-scaling compute
                                                     * Connection pooling
                                                     * Backups automáticos
```

---

## 2. Los Tres Pilares de la Infraestructura

### Pilar 1: Vercel (Capa de Presentación y Distribución Edge)
* **Función:** Hospeda la aplicación cliente construida en Vite + React.
* **Por qué es ideal:**
  * Al compilarse a archivos estáticos puros (`HTML`, `JS`, `CSS`, imágenes), Vercel los replica instantáneamente en más de 300 centros de datos alrededor del mundo.
  * Cuando un cliente en Barranquilla o Bogotá entra a la tienda, los archivos viajan desde el nodo más cercano en menos de 50 milisegundos.
  * Cero tiempo de arranque en frío (*Cold Start*): la página siempre abre de forma instantánea.

### Pilar 2: Render (Capa de Cómputo y Lógica Empresarial)
* **Función:** Ejecuta el servidor Node.js/Express y administra el Gateway de WebSockets.
* **El dilema de la capa Free vs Starter ($7/mes):**
  * En el plan gratuito de Render, el servidor se "duerme" tras 15 minutos de inactividad para ahorrar memoria. Cuando entra una petición tras ese período, tarda entre **50 y 90 segundos** en iniciar (arranque en frío). Esto destruye la experiencia del usuario y hace pensar que la app está caída.
  * Con el plan **Starter ($7/mes)**, la instancia se mantiene activa **24 horas al día, 7 días a la semana**, garantizando respuestas en menos de 200 ms y conexiones WebSocket estables sin caídas.

### Pilar 3: Neon (Capa de Persistencia Serverless PostgreSQL)
* **Función:** Almacena todos los datos relacionales de los restaurantes y transacciones.
* **Por qué Serverless:**
  * Separa el almacenamiento en disco del procesador (Compute).
  * Incluye un *Connection Pooler* basado en PgBouncer por defecto, permitiendo que cientos de peticiones concurrentes compartan conexiones sin saturar la base de datos.
  * Cuando no hay tráfico, Neon suspende la CPU; pero a diferencia de Render, **Neon despierta en menos de 1 segundo**, haciéndolo imperceptible para el usuario.

---

## 3. Integración y Despliegue Continuo (CI/CD Automático)

El ciclo de desarrollo de OrderFlow sigue el estándar de la industria mediante **GitOps**:

```
[ Desarrollador Local ]
         │
         ├── 1. Modifica código (ej: AppLayout.jsx)
         ├── 2. Ejecuta tests locales: npm test (50 tests frontend, 141 backend)
         ├── 3. Ejecuta build de verificación: npm run build
         │
         ▼
[ Repositorio GitHub (Rama 'main') ]
         │
         ├── A) Vercel Webhook detecta el commit
         │      - Instala dependencias con caché
         │      - Corre Vite build en la nube
         │      - Despliega a producción en 45 segundos (orderflowapp.online)
         │
         └── B) Render Webhook detecta el commit
                - Corre npx prisma migrate deploy
                - Reinicia el proceso Node.js con Zero-Downtime
                - Emite logs de salud en tiempo real
```

Cualquier cambio empujado con `git push origin main` queda desplegado y disponible para todos los restaurantes en menos de 2 minutos sin intervención manual.

---

## 4. Observabilidad y Monitoreo de Errores con Sentry

En un sistema en producción con clientes y pagos reales, los errores son inevitables (un fallo en la API de pagos, un parámetro nulo en un navegador obsoleto, una desconexión de red).

El peor error de un ingeniero es esperar a que un cliente enojado llame por teléfono diciendo *"La página no funciona"*.

OrderFlow integra **Sentry**:
* **Frontend Sentry SDK:** Captura excepciones no controladas en el navegador del usuario y registra el *Stack Trace*, el modelo del teléfono, el navegador y las acciones previas que hizo el usuario (*Breadcrumbs*).
* **Backend Sentry SDK:** Captura errores `500` no capturados en Express y caídas de base de datos.
* **Alertas Inmediatas:** Envía notificaciones instantáneas por correo o Slack con el archivo exacto y la línea de código donde ocurrió la excepción, permitiendo corregir el fallo antes de que afecte a más usuarios.

---

## 5. Resumen Pedagógico para Audio/Video
* **Analogía:** La infraestructura es como un restaurante físico de alto nivel: Vercel es la fachada moderna y el salón impecable (siempre abierto); Render es la cocina central trabajando sin parar las 24 horas; y Neon es la despensa organizada donde cada ingrediente está etiquetado con precisión milimétrica.
* **Regla de Oro de Producción:** El costo de $7/mes de Render es la inversión básica para convertir un proyecto universitario o de portafolio en una empresa tecnológica operativa real.
