import { SEOHead } from '../components/seo/SEOHead';

export function TermsPage() {
  return (
    <div className="container-page py-12">
      <SEOHead title="Terminos de Servicio" description="Terminos y condiciones de uso del servicio." />
      <h1 className="text-3xl font-black">Terminos de Servicio</h1>
      <div className="mt-8 space-y-6 text-stone-700 leading-relaxed max-w-3xl">
        <p>Al acceder y utilizar esta plataforma, aceptas cumplir con estos terminos de servicio. Si no estas de acuerdo, no uses el servicio.</p>
        <h2 className="text-xl font-black text-stone-950">1. Uso del servicio</h2>
        <p>Este servicio permite a restaurantes gestionar pedidos en linea. El usuario se compromete a usar la plataforma de forma legal y etica.</p>
        <h2 className="text-xl font-black text-stone-950">2. Responsabilidades</h2>
        <p>El restaurante es responsable de la calidad de sus productos, la precision de los precios y el cumplimiento de los pedidos realizados a traves de la plataforma.</p>
        <h2 className="text-xl font-black text-stone-950">3. Pagos</h2>
        <p>Los pagos se procesan a traves de pasarelas de pago integradas. El restaurante es responsable de configurar correctamente sus metodos de cobro.</p>
        <h2 className="text-xl font-black text-stone-950">4. Privacidad</h2>
        <p>El manejo de datos personales se rige por nuestra Politica de Privacidad. No compartimos datos con terceros sin consentimiento.</p>
        <h2 className="text-xl font-black text-stone-950">5. Modificaciones</h2>
        <p>Nos reservamos el derecho de modificar estos terminos en cualquier momento. Los cambios seran notificados a traves de la plataforma.</p>
        <p className="text-sm text-stone-500 mt-8">Ultima actualizacion: Julio 2026.</p>
      </div>
    </div>
  );
}
