export const toOrderItemResponse = (item) => ({
  id: item.id,
  productId: item.productId,
  quantity: item.quantity,
  unitPrice: item.unitPrice,
  subtotal: item.subtotal,
  product: item.product ? {
    id: item.product.id,
    name: item.product.name,
    description: item.product.description,
    price: item.product.price,
    imageUrl: item.product.imageUrl
  } : null
});

export const toOrderResponse = (order) => ({
  id: order.id,
  orderNumber: order.orderNumber,
  status: order.status,
  customerName: order.customerName,
  customerPhone: order.customerPhone,
  customerEmail: order.customerEmail,
  customerAddress: order.customerAddress,
  deliveryZoneName: order.deliveryZoneName,
  scheduledFor: order.scheduledFor,
  notes: order.notes,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
  subtotal: order.subtotal,
  deliveryFeeApplied: order.deliveryFeeApplied,
  discountAmount: order.discountAmount,
  pointsRedeemed: order.pointsRedeemed,
  couponCode: order.couponCode,
  tableNumber: order.tableNumber,
  total: order.total,
  items: order.items?.map(toOrderItemResponse),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

export const toOrderListResponse = (orders, pagination) => ({
  orders: orders.map(toOrderResponse),
  pagination
});
