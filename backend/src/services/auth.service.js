import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/token.js';
import { sendWelcomeEmail } from './email.service.js';

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  restaurantId: user.restaurantId
});

export const register = async ({ name, email, password }) => {
  const restaurant = await prisma.restaurant.findFirst({ where: { slug: 'demo-burger' } });
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      restaurantId: restaurant?.id
    }
  });

  await sendWelcomeEmail({ to: user.email, name: user.name });

  return { user: publicUser(user), token: signToken(user) };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(401, 'Credenciales invalidas');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new ApiError(401, 'Credenciales invalidas');
  }

  return { user: publicUser(user), token: signToken(user) };
};
