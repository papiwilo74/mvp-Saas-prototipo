import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      const user = await login(form);
      const restaurantQuery = location.search || '';
      navigate(user.role === 'SUPERADMIN' ? '/superadmin' : user.role === 'ADMIN' ? `/admin${restaurantQuery}` : `/${restaurantQuery}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Credenciales invalidas');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page flex justify-center py-10">
      <SEOHead title="Ingreso" description="Panel de administracion del restaurante." />
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-md border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black">Ingreso administrador</h1>
        <div className="mt-6 space-y-4">
          <label className="block space-y-1">
            <span className="label">Correo</span>
            <input className="input" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="label">Contrasena</span>
            <input className="input" type="password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
        </div>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">{submitting ? 'Ingresando...' : 'Ingresar'}</button>
        <div className="mt-3 text-center">
          <Link to="/forgot-password" className="text-xs font-semibold text-stone-500 underline hover:text-stone-800">Olvide mi contrasena</Link>
        </div>
        <div className="mt-6 border-t border-stone-100 pt-4 text-center">
          <p className="text-xs text-stone-500">
            ¿Eres comensal y quieres ver tus pedidos?{' '}
            <Link to="/register" className="font-bold text-stone-950 underline">Crear cuenta cliente</Link>
          </p>
          <div className="mt-3 rounded-xl bg-orange-50 border border-orange-200/80 p-3">
            <p className="text-xs font-bold text-orange-900">¿Tienes un restaurante o negocio?</p>
            <Link to="/registro-restaurante" className="mt-1 inline-block text-xs font-black text-orange-700 underline hover:text-orange-900">
              Registra tu restaurante aquí (14 días gratis) →
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
