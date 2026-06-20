import * as reportService from '../services/report.service.js';

export const summary = async (req, res) => {
  const summary = await reportService.getSalesSummary(req.user.restaurantId);
  res.json({ summary });
};

export const topProducts = async (req, res) => {
  const products = await reportService.getTopProducts(req.user.restaurantId);
  res.json({ products });
};