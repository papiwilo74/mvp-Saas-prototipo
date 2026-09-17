# Módulo 4: Flujo de Pedidos, Lógica del Carrito y Tiempo Real con WebSockets

## 1. Introducción al Motor de Comandas
En un restaurante concurrido, un retraso de 2 minutos en enterarse de un nuevo pedido significa comida fría, clientes insatisfechos y domiciliarios esperando en la puerta. Los sistemas web tradicionales obligaban al personal de cocina a presionar "F5" o recargar la página constantemente para ver si entraba un nuevo pedido.

OrderFlow resuelve este problema mediante una **arquitectura en tiempo real basada en WebSockets (Socket.io)**: en el milisegundo exacto en que un cliente presiona "Confirmar Pedido" desde su teléfono, la comanda aparece de forma sonora y visual en la pantalla de cocina (`AdminKitchenPage`), sin que nadie tenga que refrescar el navegador.

---

## 2. La Máquina de Estados del Pedido (Order State Machine)

Un pedido en OrderFlow transita por un ciclo de vida unidireccional y estricto:

```
                  ┌──────────────┐
                  │   PENDING    │ (Pedido recibido, pago pendiente o confirmado)
                  └──────┬───────┘
                         │ El restaurante acepta el pedido
                         ▼
                  ┌──────────────┐
                  │  PREPARING   │ (En cocina, elaborando los alimentos)
                  └──────┬───────┘
                         │ El chef marca plato listo
                         ▼
                  ┌──────────────┐
                  │  ON_THE_WAY  │ (Entregado al repartidor o listo para recoger)
                  └──────┬───────┘
                         │ Entregado al cliente final
                         ▼
                  ┌──────────────┐
                  │  DELIVERED   │ (Comanda completada con éxito)
                  └──────────────┘

        * En cualquier momento antes de cocina: ──▶ [ CANCELLED ]
```

Cada transición de estado dispara dos acciones atómicas:
1. **Actualización en Base de Datos:** `prisma.order.update({ where: { id }, data: { status: nextStatus } })`.
2. **Emisión de Evento WebSocket:** `emitOrderStatusChanged(restaurantId, order)`.

---

## 3. Lógica del Carrito de Compras en el Frontend

El carrito de compras (`frontend/src/context/CartContext.jsx`) es el cerebro del cliente. No hace peticiones innecesarias al servidor hasta que el usuario decide finalizar la compra:

* **Gestión de Ítems y Variantes:** Permite agregar un producto con múltiples personalizaciones (ej. Hamburguesa Clásica + Queso Extra + Sin Cebolla). El carrito calcula un identificador de variante único para no mezclar dos hamburguesas con ingredientes diferentes.
* **Cálculo de Zonas de Entrega (`deliveryZones`):**
  * Si el cliente selecciona "Domicilio", el sistema evalúa la zona seleccionada (ej. "Norte de la Ciudad") y suma la tarifa correspondiente (`fee`).
  * Si el subtotal supera el monto mínimo (`minOrder`), habilita el botón de checkout.
* **Motor de Cupones de Descuento:**
  * Valida cupones porcentuales (ej. `15% OFF`) y cupones de valor fijo (ej. `$5.000 COP`).
  * Aplica topes máximos y mínimos de orden para proteger el margen del restaurante.
* **Persistencia Local (`localStorage`):** Si el cliente cierra el navegador o se le apaga el teléfono, su carrito sigue intacto cuando vuelve a entrar.

---

## 4. Arquitectura de WebSockets con Socket.io

El protocolo HTTP tradicional funciona bajo el esquema "Petición-Respuesta": el cliente pregunta y el servidor responde. No hay forma de que el servidor inicie la comunicación.

**WebSocket**, en cambio, establece un túnel TCP dúplex bidireccional persistente sobre el puerto 80/443:

```
[ Navegador del Cliente ]                           [ Servidor Node.js / Socket.io ]
           │                                                       │
           │ ── 1. HTTP Upgrade Handshake (GET /socket.io) ──────▶ │
           │ ◀─ 2. 101 Switching Protocols (Conexión Establecida) ─│
           │                                                       │
           │ ====== Túnel TCP Permanente Abierto (Bidireccional) ==│
           │                                                       │
           │ ── 3. Cliente hace POST /api/orders ────────────────▶ │
           │                                                       │ (Servidor procesa DB)
           │                                                       │ (Servidor emite evento)
           │                                                       │
[ Pantalla Cocina Admin ]                                          │
           │ ◀─ 4. 'kitchen-order' recibido de inmediato ──────────│ (Sonido de campana)
```

### El Concepto Crítico: Aislamiento por "Rooms" (Salas)
En un SaaS multi-tenant con 50 restaurantes conectados, la cocina de "Pizzas del Norte" **no puede recibir las notificaciones** de las hamburguesas de "Demo Burger".

En `backend/src/services/socket.service.js`:
```javascript
io.on('connection', (socket) => {
  const { restaurantId } = socket.handshake.query;

  // Cada cliente y admin se une exclusivamente a la sala de su restaurante
  socket.join(`restaurant:${restaurantId}`);

  // Solo usuarios autenticados con rol de cocina o admin entran a la sala de cocina
  const role = socket.data.user?.role;
  if (role === 'ADMIN' || role === 'SUPERADMIN' || role === 'KITCHEN') {
    socket.join(`kitchen:${restaurantId}`);
  }
});
```

Cuando entra un nuevo pedido, la emisión se envía a la sala específica:
```javascript
export function emitNewOrder(restaurantId, order) {
  io.to(`kitchen:${restaurantId}`).emit('kitchen-order', order);
  io.to(`restaurant:${restaurantId}`).emit('new-order', order);
}
```

---

## 5. La Pantalla de Cocina (KDS - Kitchen Display System)

La vista `AdminKitchenPage.jsx` está diseñada específicamente para ser utilizada en tablets táctiles dentro de la cocina:
* **Tarjetas tipo Kanban:** Divididas en columnas por estado (`Pendientes`, `En Preparación`, `Listos para Despacho`).
* **Temporizador Visual de Alerta:** Mide los minutos transcurridos desde que entró el pedido. Si supera los 20 minutos, la tarjeta cambia de color (verde -> amarillo -> rojo parpadeante) para alertar al cocinero.
* **Audio Feedback:** Cada comanda entrante reproduce una campana de sonido (`new-order.mp3`) mediante la Web Audio API.

---

## 6. Resumen Pedagógico para Audio/Video
* **Analogía:** Los WebSockets son como una llamada telefónica permanente que nunca se cuelga: en cuanto el cliente dice "quiero una pizza", la cocina ya lo escuchó en altavoz sin tener que marcar de nuevo.
* **Lección de Rendimiento:** Usar "Rooms" en Socket.io es lo que permite que una sola instancia de servidor maneje 100 cocinas diferentes sin saturar la red ni cruzar mensajes entre restaurantes.
