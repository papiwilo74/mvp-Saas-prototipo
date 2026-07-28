import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { api } from '../services/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('No pudimos procesar tu solicitud. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="container-page flex min-h-[70dvh] items-center justify-center py-10">
        <SEOHead title="Correo enviado" />
        <div className="w-full max-w-md text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[28px] bg-emerald-100 text-2xl text-emerald-700">✓</div>
          <h1 className="mt-6 text-2xl font-black tracking-tight">Correo enviado</h1>
          <p className="mt-3 text-sm leading-6 text-stone-500">Si el correo existe en nuestra base de datos, recibiras instrucciones para restablecer tu contrasena.</p>
          <Link to="/login" className="btn-primary mt-8 inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Volver al inicio de sesion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex justify-center py-10">
      <SEOHead title="Recuperar contrasena" />
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-md border border-stone-200 bg-white p-6 shadow-sm">
        <Link to="/login" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-800">
          <ArrowLeft size={16} />
          Volver
        </Link>
        <h1 className="text-2xl font-black">Recuperar contrasena</h1>
        <p className="mt-2 text-sm text-stone-500">Ingresa tu correo y te enviaremos instrucciones.</p>
        <div className="mt-6 space-y-4">
          <label className="block space-y-1">
            <span className="label">Correo electronico</span>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input className="input w-full pl-10" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" />
            </div>
          </label>
        </div>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">{submitting ? 'Enviando...' : 'Enviar instrucciones'}</button>
      </form>
    </div>
  );
}
