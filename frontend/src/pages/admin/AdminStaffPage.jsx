import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApiQuery, apiQueryKey } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

const roleLabels = { ADMIN: 'Admin', CASHIER: 'Cajero', KITCHEN: 'Cocina', DELIVERY: 'Domiciliario' };
const roleColors = { ADMIN: 'bg-red-100 text-red-700', CASHIER: 'bg-blue-100 text-blue-700', KITCHEN: 'bg-amber-100 text-amber-700', DELIVERY: 'bg-emerald-100 text-emerald-700' };

export function AdminStaffPage() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', pin: '', role: 'CASHIER' });

  const { data: staff = [], isLoading, refetch } = useApiQuery(
    apiQueryKey('staff'),
    async () => { const { data } = await api.get('/staff'); return data; }
  );

  const createMutation = useApiMutation(
    async (payload) => { const { data } = await api.post('/staff', payload); return data; },
    { onSuccess: () => { toast('Empleado creado'); setShowForm(false); setForm({ name: '', email: '', phone: '', pin: '', role: 'CASHIER' }); refetch(); } }
  );

  const updateMutation = useApiMutation(
    async (payload) => { const { data } = await api.put(`/staff/${editing.id}`, payload); return data; },
    { onSuccess: () => { toast('Empleado actualizado'); setEditing(null); setShowForm(false); setForm({ name: '', email: '', phone: '', pin: '', role: 'CASHIER' }); refetch(); } }
  );

  const deleteMutation = useApiMutation(
    async (id) => { await api.delete(`/staff/${id}`); },
    { onSuccess: () => { toast('Empleado eliminado'); refetch(); } }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.pin && editing) delete payload.pin;
    if (!payload.phone) delete payload.phone;
    if (editing) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  const startEdit = (member) => {
    setEditing(member);
    setForm({ name: member.name, email: member.email, phone: member.phone || '', pin: '', role: member.role });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Empleados</h1>
          <p className="mt-1 text-sm text-stone-600">Gestiona el personal del restaurante.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', email: '', phone: '', pin: '', role: 'CASHIER' }); }} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> {showForm ? 'Cancelar' : 'Agregar'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black mb-4">{editing ? 'Editar empleado' : 'Nuevo empleado'}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">Nombre</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Telefono</label>
              <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">PIN (4 digitos)</label>
              <input className="input" type="password" maxLength={4} value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })} required={!editing} />
            </div>
            <div>
              <label className="label">Rol</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : editing ? 'Actualizar' : 'Crear empleado'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-2">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-32" /><Skeleton className="mt-1 h-3 w-24" /></div><Skeleton className="h-6 w-16 rounded-full" /></div>
          ))
        ) : staff.length === 0 ? (
          <EmptyState icon={Plus} title="Sin empleados" description="Agrega tu primer empleado para gestionar el personal." />
        ) : (
          staff.map((member) => (
            <div key={member.id} className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-stone-950 text-sm font-black text-white uppercase">{member.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-black truncate">{member.name}</p>
                <p className="text-xs text-stone-500 truncate">{member.email}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleColors[member.role]}`}>{roleLabels[member.role]}</span>
              <div className="flex gap-1">
                <button onClick={() => startEdit(member)} className="rounded-lg px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100">Editar</button>
                <button onClick={() => { if (window.confirm('Eliminar empleado?')) deleteMutation.mutate(member.id); }} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
