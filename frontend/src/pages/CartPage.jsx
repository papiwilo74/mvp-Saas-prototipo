import { Clock3, CreditCard, MapPinned, ShieldCheck, Star, Ticket } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../components/cart/CartItem';
import { EmptyState } from '../components/ui/EmptyState';
import { env } from '../config/env';
import { useCart } from '../context/CartContext';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { isValidColombianPhone } from '../utils/validators';
import { buildWhatsAppOrderUrl } from '../utils/whatsappOrder';

const CUSTOMER_STORAGE_KEY = 'ff_customer';

const loadCustomer = () => {
  try {
    const stored = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { name: '', phone: '', address: '', email: '' };
  } catch {
    return { name: '', phone: '', address: '', email: '' };
  }
};

export function CartPage() {
  const navigate = useNavigate();
  const { items, total, updateQuantity, clearCart, stockWarning } = useCart();
  const { config } = useRestaurantConfig();
  const [customer, setCustomer] = useState(loadCustomer);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(config.paymentMethods?.includes('WOMPI') ? 'WOMPI' : (config.paymentMethods?.[0] || 'CASH'));
  const [couponCode, setCouponCode] = useState('');
  const [deliveryZoneName, setDeliveryZoneName] = useState(config.deliveryZones?.[0]?.name || '');
  const [scheduledFor, setScheduledFor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const paymentMethods = [['CASH', 'Efectivo'], ['NEQUI', 'Nequi'], ['CARD', 'Tarjeta'], ['WOMPI', 'Pago en linea']]
    .filter(([value]) => (config.paymentMethods || ['CASH', 'NEQUI', 'CARD']).includes(value));
  const activeZones = (config.deliveryZones || []).filter((zone) => zone.isActive !== false);
  const selectedZone = activeZones.find((zone) => zone.name === deliveryZoneName);
  const deliveryFee = Number(selectedZone?.fee ?? config.deliveryFee ?? 0);
  const activeCoupons = (config.coupons || []).filter((coupon) => coupon.isActive !== false);
  const selectedCoupon = activeCoupons.find((coupon) => coupon.code?.toLowerCase() === couponCode.trim().toLowerCase());
  const discountAmount = selectedCoupon?.discountType === 'PERCENTAGE'
    ? total * (Number(selectedCoupon.discountValue || 0) / 100)
    : Number(selectedCoupon?.discountValue || 0);
  const loyalty = config.loyaltyProgram;
  const pointsDiscount = loyalty?.enabled ? pointsToRedeem * (loyalty.pointsValue || 10) : 0;
  const totalWithExtras = Math.max(0, total + deliveryFee - (selectedCoupon ? discountAmount : 0) - pointsDiscount);
  const subtotal = total;
  const scheduledPreview = scheduledFor ? formatDate(scheduledFor) : '';
  const loyaltyEnabled = loyalty?.enabled && (loyalty.estimatedPoints > 0 || true);

  const updateCustomer = (field, value) => {
    const updated = { ...customer, [field]: value };
    setCustomer(updated);
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(updated));
  };

  const validateForm = () => {
    const errors = {};
    if (!customer.name.trim() || customer.name.trim().length < 2) errors.name = true;
    if (!customer.phone.trim()) errors.phone = true;
    if (customer.phone.trim() && !isValidColombianPhone(customer.phone)) {
      setPhoneError('Ingresa un numero colombiano valido (ej: 3001234567)');
      errors.phone = true;
    } else {
      setPhoneError('');
    }
    if (!customer.address.trim()) errors.address = true;
    if (items.some((item) => item.product.trackStock && item.quantity > (item.product.stock || 0))) {
      setError('Algunos productos exceden el stock disponible. Revisa las cantidades.');
      return false;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        restaurantSlug: env.restaurantSlug,
        paymentMethod,
        customer,
        notes,
        couponCode: couponCode.trim() || undefined,
        deliveryZoneName: deliveryZoneName || undefined,
        scheduledFor: scheduledFor || undefined,
        pointsRedeemed: loyaltyEnabled ? pointsToRedeem : 0,
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      };

      if (paymentMethod === 'WOMPI' && config.wompiPublicKey) {
        const amountInCents = Math.round(totalWithExtras * 100);
        const { data: paymentData } = await api.post('/payments/create-link', {
          amountInCents,
          reference: `Pedido-${Date.now()}`,
          customerEmail: customer.email || undefined
        });
        payload.wompiTransactionId = paymentData.wompiId;
        const { data } = await api.post('/orders', payload);
        clearCart();
        window.location.href = paymentData.paymentUrl;
        return;
      }

      const { data } = await api.post('/orders', payload);
      const whatsappUrl = buildWhatsAppOrderUrl({ order: data.order, config });

      if (loyaltyEnabled && data.earnedPoints > 0) {
        setError('');
      }

      clearCart();
      navigate('/checkout/success', { state: { order: data.order, whatsappUrl, pointsEarned: data.earnedPoints } });
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
    <div className="container-page grid gap-6 py-5 md:gap-8 md:py-10 lg:grid-cols-[1fr_420px]">
      <section className="glass-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="badge-chip">Checkout directo</span>
            <h1 className="mt-3 text-3xl font-black tracking-tight">Tu pedido esta casi listo</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">Completa tus datos y envia el pedido al WhatsApp del restaurante.</p>
          </div>
          <div className="grid gap-2 sm:max-w-[220px]">
            <div className="safe-panel p-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Zonas</p>
              <p className="mt-1 text-sm font-black">{selectedZone?.name || 'General'}</p>
            </div>
          </div>
        </div>
        {stockWarning && (
          <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">{stockWarning}</div>
        )}
        <div className="mt-5">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} onQuantityChange={updateQuantity} />
          ))}
        </div>
      </section>

      <form onSubmit={submitOrder} className="glass-panel h-fit p-5 sm:p-6">
        <h2 className="text-2xl font-black tracking-tight">Datos del pedido</h2>
        <div className="mt-5 space-y-4">
          <label className="block space-y-1">
            <span className="label">Nombre {fieldErrors.name && <span className="text-red-500">*</span>}</span>
            <input className={`input ${fieldErrors.name ? 'border-red-400 ring-2 ring-red-100' : ''}`} required value={customer.name} onChange={(event) => updateCustomer('name', event.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="label">Telefono / WhatsApp {fieldErrors.phone && <span className="text-red-500">*</span>}</span>
            <input className={`input ${fieldErrors.phone || phoneError ? 'border-red-400 ring-2 ring-red-100' : ''}`} required value={customer.phone} onChange={(event) => updateCustomer('phone', event.target.value)} placeholder="3001234567" />
            {phoneError && <p className="text-xs font-semibold text-red-600">{phoneError}</p>}
          </label>
          <label className="block space-y-1">
            <span className="label">Direccion de entrega {fieldErrors.address && <span className="text-red-500">*</span>}</span>
            <input className={`input ${fieldErrors.address ? 'border-red-400 ring-2 ring-red-100' : ''}`} required value={customer.address} onChange={(event) => updateCustomer('address', event.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="label">Email</span>
            <input className="input" type="email" value={customer.email} onChange={(event) => updateCustomer('email', event.target.value)} />
          </label>
          {activeZones.length ? (
            <label className="block space-y-1">
              <span className="label">Zona de entrega</span>
              <select className="input" value={deliveryZoneName} onChange={(event) => setDeliveryZoneName(event.target.value)}>
                {activeZones.map((zone) => (
                  <option key={zone.name} value={zone.name}>
                    {zone.name} - {formatCurrency(zone.fee || 0)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {config.acceptsScheduledOrders ? (
            <label className="block space-y-1">
              <span className="label">Programar pedido</span>
              <input className="input" type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} />
            </label>
          ) : null}
          {loyaltyEnabled && (
            <div className="safe-panel p-4">
              <div className="flex items-start gap-3">
                <Star className="mt-0.5 text-amber-500" size={18} />
                <div>
                  <p className="text-sm font-black">Puntos disponibles: {loyalty.estimatedPoints || 0}</p>
                  <p className="mt-1 text-sm text-stone-600">Cada punto vale {formatCurrency(loyalty.pointsValue || 10)}. Ganas {Math.floor(total * (loyalty.pointsPerPeso || 0.01))} puntos en este pedido.</p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max={loyalty.estimatedPoints || 0}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                      className="flex-1 accent-amber-500"
                    />
                    <span className="text-sm font-black">{pointsToRedeem} pts = {formatCurrency(pointsToRedeem * (loyalty.pointsValue || 10))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeCoupons.length ? (
            <label className="block space-y-1">
              <span className="label">Cupon</span>
              <input className="input" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Ej: BIENVENIDA10" />
            </label>
          ) : null}
          <label className="block space-y-1">
            <span className="label">Notas</span>
            <textarea className="input min-h-24" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          <div>
            <p className="label mb-2">Metodo de pago</p>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value)}
                  className={`min-h-11 rounded-full border px-2 text-sm font-black ${
                    paymentMethod === value
                      ? 'border-stone-950 bg-stone-950 text-white'
                      : 'border-stone-300 bg-white text-stone-800'
                  } ${value === 'WOMPI' ? 'col-span-2' : ''}`}
                >
                  {value === 'WOMPI' && <CreditCard size={16} />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {selectedZone ? (
            <div className="safe-panel p-4">
              <div className="flex items-start gap-3">
                <MapPinned className="mt-0.5 text-[color:var(--color-primary)]" size={18} />
                <div>
                  <p className="text-sm font-black">Entrega en {selectedZone.name}</p>
                  <p className="mt-1 text-sm text-stone-600">Costo {formatCurrency(selectedZone.fee || 0)}{selectedZone.estimatedMinutes ? ` · aprox. ${selectedZone.estimatedMinutes} min` : ''}</p>
                </div>
              </div>
            </div>
          ) : null}
          {scheduledPreview ? (
            <div className="safe-panel p-4">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 text-[color:var(--color-primary)]" size={18} />
                <div>
                  <p className="text-sm font-black">Pedido programado</p>
                  <p className="mt-1 text-sm text-stone-600">{scheduledPreview}</p>
                </div>
              </div>
            </div>
          ) : null}
          {pointsToRedeem > 0 ? (
            <div className="safe-panel p-4">
              <div className="flex items-start gap-3">
                <Star className="mt-0.5 text-amber-500" size={18} />
                <div>
                  <p className="text-sm font-black">Puntos canjeados: {pointsToRedeem} pts</p>
                  <p className="mt-1 text-sm text-stone-600">Descuento de {formatCurrency(pointsToRedeem * (loyalty.pointsValue || 10))}</p>
                </div>
              </div>
            </div>
          ) : null}
          {selectedCoupon ? (
            <div className="safe-panel p-4">
              <div className="flex items-start gap-3">
                <Ticket className="mt-0.5 text-[color:var(--color-primary)]" size={18} />
                <div>
                  <p className="text-sm font-black">Cupon aplicado: {selectedCoupon.code}</p>
                  <p className="mt-1 text-sm text-stone-600">Ahorro estimado de {formatCurrency(discountAmount)}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        <div className="mt-5 rounded-[28px] bg-stone-950 p-5 text-white">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-stone-300">
            <ShieldCheck size={14} />
            Resumen final
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-stone-300">Subtotal</span>
              <span className="font-black">{formatCurrency(subtotal)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-stone-300">Domicilio</span>
                <span className="font-black">{formatCurrency(deliveryFee)}</span>
              </div>
            )}
            {pointsToRedeem > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-amber-300">Puntos canjeados ({pointsToRedeem})</span>
                <span className="font-black text-amber-300">- {formatCurrency(pointsDiscount)}</span>
              </div>
            )}
            {selectedCoupon ? (
              <div className="flex items-center justify-between">
                <span className="text-stone-300">Descuento {selectedCoupon.code}</span>
                <span className="font-black text-emerald-300">- {formatCurrency(discountAmount)}</span>
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-sm font-bold text-stone-300">Total</span>
            <span className="text-3xl font-black">{formatCurrency(totalWithExtras)}</span>
          </div>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full">
          {submitting ? 'Procesando...' : paymentMethod === 'WOMPI' ? 'Pagar en linea' : 'Enviar pedido por WhatsApp'}
        </button>
      </form>
    </div>
  );
}
