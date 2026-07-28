import * as onboardingService from '../services/onboarding.service.js';

export const status = async (req, res) => {
  const data = await onboardingService.getOnboardingStatus(req.user.restaurantId);
  if (!data) return res.status(404).json({ error: 'Restaurante no encontrado' });
  res.json(data);
};

export const complete = async (_req, res) => {
  await onboardingService.completeOnboarding(_req.user.restaurantId);
  res.json({ message: 'Onboarding completado' });
};