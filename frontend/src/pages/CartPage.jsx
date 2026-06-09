import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../components/cart/CartItem';
import { EmptyState } from '../components/ui/EmptyState';
import { env } from '../config/env';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export function CartPage() {
  const navigate = useNavigate();
  const { items, total, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [customer, setCustomer] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);

  const submitOrder = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      restaurantSlug: env.restaurantSlug,
      paymentMethod,
      customer,
      notes,
      items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
    };

    const { data } = await api.post('/orders', payload);
    clearCart();
    setSubmitting(false);
    navigate('/checkout/success', { state: { order: data.order } });
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-10">
        <EmptyState
          title="Tu carrito esta vacio"
          description="Agrega productos del menu para crear tu pedido."
          action={<Link to="/" className="btn-primary">Ver menu</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-page grid gap-5 py-5 md:gap-8 md:py-10 lg:grid-cols-[1fr_380px]">
      <section className="rounded-md border border-stone-200 bg-white p-5">
        <h1 className="text-2xl font-black">Carrito</h1>
        <div className="mt-4">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} onQuantityChange={updateQuantity} />
          ))}
        </div>
      </section>

      <form onSubmit={submitOrder} className="h-fit rounded-md border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Datos del pedido</h2>
        <div className="mt-5 space-y-4">
          <label className="block space-y-1">
            <span className="label">Nombre</span>
            <input className="input" required value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="label">Correo</span>
            <input className="input" type="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="label">Telefono</span>
            <input className="input" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="label">Notas</span>
            <textarea className="input min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          <div>
            <p className="label mb-2">Pago simulado</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['CASH', 'Efectivo'],
                ['NEQUI', 'Nequi'],
                ['CARD', 'Tarjeta']
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value)}
                  className={`min-h-11 rounded-md border px-2 text-sm font-black ${
                    paymentMethod === value
                      ? 'border-stone-950 bg-stone-950 text-white'
                      : 'border-stone-300 bg-white text-stone-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-5">
          <span className="text-sm font-bold text-stone-600">Total</span>
          <span className="text-2xl font-black">{formatCurrency(total)}</span>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full">
          Crear pedido
        </button>
      </form>
    </div>
  );
}
