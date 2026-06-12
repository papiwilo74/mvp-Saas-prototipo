import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'demo-burger' },
    update: {},
    create: {
      name: 'Demo Burger',
      slug: 'demo-burger',
      email: 'hola@demoburger.com',
      phone: '+57 300 753 8040',
      address: 'Calle Principal 123'
    }
  });

  await prisma.restaurantConfig.upsert({
    where: { restaurantId: restaurant.id },
    update: {},
    create: {
      restaurantName: 'Demo Burger',
      logoUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add',
      primaryColor: '#ea580c',
      secondaryColor: '#18181b',
      phone: '+57 300 753 8040',
      whatsapp: '+573007538040',
      address: 'Calle Principal 123',
      email: 'hola@demoburger.com',
      facebookUrl: 'https://facebook.com',
      instagramUrl: 'https://instagram.com',
      restaurantId: restaurant.id
    }
  });

  const burgers = await prisma.category.upsert({
    where: { restaurantId_name: { restaurantId: restaurant.id, name: 'Hamburguesas' } },
    update: {},
    create: { name: 'Hamburguesas', sortOrder: 1, restaurantId: restaurant.id }
  });

  const sides = await prisma.category.upsert({
    where: { restaurantId_name: { restaurantId: restaurant.id, name: 'Acompanantes' } },
    update: {},
    create: { name: 'Acompanantes', sortOrder: 2, restaurantId: restaurant.id }
  });

  const drinks = await prisma.category.upsert({
    where: { restaurantId_name: { restaurantId: restaurant.id, name: 'Bebidas' } },
    update: {},
    create: { name: 'Bebidas', sortOrder: 3, restaurantId: restaurant.id }
  });

  const products = [
    {
      name: 'Classic Burger',
      description: 'Carne artesanal, queso cheddar, lechuga, tomate y salsa de la casa.',
      price: 24900,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      restaurantId: restaurant.id,
      categoryId: burgers.id
    },
    {
      name: 'Doble Bacon',
      description: 'Doble carne, bacon crocante, cebolla caramelizada y BBQ.',
      price: 32900,
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
      restaurantId: restaurant.id,
      categoryId: burgers.id
    },
    {
      name: 'Papas Crunch',
      description: 'Papas rusticas con paprika y salsa ranch.',
      price: 11900,
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
      restaurantId: restaurant.id,
      categoryId: sides.id
    },
    {
      name: 'Limonada Natural',
      description: 'Limonada fresca preparada al momento.',
      price: 7900,
      imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859',
      restaurantId: restaurant.id,
      categoryId: drinks.id
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { restaurantId_name: { restaurantId: restaurant.id, name: product.name } },
      update: product,
      create: product
    });
  }

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      name: 'Admin Demo',
      email: 'admin@demo.com',
      passwordHash,
      role: 'ADMIN',
      restaurantId: restaurant.id
    }
  });

  const customerPasswordHash = await bcrypt.hash('Cliente123!', 10);
  await prisma.user.upsert({
    where: { email: 'cliente@demo.com' },
    update: {},
    create: {
      name: 'Cliente Demo',
      email: 'cliente@demo.com',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      restaurantId: restaurant.id
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
