import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await register(form);
      navigate('/');
    } catch {
      setError('No pudimos crear la cuenta');
    }
  };

  return (
    <div className="container-page flex justify-center py-10">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-md border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black">Crear cuenta</h1>
        <div className="mt-6 space-y-4">
          <label className="block space-y-1">
            <span className="label">Nombre</span>
            <input className="input" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="label">Correo</span>
            <input className="input" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="label">Contrasena</span>
            <input className="input" type="password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
        </div>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button type="submit" className="btn-primary mt-6 w-full">Registrarme</button>
        <p className="mt-4 text-center text-sm text-stone-600">
          Ya tienes cuenta? <Link className="font-bold text-brand-700" to="/login">Ingresa</Link>
        </p>
      </form>
    </div>
  );
}

