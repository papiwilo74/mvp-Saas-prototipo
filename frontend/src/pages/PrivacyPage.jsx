import { SEOHead } from '../components/seo/SEOHead';
import { ShieldCheck, Lock, Eye, Database, Cookie, UserCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PrivacyPage() {
  return (
    <div className="container-page py-10 md:py-16">
      <SEOHead 
        title="Política de Privacidad y Seguridad" 
        description="Política de tratamiento y protección de datos personales, cookies y seguridad de la información." 
      />

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="glass-panel p-6 sm:p-10 text-center mb-8 border border-white/70">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-emerald-900 mb-3">
            <ShieldCheck size={15} />
            Habeas Data & Privacidad
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-950">
            Política de Privacidad y Tratamiento de Datos
          </h1>
          <p className="mt-3 text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Tu privacidad y la seguridad de tu información son una prioridad fundamental para nosotros. Conoce cómo tratamos, protegemos y resguardamos tus datos.
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
              <Database className="text-[color:var(--color-primary)]" size={20} />
              1. Información que Recopilamos
            </h2>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>
                Para brindar el servicio de pedidos en línea, recopilamos únicamente los datos necesarios y pertinentes:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Datos de contacto e identificación:</strong> Nombre completo, número telefónico / WhatsApp y dirección de correo electrónico.</li>
                <li><strong>Datos de entrega y ubicación:</strong> Dirección física de entrega, referencias de domicilio y coordenadas geográficas aproximadas para validación de cobertura.</li>
                <li><strong>Detalles de transacciones:</strong> Historial de pedidos realizados, productos seleccionados, cupones aplicados y puntos de fidelización acumulados.</li>
              </ul>
            </div>
          </section>

          <section className="safe-panel p-6 sm:p-8 bg-white/90">
            <h2 className="text-xl font-black text-stone-950 flex items-center gap-2 mb-3">
              <Eye className="text-blue-600" size={20} />
              2. Finalidad del Tratamiento de los Datos
            </h2>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>
                La información personal recopilada tiene como finalidades exclusivas:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Procesar, preparar, despachar y entregar los pedidos realizados al restaurante.</li>
                <li>Enviar notificaciones operativas en tiempo real sobre el estado del pedido (vía WebSockets, correo electrónico o WhatsApp).</li>
                <li>Administrar el programa de recompensas y puntos de fidelización de clientes recurrentes.</li>
                <li>Prevenir fraudes y garantizar la integridad de las transacciones comerciales.</li>
              </ul>
              <p className="font-semibold text-stone-800">
                🔒 No comercializamos, alquilamos ni transferimos tus datos personales a terceros con fines publicitarios no autorizados.
              </p>
            </div>
          </section>

          <section className="safe-panel p-6 sm:p-8 bg-white/90">
            <h2 className="text-xl font-black text-stone-950 flex items-center gap-2 mb-3">
              <Cookie className="text-amber-600" size={20} />
              3. Política de Cookies y Almacenamiento Local
            </h2>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>
                Nuestra plataforma utiliza cookies y almacenamiento local (<em>LocalStorage</em>) con fines estrictamente técnicos y operativos:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Cookies de sesión y autenticación:</strong> Mantienen tu sesión activa de manera segura y protegen contra ataques CSRF y XSS.</li>
                <li><strong>Persistencia de carrito:</strong> Conservan los productos agregados a tu orden para que no los pierdas al navegar entre páginas.</li>
                <li><strong>Preferencias del usuario:</strong> Guardan el estado de consentimiento de cookies y personalizaciones de interfaz.</li>
              </ul>
              <p>
                Puedes configurar tu navegador para bloquear o eliminar las cookies en cualquier momento, aunque esto podría afectar la capacidad de realizar compras en línea.
              </p>
            </div>
          </section>

          <section className="safe-panel p-6 sm:p-8 bg-white/90">
            <h2 className="text-xl font-black text-stone-950 flex items-center gap-2 mb-3">
              <Lock className="text-emerald-600" size={20} />
              4. Medidas de Seguridad de la Información
            </h2>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>
                Aplicamos rigurosas salvaguardas técnicas y administrativas:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Cifrado de datos en tránsito mediante protocolos HTTPS / TLS 1.3.</li>
                <li>Almacenamiento de contraseñas mediante algoritmos de hashing criptográfico unidireccional (Bcrypt con sal).</li>
                <li>Bases de datos relacionales aisladas por tenant con políticas de acceso por roles (RBAC).</li>
                <li>Limitación de tasa de solicitudes (Rate Limiting) para mitigar ataques DDoS y accesos indebidos.</li>
              </ul>
            </div>
          </section>

          <section className="safe-panel p-6 sm:p-8 bg-white/90">
            <h2 className="text-xl font-black text-stone-950 flex items-center gap-2 mb-3">
              <UserCheck className="text-purple-600" size={20} />
              5. Derechos del Titular (Habeas Data)
            </h2>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <p>
                De acuerdo con la legislación vigente de protección de datos personales (Ley 1581 de 2012 / GDPR), tienes derecho a conocer, actualizar, rectificar y solicitar la supresión de tus datos de nuestros sistemas en cualquier momento.
              </p>
              <p>
                Para ejercer cualquiera de tus derechos, puedes contactar al administrador del restaurante a través de los datos de contacto publicados en el encabezado o mediante nuestro correo de soporte.
              </p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-10 text-center text-sm text-stone-500 flex flex-wrap justify-center gap-6">
          <Link to="/terms" className="font-bold underline text-stone-800 hover:text-stone-950">
            Leer Términos de Servicio
          </Link>
          <Link to="/menu" className="font-bold underline text-stone-800 hover:text-stone-950">
            Volver al Menú
          </Link>
        </div>
      </div>
    </div>
  );
}
