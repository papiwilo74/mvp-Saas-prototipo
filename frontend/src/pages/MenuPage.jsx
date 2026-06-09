import { Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCard } from '../components/menu/ProductCard';
import { useCart } from '../context/CartContext';
import { useMenu } from '../hooks/useMenu';

export function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const { addItem } = useCart();
  const { categories, products, loading } = useMenu();

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
    return <div className="container-page py-10 text-sm text-stone-600">Cargando menu...</div>;
  }

  return (
    <section className="container-page py-5 md:py-8">
      <div className="mb-5">
        <h1 className="text-2xl font-black">Menu</h1>
        <p className="mt-1 text-sm text-stone-600">Elige tus favoritos y arma el pedido en segundos.</p>
      </div>

      <div className="sticky top-16 z-20 -mx-4 border-y border-stone-200 bg-stone-50 px-4 py-3 sm:mx-0 sm:rounded-md sm:border">
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
            className={`min-h-10 shrink-0 rounded-md px-4 text-sm font-bold ${
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
              className={`min-h-10 shrink-0 whitespace-nowrap rounded-md px-4 text-sm font-bold ${
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
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-bold ${
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
    </section>
  );
}

