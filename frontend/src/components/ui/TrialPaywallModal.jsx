import { Check, Flame, MessageCircle, ShieldCheck, Sparkles, X } from 'lucide-react';

export function TrialPaywallModal({
  isOpen,
  onClose,
  daysLeft = 0,
  isExpired = false,
  restaurantName = 'Mi Restaurante',
  restaurantSlug = ''
}) {
  if (!isOpen) return null;

  const getWhatsAppUpgradeUrl = (planName, price) => {
    const supportPhone = '573000000000'; // Número de soporte/ventas comercial
    const text = encodeURIComponent(
      `Hola OrderFlow, quiero activar el *${planName}* (${price}) para mi negocio:\n\n*Restaurante:* ${restaurantName}\n*Slug:* ${restaurantSlug || 'mi-restaurante'}\n\n¿Cuáles son los métodos de pago disponibles?`
    );
    return `https://wa.me/${supportPhone}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-900/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-stone-200 text-stone-900">
        {!isExpired && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        )}

        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 mb-3">
            <Sparkles size={14} />
            {isExpired ? 'Periodo de prueba finalizado' : `Prueba gratuita: ${daysLeft} ${daysLeft === 1 ? 'día restante' : 'días restantes'}`}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
            {isExpired
              ? 'Continúa impulsando tus ventas con OrderFlow'
              : 'Elige el plan ideal para tu restaurante'}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {isExpired
              ? 'Tu prueba gratuita de 14 días ha concluido. Activa tu plan para seguir recibiendo pedidos online y comandas en tiempo real sin pagar comisiones.'
              : 'Disfruta de todas las herramientas operativas, KDS de cocina e impresión de comandas sin comisiones por pedido.'}
          </p>
        </div>

        {/* Planes */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Plan Básico */}
          <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50 p-6 transition hover:border-stone-300">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900">Plan Emprendedor</h3>
                <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-bold text-stone-700">Básico</span>
              </div>
              <p className="mt-1 text-xs text-stone-500">Para locales pequeños y carritos que inician su digitalización.</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-stone-900">$49.000</span>
                <span className="text-xs font-bold text-stone-500">COP / mes</span>
              </div>

              <ul className="mt-5 space-y-2.5 text-xs text-stone-700">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>Menú digital interactivo ilimitado</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>Código QR estándar de mesa en alta resolución</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>Pedidos ilimitados recibidos por WhatsApp</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>Personalización de marca (colores y logo)</span>
                </li>
                <li className="flex items-center gap-2 text-stone-400">
                  <span className="h-4 w-4 shrink-0 text-center font-bold">✕</span>
                  <span>Sin pantalla KDS ni impresión térmica</span>
                </li>
              </ul>
            </div>

            <a
              href={getWhatsAppUpgradeUrl('Plan Emprendedor', '$49.000 COP/mes')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary mt-6 w-full text-center text-xs font-bold py-2.5 inline-flex items-center justify-center gap-2"
            >
              <MessageCircle size={15} />
              Activar Plan Emprendedor
            </a>
          </div>

          {/* Plan Pro */}
          <div className="relative flex flex-col justify-between rounded-xl border-2 border-orange-500 bg-white p-6 shadow-md">
            <div className="absolute -top-3 right-6 rounded-full bg-orange-600 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
              <Flame size={12} /> Más Popular
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900">Plan Pro Restaurante</h3>
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">Completo</span>
              </div>
              <p className="mt-1 text-xs text-stone-500">Para restaurantes con operación activa en cocina y salón.</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-stone-900">$99.000</span>
                <span className="text-xs font-bold text-stone-500">COP / mes</span>
              </div>

              <ul className="mt-5 space-y-2.5 text-xs text-stone-700">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span><strong>Todo</strong> lo del Plan Emprendedor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span><strong>Pantalla de Cocina (KDS)</strong> en tiempo real con WebSockets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span><strong>Impresión térmica de comandas</strong> (80mm / 58mm)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span><strong>Alertas sonoras</strong> ante nuevos pedidos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>Pagos en línea con Wompi y Nequi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 shrink-0" />
                  <span>Reportes y métricas de productos más vendidos</span>
                </li>
              </ul>
            </div>

            <a
              href={getWhatsAppUpgradeUrl('Plan Pro Restaurante', '$99.000 COP/mes')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6 w-full text-center text-xs font-bold py-2.5 inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow"
            >
              <MessageCircle size={15} />
              Activar Plan Pro Restaurante
            </a>
          </div>
        </div>

        {/* Pie informativo */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 border-t border-stone-100 pt-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Sin cláusulas de permanencia. Cancela en cualquier momento.</span>
          </div>
          {isExpired && (
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 underline"
            >
              Continuar en modo de solo lectura
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
