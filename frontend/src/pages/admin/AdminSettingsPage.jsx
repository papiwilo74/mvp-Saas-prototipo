import { Check, Copy, ExternalLink, Image as ImageIcon, QrCode, Save, Sparkles, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { QRCode } from '../../components/ui/QRCode';
import { useRestaurantConfig } from '../../context/RestaurantConfigContext';
import { useAuth } from '../../context/AuthContext';
import { env } from '../../config/env';
import { api } from '../../services/api';
import { getErrorMessage } from '../../utils/errorMessage';

const paymentOptions = [
  ['CASH', 'Efectivo'],
  ['NEQUI', 'Nequi'],
  ['CARD', 'Tarjeta'],
  ['WOMPI', 'Pago en linea (Wompi)']
];

const HERO_PRESETS = [
  { label: '🛍️ Tienda / Variedades', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8' },
  { label: '🍔 Comida Rápida', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
  { label: '🍕 Pizzería', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591' },
  { label: '☕ Café / Panadería', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb' },
  { label: '✨ Moda / Belleza', url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883' },
];

function SettingsForm({ config, setConfig, menuUrl }) {
  const [form, setForm] = useState(() => ({
    ...(config || {}),
    deliveryZones: Array.isArray(config?.deliveryZones) ? config.deliveryZones : [],
    coupons: Array.isArray(config?.coupons) ? config.coupons : [],
    paymentMethods: Array.isArray(config?.paymentMethods) ? config.paymentMethods : ['CASH', 'NEQUI', 'CARD'],
    deliveryModes: Array.isArray(config?.deliveryModes) ? config.deliveryModes : ['DELIVERY', 'PICKUP']
  }));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);

  const uploadImage = async (file, field) => {
    if (!file) return;
    const body = new FormData();
    body.append('image', file);
    setUploadingField(field);
    try {
      const { data } = await api.post('/products/upload-image', body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      update(field, data.imageUrl);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Error al subir la imagen'));
    } finally {
      setUploadingField(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        deliveryZones: Array.isArray(form.deliveryZones) ? form.deliveryZones : [],
        coupons: Array.isArray(form.coupons) ? form.coupons : [],
        paymentMethods: Array.isArray(form.paymentMethods) ? form.paymentMethods : ['CASH', 'NEQUI', 'CARD'],
        deliveryModes: Array.isArray(form.deliveryModes) ? form.deliveryModes : ['DELIVERY', 'PICKUP']
      };
      const { data } = await api.put('/restaurant-config', payload);
      setConfig(data.config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Error al guardar la configuración'));
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
          <span className="label">Tipo de negocio</span>
          <select
            className="input font-semibold"
            value={form.businessType || 'restaurant'}
            onChange={(event) => {
              const type = event.target.value;
              update('businessType', type);
              if (type === 'store') {
                update('businessLabel', 'tienda');
                update('catalogLabel', 'Catálogo');
                update('orderLabel', 'compra');
                update('productLabel', 'producto');
                update('fulfillmentLabel', 'entrega');
              } else if (type === 'cafe') {
                update('businessLabel', 'cafetería');
                update('catalogLabel', 'Carta');
                update('orderLabel', 'pedido');
                update('productLabel', 'producto');
                update('fulfillmentLabel', 'entrega');
              } else {
                update('businessLabel', 'restaurante');
                update('catalogLabel', 'Menú');
                update('orderLabel', 'pedido');
                update('productLabel', 'plato');
                update('fulfillmentLabel', 'domicilio');
              }
            }}
          >
            <option value="restaurant">🍔 Restaurante / Comidas Rápidas</option>
            <option value="store">🛍️ Tienda / Variedades / Retail</option>
            <option value="cafe">☕ Cafetería / Panadería / Repostería</option>
          </select>
        </label>

        {/* Logo Section */}
        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 sm:col-span-2">
          <span className="label">Logo del negocio</span>
          <p className="mt-1 text-xs text-stone-500">Aparece en la cabecera, checkout y navegación de clientes.</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            {form.logoUrl ? (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                <button
                  type="button"
                  onClick={() => update('logoUrl', '')}
                  className="absolute right-1 top-1 rounded-md bg-stone-900/80 p-1 text-white hover:bg-red-600 transition"
                  title="Eliminar logo"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border border-dashed border-stone-300 bg-white text-stone-400">
                <ImageIcon size={24} />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="btn-secondary cursor-pointer text-xs py-2 px-3 inline-flex items-center gap-1.5">
                  <Upload size={14} />
                  <span>{uploadingField === 'logoUrl' ? 'Subiendo logo...' : 'Subir logo desde PC/móvil'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingField === 'logoUrl'}
                    onChange={(e) => uploadImage(e.target.files?.[0], 'logoUrl')}
                  />
                </label>
              </div>
              <input
                className="input text-xs"
                value={form.logoUrl || ''}
                onChange={(event) => update('logoUrl', event.target.value)}
                placeholder="O pega una URL: https://..."
              />
            </div>
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 sm:col-span-2">
          <span className="label">Foto Principal (Banner Hero de la Landing)</span>
          <p className="mt-1 text-xs text-stone-500">Imagen principal de presentación que verán los clientes en la portada.</p>
          <div className="mt-3 space-y-3">
            {form.heroImageUrl ? (
              <div className="relative h-44 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-950 shadow-sm">
                <img src={form.heroImageUrl} alt="Hero Banner" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => update('heroImageUrl', '')}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-stone-900/80 px-2.5 py-1.5 text-xs font-bold text-white shadow hover:bg-red-600 transition"
                >
                  <Trash2 size={13} />
                  Eliminar imagen
                </button>
              </div>
            ) : (
              <div className="grid h-28 w-full place-items-center rounded-xl border border-dashed border-stone-300 bg-white text-center text-stone-400">
                <div>
                  <ImageIcon size={28} className="mx-auto mb-1 text-stone-400" />
                  <p className="text-xs">No hay foto principal configurada. Se usará la sugerida por defecto.</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="btn-secondary cursor-pointer text-xs py-2 px-3 inline-flex items-center justify-center gap-1.5 shrink-0">
                <Upload size={14} />
                <span>{uploadingField === 'heroImageUrl' ? 'Subiendo imagen...' : 'Subir foto desde dispositivo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingField === 'heroImageUrl'}
                  onChange={(e) => uploadImage(e.target.files?.[0], 'heroImageUrl')}
                />
              </label>
              <input
                className="input text-xs flex-1"
                value={form.heroImageUrl || ''}
                onChange={(event) => update('heroImageUrl', event.target.value)}
                placeholder="O pega una URL directa: https://images.unsplash.com/..."
              />
            </div>

            <div>
              <p className="text-xs font-bold text-stone-600 mb-1.5 flex items-center gap-1">
                <Sparkles size={13} className="text-amber-500" />
                O elige una imagen predeterminada de alta resolución:
              </p>
              <div className="flex flex-wrap gap-2">
                {HERO_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => update('heroImageUrl', preset.url)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                      form.heroImageUrl === preset.url
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
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
        <div className="sm:col-span-2 rounded-xl border border-stone-200 p-4">
          <p className="label">Origen y tarifas por distancia</p>
          <p className="mt-1 text-xs text-stone-500">Usa las coordenadas del local y define el máximo de cada rango.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input className="input" type="number" step="any" placeholder="Latitud del negocio" value={form.storeLatitude ?? ''} onChange={(e) => update('storeLatitude', e.target.value === '' ? null : Number(e.target.value))} />
            <input className="input" type="number" step="any" placeholder="Longitud del negocio" value={form.storeLongitude ?? ''} onChange={(e) => update('storeLongitude', e.target.value === '' ? null : Number(e.target.value))} />
          </div>
        </div>
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
            <div key={`zone-${index}`} className="grid gap-2 rounded-md border border-stone-200 p-3 sm:grid-cols-5">
              <input className="input" placeholder="Nombre" value={zone.name || ''} onChange={(event) => updateArrayItem('deliveryZones', index, 'name', event.target.value)} />
              <input className="input" type="number" min="0" placeholder="Costo" value={zone.fee || 0} onChange={(event) => updateArrayItem('deliveryZones', index, 'fee', Number(event.target.value))} />
              <input className="input" type="number" min="0" placeholder="Pedido minimo" value={zone.minOrder || 0} onChange={(event) => updateArrayItem('deliveryZones', index, 'minOrder', Number(event.target.value))} />
              <input className="input" type="number" min="0" step="0.1" placeholder="Máx. km" value={zone.maxKm || ''} onChange={(event) => updateArrayItem('deliveryZones', index, 'maxKm', Number(event.target.value))} />
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
          <p className="label mb-1 text-base font-bold text-stone-900">Código QR de tu Tienda / Menú</p>
          <p className="mb-4 text-xs text-stone-500">
            Tus comensales escanearán este código para ver tu carta y pedir directamente sin comisiones.
          </p>
          <div className="flex justify-center">
            <QRCode url={menuUrl} />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-lg mx-auto">
            <input
              type="text"
              readOnly
              value={menuUrl}
              className="input text-xs w-full sm:w-auto flex-1 font-mono text-stone-600 bg-stone-50 text-center sm:text-left"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary w-full sm:w-auto text-xs py-2 px-3 inline-flex items-center justify-center gap-1.5"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? '¡Copiado!' : 'Copiar link'}</span>
            </button>
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto text-xs py-2 px-3 inline-flex items-center justify-center gap-1.5"
            >
              <ExternalLink size={14} />
              <span>Abrir tienda</span>
            </a>
          </div>
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

export function AdminSettingsPage() {
  const { config, setConfig, activeSlug: configSlug } = useRestaurantConfig();
  const { user } = useAuth();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const restaurantSlug = searchParams.get('restaurant') || user?.restaurantSlug || configSlug || env.restaurantSlug;
  const menuUrl = `${window.location.origin}/menu?restaurant=${restaurantSlug}`;

  return (
    <SettingsForm
      key={config?.id || restaurantSlug || 'settings'}
      config={config}
      setConfig={setConfig}
      menuUrl={menuUrl}
      restaurantSlug={restaurantSlug}
    />
  );
}

