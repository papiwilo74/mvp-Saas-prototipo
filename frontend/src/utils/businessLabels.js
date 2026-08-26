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
  }
};

const supportedTypes = Object.keys(businessDefaults);

function normalizeBusinessType(value) {
  const type = String(value || 'restaurant').toLowerCase().trim();
  return supportedTypes.includes(type) ? type : 'store';
}

function pluralize(label) {
  if (!label) return '';
  if (label.endsWith('s')) return label;
  if (label.endsWith('z')) return `${label.slice(0, -1)}ces`;
  return `${label}s`;
}

export function capitalizeLabel(label) {
  if (!label) return '';
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

export function getBusinessLabels(config = {}) {
  const businessType = normalizeBusinessType(config.businessType);
  const defaults = businessDefaults[businessType] || businessDefaults.store;

  const businessLabel = config.businessLabel || defaults.businessLabel;
  const catalogLabel = config.catalogLabel || defaults.catalogLabel;
  const orderLabel = config.orderLabel || defaults.orderLabel;
  const productLabel = config.productLabel || defaults.productLabel;
  const fulfillmentLabel = config.fulfillmentLabel || defaults.fulfillmentLabel;

  return {
    ...defaults,
    businessType,
    businessLabel,
    businessLabelPlural: defaults.businessLabelPlural || pluralize(businessLabel),
    catalogLabel,
    orderLabel,
    orderLabelPlural: defaults.orderLabelPlural || pluralize(orderLabel),
    productLabel,
    productLabelPlural: defaults.productLabelPlural || pluralize(productLabel),
    fulfillmentLabel,
    showTableNumber: typeof config.showTableNumber === 'boolean' ? config.showTableNumber : defaults.showTableNumber,
    showKitchenPanel: typeof config.showKitchenPanel === 'boolean' ? config.showKitchenPanel : defaults.showKitchenPanel
  };
}
