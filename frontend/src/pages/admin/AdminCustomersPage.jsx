import { MessageSquare, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Pagination } from '../../components/ui/Pagination';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const cleanPhone = (phone) => (phone || '').replace(/\D/g, '');

export function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, pageSize: 20 });

  const selectedCustomer = useMemo(
    () => selected || customers.find((customer) => customer.id === selectedId),
    [customers, selected, selectedId]
  );

  const loadCustomers = (page = pagination.page) => {
    api.get('/customers', { params: { search, page, pageSize: pagination.pageSize } }).then(({ data }) => {
      setCustomers(data.customers);
      setPagination(data.pagination);
      if (!selectedId && data.customers[0]) setSelectedId(data.customers[0].id);
    });
  };

  useEffect(() => {
    loadCustomers(1);
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    api.get(`/customers/${selectedId}`).then(({ data }) => {
      setSelected(data.customer);
      setNotes(data.customer.notes || '');
    });
  }, [selectedId]);

  const submitSearch = (event) => {
    event.preventDefault();
    setSelected(null);
    setSelectedId(null);
    loadCustomers(1);
  };

  const saveNotes = async () => {
    if (!selectedId) return;
    setSavingNotes(true);
    const { data } = await api.patch(`/customers/${selectedId}/notes`, { notes });
    setSelected((current) => ({ ...current, notes: data.customer.notes }));
    setSavingNotes(false);
  };

  const whatsappUrl = selectedCustomer?.phone
    ? `https://wa.me/${cleanPhone(selectedCustomer.phone)}?text=${encodeURIComponent(`Hola ${selectedCustomer.name}, te escribimos del restaurante.`)}`
    : '';

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Clientes CRM</h1>
          <p className="mt-1 text-sm text-stone-600">Contactos creados automaticamente desde los pedidos.</p>
        </div>
        <form onSubmit={submitSearch} className="flex gap-2 sm:w-80">
          <input
            className="input min-h-10"
            placeholder="Buscar cliente"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="btn-secondary min-h-10 px-3" type="submit" aria-label="Buscar">
            <Search size={17} />
          </button>
        </form>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="overflow-hidden rounded-md border border-stone-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-stone-100 text-stone-700">
                <tr>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3">Pedidos</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Ultima compra</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedId(customer.id)}
                    className={`cursor-pointer border-t border-stone-200 ${selectedId === customer.id ? 'bg-amber-50' : 'hover:bg-stone-50'}`}
                  >
                    <td className="p-3 font-bold">{customer.name}</td>
                    <td className="p-3">
                      {customer.phone && <p>{customer.phone}</p>}
                      {customer.email && <p className="text-xs text-stone-500">{customer.email}</p>}
                    </td>
                    <td className="p-3 font-bold">{customer._count?.orders || 0}</td>
                    <td className="p-3 font-bold">{formatCurrency(customer.totalSpent)}</td>
                    <td className="p-3">{customer.lastOrder ? formatDate(customer.lastOrder.createdAt) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div className="lg:col-span-2">
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={loadCustomers} />
        </div>

        <aside className="h-fit rounded-md border border-stone-200 bg-white p-5">
          {selectedCustomer ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">{selectedCustomer.name}</h2>
                  {selectedCustomer.address && <p className="mt-1 text-sm text-stone-600">{selectedCustomer.address}</p>}
                </div>
                {whatsappUrl && (
                  <a className="btn-primary min-h-10 px-3" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                    <MessageSquare size={17} />
                  </a>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-stone-100 p-3">
                  <p className="text-stone-600">Pedidos</p>
                  <p className="text-lg font-black">{selectedCustomer.orders?.length || selectedCustomer._count?.orders || 0}</p>
                </div>
                <div className="rounded-md bg-stone-100 p-3">
                  <p className="text-stone-600">Telefono</p>
                  <p className="font-black">{selectedCustomer.phone || '-'}</p>
                </div>
              </div>

              <label className="mt-5 block space-y-2">
                <span className="label">Notas internas</span>
                <textarea className="input min-h-28" value={notes} onChange={(event) => setNotes(event.target.value)} />
              </label>
              <button className="btn-secondary mt-3 w-full" type="button" onClick={saveNotes} disabled={savingNotes}>
                {savingNotes ? 'Guardando...' : 'Guardar notas'}
              </button>

              <div className="mt-6">
                <h3 className="font-black">Historial</h3>
                <div className="mt-3 space-y-3">
                  {(selectedCustomer.orders || []).map((order) => (
                    <div key={order.id} className="rounded-md border border-stone-200 p-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="font-black">Pedido #{order.orderNumber}</span>
                        <span className="font-black">{formatCurrency(order.total)}</span>
                      </div>
                      <p className="mt-1 text-xs text-stone-500">{formatDate(order.createdAt)} - {order.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-stone-600">Selecciona un cliente para ver su historial.</p>
          )}
        </aside>
      </div>
    </div>
  );
}