import { SEOHead } from '../components/seo/SEOHead';
import { FileText, Shield, CreditCard, ShoppingBag, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TermsPage() {
  return (
    <div className="container-page py-10 md:py-16">
      <SEOHead 
        title="Términos de Servicio" 
        description="Términos y condiciones de uso de la plataforma de pedidos y servicios para restaurantes." 
      />

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="glass-panel p-6 sm:p-10 text-center mb-8 border border-white/70">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-amber-900 mb-3">
            <FileText size={15} />
            Acuerdo Legal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-950">
            Términos y Condiciones de Servicio
          </h1>
          <p className="mt-3 text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Bienvenido a nuestra plataforma. Al utilizar nuestra carta digital y sistema de pedidos en línea, aceptas los siguientes términos y condiciones de uso.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-stone-500">
            <Clock size={14} />
            Última actualización: Agosto 2026
          </div>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          <section className="safe-panel p-6 sm:p-8 bg-white/90">
            <h2 className="text-xl font-black text-stone-950 flex items-center gap-2 mb-3">
              <ShoppingBag className="text-[color:var(--color-primary)]" size={20} />
              1. Descripción del Servicio y Uso de la Plataforma
            </h2>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>
                Esta plataforma tecnológica actúa como un canal directo de comercio electrónico y software de gestión (SaaS) que permite a los clientes explorar la carta del restaurante, personalizar productos, calcular costos de envío según su ubicación y formalizar pedidos directos.
              </p>
              <p>
                El usuario se compromete a proporcionar información veraz, completa y actualizada (nombre, número de WhatsApp/teléfono y dirección física) al momento de procesar un pedido.
              </p>
            </div>
          </section>

          <section className="safe-panel p-6 sm:p-8 bg-white/90">
            <h2 className="text-xl font-black text-stone-950 flex items-center gap-2 mb-3">
              <CreditCard className="text-emerald-600" size={20} />
              2. Precios, Pagos y Facturación
            </h2>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>
                Todos los precios de los productos están expresados en moneda de curso legal (COP) e incluyen los impuestos aplicables. Los costos de domicilio se calculan dinámicamente de acuerdo a las zonas de cobertura y distancia geográfica predefinidas por el establecimiento.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Efectivo / Contra entrega:</strong> El pago se efectúa directamente al repartidor o en el punto físico.</li>
                <li><strong>Nequi / Transferencia:</strong> El cliente transfiere al número oficial del restaurante y puede adjuntar su comprobante vía WhatsApp.</li>
                <li><strong>Wompi / Pagos en línea:</strong> Las transacciones con tarjetas de crédito/débito o PSE son procesadas a través de pasarelas certificadas con estándares de seguridad PCI-DSS.</li>
              </ul>
            </div>
          </section>

          <section className="safe-panel p-6 sm:p-8 bg-white/90">
            <h2 className="text-xl font-black text-stone-950 flex items-center gap-2 mb-3">
              <RefreshCw className="text-blue-600" size={20} />
              3. Tiempos de Entrega, Cancelaciones y Reembolsos
            </h2>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>
                Los tiempos de preparación y entrega indicados en la plataforma son estimaciones que pueden variar por condiciones climáticas, tráfico o alta demanda en cocina.
              </p>
              <p>
                Debido a la naturaleza perecedera de los alimentos preparados, una vez que el restaurante ha comenzado la preparación del pedido (estado <em>"En preparación"</em>), la orden no podrá ser cancelada de manera unilateral por el cliente. En caso de inconsistencias con el pedido recibido, el cliente deberá comunicarse inmediatamente con el restaurante mediante los canales de contacto habilitados.
              </p>
            </div>
          </section>

          <section className="safe-panel p-6 sm:p-8 bg-white/90">
            <h2 className="text-xl font-black text-stone-950 flex items-center gap-2 mb-3">
              <Shield className="text-purple-600" size={20} />
              4. Responsabilidad y Propiedad Intelectual
            </h2>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>
                El restaurante asociado es el único responsable de la preparación, inocuidad, calidad de los alimentos y cumplimiento de las regulaciones sanitarias locales. La plataforma proporciona el medio tecnológico para la transmisión de la orden.
              </p>
              <p>
                Las marcas, logotipos, imágenes y contenidos publicados pertenecen a sus respectivos titulares y están protegidos por leyes de propiedad intelectual.
              </p>
            </div>
          </section>

          <section className="safe-panel p-6 sm:p-8 bg-white/90">
            <h2 className="text-xl font-black text-stone-950 flex items-center gap-2 mb-3">
              <AlertCircle className="text-stone-700" size={20} />
              5. Modificaciones de los Términos
            </h2>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>
                Nos reservamos el derecho de actualizar estos términos periódicamente para reflejar cambios legales o mejoras en nuestras funcionalidades. El uso continuo del sitio web constituye la aceptación de dichas actualizaciones.
              </p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-10 text-center text-sm text-stone-500 flex flex-wrap justify-center gap-6">
          <Link to="/privacy" className="font-bold underline text-stone-800 hover:text-stone-950">
            Leer Política de Privacidad
          </Link>
          <Link to="/menu" className="font-bold underline text-stone-800 hover:text-stone-950">
            Volver al Menú
          </Link>
        </div>
      </div>
    </div>
  );
}
