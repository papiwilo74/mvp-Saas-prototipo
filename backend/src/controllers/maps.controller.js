import * as mapsService from '../services/maps.service.js';

export const validateAddress = async (req, res) => {
  const { address } = req.validated.query;
  const result = await mapsService.isAddressInZone(req.user.restaurantId, address);
  if (!result) {
    res.json({ valid: false, inZone: false, message: 'No se pudo verificar la dirección' });
    return;
  }
  res.json({
    valid: result.inZone,
    inZone: result.inZone,
    zone: result.zone,
    latitude: result.latitude,
    longitude: result.longitude,
    formattedAddress: result.formattedAddress
  });
};
