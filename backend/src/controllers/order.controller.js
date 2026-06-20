import * as orderService from '../services/order.service.js';

export const create = async (req, res) => {
  const order = await orderService.createOrder({
    ...req.validated.body,
    userId: req.user?.id
  });
  res.status(201).json({ order });
};

export const myOrders = async (req, res) => {
  const orders = await orderService.listMyOrders(req.user.id);
  res.json({ orders });
};

export const adminOrders = async (req, res) => {
  const orders = await orderService.listRestaurantOrders(req.user.restaurantId, req.validated?.query || {});
  res.json({ orders });
};

export const updateStatus = async (req, res) => {
  const order = await orderService.updateOrderStatus(
    req.user.restaurantId,
    req.validated.params.id,
    req.validated.body.status
  );
  res.json({ order });
};

