import { ApiError } from '../utils/apiError.js';
import * as restaurantConfigService from '../services/restaurantConfig.service.js';

export const getPublic = async (req, res) => {
  const restaurant = await restaurantConfigService.getPublicConfig(req.query.restaurant || 'demo-burger');

  if (!restaurant) throw new ApiError(404, 'Restaurante no encontrado');

  res.json({ restaurant });
};

export const update = async (req, res) => {
  const config = await restaurantConfigService.updateConfig(req.user.restaurantId, req.validated.body);
  res.json({ config });
};

