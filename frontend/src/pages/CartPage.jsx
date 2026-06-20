import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../components/cart/CartItem';
import { EmptyState } from '../components/ui/EmptyState';
import { env } from '../config/env';
import { useCart } from '../context/CartContext';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { buildWhatsAppOrderUrl } from '../utils/whatsappOrder';

export function CartPage() {
  const navigate = useNavigate();
  const { items, total, updateQuantity, clearCart } = useCart();
  const { config } = useRestaurantConfig();
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(config.paymentMethods?.[0] || 'CASH');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = [['CASH', 'Efectivo'], ['NEQUI', 'Nequi'], ['CARD', 'Tarjeta']]
    .filter(([value]) => (config.paymentMethods || ['CASH', 'NEQUI', 'CARD']).includes(value));

  const submitOrder = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        restaurantSlug: env.restaurantSlug,
        paymentMethod,
        customer,
        notes,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      };

      const { data } = await api.post('/orders', payload);
      const whatsappUrl = buildWhatsAppOrderUrl({ order: data.order, config });

      clearCart();
      navigate('/checkout/success', { state: { order: data.order, whatsappUrl } });

      if (whatsappUrl) {
        window.location.href = whatsappUrl;
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No pudimos crear el pedido. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-10">
        <EmptyState
          title="Tu carrito esta vacio"
          description="Agrega productos del menu para crear tu pedido. No necesitas crear cuenta."
          action={<Link to="/" className="btn-primary">Ver menu</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-page grid gap-5 py-5 md:gap-8 md:py-10 lg:grid-cols-[1fr_380px]">
      <section className="rounded-md border border-stone-200 bg-white p-5">
        <h1 className="text-2xl font-black">Carrito</h1>
        <p className="mt-1 text-sm text-stone-600">Completa tus datos y enviaremos el pedido al WhatsApp del restaurante.</p>
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
            <span className="label">Telefono / WhatsApp</span>
            <input className="input" required value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="label">Direccion de entrega</span>
            <input className="input" required value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="label">Notas</span>
            <textarea className="input min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          <div>
            <p className="label mb-2">Metodo de pago</p>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map(([value, label]) => (
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
        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        {Number(config.deliveryFee || 0) > 0 && (
          <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-5 text-sm">
            <span className="font-bold text-stone-600">Domicilio</span>
            <span className="font-black">{formatCurrency(config.deliveryFee)}</span>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-5">
          <span className="text-sm font-bold text-stone-600">Total</span>
          <span className="text-2xl font-black">{formatCurrency(total + Number(config.deliveryFee || 0))}</span>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full">
          {submitting ? 'Creando pedido...' : 'Enviar pedido por WhatsApp'}
        </button>
      </form>
    </div>
  );
}