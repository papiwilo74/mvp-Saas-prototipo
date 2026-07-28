import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="container-page flex min-h-[70dvh] items-center justify-center py-16">
      <Helmet><title>Pagina no encontrada - FastFood SaaS</title></Helmet>
      <div className="max-w-sm text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] bg-stone-100 text-4xl font-black text-stone-400">404</span>
        <h1 className="mt-6 text-2xl font-black tracking-tight">Pagina no encontrada</h1>
        <p className="mt-3 text-sm leading-6 text-stone-500">La pagina que buscas no existe o fue movida.</p>
        <Link to="/" className="btn-primary mt-8 inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
