import * as exportService from '../services/export.service.js';

export const exportOrders = async (req, res) => {
  const csv = await exportService.exportOrdersCSV(req.user.restaurantId, req.validated?.query || {});
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="pedidos-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send('\uFEFF' + csv);
};
