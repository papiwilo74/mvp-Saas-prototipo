# Módulo 5: Pasarelas de Pago, Finanzas y Webhooks Seguros en Colombia

## 1. El Reto de los Pagos en el E-Commerce Colombiano
El mercado gastronómico en Colombia presenta un ecosistema de pagos híbrido y particular. A diferencia de mercados como Estados Unidos o Europa, donde casi el 100% de las transacciones son con tarjeta de crédito, en Colombia los comercios dependen de una combinación de:
1. **Efectivo contra entrega:** Sigue representando más del 30% en zonas residenciales.
2. **Transferencias inmediatas por Nequi y Daviplata:** Populares por su inmediatez, pero problemáticas por los comprobantes falsos editados en aplicaciones móviles.
3. **Sistemas de interoperabilidad (Bre-B del Banco de la República / llaves QR):** La nueva ola de pagos interbancarios en tiempo real.
4. **Pasarelas de Pago Reguladas (Wompi de Bancolombia):** Tarjetas de crédito/débito, PSE y botón Bancolombia.

OrderFlow integra todos estos métodos, resolviendo el fraude y automatizando la conciliación contable del restaurante.

---

## 2. Métodos de Pago Soportados en OrderFlow

| Método | Tipo | Flujo de Verificación | Riesgo / Comisión |
| :--- | :--- | :--- | :--- |
| **Efectivo (`CASH`)** | Manual / Offline | El repartidor cobra al entregar en puerta. | Cero comisión digital. Riesgo de pedido fantasma si el cliente no responde. |
| **Nequi / Bre-B (`NEQUI`)** | Manual con QR Dinámico | El cliente escanea el QR oficial o transfiere al número guardado en `RestaurantConfig`. El comprobante se valida contra referencia de orden. | Sin comisión de pasarela. Protegido por validación de pedido único. |
| **Wompi (`WOMPI` / `CARD`)** | Pasarela Automatizada | Widget oficial de Wompi / Link de pago de un solo uso con redirección segura. | Comisión estándar de pasarela (~2.6% + $900 COP). Conciliación 100% desatendida. |

---

## 3. Arquitectura del Flujo Wompi (Hosted vs Server-to-Server)

¿Por qué el cliente nunca ingresa los datos de su tarjeta de crédito directamente en los servidores de OrderFlow?

Por normativas internacionales de seguridad financiera **PCI-DSS (Payment Card Industry Data Security Standard)**. Si un servidor almacena o procesa números de tarjeta en crudo, debe someterse a auditorías millonarias.

OrderFlow implementa el flujo seguro de tokenización:

```
[ Cliente en el Carrito ]
          │ 1. Selecciona "Pagar con Wompi / Tarjeta / PSE"
          │ 2. Envía POST /api/payments/create-link
          ▼
[ Backend OrderFlow (Node.js) ]
          │ 3. Llama a API de Wompi (/v1/payment_links) con credenciales privadas
          │ 4. Crea registro PaymentTransaction (status: PENDING)
          ▼
[ Wompi Checkout Modal ]
          │ 5. El cliente ingresa su tarjeta o PSE en la pasarela oficial de Bancolombia
          │    (OrderFlow jamás toca el número de tarjeta)
          ▼
[ Wompi aprueba la transacción ]
          │
          ├── A) Redirige al cliente a: orderflowapp.online/checkout/success
          │
          └── B) Envía notificación HTTP en segundo plano:
                 POST /api/payments/webhook (Server-to-Server)
```

---

## 4. La Anatomía de un Webhook Seguro (Prevención de Fraude)

### La Trampa del Novato: Confiar en la Redirección del Frontend
Muchos desarrolladores cometen el error crítico de marcar un pedido como "PAGADO" en cuanto el navegador del cliente llega a la URL `/checkout/success`. 
* **Por qué es un agujero de seguridad:** Un atacante puede simplemente escribir en la barra de direcciones `orderflowapp.online/checkout/success?order=123` o manipular la respuesta en el navegador con DevTools y obtener su comida gratis sin haber pagado un solo peso.

### La Solución Profesional: Webhooks con Firma Criptográfica HMAC SHA-256
La única entidad con autoridad para confirmar un pago es el servidor de Wompi enviando un **Webhook** directamente al backend de OrderFlow.

Pero, ¿cómo sabe el backend que esa petición viene realmente de Wompi y no de un hacker enviando un JSON falso con `status: "APPROVED"`?

Mediante **Firmas Criptográficas Simétricas (HMAC SHA-256)** implementadas en `backend/src/services/payment.service.js`:

```javascript
export const verifyWompiSignature = (rawBody, signature) => {
  const secret = env.WOMPI_EVENTS_SECRET;
  if (!secret) return true;
  if (!signature) return false;

  // 1. Calculamos el hash esperado usando nuestro secreto compartido
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // 2. Comprobación segura contra Timing Attacks
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};
```

### ¿Qué es un Timing Attack y por qué `timingSafeEqual`?
Si comparas dos cadenas con un simple `if (expected === signature)`, el procesador compara carácter por carácter y se detiene en la primera discrepancia. Un atacante midiendo nanosegundos de respuesta de red puede deducir la firma correcta byte por byte. `crypto.timingSafeEqual` toma exactamente el mismo tiempo sin importar dónde esté el fallo, neutralizando el ataque por canal lateral.

---

## 5. Idempotencia y Conciliación Atómica

En internet, los servidores de pasarelas pueden reintentar el envío de un webhook 3 o 4 veces si detectan una pequeña latencia en la red.

Si el webhook se procesa 3 veces:
* ¿Se suma 3 veces el saldo?
* ¿Se crean 3 comandas en la cocina?

OrderFlow implementa **Idempotencia**:
1. Cada transacción tiene un `wompiId` único.
2. Al recibir el webhook, busca si ya existe:
   ```javascript
   let transaction = await prisma.paymentTransaction.findUnique({ where: { wompiId: id } });
   ```
3. Si el pedido ya fue marcado como `APPROVED`, se retorna `200 OK` inmediatamente sin volver a emitir comanda a la cocina ni duplicar registros contables.

---

## 6. Resumen Pedagógico para Audio/Video
* **Analogía:** El Webhook es como el sello lacrado de cera medieval en una carta: el rey (Wompi) envía el mensaje y el receptor (OrderFlow) solo abre el sobre si el sello coincide exactamente con el anillo real (`WOMPI_EVENTS_SECRET`).
* **Lección de Dinero:** Nunca confíes en lo que el navegador del cliente dice que pagó. La confirmación del dinero siempre viaja de servidor a servidor.
