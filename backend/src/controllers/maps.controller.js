import * as mapsService from '../services/maps.service.js';

export const validateAddress = async (req, res) => {
  const { address } = req.validated.query;
  const geoData = await mapsService.isAddressInZone(req.user.restaurantId, address);
  res.json(geoData || { valid: false });
};
