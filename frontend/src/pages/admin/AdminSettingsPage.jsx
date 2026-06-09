import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRestaurantConfig } from '../../context/RestaurantConfigContext';
import { api } from '../../services/api';

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

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Configuracion del restaurante</h1>
        <p className="mt-1 text-sm text-stone-600">Cambia identidad, colores y datos de contacto para personalizar la demo.</p>
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
      </div>

      {saved ? <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Configuracion guardada</p> : null}
      <button type="submit" className="btn-primary mt-5 w-full sm:w-auto">
        <Save size={18} />
        Guardar configuracion
      </button>
    </form>
  );
}
