import { formatCurrency, formatDate } from './formatters';
import { paymentLabels } from './whatsappOrder';

/**
 * Imprime un ticket de comanda / recibo optimizado para impresoras térmicas (58mm / 80mm)
 * @param {Object} order - Datos completos del pedido
 * @param {Object} [config] - Configuración del restaurante (nombre, dirección, etc.)
 */
export const printOrderTicket = (order, config = {}) => {
  if (!order) return;

  const restaurantName = config.restaurantName || 'OrderFlow';
  const restaurantPhone = config.phone || config.whatsapp || '';
  const restaurantAddress = config.address || '';

  const orderType = order.tableNumber
    ? `MESA #${order.tableNumber}`
    : order.deliveryType === 'PICKUP'
      ? 'PARA LLEVAR / RECOGER'
      : 'DOMICILIO';

  const paymentName = paymentLabels[order.paymentMethod] || order.paymentMethod || 'Efectivo';
  const paymentStatus = order.paymentStatus === 'APPROVED' ? 'PAGADO' : 'PENDIENTE DE PAGO';

  const itemsHtml = (order.items || [])
    .map((item) => {
      const prodName = item.product?.name || item.name || 'Producto';
      const qty = item.quantity || 1;
      const price = Number(item.price || item.unitPrice || 0);
      const total = price * qty;
      const notes = item.notes ? `<div style="font-size: 10px; color: #555; padding-left: 10px;">Nota: ${escapeHtml(item.notes)}</div>` : '';
      const selectedMods = Array.isArray(item.selectedModifiers) && item.selectedModifiers.length > 0
        ? `<div style="font-size: 10px; color: #555; padding-left: 10px;">${escapeHtml(item.selectedModifiers.map(m => typeof m === 'string' ? m : m.name).join(', '))}</div>`
        : '';

      return `
        <tr>
          <td style="vertical-align: top; padding: 2px 0; font-weight: bold; width: 24px;">${qty}x</td>
          <td style="vertical-align: top; padding: 2px 0;">
            <div>${escapeHtml(prodName)}</div>
            ${selectedMods}
            ${notes}
          </td>
          <td style="vertical-align: top; padding: 2px 0; text-align: right; white-space: nowrap;">
            ${formatCurrency(total)}
          </td>
        </tr>
      `;
    })
    .join('');

  const ticketHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Ticket #${order.orderNumber || order.id}</title>
      <style>
        @page {
          margin: 0;
          size: 80mm auto;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 8px;
          line-height: 1.25;
          width: 76mm;
          max-width: 100%;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .divider {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }
        .double-divider {
          border-top: 2px solid #000;
          margin: 6px 0;
        }
        .title {
          font-size: 16px;
          font-weight: 900;
          text-transform: uppercase;
        }
        .order-badge {
          font-size: 18px;
          font-weight: 900;
          padding: 4px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .highlight-box {
          border: 1px solid #000;
          padding: 4px;
          margin: 4px 0;
          font-weight: bold;
        }
        @media print {
          body {
            width: 100%;
            padding: 2mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="text-center">
        <div class="title">${escapeHtml(restaurantName)}</div>
        ${restaurantAddress ? `<div>${escapeHtml(restaurantAddress)}</div>` : ''}
        ${restaurantPhone ? `<div>Tel: ${escapeHtml(restaurantPhone)}</div>` : ''}
      </div>

      <div class="double-divider"></div>

      <div class="text-center">
        <div class="order-badge">PEDIDO #${escapeHtml(String(order.orderNumber || ''))}</div>
        <div class="bold" style="font-size: 13px;">${escapeHtml(orderType)}</div>
        <div style="font-size: 11px; margin-top: 2px;">${formatDate(order.createdAt || new Date())}</div>
      </div>

      <div class="divider"></div>

      <div>
        <div><span class="bold">Cliente:</span> ${escapeHtml(order.customerName || 'Cliente')}</div>
        ${order.customerPhone ? `<div><span class="bold">Tel:</span> ${escapeHtml(order.customerPhone)}</div>` : ''}
        ${order.customerAddress ? `<div><span class="bold">Dir:</span> ${escapeHtml(order.customerAddress)}</div>` : ''}
        ${order.tableNumber ? `<div><span class="bold">Mesa:</span> #${escapeHtml(String(order.tableNumber))}</div>` : ''}
      </div>

      ${order.notes ? `
        <div class="highlight-box">
          NOTAS: ${escapeHtml(order.notes)}
        </div>
      ` : ''}

      <div class="divider"></div>

      <table>
        <thead>
          <tr style="border-bottom: 1px dashed #000;">
            <th style="text-align: left; padding-bottom: 3px;">Cant</th>
            <th style="text-align: left; padding-bottom: 3px;">Item</th>
            <th style="text-align: right; padding-bottom: 3px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="divider"></div>

      <table>
        ${Number(order.deliveryFee || 0) > 0 ? `
          <tr>
            <td>Costo Domicilio:</td>
            <td class="text-right">${formatCurrency(order.deliveryFee)}</td>
          </tr>
        ` : ''}
        ${Number(order.discount || 0) > 0 ? `
          <tr>
            <td>Descuento:</td>
            <td class="text-right">-${formatCurrency(order.discount)}</td>
          </tr>
        ` : ''}
        <tr style="font-size: 15px; font-weight: bold;">
          <td style="padding-top: 4px;">TOTAL:</td>
          <td class="text-right" style="padding-top: 4px;">${formatCurrency(order.total || 0)}</td>
        </tr>
      </table>

      <div class="divider"></div>

      <div style="font-size: 11px;">
        <div><span class="bold">Medio de Pago:</span> ${escapeHtml(paymentName)}</div>
        <div><span class="bold">Estado:</span> ${escapeHtml(paymentStatus)}</div>
      </div>

      <div class="double-divider"></div>

      <div class="text-center" style="font-size: 10px; margin-top: 6px;">
        <div>¡Gracias por preferirnos!</div>
        <div style="color: #666; margin-top: 2px;">OrderFlow App</div>
      </div>

      <script>
        window.onload = function() {
          window.focus();
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  // Crear un iframe oculto para no interrumpir la navegación actual
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(ticketHtml);
  doc.close();

  // Limpiar el iframe después de que termine la impresión
  setTimeout(() => {
    try {
      document.body.removeChild(iframe);
    } catch {
      // Ignorar si ya fue removido
    }
  }, 60000);
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
