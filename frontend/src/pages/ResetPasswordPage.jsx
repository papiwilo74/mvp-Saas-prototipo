import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { api } from '../services/api';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,128}/.test(password)) {
      setError('La contraseña debe tener 8 caracteres e incluir mayúscula, minúscula, número y símbolo');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { email, token, password });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'El enlace es invalido o expiro.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="container-page flex min-h-[70dvh] items-center justify-center py-10">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-black">Enlace invalido</h1>
          <p className="mt-3 text-sm text-stone-500">Este enlace de recuperacion no es valido. Solicita uno nuevo.</p>
          <Link to="/forgot-password" className="btn-primary mt-8 inline-flex items-center gap-2">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container-page flex min-h-[70dvh] items-center justify-center py-10">
        <SEOHead title="Contrasena actualizada" />
        <div className="w-full max-w-md text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[28px] bg-emerald-100 text-2xl text-emerald-700">✓</div>
          <h1 className="mt-6 text-2xl font-black tracking-tight">Contrasena actualizada</h1>
          <p className="mt-3 text-sm leading-6 text-stone-500">Tu contrasena fue cambiada exitosamente.</p>
          <Link to="/login" className="btn-primary mt-8 inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Iniciar sesion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex justify-center py-10">
      <SEOHead title="Restablecer contrasena" />
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-md border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black">Nueva contrasena</h1>
        <p className="mt-2 text-sm text-stone-500">Ingresa tu nueva contrasena para {email}.</p>
        <div className="mt-6 space-y-4">
          <label className="block space-y-1">
            <span className="label">Nueva contrasena</span>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input className="input w-full pl-10 pr-10" type={showPassword ? 'text' : 'password'} required minLength={8} pattern="(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,128}" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8: Mayúscula, minúscula, número y símbolo" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          <p className="-mt-2 text-[11px] text-stone-500">Debe incluir mayúscula, minúscula, número y símbolo.</p>
          <label className="block space-y-1">
            <span className="label">Confirmar contrasena</span>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input className="input w-full pl-10" type="password" required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contrasena" />
            </div>
          </label>
        </div>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">{submitting ? 'Actualizando...' : 'Actualizar contrasena'}</button>
      </form>
    </div>
  );
}
