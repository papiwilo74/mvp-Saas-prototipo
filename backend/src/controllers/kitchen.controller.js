import * as orderService from '../services/order.service.js';

export const kitchenOrders = async (req, res) => {
  const orders = await orderService.listKitchenOrders(req.user.restaurantId);
  res.json({ orders });
};
