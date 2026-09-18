import { useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { playOrderChime } from '../../utils/audioAlert';

export function SocketNotifier() {
  const { user } = useAuth();
  const { socketRef } = useSocket(user?.restaurantId, user);
  const { toast } = useToast();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNewOrder = (order) => {
      playOrderChime();
      toast(`Nuevo pedido #${order.orderNumber} - $${Number(order.total).toLocaleString('es-CO')}`, 'success');
    };

    const handleOrderUpdated = (order) => {
      const statusLabels = { PENDING: 'Pendiente', PREPARING: 'Preparando', ON_THE_WAY: 'En camino', DELIVERED: 'Entregado', CANCELLED: 'Cancelado' };
      toast(`Pedido #${order.orderNumber}: ${statusLabels[order.status] || order.status}`, 'info');
    };

    const handleKitchenOrder = () => {
      playOrderChime();
      toast('Nuevo pedido en cocina', 'warning');
    };

    socket.on('new-order', handleNewOrder);
    socket.on('order-updated', handleOrderUpdated);
    socket.on('kitchen-order', handleKitchenOrder);

    return () => {
      socket.off('new-order', handleNewOrder);
      socket.off('order-updated', handleOrderUpdated);
      socket.off('kitchen-order', handleKitchenOrder);
    };
  }, [socketRef, toast]);

  return null;
}
