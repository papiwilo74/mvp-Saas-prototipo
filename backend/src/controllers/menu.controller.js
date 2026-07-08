import { ApiError } from '../utils/apiError.js';
import * as menuService from '../services/menu.service.js';

export const getMenu = async (req, res) => {
  const restaurantSlug = req.query.restaurant || 'demo-burger';
  const search = req.query.search || '';

  const restaurant = await menuService.getPublicMenu(restaurantSlug, search);

  if (!restaurant) throw new ApiError(404, 'Restaurante no encontrado');

  res.json({ restaurant });
};
