import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  DollarSign,
  HelpCircle,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Zap
} from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { formatCurrency } from '../utils/formatters';

const FAQS = [
  {
    q: '¿Cobran alguna comisión por pedido?',
    a: 'No. En BcaXen cobramos una suscripción mensual fija. El 100% del valor de tus pedidos es tuyo, sin comisiones ocultas ni cobros porcentuales.'
  },
  {
    q: '¿Mis clientes necesitan descargar una aplicación o registrarse?',
    a: 'No. Tus clientes acceden directamente desde su navegador escaneando el código QR en la mesa o desde el enlace en tu perfil de Instagram/WhatsApp. Hacen su pedido en menos de 1 minuto sin contraseñas.'
  },
  {
    q: '¿Cómo recibo el dinero de las ventas?',
    a: 'El dinero entra directo a tus cuentas. Si pagan con Nequi o Bre-B, te transfieren directamente a tu número o QR. Si pagan en efectivo, cobran al entregar. Y con Wompi, el dinero se deposita en tu cuenta bancaria.'
  },
  {
    q: '¿Puedo usarlo en varios dispositivos a la vez?',
    a: 'Sí. Puedes tener la pantalla de cocina (KDS) en una tablet o monitor en la cocina, el panel de caja en el computador del mostrador y revisarlo en tu celular en tiempo real.'
  },
  {
    q: '¿Tienen cláusula de permanencia?',
    a: 'Ninguna. Puedes cancelar tu suscripción en cualquier momento sin penalizaciones.'
  }
];

export function SaasLandingPage() {
  const [monthlySales, setMonthlySales] = useState(8000000);
  const [activeFaq, setActiveFaq] = useState(null);

  const deliveryAppCommission = Math.round(monthlySales * 0.25);
  const bcaxenCost = 79000;
  const monthlySavings = Math.max(0, deliveryAppCommission - bcaxenCost);
  const yearlySavings = monthlySavings * 12;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <SEOHead
        title="BcaXen | Plataforma SaaS de Pedidos Online para Restaurantes"
        description="Tu propia página de pedidos online con marca propia, menú QR, pantalla de cocina y 0% comisiones. Empieza tu prueba gratis de 14 días."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-950 px-4 pt-16 pb-20 text-white sm:px-6 lg:px-8">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-orange-600/20 blur-3xl pointer-events-none" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-400">
            <Sparkles size={14} />
            <span>0% Comisiones por Pedido · Hecho para Restaurantes</span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl sm:leading-tight">
            Deja de regalar el <span className="text-orange-500">25% de tus ventas</span> a las apps de delivery
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-stone-300 sm:text-lg">
            Ten tu propia página de pedidos online con marca propia, pagos directos por Nequi QR o tarjeta, y pantalla de cocina en tiempo real. Sin intermediarios.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/registro-restaurante"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-7 py-3.5 text-base font-black text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500"
            >
              Comenzar prueba gratis de 14 días
              <ArrowRight size={18} />
            </Link>
            <a
              href="#calculadora"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900/60 px-6 py-3.5 text-sm font-bold text-stone-200 transition hover:bg-stone-800"
            >
              <Calculator size={16} />
              Calcular cuánto ahorras
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={16} className="text-emerald-400" /> Sin tarjeta de crédito requerida
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={16} className="text-emerald-400" /> Configuración en 10 minutos
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={16} className="text-emerald-400" /> Cancela cuando quieras
            </span>
          </div>
        </div>
      </section>

      {/* Calculadora de Ahorro Interactiva */}
      <section id="calculadora" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xl sm:p-10">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                <TrendingUp size={14} />
                Calculadora de Rentabilidad
              </span>
              <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                ¿Cuánto dinero estás perdiendo en comisiones?
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                Mueve el control para ver cuánto te ahorras al recibir pedidos directos con BcaXen.
              </p>
            </div>

            <div className="mt-8">
              <div className="flex justify-between text-sm font-bold">
                <span>Ventas mensuales por delivery:</span>
                <span className="text-xl font-black text-orange-600">{formatCurrency(monthlySales)}</span>
              </div>
              <input
                type="range"
                min={2000000}
                max={30000000}
                step={500000}
                value={monthlySales}
                onChange={(e) => setMonthlySales(Number(e.target.value))}
                className="mt-3 h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-stone-200 accent-orange-600"
              />
              <div className="mt-2 flex justify-between text-xs text-stone-400">
                <span>$2.000.000</span>
                <span>$15.000.000</span>
                <span>$30.000.000</span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-red-100 bg-red-50/60 p-5 text-center">
                <span className="text-xs font-black uppercase tracking-wider text-red-600">Comisión Apps (25%)</span>
                <p className="mt-2 text-2xl font-black text-red-700">{formatCurrency(deliveryAppCommission)}</p>
                <p className="mt-1 text-xs text-red-500">Al mes en comisiones de terceros</p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-center">
                <span className="text-xs font-black uppercase tracking-wider text-stone-500">Costo BcaXen</span>
                <p className="mt-2 text-2xl font-black text-stone-900">{formatCurrency(bcaxenCost)}</p>
                <p className="mt-1 text-xs text-stone-500">Tarifa fija mensual sin comisiones</p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700">Tu Ahorro Neto</span>
                <p className="mt-2 text-2xl font-black text-emerald-700">{formatCurrency(monthlySavings)}</p>
                <p className="mt-1 text-xs font-bold text-emerald-800">
                  ¡{formatCurrency(yearlySavings)} al año!
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/registro-restaurante"
                className="btn-primary inline-flex items-center gap-2 px-8 py-3 font-black"
              >
                Comenzar a ahorrar ahora
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Características del Sistema */}
      <section className="bg-stone-100/70 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight">Todo lo que necesita tu restaurante para operar</h2>
            <p className="mt-3 text-sm text-stone-600">Diseñado especialmente para la agilidad de los negocios de comida rápida en Colombia.</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-600">
                <QrCode size={20} />
              </div>
              <h3 className="mt-4 font-black">Menú QR Sin Fricción</h3>
              <p className="mt-2 text-xs leading-5 text-stone-600">
                Tus clientes escanean el código en la mesa o entran desde WhatsApp. Piden sin registrarse, reduciendo tiempos de espera y mesas ocupadas.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-600">
                <ChefHat size={20} />
              </div>
              <h3 className="mt-4 font-black">Pantalla de Cocina (KDS)</h3>
              <p className="mt-2 text-xs leading-5 text-stone-600">
                Alertas con audio instantáneas cuando entra un pedido nuevo. Cambia estados con 1 clic e imprime la comanda para el cocinero.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-100 text-purple-600">
                <Smartphone size={20} />
              </div>
              <h3 className="mt-4 font-black">Nequi QR y Bre-B</h3>
              <p className="mt-2 text-xs leading-5 text-stone-600">
                Tus comensales transfieren directamente con QR o Llave Bre-B y pueden enviarte el comprobante por WhatsApp con un solo toque.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <Truck size={20} />
              </div>
              <h3 className="mt-4 font-black">Cálculo de Domicilios</h3>
              <p className="mt-2 text-xs leading-5 text-stone-600">
                Cálculo de distancia con Mapbox para cobrar el valor justo del envío según la ubicación exacta del cliente.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <Sparkles size={20} />
              </div>
              <h3 className="mt-4 font-black">Fidelización y Cupones</h3>
              <p className="mt-2 text-xs leading-5 text-stone-600">
                Sistema de puntos acumulables por compra y cupones de descuento para premiar a tus clientes fieles e impulsar la recompra.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-stone-100 text-stone-800">
                <Zap size={20} />
              </div>
              <h3 className="mt-4 font-black">Marca Propia</h3>
              <p className="mt-2 text-xs leading-5 text-stone-600">
                Personaliza tus colores, logotipo, horarios y redes sociales. Tu negocio, tu marca y tu base de datos de clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planes y Precios */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
            Planes Transparentes
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Precios accesibles para crecer</h2>
          <p className="mt-2 text-sm text-stone-600">Prueba 14 días gratis sin compromiso. Sin cobros sorpresa.</p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 text-left">
            {/* Plan Emprendedor */}
            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm hover:shadow-md transition">
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-stone-700 uppercase">
                Emprendedor
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-stone-900">$79.000</span>
                <span className="text-xs text-stone-500">COP / mes</span>
              </div>
              <p className="mt-2 text-xs text-stone-600">Para restaurantes que quieren empezar a vender online directo.</p>

              <ul className="mt-6 space-y-3 text-xs text-stone-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Pedidos online y mesas ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>0% comisiones por pedido</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Menú digital responsive con QR</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Pagos con Nequi, Bre-B y Efectivo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Pantalla de cocina KDS con audio</span>
                </li>
              </ul>

              <Link
                to="/registro-restaurante"
                className="btn-secondary mt-8 w-full justify-center font-bold"
              >
                Comenzar prueba gratis
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="relative rounded-3xl border-2 border-orange-500 bg-white p-8 shadow-xl">
              <div className="absolute -top-3.5 right-6 rounded-full bg-orange-600 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-sm">
                Más Popular
              </div>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800 uppercase">
                Pro & Delivery
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-stone-900">$129.000</span>
                <span className="text-xs text-stone-500">COP / mes</span>
              </div>
              <p className="mt-2 text-xs text-stone-600">Para restaurantes con alto volumen de pedidos y delivery propio.</p>

              <ul className="mt-6 space-y-3 text-xs text-stone-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Todo lo incluido en Emprendedor</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Pagos con tarjeta online (Wompi)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Cálculo automático de domicilio por km</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Programa de lealtad y puntos para clientes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Gestión de staff con roles (cajero, cocina, repartidor)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Analíticas avanzadas y exportación CSV</span>
                </li>
              </ul>

              <Link
                to="/registro-restaurante"
                className="btn-primary mt-8 w-full justify-center font-black shadow-md"
              >
                Comenzar prueba gratis de 14 días
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-stone-100/70 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-black tracking-tight">Preguntas Frecuentes</h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-stone-900"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180 text-orange-600' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-stone-100 px-5 pb-5 pt-3 text-xs leading-6 text-stone-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-orange-600 py-16 text-center text-white px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-black sm:text-4xl">¿Listo para hacer crecer tu restaurante?</h2>
          <p className="mt-3 text-sm text-orange-100">
            Únete a los restaurantes independientes que ya no pagan comisiones abusivas.
          </p>
          <div className="mt-8">
            <Link
              to="/registro-restaurante"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-black text-orange-700 shadow-xl hover:bg-stone-100 transition"
            >
              Crear mi restaurante gratis
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
