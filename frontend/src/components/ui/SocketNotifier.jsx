import { useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export function SocketNotifier() {
  const { user } = useAuth();
  const { socketRef } = useSocket(user?.restaurantId, user);
  const { toast } = useToast();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNewOrder = (order) => {
      toast(`Nuevo pedido #${order.orderNumber} - $${Number(order.total).toLocaleString('es-CO')}`, 'success');
    };

    const handleOrderUpdated = (order) => {
      const statusLabels = { PENDING: 'Pendiente', PREPARING: 'Preparando', ON_THE_WAY: 'En camino', DELIVERED: 'Entregado', CANCELLED: 'Cancelado' };
      toast(`Pedido #${order.orderNumber}: ${statusLabels[order.status] || order.status}`, 'info');
    };

    socket.on('new-order', handleNewOrder);
    socket.on('order-updated', handleOrderUpdated);
    socket.on('kitchen-order', () => {
      toast('Nuevo pedido en cocina', 'warning');
    });

    return () => {
      socket.off('new-order', handleNewOrder);
      socket.off('order-updated', handleOrderUpdated);
    };
  }, [socketRef, toast]);

  return null;
}
