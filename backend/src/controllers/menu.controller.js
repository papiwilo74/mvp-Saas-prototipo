import { ApiError } from '../utils/apiError.js';
import { DEFAULT_RESTAURANT_SLUG } from '../config/constants.js';
import * as menuService from '../services/menu.service.js';
import { toMenuResponse } from '../dto/menu.dto.js';

export const getMenu = async (req, res) => {
  const restaurantSlug = req.query.restaurant || DEFAULT_RESTAURANT_SLUG;
  const search = req.query.search || '';

  const restaurant = await menuService.getPublicMenu(restaurantSlug, search);

  if (!restaurant) throw new ApiError(404, 'Restaurante no encontrado');

  res.json({ restaurant: toMenuResponse(restaurant) });
};
