import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export function AdminDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/orders/admin'), api.get('/products')]).then(([ordersResponse, productsResponse]) => {
      setOrders(ordersResponse.data.orders);
      setProducts(productsResponse.data.products);
    });
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const pending = orders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.status)).length;

    return [
      { label: 'Ventas', value: formatCurrency(revenue) },
      { label: 'Pedidos activos', value: pending },
      { label: 'Productos', value: products.length }
    ];
  }, [orders, products]);

  return (
    <div>
      <h1 className="text-2xl font-black">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-600">{stat.label}</p>
            <p className="mt-2 text-2xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
