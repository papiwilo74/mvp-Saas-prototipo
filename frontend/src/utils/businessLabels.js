const businessDefaults = {
  restaurant: {
    businessLabel: 'restaurante',
    businessLabelPlural: 'restaurantes',
    catalogLabel: 'Menú',
    orderLabel: 'pedido',
    orderLabelPlural: 'pedidos',
    productLabel: 'producto',
    productLabelPlural: 'productos',
    fulfillmentLabel: 'domicilio',
    prepAreaLabel: 'cocina',
    statusPreparingLabel: 'Preparando',
    readyActionLabel: 'preparar',
    showTableNumber: true,
    showKitchenPanel: true,
    searchPlaceholder: 'Buscar hamburguesas, papas, bebidas...',
    catalogHeadline: 'Menú listo para convertir',
    catalogDescription: 'Elige tus favoritos, filtra por categorías y arma el pedido en segundos con una presentación más premium.'
  },
  store: {
    businessLabel: 'tienda',
    businessLabelPlural: 'tiendas',
    catalogLabel: 'Catálogo',
    orderLabel: 'compra',
    orderLabelPlural: 'compras',
    productLabel: 'producto',
    productLabelPlural: 'productos',
    fulfillmentLabel: 'entrega',
    prepAreaLabel: 'equipo',
    statusPreparingLabel: 'Alistando',
    readyActionLabel: 'alistar',
    showTableNumber: false,
    showKitchenPanel: false,
    searchPlaceholder: 'Buscar productos, accesorios, hogar...',
    catalogHeadline: 'Catálogo listo para vender',
    catalogDescription: 'Explora productos, filtra por categorías y arma tu compra en segundos.'
  },
  boutique: {
    businessLabel: 'boutique',
    businessLabelPlural: 'boutiques',
    catalogLabel: 'Catálogo',
    orderLabel: 'compra',
    orderLabelPlural: 'compras',
    productLabel: 'prenda',
    productLabelPlural: 'prendas',
    fulfillmentLabel: 'entrega',
    prepAreaLabel: 'equipo',
    statusPreparingLabel: 'Alistando',
    readyActionLabel: 'alistar',
    showTableNumber: false,
    showKitchenPanel: false,
    searchPlaceholder: 'Buscar prendas, accesorios, referencias...',
    catalogHeadline: 'Catálogo listo para vender',
    catalogDescription: 'Elige tus prendas favoritas, revisa disponibilidad y confirma tu compra.'
  },
  bakery: {
    businessLabel: 'repostería',
    businessLabelPlural: 'reposterías',
    catalogLabel: 'Catálogo',
    orderLabel: 'pedido',
    orderLabelPlural: 'pedidos',
    productLabel: 'producto',
    productLabelPlural: 'productos',
    fulfillmentLabel: 'entrega',
    prepAreaLabel: 'equipo',
    statusPreparingLabel: 'Preparando',
    readyActionLabel: 'preparar',
    showTableNumber: false,
    showKitchenPanel: false,
    searchPlaceholder: 'Buscar tortas, postres, galletas...',
    catalogHeadline: 'Catálogo dulce listo para vender',
    catalogDescription: 'Escoge tus postres favoritos y confirma tu pedido fácilmente.'
  },
  stationery: {
    businessLabel: 'papelería',
    businessLabelPlural: 'papelerías',
    catalogLabel: 'Catálogo',
    orderLabel: 'compra',
    orderLabelPlural: 'compras',
    productLabel: 'producto',
    productLabelPlural: 'productos',
    fulfillmentLabel: 'entrega',
    prepAreaLabel: 'equipo',
    statusPreparingLabel: 'Alistando',
    readyActionLabel: 'alistar',
    showTableNumber: false,
    showKitchenPanel: false,
    searchPlaceholder: 'Buscar útiles, cuadernos, materiales...',
    catalogHeadline: 'Catálogo listo para vender',
    catalogDescription: 'Encuentra productos por categoría y confirma tu compra de forma rápida.'
  },
  pharmacy: {
    businessLabel: 'farmacia',
    businessLabelPlural: 'farmacias',
    catalogLabel: 'Catálogo',
    orderLabel: 'pedido',
    orderLabelPlural: 'pedidos',
    productLabel: 'producto',
    productLabelPlural: 'productos',
    fulfillmentLabel: 'entrega',
    prepAreaLabel: 'botica',
    statusPreparingLabel: 'Preparando',
    readyActionLabel: 'preparar',
    showTableNumber: false,
    showKitchenPanel: false,
    searchPlaceholder: 'Buscar medicamentos, vitaminas, higiene...',
    catalogHeadline: 'Catálogo de salud listo para servir',
    catalogDescription: 'Encuentra tus medicamentos y productos de salud, filtra por categorías y realiza tu pedido rápido.'
  },
  cosmetics: {
    businessLabel: 'tienda de belleza',
    businessLabelPlural: 'tiendas de belleza',
    catalogLabel: 'Catálogo',
    orderLabel: 'compra',
    orderLabelPlural: 'compras',
    productLabel: 'producto',
    productLabelPlural: 'productos',
    fulfillmentLabel: 'entrega',
    prepAreaLabel: 'equipo',
    statusPreparingLabel: 'Alistando',
    readyActionLabel: 'alistar',
    showTableNumber: false,
    showKitchenPanel: false,
    searchPlaceholder: 'Buscar maquillaje, cremas, perfumes...',
    catalogHeadline: 'Catálogo de belleza listo para lucir',
    catalogDescription: 'Explora productos de maquillaje, cuidado personal y fragancias. Filtra y compra fácil.'
  },
  petshop: {
    businessLabel: 'petshop',
    businessLabelPlural: 'petshops',
    catalogLabel: 'Catálogo',
    orderLabel: 'compra',
    orderLabelPlural: 'compras',
    productLabel: 'producto',
    productLabelPlural: 'productos',
    fulfillmentLabel: 'entrega',
    prepAreaLabel: 'equipo',
    statusPreparingLabel: 'Alistando',
    readyActionLabel: 'alistar',
    showTableNumber: false,
    showKitchenPanel: false,
    searchPlaceholder: 'Buscar alimento, juguetes, accesorios mascotas...',
    catalogHeadline: 'Todo para tu mascota',
    catalogDescription: 'Encuentra alimentos, juguetes y accesorios para tu mascota. Compra fácil y rápido.'
  },
  bookstore: {
    businessLabel: 'librería',
    businessLabelPlural: 'librerías',
    catalogLabel: 'Catálogo',
    orderLabel: 'compra',
    orderLabelPlural: 'compras',
    productLabel: 'libro',
    productLabelPlural: 'libros',
    fulfillmentLabel: 'entrega',
    prepAreaLabel: 'equipo',
    statusPreparingLabel: 'Alistando',
    readyActionLabel: 'alistar',
    showTableNumber: false,
    showKitchenPanel: false,
    searchPlaceholder: 'Buscar libros, revistas, papelería...',
    catalogHeadline: 'Catálogo de lectura',
    catalogDescription: 'Explora libros, best sellers y novedades literarias. Filtra por género y compra fácil.'
  },
  grocery: {
    businessLabel: 'supermercado',
    businessLabelPlural: 'supermercados',
    catalogLabel: 'Catálogo',
    orderLabel: 'compra',
    orderLabelPlural: 'compras',
    productLabel: 'producto',
    productLabelPlural: 'productos',
    fulfillmentLabel: 'entrega',
    prepAreaLabel: 'bodega',
    statusPreparingLabel: 'Alistando',
    readyActionLabel: 'alistar',
    showTableNumber: false,
    showKitchenPanel: false,
    searchPlaceholder: 'Buscar frutas, verduras, lácteos...',
    catalogHeadline: 'Despensa virtual',
    catalogDescription: 'Compra tus víveres y productos del hogar en línea. Rápido, fresco y a domicilio.'
  }
};

const supportedTypes = Object.freeze(Object.keys(businessDefaults));

const ALLOWED_STRING_KEYS = [
  'businessLabel',
  'catalogLabel',
  'orderLabel',
  'productLabel',
  'fulfillmentLabel'
];

const MAX_STRING_LENGTH = 50;

function sanitizeString(value) {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, MAX_STRING_LENGTH);
}

function normalizeBusinessType(value) {
  if (typeof value !== 'string') return 'store';
  const type = value.toLowerCase().trim();
  if (type.length > 30) return 'store';
  return supportedTypes.includes(type) ? type : 'store';
}

function pluralize(label) {
  if (!label) return '';
  if (label.endsWith('s')) return label;
  if (label.endsWith('z')) return `${label.slice(0, -1)}ces`;
  return `${label}s`;
}

export function capitalizeLabel(label) {
  if (typeof label !== 'string' || !label) return '';
  const sanitized = label.trim().slice(0, 50);
  return `${sanitized.charAt(0).toUpperCase()}${sanitized.slice(1)}`;
}

export function getBusinessLabels(config = {}) {
  if (!config || typeof config !== 'object') {
    return {
      ...businessDefaults.store,
      businessType: 'store'
    };
  }

  const businessType = normalizeBusinessType(config.businessType);
  const defaults = businessDefaults[businessType] || businessDefaults.store;

  const sanitizedConfig = {};
  for (const key of ALLOWED_STRING_KEYS) {
    if (config[key] !== undefined) {
      sanitizedConfig[key] = sanitizeString(config[key]);
    }
  }

  const businessLabel = sanitizedConfig.businessLabel || defaults.businessLabel;
  const catalogLabel = sanitizedConfig.catalogLabel || defaults.catalogLabel;
  const orderLabel = sanitizedConfig.orderLabel || defaults.orderLabel;
  const productLabel = sanitizedConfig.productLabel || defaults.productLabel;
  const fulfillmentLabel = sanitizedConfig.fulfillmentLabel || defaults.fulfillmentLabel;

  const showTableNumber = typeof config.showTableNumber === 'boolean'
    ? config.showTableNumber
    : defaults.showTableNumber;

  const showKitchenPanel = typeof config.showKitchenPanel === 'boolean'
    ? config.showKitchenPanel
    : defaults.showKitchenPanel;

  return {
    ...defaults,
    businessType,
    businessLabel,
    businessLabelPlural: pluralize(businessLabel),
    catalogLabel,
    orderLabel,
    orderLabelPlural: pluralize(orderLabel),
    productLabel,
    productLabelPlural: pluralize(productLabel),
    fulfillmentLabel,
    showTableNumber,
    showKitchenPanel
  };
}
