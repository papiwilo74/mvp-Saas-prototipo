import { prisma } from '../config/prisma.js';

export const getOnboardingStatus = async (restaurantId) => {
  const [restaurant, config, productCount, staffCount] = await Promise.all([
    prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { onboardingCompleted: true, name: true, email: true, phone: true, address: true } }),
    prisma.restaurantConfig.findUnique({ where: { restaurantId } }),
    prisma.product.count({ where: { restaurantId, isAvailable: true } }),
    prisma.staff.count({ where: { restaurantId } })
  ]);

  if (!restaurant) return null;

  const steps = [
    { key: 'profile', label: 'Completar perfil del restaurante', done: !!(restaurant.name && config?.restaurantName) },
    { key: 'hours', label: 'Configurar horarios de atencion', done: !!config?.businessHours },
    { key: 'products', label: 'Agregar al menos 1 producto', done: productCount > 0 },
    { key: 'staff', label: 'Agregar al menos 1 empleado', done: staffCount > 0 },
    { key: 'delivery', label: 'Configurar zona de entrega', done: !!(config?.deliveryZones && config.deliveryZones.length > 0) },
    { key: 'payments', label: 'Configurar metodo de pago', done: config?.paymentMethods && config.paymentMethods.length > 0 }
  ];

  const completedSteps = steps.filter((s) => s.done).length;
  const totalSteps = steps.length;

  return {
    completed: restaurant.onboardingCompleted,
    progress: Math.round((completedSteps / totalSteps) * 100),
    steps,
    completedSteps,
    totalSteps
  };
};

export const completeOnboarding = async (restaurantId) => {
  return prisma.restaurant.update({
    where: { id: restaurantId },
    data: { onboardingCompleted: true }
  });
};