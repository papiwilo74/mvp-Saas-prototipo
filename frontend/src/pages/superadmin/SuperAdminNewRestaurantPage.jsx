import { Building2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export function SuperAdminNewRestaurantPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    slug: '',
    adminEmail: '',
    adminPassword: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const generateSlug = (name) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const update = (field, value) => {
    const updated = { ...form, [field]: value };
    if (field === 'name' && !form.slug) {
      updated.slug = generateSlug(value);
    }
    setForm(updated);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/superadmin/restaurants', {
        ...form,
        email: form.adminEmail
      });
      setSuccess(true);
      setTimeout(() => navigate('/superadmin/restaurants'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el restaurante');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <CheckCircle2 size={60} className="mx-auto text-emerald-500" />
        <h1 className="mt-4 text-2xl font-black">Restaurante creado</h1>
        <p className="mt-2 text-stone-600">El restaurante y su admin fueron creados. Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-black">Nuevo restaurante</h1>
      <p className="mt-1 text-sm text-stone-600">Crea un restaurante, su configuracion base y su cuenta de administrador en un solo paso.</p>

      <form onSubmit={submit} className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1 sm:col-span-2">
            <span className="label">Nombre del restaurante</span>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Ej: Pizza Master"
            />
          </label>
          <label className="block space-y-1">
            <span className="label">Slug (URL)</span>
            <input
              className="input"
              required
              value={form.slug}
              onChange={(e) => update('slug', e.target.value)}
              placeholder="pizza-master"
            />
            <p className="text-xs text-stone-400">Solo letras, numeros y guiones. Sera parte del link.</p>
          </label>
          <label className="block space-y-1">
            <span className="label">Telefono</span>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+57 300 000 0000"
            />
          </label>
          <label className="block space-y-1">
            <span className="label">Email del admin</span>
            <input
              className="input"
              type="email"
              required
              value={form.adminEmail}
              onChange={(e) => update('adminEmail', e.target.value)}
              placeholder="admin@pizzamaster.com"
            />
          </label>
          <label className="block space-y-1">
            <span className="label">Contrasena del admin</span>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={form.adminPassword}
              onChange={(e) => update('adminPassword', e.target.value)}
              placeholder="Minimo 6 caracteres"
            />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="label">Direccion</span>
            <input
              className="input"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="Calle 123 #45-67"
            />
          </label>
        </div>

        <div className="mt-5 rounded-xl bg-stone-50 p-4 text-sm">
          <p className="font-bold">Que se crea automaticamente:</p>
          <ul className="mt-2 space-y-1 text-stone-600">
            <li>- Restaurante con su slug</li>
            <li>- Configuracion base (colores, zonas, cupones vacios)</li>
            <li>- Usuario administrador con acceso al panel del restaurante</li>
          </ul>
        </div>

        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full">
          <Building2 size={18} />
          {submitting ? 'Creando...' : 'Crear restaurante'}
        </button>
      </form>
    </div>
  );
}
