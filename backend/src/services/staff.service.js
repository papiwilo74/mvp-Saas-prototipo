import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';

export const listStaff = async (restaurantId) => {
  return prisma.staff.findMany({
    where: { restaurantId },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const createStaff = async (restaurantId, data) => {
  const pin = await bcrypt.hash(data.pin, 10);
  return prisma.staff.create({
    data: { ...data, pin, restaurantId },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true }
  });
};

export const updateStaff = async (id, restaurantId, data) => {
  const existing = await prisma.staff.findFirst({ where: { id, restaurantId } });
  if (!existing) return null;

  const updateData = { ...data };
  if (data.pin) updateData.pin = await bcrypt.hash(data.pin, 10);

  return prisma.staff.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true }
  });
};

export const deleteStaff = async (id, restaurantId) => {
  const existing = await prisma.staff.findFirst({ where: { id, restaurantId } });
  if (!existing) return false;

  await prisma.staff.delete({ where: { id } });
  return true;
};

export const verifyStaffPin = async (restaurantId, email, pin) => {
  const staff = await prisma.staff.findFirst({ where: { restaurantId, email, isActive: true } });
  if (!staff) return null;

  const valid = await bcrypt.compare(pin, staff.pin);
  if (!valid) return null;

  return { id: staff.id, name: staff.name, email: staff.email, role: staff.role };
};