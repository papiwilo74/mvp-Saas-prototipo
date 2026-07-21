import * as orderService from '../services/order.service.js';
import { toOrderResponse, toOrderListResponse } from '../dto/order.dto.js';

export const create = async (req, res) => {
  const result = await orderService.createOrder({
    ...req.validated.body,
    userId: req.user?.id
  });
  res.status(201).json({ order: toOrderResponse(result.order), earnedPoints: result.earnedPoints, warnings: result.warnings });
};

export const myOrders = async (req, res) => {
  const orders = await orderService.listMyOrders(req.user.id);
  res.json({ orders: orders.map(toOrderResponse) });
};

export const adminOrders = async (req, res) => {
  const result = await orderService.listRestaurantOrders(req.user.restaurantId, req.validated?.query || {});
  res.json(toOrderListResponse(result.orders, result.pagination));
};

export const updateStatus = async (req, res) => {
  const order = await orderService.updateOrderStatus(
    req.user.restaurantId,
    req.validated.params.id,
    req.validated.body.status
  );
  res.json({ order: toOrderResponse(order) });
};

