import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const burgerProducts = [
  { name: 'Burger Clasica', description: 'Carne 150g, queso cheddar, lechuga, tomate, cebolla y salsa de la casa.', price: 18000, category: 'Hamburguesas', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' },
  { name: 'Burger Doble', description: 'Dos carnes 150g, doble queso, tocineta, cebolla caramelizada.', price: 26000, category: 'Hamburguesas', imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b', isCombo: true, comboItems: ['Burger doble', 'Papas grandes', 'Bebida 500ml'] },
  { name: 'Burger Pollo', description: 'Pechuga crispy, queso mozzarella, guacamole y pico de gallo.', price: 22000, category: 'Hamburguesas', imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e1a13086' },
  { name: 'Papas Supreme', description: 'Papas en cascos con queso fundido, tocineta y sour cream.', price: 14000, category: 'Acompanantes' },
  { name: 'Aros de Cebolla', description: '12 aros empanizados con salsa ranch.', price: 12000, category: 'Acompanantes', trackStock: true, stock: 25 },
  { name: 'Coca Cola 500ml', description: 'Botella personal.', price: 5000, category: 'Bebidas' },
  { name: 'Limonada de Coco', description: 'Natural, sin azucar anadida.', price: 8000, category: 'Bebidas', trackStock: true, stock: 15 },
  { name: 'Malteada Oreo', description: 'Con helado de vainilla y trozos de Oreo.', price: 12000, category: 'Bebidas' },
];

const pizzaProducts = [
  { name: 'Pizza Margherita', description: 'Salsa de tomate, mozzarella fresca, albahaca y aceite de oliva.', price: 25000, category: 'Pizzas Clasicas', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002' },
  { name: 'Pizza Pepperoni', description: 'Doble pepperoni, mozzarella y oregano.', price: 28000, category: 'Pizzas Clasicas', imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e' },
  { name: 'Pizza Hawaiana', description: 'Jamon, pina caramelizada y mozzarella.', price: 26000, category: 'Pizzas Clasicas' },
  { name: 'Pizza BBQ Chicken', description: 'Pollo BBQ, maiz, cebolla morada y mozzarella.', price: 32000, category: 'Pizzas Premium', isCombo: true, comboItems: ['Pizza BBQ Chicken', 'Bebida 1.5L', 'Porcion de Pan de Ajo'] },
  { name: 'Pizza Supreme', description: 'Carne, pepperoni, chorizo, pimenton, champiñones y aceitunas.', price: 35000, category: 'Pizzas Premium', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591' },
  { name: 'Pan de Ajo', description: '4 porciones con queso parmesano y especias.', price: 10000, category: 'Entradas' },
  { name: 'Palitos de Mozzarella', description: '8 unidades con salsa marinara.', price: 15000, category: 'Entradas', trackStock: true, stock: 20 },
  { name: 'Coca Cola 1.5L', description: 'Botella familiar.', price: 9000, category: 'Bebidas' },
  { name: 'Jugo Natural de Maracuya', description: 'Sin azucar. 500ml.', price: 7000, category: 'Bebidas' },
];

const storeProducts = [
  { name: 'Bolso tejido artesanal', description: 'Bolso mediano hecho a mano, ideal para uso diario.', price: 45000, category: 'Accesorios', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7', trackStock: true, stock: 12 },
  { name: 'Aretes dorados minimalistas', description: 'Aretes livianos para combinar con cualquier outfit.', price: 18000, category: 'Accesorios', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908', trackStock: true, stock: 20 },
  { name: 'Set de libretas decoradas', description: 'Paquete de 3 libretas pequeñas con diseños variados.', price: 22000, category: 'Papeleria', imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db', trackStock: true, stock: 18 },
  { name: 'Vela aromatica vainilla', description: 'Vela en vaso de vidrio con aroma suave a vainilla.', price: 25000, category: 'Hogar', imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59', trackStock: true, stock: 15 },
  { name: 'Organizador multiusos', description: 'Organizador plastico para escritorio, maquillaje o accesorios.', price: 30000, category: 'Hogar', trackStock: true, stock: 10 },
  { name: 'Crema corporal hidratante', description: 'Crema de uso diario para manos y cuerpo.', price: 28000, category: 'Belleza', imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883', trackStock: true, stock: 16 },
  { name: 'Kit regalo especial', description: 'Incluye vela aromatica, libreta decorada y empaque de regalo.', price: 62000, category: 'Promociones', isCombo: true, comboItems: ['Vela aromatica vainilla', 'Set de libretas decoradas', 'Empaque de regalo'], trackStock: true, stock: 8 },
  { name: 'Moña scrunchie satinada', description: 'Moña suave para el cabello disponible en colores surtidos.', price: 12000, category: 'Belleza', trackStock: true, stock: 30 }
];

const skincareProducts = [
  { name: 'Limpiador facial suave', description: 'Limpieza diaria para rostro, con aloe vera y niacinamida.', price: 32000, category: 'Limpieza facial', imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883', trackStock: true, stock: 25 },
  { name: 'Serum de vitamina C', description: 'Serum iluminador para ayudar a mejorar la apariencia de manchas.', price: 58000, category: 'Tratamientos', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', trackStock: true, stock: 18 },
  { name: 'Crema hidratante facial', description: 'Hidratación ligera para todo tipo de piel.', price: 45000, category: 'Hidratación', imageUrl: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd', trackStock: true, stock: 20 },
  { name: 'Protector solar SPF 50', description: 'Protección facial de amplio espectro, acabado ligero.', price: 52000, category: 'Protección solar', imageUrl: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8', trackStock: true, stock: 30 },
  { name: 'Mascarilla de arcilla', description: 'Tratamiento semanal para limpiar y refrescar la piel.', price: 28000, category: 'Tratamientos', trackStock: true, stock: 16 },
  { name: 'Kit rutina facial', description: 'Limpiador, serum y crema hidratante para una rutina completa.', price: 119000, category: 'Kits', isCombo: true, comboItems: ['Limpiador facial suave', 'Serum de vitamina C', 'Crema hidratante facial'], trackStock: true, stock: 10 }
];

async function createRestaurant({ name, slug, email, phone, address, adminEmail, adminPassword, products, config }) {
  console.log(`Creando ${name}...`);

  const restaurant = await prisma.restaurant.upsert({
    where: { slug },
    update: {},
    create: { name, slug, email, phone, address }
  });

  const defaultConfig = {
    restaurantName: name,
    logoUrl: '',
    primaryColor: '#ea580c',
    secondaryColor: '#141414',
    phone,
    whatsapp: phone?.replace(/\D/g, ''),
    address,
    email,
    openingHours: 'Lunes a domingo: 11:00 a.m. - 10:00 p.m.',
    businessType: 'restaurant',
    businessLabel: 'restaurante',
    catalogLabel: 'Menú',
    orderLabel: 'pedido',
    productLabel: 'producto',
    fulfillmentLabel: 'domicilio',
    showTableNumber: true,
    showKitchenPanel: true,
    acceptsScheduledOrders: true,
    leadTimeMinutes: 30,
    deliveryFee: 5000,
    deliveryZones: [
      { name: 'Centro', fee: 5000, minOrder: 20000, estimatedMinutes: 30, isActive: true },
      { name: 'Norte', fee: 8000, minOrder: 25000, estimatedMinutes: 45, isActive: true },
      { name: 'Sur', fee: 6000, minOrder: 20000, estimatedMinutes: 35, isActive: false }
    ],
    coupons: [
      { code: 'BIENVENIDA10', description: '10% en tu primer pedido', discountType: 'PERCENTAGE', discountValue: 10, minimumOrder: 0, isActive: true },
      { code: 'FINDE20', description: '20% off fines de semana', discountType: 'PERCENTAGE', discountValue: 20, minimumOrder: 30000, isActive: true }
    ],
    paymentMethods: ['CASH', 'NEQUI', 'CARD'],
    loyaltyProgram: { enabled: true, pointsPerPeso: 0.01, pointsValue: 10 },
    ...config
  };

  await prisma.restaurantConfig.upsert({
    where: { restaurantId: restaurant.id },
    update: defaultConfig,
    create: { ...defaultConfig, restaurantId: restaurant.id }
  });

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { emailVerifiedAt: new Date() },
    create: { name: `Admin ${name}`, email: adminEmail, passwordHash, role: 'ADMIN', restaurantId: restaurant.id, emailVerifiedAt: new Date() }
  });

  const categories = [...new Set(products.map((p) => p.category))];
  const categoryMap = {};

  for (let i = 0; i < categories.length; i++) {
    const cat = await prisma.category.upsert({
      where: { restaurantId_name: { restaurantId: restaurant.id, name: categories[i] } },
      update: {},
      create: { name: categories[i], sortOrder: i, restaurantId: restaurant.id }
    });
    categoryMap[categories[i]] = cat;
  }

  for (const product of products) {
    const { category, ...productData } = product;
    await prisma.product.upsert({
      where: { restaurantId_name: { restaurantId: restaurant.id, name: product.name } },
      update: { ...productData, categoryId: categoryMap[product.category].id },
      create: {
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl || null,
        isAvailable: true,
        trackStock: product.trackStock || false,
        stock: product.stock || null,
        isCombo: product.isCombo || false,
        comboItems: product.comboItems || [],
        restaurantId: restaurant.id,
        categoryId: categoryMap[product.category].id
      }
    });
  }

  console.log(`  ✓ ${name} creado (${products.length} productos, ${categories.length} categorias)`);
  console.log(`    Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`    Slug: /?restaurant=${slug}`);
  console.log('');
  return restaurant;
}

async function main() {
  console.log('Creando negocios de ejemplo...\n');

  await createRestaurant({
    name: 'Burger House',
    slug: 'burger-house',
    email: 'hola@burgerhouse.com',
    phone: '+57 310 111 2233',
    address: 'Carrera 15 #85-20, Bogota',
    adminEmail: 'admin@burgerhouse.com',
    adminPassword: 'Burger123!',
    products: burgerProducts,
    config: {
      restaurantName: 'Burger House',
      primaryColor: '#dc2626',
      secondaryColor: '#1c1917',
      businessType: 'restaurant',
      businessLabel: 'restaurante',
      catalogLabel: 'Menú',
      orderLabel: 'pedido',
      productLabel: 'producto',
      fulfillmentLabel: 'domicilio',
      showTableNumber: true,
      showKitchenPanel: true,
      openingHours: 'Martes a domingo: 12:00 p.m. - 11:00 p.m.'
    }
  });

  await createRestaurant({
    name: 'Aura Skin',
    slug: 'aura-skin',
    email: 'hola@auraskin.com',
    phone: '+57 315 888 1122',
    address: 'Carrera 7 #72-41, Bogota',
    adminEmail: 'admin@auraskin.com',
    adminPassword: 'Aura123!',
    products: skincareProducts,
    config: {
      restaurantName: 'Aura Skin',
      logoUrl: 'https://images.unsplash.com/photo-1612817288484-6f916006741a',
      heroImageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883',
      primaryColor: '#be7c8c',
      secondaryColor: '#59434a',
      businessType: 'store',
      businessLabel: 'tienda',
      catalogLabel: 'Catálogo',
      orderLabel: 'compra',
      productLabel: 'producto',
      fulfillmentLabel: 'entrega',
      showTableNumber: false,
      showKitchenPanel: false,
      openingHours: 'Lunes a sábado: 9:00 a.m. - 6:00 p.m.',
      acceptsScheduledOrders: false,
      deliveryFee: 6000,
      storeLatitude: 4.667,
      storeLongitude: -74.056,
      deliveryZones: [
        { name: 'Hasta 3 km', fee: 5000, maxKm: 3, estimatedMinutes: 30, isActive: true },
        { name: 'Hasta 6 km', fee: 8000, maxKm: 6, estimatedMinutes: 45, isActive: true },
        { name: 'Hasta 10 km', fee: 12000, maxKm: 10, estimatedMinutes: 60, isActive: true }
      ],
      paymentMethods: ['CASH', 'NEQUI', 'CARD']
    }
  });

  await createRestaurant({
    name: 'Pizza Roma',
    slug: 'pizza-roma',
    email: 'hola@pizzaroma.com',
    phone: '+57 320 444 5566',
    address: 'Calle 80 #12-34, Medellin',
    adminEmail: 'admin@pizzaroma.com',
    adminPassword: 'Pizza123!',
    products: pizzaProducts,
    config: {
      restaurantName: 'Pizza Roma',
      primaryColor: '#7c3aed',
      secondaryColor: '#1c1917',
      businessType: 'restaurant',
      businessLabel: 'restaurante',
      catalogLabel: 'Menú',
      orderLabel: 'pedido',
      productLabel: 'producto',
      fulfillmentLabel: 'domicilio',
      showTableNumber: true,
      showKitchenPanel: true,
      openingHours: 'Lunes a domingo: 11:00 a.m. - 10:00 p.m.',
      deliveryFee: 4000
    }
  });

  await createRestaurant({
    name: 'Variedades Martha',
    slug: 'variedades-martha',
    email: 'ventas@variedadesmartha.com',
    phone: '+57 301 555 7788',
    address: 'Barrio El Prado, Barranquilla',
    adminEmail: 'admin@variedadesmartha.com',
    adminPassword: 'Martha123!',
    products: storeProducts,
    config: {
      restaurantName: 'Variedades Martha',
      logoUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
      primaryColor: '#db2777',
      secondaryColor: '#312e81',
      businessType: 'store',
      businessLabel: 'tienda',
      catalogLabel: 'Catálogo',
      orderLabel: 'compra',
      productLabel: 'producto',
      fulfillmentLabel: 'entrega',
      showTableNumber: false,
      showKitchenPanel: false,
      openingHours: 'Lunes a sábado: 9:00 a.m. - 7:00 p.m.',
      acceptsScheduledOrders: false,
      leadTimeMinutes: 60,
      deliveryFee: 6000,
      deliveryZones: [
        { name: 'Cerca a la tienda', fee: 4000, minOrder: 20000, estimatedMinutes: 35, isActive: true },
        { name: 'Ciudad', fee: 8000, minOrder: 35000, estimatedMinutes: 60, isActive: true },
        { name: 'Recoger en tienda', fee: 0, minOrder: 0, estimatedMinutes: 20, isActive: true }
      ],
      coupons: [
        { code: 'MARTHA10', description: '10% en tu primera compra', discountType: 'PERCENTAGE', discountValue: 10, minimumOrder: 25000, isActive: true },
        { code: 'ENVIOGRATIS', description: 'Descuento fijo para ayudarte con el envio', discountType: 'FIXED', discountValue: 6000, minimumOrder: 60000, isActive: true }
      ],
      paymentMethods: ['CASH', 'NEQUI', 'CARD'],
      loyaltyProgram: { enabled: true, pointsPerPeso: 0.01, pointsValue: 10 }
    }
  });

  console.log('Listo. Negocios de ejemplo creados.');
  console.log('\nSuperadmin: superadmin@demo.com / SuperAdmin123!');
  console.log('Demo original: admin@demo.com / Admin123!');
  console.log('Tienda demo: admin@variedadesmartha.com / Martha123!');
  console.log('Tienda facial demo: admin@auraskin.com / Aura123!');
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
