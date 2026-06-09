import { CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

const paymentLabels = {
  CASH: 'Efectivo',
  NEQUI: 'Nequi',
  CARD: 'Tarjeta'
};

export function CheckoutSuccessPage() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="container-page py-8">
      <div className="safe-panel p-6 text-center">
        <CheckCircle2 className="mx-auto text-emerald-600" size={54} />
        <h1 className="mt-4 text-2xl font-black">Pedido confirmado</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
          Tu pedido quedo en estado Pendiente. Esta pantalla simula el pago para la demo comercial.
        </p>
        {order ? (
          <div className="mt-5 rounded-md bg-stone-100 p-4 text-left text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-stone-600">Pedido</span>
              <span className="font-black">#{order.orderNumber}</span>
            </div>
            <div className="mt-2 flex justify-between gap-3">
              <span className="text-stone-600">Total</span>
              <span className="font-black">{formatCurrency(order.total)}</span>
            </div>
            <div className="mt-2 flex justify-between gap-3">
              <span className="text-stone-600">Pago</span>
              <span className="font-black">{paymentLabels[order.paymentMethod] || 'Simulado'}</span>
            </div>
          </div>
        ) : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to="/orders" className="btn-primary">Ver historial</Link>
          <Link to="/menu" className="btn-secondary">Seguir comprando</Link>
        </div>
      </div>
    </div>
  );
}

