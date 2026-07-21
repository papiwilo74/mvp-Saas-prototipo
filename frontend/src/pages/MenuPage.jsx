import { Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCard } from '../components/menu/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductSkeleton } from '../components/ui/Skeleton';
import { useCart } from '../context/CartContext';
import { useMenu } from '../hooks/useMenu';

export function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const { addItem } = useCart();
  const { categories, products, loading, error } = useMenu();

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory = activeCategory === 'all' || product.categoryId === activeCategory;
        const matchesQuery = `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase());
        const matchesAvailability = !onlyAvailable || product.isAvailable;

        return matchesCategory && matchesQuery && matchesAvailability;
      }),
    [products, activeCategory, query, onlyAvailable]
  );

  if (loading) {
    return (
      <section className="container-page py-5 md:py-8">
        <div className="mb-5">
          <span className="badge-chip">Catalogo visual</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Menu listo para convertir</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Elige tus favoritos, filtra por categorias y arma el pedido en segundos con una presentacion mas premium.</p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="container-page py-10">
        <EmptyState title="No pudimos cargar el menu" isLoading={false} isError errorMessage={error} />
      </div>
    );
  }

  if (!products.length && !loading) {
    return (
      <div className="container-page py-10">
        <EmptyState title="No hay productos disponibles" description="El restaurante aun no ha agregado productos al menu." />
      </div>
    );
  }

  return (
    <section className="container-page py-5 md:py-8">
      <div className="mb-5">
        <span className="badge-chip">Catalogo visual</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Menu listo para convertir</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Elige tus favoritos, filtra por categorias y arma el pedido en segundos con una presentacion mas premium.</p>
      </div>

      <div className="glass-panel sticky top-20 z-20 -mx-4 px-4 py-4 sm:mx-0 sm:px-5">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            className="input pl-10"
            placeholder="Buscar hamburguesas, papas, bebidas..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-bold ${
              activeCategory === 'all' ? 'bg-stone-950 text-white' : 'border border-stone-300 bg-white text-stone-800'
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`min-h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-bold ${
                activeCategory === category.id
                  ? 'bg-stone-950 text-white'
                  : 'border border-stone-300 bg-white text-stone-800'
              }`}
            >
              {category.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOnlyAvailable((value) => !value)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold ${
              onlyAvailable ? 'bg-green-100 text-green-800' : 'border border-stone-300 bg-white text-stone-800'
            }`}
          >
            <SlidersHorizontal size={16} />
            Disponibles
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={addItem} />
        ))}
      </div>
      {!filteredProducts.length ? (
        <div className="safe-panel mt-5 p-5 text-sm text-stone-600">No encontramos productos con esos filtros.</div>
      ) : null}
    </section>
  );
}
