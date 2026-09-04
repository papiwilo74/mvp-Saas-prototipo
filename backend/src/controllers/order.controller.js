import * as orderService from '../services/order.service.js';
import { toOrderResponse, toOrderListResponse } from '../dto/order.dto.js';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export const create = async (req, res) => {
  const result = await orderService.createOrder({
    ...req.validated.body,
    userId: req.user?.id
  });
  res.status(201).json({ order: toOrderResponse(result.order), earnedPoints: result.earnedPoints, warnings: result.warnings });
};

export const wompiWebhook = async (req, res) => {
  const { event, data, timestamp, signature } = req.body || {};

  if (event === 'transaction.updated' && data?.transaction) {
    const { id, reference, status, amount_in_cents } = data.transaction;

    if (env.WOMPI_EVENTS_SECRET) {
      const properties = signature?.properties || [];
      const concatenatedValues = properties
        .map((prop) => {
          const keys = prop.split('.');
          let val = data;
          for (const key of keys) {
            val = val?.[key];
          }
          return val;
        })
        .join('');

      const checksum = crypto
        .createHash('sha256')
        .update(`${concatenatedValues}${timestamp}${env.WOMPI_EVENTS_SECRET}`)
        .digest('hex');

      if (checksum !== signature?.checksum) {
        throw new ApiError(400, 'Firma de webhook inválida');
      }
    }

    if (status === 'APPROVED') {
      await orderService.handlePaymentSuccess(reference, id, amount_in_cents);
    }
  }

  res.json({ received: true });
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

export const updatePayment = async (req, res) => {
  const order = await orderService.updatePaymentStatus(
    req.user.restaurantId,
    req.validated.params.id,
    req.validated.body.paymentStatus
  );
  res.json({ order: toOrderResponse(order) });
};
