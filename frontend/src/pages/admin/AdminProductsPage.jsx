import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  categoryId: '',
  isAvailable: true
};

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = () =>
    Promise.all([api.get('/products'), api.get('/categories')]).then(([productsResponse, categoriesResponse]) => {
      setProducts(productsResponse.data.products);
      setCategories(categoriesResponse.data.categories);
      setForm((current) => ({ ...current, categoryId: current.categoryId || categoriesResponse.data.categories[0]?.id || '' }));
    });

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = { ...form, price: Number(form.price) };

    if (editingId) {
      await api.put(`/products/${editingId}`, payload);
    } else {
      await api.post('/products', payload);
    }

    setEditingId(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id || '' });
    load();
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: Number(product.price),
      imageUrl: product.imageUrl || '',
      categoryId: product.categoryId,
      isAvailable: product.isAvailable
    });
  };

  const deleteProduct = async (productId) => {
    await api.delete(`/products/${productId}`);
    load();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={onSubmit} className="h-fit rounded-md border border-stone-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-black">{editingId ? 'Editar producto' : 'Nuevo producto'}</h1>
        <div className="mt-5 space-y-4">
          <label className="block space-y-1">
            <span className="label">Nombre</span>
            <input className="input" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="label">Descripcion</span>
            <textarea className="input min-h-24" required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
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
            <span className="label">Categoria</span>
            <select className="input" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={form.isAvailable} onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })} />
            Disponible
          </label>
        </div>
        <button type="submit" className="btn-primary mt-5 w-full">{editingId ? 'Guardar cambios' : 'Crear producto'}</button>
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
    </div>
  );
}
