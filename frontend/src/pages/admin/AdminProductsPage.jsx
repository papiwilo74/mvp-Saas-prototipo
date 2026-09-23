import { useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Pagination } from '../../components/ui/Pagination';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/errorMessage';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  categoryId: '',
  isAvailable: true,
  trackStock: false,
  stock: '',
  isCombo: false,
  comboItems: ''
};

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, pageSize: 20 });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback((page = 1) =>
    Promise.all([api.get('/products', { params: { page, pageSize: pagination.pageSize } }), api.get('/categories')]).then(([productsResponse, categoriesResponse]) => {
      setProducts(productsResponse.data.products);
      setPagination(productsResponse.data.pagination);
      setCategories(categoriesResponse.data.categories);
      setForm((current) => ({ ...current, categoryId: current.categoryId || categoriesResponse.data.categories[0]?.id || '' }));
    }), [pagination.pageSize]);

  useEffect(() => {
    load(1);
  }, [load]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description ? form.description.trim() : '',
        price: Number(form.price),
        imageUrl: form.imageUrl ? form.imageUrl.trim() : null,
        stock: form.trackStock ? Number(form.stock || 0) : null,
        comboItems: form.isCombo && typeof form.comboItems === 'string'
          ? form.comboItems.split(',').map((item) => item.trim()).filter(Boolean)
          : Array.isArray(form.comboItems) ? form.comboItems : []
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setEditingId(null);
      setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
      load(pagination.page);
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'Error al guardar el producto'));
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return;
    const body = new FormData();
    body.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/products/upload-image', body, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm((current) => ({ ...current, imageUrl: data.imageUrl }));
    } finally {
      setUploading(false);
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setErrorMessage('');
    setForm({
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId,
      isAvailable: product.isAvailable,
      trackStock: product.trackStock,
      stock: product.stock ?? '',
      isCombo: product.isCombo,
      comboItems: (product.comboItems || []).join(', ')
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErrorMessage('');
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
  };

  const deleteProduct = async (productId) => {
    await api.delete(`/products/${productId}`);
    load(pagination.page);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={onSubmit} className="h-fit rounded-md border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black">{editingId ? 'Editar producto' : 'Nuevo producto'}</h1>
          {editingId ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-xs font-bold text-stone-500 hover:text-stone-800 underline"
            >
              Cancelar
            </button>
          ) : null}
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <label className="block space-y-1">
            <span className="label">Nombre</span>
            <input className="input" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="label">Descripcion (opcional)</span>
            <textarea className="input min-h-24" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Ingredientes o detalles del producto" />
          </label>
          <label className="block space-y-1">
            <span className="label">Precio</span>
            <input className="input" type="number" min="1" required value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="label">Imagen URL</span>
            <input className="input" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="label">Subir imagen</span>
            <input className="input" type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files?.[0])} />
            {uploading ? <p className="text-xs text-stone-500">Subiendo...</p> : null}
          </label>
          <label className="block space-y-1">
            <span className="label">Categoria</span>
            <select className="input" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={form.isAvailable} onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })} />
            Disponible
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={form.trackStock} onChange={(event) => setForm({ ...form, trackStock: event.target.checked })} />
            Controlar inventario
          </label>
          {form.trackStock ? (
            <label className="block space-y-1">
              <span className="label">Stock</span>
              <input className="input" type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
            </label>
          ) : null}
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={form.isCombo} onChange={(event) => setForm({ ...form, isCombo: event.target.checked })} />
            Es combo
          </label>
          {form.isCombo ? (
            <label className="block space-y-1">
              <span className="label">Items del combo</span>
              <input className="input" value={form.comboItems} onChange={(event) => setForm({ ...form, comboItems: event.target.value })} placeholder="Classic Burger, Papas Crunch, Limonada Natural" />
            </label>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary mt-5 w-full disabled:opacity-50"
        >
          {saving ? 'Guardando...' : (editingId ? 'Guardar cambios' : 'Crear producto')}
        </button>
      </form>

      <section>
        <h2 className="text-2xl font-black">Productos</h2>
        <div className="mt-5 grid gap-4">
          {products.map((product) => (
            <article key={product.id} className="flex flex-col gap-4 rounded-md border border-stone-200 bg-white p-4 sm:flex-row sm:items-center">
              <img src={product.imageUrl} alt={product.name} className="h-24 w-full rounded-md object-cover sm:w-28" />
              <div className="min-w-0 flex-1">
                <h3 className="font-black">{product.name}</h3>
                <p className="text-sm text-stone-600">{product.category?.name}</p>
                {product.isCombo ? <p className="text-xs font-bold text-purple-700">Combo</p> : null}
                {product.trackStock ? <p className="text-xs text-stone-500">Stock: {product.stock ?? 0}</p> : null}
                <p className="mt-1 font-bold">{formatCurrency(product.price)}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary px-3" onClick={() => editProduct(product)} aria-label="Editar producto">
                  <Pencil size={18} />
                </button>
                <button type="button" className="btn-secondary px-3" onClick={() => deleteProduct(product.id)} aria-label="Eliminar producto">
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="lg:col-span-2">
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={load} />
      </div>
    </div>
  );
}
