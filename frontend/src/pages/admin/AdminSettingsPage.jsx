import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRestaurantConfig } from '../../context/RestaurantConfigContext';
import { api } from '../../services/api';

const paymentOptions = [
  ['CASH', 'Efectivo'],
  ['NEQUI', 'Nequi'],
  ['CARD', 'Tarjeta']
];

export function AdminSettingsPage() {
  const { config, setConfig } = useRestaurantConfig();
  const [form, setForm] = useState(config);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(config), [config]);

  const onSubmit = async (event) => {
    event.preventDefault();
    const { data } = await api.put('/restaurant-config', form);
    setConfig(data.config);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateArrayItem = (field, index, key, value) => {
    const next = [...(form[field] || [])];
    next[index] = { ...next[index], [key]: value };
    update(field, next);
  };
  const addDeliveryZone = () => update('deliveryZones', [...(form.deliveryZones || []), { name: '', fee: 0, minOrder: 0, estimatedMinutes: 30, isActive: true }]);
  const addCoupon = () => update('coupons', [...(form.coupons || []), { code: '', description: '', discountType: 'PERCENTAGE', discountValue: 10, minimumOrder: 0, isActive: true }]);
  const togglePayment = (value) => {
    const current = form.paymentMethods || [];
    update('paymentMethods', current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Configuracion del restaurante</h1>
        <p className="mt-1 text-sm text-stone-600">Cambia identidad, horarios, domicilio y pagos visibles para clientes.</p>
      </div>

      <div className="safe-panel grid gap-4 p-5 sm:grid-cols-2">
        <label className="block space-y-1 sm:col-span-2">
          <span className="label">Nombre</span>
          <input className="input" value={form.restaurantName || ''} onChange={(event) => update('restaurantName', event.target.value)} />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="label">Logo URL</span>
          <input className="input" value={form.logoUrl || ''} onChange={(event) => update('logoUrl', event.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="label">Color primario</span>
          <input className="input h-12" type="color" value={form.primaryColor || '#ea580c'} onChange={(event) => update('primaryColor', event.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="label">Color secundario</span>
          <input className="input h-12" type="color" value={form.secondaryColor || '#18181b'} onChange={(event) => update('secondaryColor', event.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="label">Telefono</span>
          <input className="input" value={form.phone || ''} onChange={(event) => update('phone', event.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="label">WhatsApp</span>
          <input className="input" value={form.whatsapp || ''} onChange={(event) => update('whatsapp', event.target.value)} />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="label">Direccion</span>
          <input className="input" value={form.address || ''} onChange={(event) => update('address', event.target.value)} />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="label">Horarios de atencion</span>
          <input className="input" value={form.openingHours || ''} onChange={(event) => update('openingHours', event.target.value)} />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold sm:col-span-2">
          <input type="checkbox" checked={Boolean(form.acceptsScheduledOrders)} onChange={(event) => update('acceptsScheduledOrders', event.target.checked)} />
          Permitir pedidos programados
        </label>
        <label className="block space-y-1">
          <span className="label">Tiempo minimo para programar (min)</span>
          <input className="input" type="number" min="0" value={form.leadTimeMinutes || 0} onChange={(event) => update('leadTimeMinutes', Number(event.target.value))} />
        </label>
        <label className="block space-y-1">
          <span className="label">Costo de domicilio</span>
          <input className="input" type="number" min="0" value={form.deliveryFee || 0} onChange={(event) => update('deliveryFee', Number(event.target.value))} />
        </label>
        <div className="space-y-2">
          <span className="label">Metodos de pago visibles</span>
          <div className="grid grid-cols-3 gap-2">
            {paymentOptions.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => togglePayment(value)}
                className={`min-h-10 rounded-md border px-2 text-sm font-black ${
                  form.paymentMethods?.includes(value) ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-300 bg-white text-stone-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <label className="block space-y-1">
          <span className="label">Email</span>
          <input className="input" type="email" value={form.email || ''} onChange={(event) => update('email', event.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="label">Instagram</span>
          <input className="input" value={form.instagramUrl || ''} onChange={(event) => update('instagramUrl', event.target.value)} />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="label">Facebook</span>
          <input className="input" value={form.facebookUrl || ''} onChange={(event) => update('facebookUrl', event.target.value)} />
        </label>
        <div className="space-y-3 sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="label">Zonas de entrega</span>
            <button type="button" className="btn-secondary" onClick={addDeliveryZone}>Agregar zona</button>
          </div>
          {(form.deliveryZones || []).map((zone, index) => (
            <div key={`zone-${index}`} className="grid gap-2 rounded-md border border-stone-200 p-3 sm:grid-cols-4">
              <input className="input" placeholder="Nombre" value={zone.name || ''} onChange={(event) => updateArrayItem('deliveryZones', index, 'name', event.target.value)} />
              <input className="input" type="number" min="0" placeholder="Costo" value={zone.fee || 0} onChange={(event) => updateArrayItem('deliveryZones', index, 'fee', Number(event.target.value))} />
              <input className="input" type="number" min="0" placeholder="Pedido minimo" value={zone.minOrder || 0} onChange={(event) => updateArrayItem('deliveryZones', index, 'minOrder', Number(event.target.value))} />
              <input className="input" type="number" min="0" placeholder="Min estimados" value={zone.estimatedMinutes || 0} onChange={(event) => updateArrayItem('deliveryZones', index, 'estimatedMinutes', Number(event.target.value))} />
            </div>
          ))}
        </div>
        <div className="space-y-3 sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="label">Cupones</span>
            <button type="button" className="btn-secondary" onClick={addCoupon}>Agregar cupon</button>
          </div>
          {(form.coupons || []).map((coupon, index) => (
            <div key={`coupon-${index}`} className="grid gap-2 rounded-md border border-stone-200 p-3 sm:grid-cols-2">
              <input className="input" placeholder="Codigo" value={coupon.code || ''} onChange={(event) => updateArrayItem('coupons', index, 'code', event.target.value.toUpperCase())} />
              <input className="input" placeholder="Descripcion" value={coupon.description || ''} onChange={(event) => updateArrayItem('coupons', index, 'description', event.target.value)} />
              <select className="input" value={coupon.discountType || 'PERCENTAGE'} onChange={(event) => updateArrayItem('coupons', index, 'discountType', event.target.value)}>
                <option value="PERCENTAGE">Porcentaje</option>
                <option value="FIXED">Valor fijo</option>
              </select>
              <input className="input" type="number" min="0" placeholder="Valor descuento" value={coupon.discountValue || 0} onChange={(event) => updateArrayItem('coupons', index, 'discountValue', Number(event.target.value))} />
            </div>
          ))}
        </div>
      </div>

      {saved ? <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Configuracion guardada</p> : null}
      <button type="submit" className="btn-primary mt-5 w-full sm:w-auto">
        <Save size={18} />
        Guardar configuracion
      </button>
    </form>
  );
}