import { useState } from 'react';
import { Check, ChevronRight, Rocket } from 'lucide-react';
import { useApiQuery, apiQueryKey } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Skeleton } from './Skeleton';

export function OnboardingWizard() {
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);

  const { data, isLoading, refetch } = useApiQuery(
    apiQueryKey('onboarding', 'status'),
    async () => { const { data } = await api.get('/onboarding/status'); return data; }
  );

  const completeMutation = useApiMutation(
    async () => { await api.post('/onboarding/complete'); },
    { onSuccess: () => { toast('Onboarding completado. Bienvenido!'); refetch(); } }
  );

  if (isLoading || !data || data.completed || dismissed) return null;

  const stepLinks = {
    profile: '/admin/settings',
    hours: '/admin/settings',
    products: '/admin/products',
    staff: '/admin/staff',
    delivery: '/admin/settings',
    payments: '/admin/settings'
  };

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-200 text-amber-700"><Rocket size={20} /></span>
          <div>
            <h3 className="font-black text-amber-950">Configuracion inicial</h3>
            <p className="mt-1 text-sm text-amber-800">Completa los siguientes pasos para poner en marcha tu restaurante.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-amber-700">{data.progress}%</span>
          <div className="h-2 w-20 overflow-hidden rounded-full bg-amber-200">
            <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${data.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {data.steps.map((step) => (
          <div key={step.key} className={`flex items-center gap-3 rounded-lg p-3 text-sm ${step.done ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-stone-700'}`}>
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${step.done ? 'bg-emerald-500 text-white' : 'border-2 border-stone-300 text-stone-400'}`}>
              {step.done ? <Check size={14} /> : <span className="text-xs font-black">{data.steps.indexOf(step) + 1}</span>}
            </span>
            <span className={`flex-1 font-semibold ${step.done ? 'line-through opacity-60' : ''}`}>{step.label}</span>
            {!step.done && (
              <a href={stepLinks[step.key]} className="rounded-lg p-1 text-amber-600 hover:bg-amber-100">
                <ChevronRight size={16} />
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        {data.progress === 100 && (
          <button onClick={() => completeMutation.mutate()} className="btn-primary flex items-center gap-2" disabled={completeMutation.isPending}>
            <Rocket size={16} /> {completeMutation.isPending ? 'Completando...' : 'Finalizar configuracion'}
          </button>
        )}
        <button onClick={() => setDismissed(true)} className="btn-secondary text-sm">Ahora no</button>
      </div>
    </div>
  );
}
