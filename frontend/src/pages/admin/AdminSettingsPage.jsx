import { QrCode, Save } from 'lucide-react';
import { useState } from 'react';
import { QRCode } from '../../components/ui/QRCode';
import { useRestaurantConfig } from '../../context/RestaurantConfigContext';
import { api } from '../../services/api';

const paymentOptions = [
  ['CASH', 'Efectivo'],
  ['NEQUI', 'Nequi'],
  ['CARD', 'Tarjeta'],
  ['WOMPI', 'Pago en linea (Wompi)']
];

export function AdminSettingsPage() {
  const { config, setConfig } = useRestaurantConfig();
  const [form, setForm] = useState(config);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQR, setShowQR] = useState(false);

  const menuUrl = `${window.location.origin}/menu`;

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSaving(true);
    try {
      const { data } = await api.put('/restaurant-config', form);
      setConfig(data.config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.details?.message || 'Error al guardar la configuración';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
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
  const removeArrayItem = (field, index) => {
    const next = [...(form[field] || [])];
    next.splice(index, 1);
    update(field, next);
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
        <label className="block space-y-1 sm:col-span-2">
          <span className="label">Imagen Hero (Landing)</span>
          <input className="input" value={form.heroImageUrl || ''} onChange={(event) => update('heroImageUrl', event.target.value)} placeholder="https://..." />
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

        <div className="border-t border-stone-200 pt-4 sm:col-span-2">
          <span className="label text-purple-950 font-black flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-md bg-purple-600 text-white text-xs">N</span>
            Configuración de Nequi / Transferencia Directa
          </span>
          <p className="text-xs text-stone-500 mb-3">Datos bancarios que verá el cliente al seleccionar pagar por Nequi o transferencia.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <span className="text-xs font-bold text-stone-600 mb-1 block">Número de Nequi / Celular</span>
              <input className="input" placeholder="Ej: 3001234567" value={form.nequiNumber || ''} onChange={(event) => update('nequiNumber', event.target.value)} />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-600 mb-1 block">Llave Bre-B (Opcional)</span>
              <input className="input" placeholder="Ej: @mirestaurante o ID" value={form.nequiBreB || ''} onChange={(event) => update('nequiBreB', event.target.value)} />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-600 mb-1 block">URL de Imagen QR Nequi (Opcional)</span>
              <input className="input" placeholder="https://.../qr-nequi.jpg" value={form.nequiQrUrl || ''} onChange={(event) => update('nequiQrUrl', event.target.value)} />
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-4 sm:col-span-2">
          <span className="label">Wompi (Pagos en linea)</span>
          <p className="text-xs text-stone-500 mb-3">Configura las llaves de Wompi para aceptar pagos con tarjeta, Nequi, etc.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="input" placeholder="Llave publica (pub_test_...)" value={form.wompiPublicKey || ''} onChange={(event) => update('wompiPublicKey', event.target.value)} />
            <input className="input" type="password" placeholder="Llave privada (prv_test_...)" value={form.wompiPrivateKey || ''} onChange={(event) => update('wompiPrivateKey', event.target.value)} />
          </div>
        </div>

        <div className="border-t border-stone-200 pt-4 sm:col-span-2">
          <span className="label">WhatsApp Business API</span>
          <p className="text-xs text-stone-500 mb-3">Notificaciones automaticas al cliente cuando cambia el estado del pedido.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="input" placeholder="Token de acceso" type="password" value={form.whatsappToken || ''} onChange={(event) => update('whatsappToken', event.target.value)} />
            <input className="input" placeholder="Phone Number ID" value={form.whatsappPhoneNumberId || ''} onChange={(event) => update('whatsappPhoneNumberId', event.target.value)} />
          </div>
        </div>

        <div className="border-t border-stone-200 pt-4 sm:col-span-2">
          <span className="label">API Key de Mapas (Mapbox / Google Maps)</span>
          <p className="text-xs text-stone-500 mb-3">Validación automática de direcciones y cálculo de distancia en zonas de cobertura.</p>
          <input className="input" placeholder="pk.eyJ1... o AIzaSy..." type="password" value={form.googleMapsApiKey || ''} onChange={(event) => update('googleMapsApiKey', event.target.value)} />
        </div>

        <div className="border-t border-stone-200 pt-4 sm:col-span-2">
          <span className="label">Programa de fidelizacion</span>
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input type="checkbox" checked={Boolean(form.loyaltyProgram?.enabled)} onChange={(event) => update('loyaltyProgram', { ...(form.loyaltyProgram || {}), enabled: event.target.checked })} />
              Activar programa de puntos
            </label>
            {form.loyaltyProgram?.enabled && (
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <span className="text-xs text-stone-500">Puntos por peso gastado</span>
                  <input className="input" type="number" step="0.001" value={form.loyaltyProgram?.pointsPerPeso || 0.01} onChange={(event) => update('loyaltyProgram', { ...form.loyaltyProgram, pointsPerPeso: Number(event.target.value) })} />
                </div>
                <div>
                  <span className="text-xs text-stone-500">Valor de cada punto ($)</span>
                  <input className="input" type="number" value={form.loyaltyProgram?.pointsValue || 10} onChange={(event) => update('loyaltyProgram', { ...form.loyaltyProgram, pointsValue: Number(event.target.value) })} />
                </div>
              </div>
            )}
          </div>
        </div>

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
              <div className="flex gap-2">
                <input className="input" type="number" min="0" placeholder="Min" value={zone.estimatedMinutes || 0} onChange={(event) => updateArrayItem('deliveryZones', index, 'estimatedMinutes', Number(event.target.value))} />
                <button type="button" onClick={() => removeArrayItem('deliveryZones', index)} className="text-red-500 hover:text-red-700 text-xs font-bold shrink-0">X</button>
              </div>
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
              <div className="flex gap-2 sm:col-span-2">
                <input className="input" placeholder="Codigo" value={coupon.code || ''} onChange={(event) => updateArrayItem('coupons', index, 'code', event.target.value.toUpperCase())} />
                <button type="button" onClick={() => removeArrayItem('coupons', index)} className="text-red-500 hover:text-red-700 text-xs font-bold shrink-0">X</button>
              </div>
              <input className="input sm:col-span-2" placeholder="Descripcion" value={coupon.description || ''} onChange={(event) => updateArrayItem('coupons', index, 'description', event.target.value)} />
              <select className="input" value={coupon.discountType || 'PERCENTAGE'} onChange={(event) => updateArrayItem('coupons', index, 'discountType', event.target.value)}>
                <option value="PERCENTAGE">Porcentaje</option>
                <option value="FIXED">Valor fijo</option>
              </select>
              <input className="input" type="number" min="0" placeholder="Valor descuento" value={coupon.discountValue || 0} onChange={(event) => updateArrayItem('coupons', index, 'discountValue', Number(event.target.value))} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowQR(!showQR)}
        className="btn-secondary mt-4 w-full sm:w-auto"
      >
        <QrCode size={18} />
        {showQR ? 'Ocultar QR' : 'Generar QR del menu'}
      </button>

      {showQR && (
        <div className="safe-panel mt-4 p-5 text-center">
          <p className="label mb-3">Escanea para ver el menu</p>
          <QRCode url={menuUrl} />
          <p className="mt-2 text-xs text-stone-500">{menuUrl}</p>
        </div>
      )}

      {saved && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
          ✓ Configuración guardada exitosamente
        </p>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
          ⚠️ {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className={`btn-primary mt-5 w-full sm:w-auto ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <Save size={18} />
        {saving ? 'Guardando cambios...' : 'Guardar configuración'}
      </button>
    </form>
  );
}
