import { ApiError } from '../utils/apiError.js';
import * as menuService from '../services/menu.service.js';

export const getMenu = async (req, res) => {
  const restaurant = await menuService.getPublicMenu(req.query.restaurant || 'demo-burger');

  if (!restaurant) throw new ApiError(404, 'Restaurante no encontrado');

  res.json({ restaurant });
};

