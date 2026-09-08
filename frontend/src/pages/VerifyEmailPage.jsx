import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const submit = async (event) => {
    event.preventDefault(); setError(''); setResendMsg(''); setLoading(true);
    try { await api.post('/auth/verify-email', { email, code }); setDone(true); }
    catch (err) { setError(err.response?.data?.message || 'No pudimos confirmar el código.'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true); setError(''); setResendMsg('');
    try {
      const { data } = await api.post('/auth/resend-verification', { email });
      setResendMsg(data.message || 'Código reenviado con éxito.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el código.');
    } finally {
      setResending(false);
    }
  };

  return <div className="container-page flex min-h-[70dvh] items-center justify-center py-10">
    <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-black">Confirma tu correo</h1>
      <p className="mt-2 text-sm text-stone-600">Enviamos un código de 6 dígitos a <strong>{email}</strong>.</p>
      <input className="input mt-6 text-center text-2xl tracking-[0.5em]" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" />
      {resendMsg && <p className="mt-3 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{resendMsg}</p>}
      {error && <p className="mt-3 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      {done ? <Link to="/login" className="btn-primary mt-6 w-full">Ir a iniciar sesión</Link> : <button disabled={loading} className="btn-primary mt-6 w-full">{loading ? 'Confirmando...' : 'Confirmar correo'}</button>}
      {!done && (
        <div className="mt-4 text-center">
          <button type="button" onClick={handleResend} disabled={resending} className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline disabled:opacity-50">
            {resending ? 'Reenviando...' : '¿No recibiste el código? Reenviar código'}
          </button>
        </div>
      )}
    </form>
  </div>;
}
