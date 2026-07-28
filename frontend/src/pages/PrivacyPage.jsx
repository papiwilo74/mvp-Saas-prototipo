import { SEOHead } from '../components/seo/SEOHead';

export function PrivacyPage() {
  return (
    <div className="container-page py-12">
      <SEOHead title="Politica de Privacidad" description="Politica de privacidad y proteccion de datos." />
      <h1 className="text-3xl font-black">Politica de Privacidad</h1>
      <div className="mt-8 space-y-6 text-stone-700 leading-relaxed max-w-3xl">
        <p>En esta plataforma, nos tomamos la privacidad de tus datos muy en serio. Esta politica describe como recopilamos, usamos y protegemos tu informacion.</p>
        <h2 className="text-xl font-black text-stone-950">1. Datos que recopilamos</h2>
        <p>Recopilamos nombre, correo electronico, telefono y direccion necesarios para procesar pedidos. Tambien recopilamos datos de uso para mejorar el servicio.</p>
        <h2 className="text-xl font-black text-stone-950">2. Uso de la informacion</h2>
        <p>Usamos tus datos para procesar pedidos, enviar notificaciones, mejorar la plataforma y brindar soporte. No vendemos tu informacion a terceros.</p>
        <h2 className="text-xl font-black text-stone-950">3. Proteccion de datos</h2>
        <p>Implementamos medidas de seguridad tecnicas y organizativas para proteger tus datos contra accesos no autorizados, perdida o alteracion.</p>
        <h2 className="text-xl font-black text-stone-950">4. Cookies</h2>
        <p>Usamos cookies estrictamente necesarias para el funcionamiento de la plataforma. No usamos cookies de rastreo con fines publicitarios.</p>
        <h2 className="text-xl font-black text-stone-950">5. Tus derechos</h2>
        <p>Tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento. Puedes ejercer estos derechos contactando al restaurante.</p>
        <p className="text-sm text-stone-500 mt-8">Ultima actualizacion: Julio 2026.</p>
      </div>
    </div>
  );
}
