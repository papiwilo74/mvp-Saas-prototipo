import * as analyticsService from '../services/analytics.service.js';

export const peakHours = async (req, res) => {
  const data = await analyticsService.getPeakHours(req.user.restaurantId);
  res.json(data);
};

export const revenueByDay = async (req, res) => {
  const data = await analyticsService.getRevenueByDay(req.user.restaurantId);
  res.json(data);
};

export const frequentCustomers = async (req, res) => {
  const data = await analyticsService.getFrequentCustomers(req.user.restaurantId);
  res.json(data);
};
