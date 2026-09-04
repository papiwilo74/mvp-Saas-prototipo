import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Building2, CheckCircle2, Eye, EyeOff, Globe, Lock, Mail, Phone, Sparkles, User } from 'lucide-react';

export function RestaurantRegisterPage() {
  const navigate = useNavigate();
  const { registerRestaurant } = useAuth();
  const [form, setForm] = useState({
    restaurantName: '',
    slug: '',
    phone: '',
    adminName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (name) => {
    const autoSlug = name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setForm((prev) => ({
      ...prev,
      restaurantName: name,
      slug: prev.slug === '' || prev.slug === autoSlug.slice(0, prev.slug.length) ? autoSlug : prev.slug
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await registerRestaurant(form);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'No pudimos registrar tu negocio. Verifica los datos e intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page flex min-h-[90dvh] items-center justify-center py-10">
      <div className="w-full max-w-lg">
        <Link to="/saas" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-800">
          <ArrowLeft size={16} />
          Volver a BcaXen
        </Link>

        <div className="glass-panel p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-600">
            <Sparkles size={16} />
            <span>14 Días de Prueba Gratis · 0% Comisiones</span>
          </div>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
            Registra tu Restaurante
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Ten tu propia página de pedidos online lista para vender en minutos.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Nombre del Restaurante
                </label>
                <div className="relative">
                  <Building2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    className="input w-full pl-9 text-sm"
                    type="text"
                    placeholder="Ej. Burger House"
                    value={form.restaurantName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Enlace Web (Slug)
                </label>
                <div className="relative">
                  <Globe size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    className="input w-full pl-9 text-sm font-mono"
                    type="text"
                    placeholder="burger-house"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    required
                    minLength={2}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  WhatsApp o Teléfono
                </label>
                <div className="relative">
                  <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    className="input w-full pl-9 text-sm"
                    type="tel"
                    placeholder="300 123 4567"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    minLength={7}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                  Nombre del Administrador
                </label>
                <div className="relative">
                  <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    className="input w-full pl-9 text-sm"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={form.adminName}
                    onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                    required
                    minLength={2}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Correo Electrónico (Acceso)
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  className="input w-full pl-9 text-sm"
                  type="email"
                  placeholder="admin@minegocio.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  className="input w-full pl-9 pr-10 text-sm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 text-xs text-stone-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Incluido en tu prueba de 14 días:</span>
              </div>
              <p>• Menú digital con QR para mesas y catálogo online</p>
              <p>• Pagos directos con Nequi, Bre-B, Efectivo y Tarjeta</p>
              <p>• Pantalla de cocina KDS con alertas en tiempo real</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full justify-center py-3 text-base font-black shadow-md"
            >
              {submitting ? 'Creando tu restaurante...' : 'Comenzar 14 días gratis'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-500">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-bold text-stone-900 underline hover:text-orange-600">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
