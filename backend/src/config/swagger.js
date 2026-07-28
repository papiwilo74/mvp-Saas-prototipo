import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FastFood SaaS API',
      version: '0.1.0',
      description: 'API para pedidos de restaurantes con menu digital, carrito, pagos Wompi, panel admin y superadmin.'
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local dev' }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          },
          example: { error: 'Restaurante no encontrado' }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' },
            environment: { type: 'string' },
            db: { type: 'string' },
            version: { type: 'string' }
          },
          example: { status: 'ok', timestamp: '2026-07-27T23:00:00.000Z', uptime: 12345.67, environment: 'development', db: 'ok', version: '0.1.0' }
        },
        LoginRequest: {
          type: 'object',
          properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 6 } },
          required: ['email', 'password'],
          example: { email: 'admin@burger.com', password: '123456' }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: { id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' }, role: { type: 'string' } }
            }
          },
          example: { user: { id: 'usr-1', name: 'Admin Burger', email: 'admin@burger.com', role: 'admin' } }
        },
        RegisterRequest: {
          type: 'object',
          properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 6 } },
          required: ['name', 'email', 'password'],
          example: { name: 'Juan Perez', email: 'juan@example.com', password: 'miPassword123' }
        },
        MenuResponse: {
          type: 'object',
          properties: {
            restaurant: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                slug: { type: 'string' },
                name: { type: 'string' },
                config: { type: 'object' },
                categories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      products: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            price: { type: 'number' },
                            imageUrl: { type: 'string' },
                            isAvailable: { type: 'boolean' },
                            categoryId: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          example: {
            restaurant: {
              id: 'rest-1',
              slug: 'demo-burger',
              name: 'Demo Burger',
              config: { deliveryFee: 3000, freeDeliveryMin: 50000, businessHours: { open: '08:00', close: '23:00' } },
              categories: [{
                id: 'cat-1',
                name: 'Hamburguesas',
                products: [{
                  id: 'prod-1',
                  name: 'Hamburguesa Clasica',
                  description: 'Carne 150g, queso, lechuga, tomate',
                  price: 15000,
                  imageUrl: '/uploads/burger.jpg',
                  isAvailable: true,
                  categoryId: 'cat-1'
                }]
              }]
            }
          }
        },
        CreateOrderRequest: {
          type: 'object',
          properties: {
            restaurantSlug: { type: 'string' },
            customer: {
              type: 'object',
              properties: { name: { type: 'string' }, phone: { type: 'string' }, address: { type: 'string' }, email: { type: 'string' } }
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: { productId: { type: 'string' }, quantity: { type: 'integer', minimum: 1 } }
              }
            },
            paymentMethod: { type: 'string', enum: ['CASH', 'CARD', 'MERCADO_PAGO', 'NEQUI', 'WOMFI', 'TRANSFER'] },
            couponCode: { type: 'string' },
            deliveryZoneName: { type: 'string' },
            pointsRedeemed: { type: 'integer' }
          },
          required: ['restaurantSlug', 'customer', 'items', 'paymentMethod'],
          example: {
            restaurantSlug: 'demo-burger',
            customer: { name: 'Carlos Lopez', phone: '3001234567', address: 'Calle 1 # 2-3', email: 'carlos@example.com' },
            items: [{ productId: 'prod-1', quantity: 2 }, { productId: 'prod-2', quantity: 1 }],
            paymentMethod: 'CASH',
            couponCode: 'DESCUENTO10',
            deliveryZoneName: 'Norte'
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderNumber: { type: 'integer' },
            status: { type: 'string', enum: ['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'] },
            total: { type: 'number' },
            subtotal: { type: 'number' },
            deliveryFeeApplied: { type: 'number' },
            discountAmount: { type: 'number' },
            paymentMethod: { type: 'string' },
            paymentStatus: { type: 'string' },
            customerName: { type: 'string' },
            customerPhone: { type: 'string' },
            customerEmail: { type: 'string' },
            customerAddress: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          },
          example: {
            id: 'order-1',
            orderNumber: 42,
            status: 'PENDING',
            total: 38000,
            subtotal: 45000,
            deliveryFeeApplied: 3000,
            discountAmount: 10000,
            paymentMethod: 'CASH',
            paymentStatus: 'PENDING',
            customerName: 'Carlos Lopez',
            customerPhone: '3001234567',
            customerEmail: 'carlos@example.com',
            customerAddress: 'Calle 1 # 2-3',
            createdAt: '2026-07-27T22:00:00.000Z'
          }
        },
        Staff: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'CASHIER', 'KITCHEN', 'DELIVERY'] },
            isActive: { type: 'boolean' }
          },
          example: { id: 'staff-1', name: 'Maria Chef', email: 'maria@burger.com', phone: '3007654321', role: 'KITCHEN', isActive: true }
        },
        CreateStaffRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            pin: { type: 'string', minLength: 4, maxLength: 6 },
            role: { type: 'string', enum: ['ADMIN', 'CASHIER', 'KITCHEN', 'DELIVERY'] }
          },
          required: ['name', 'email', 'pin'],
          example: { name: 'Pedro Ayudante', email: 'pedro@burger.com', pin: '1234', role: 'KITCHEN' }
        },
        VerifyPinRequest: {
          type: 'object',
          properties: { email: { type: 'string', format: 'email' }, pin: { type: 'string' } },
          required: ['email', 'pin'],
          example: { email: 'maria@burger.com', pin: '1234' }
        },
        UpdateOrderStatusRequest: {
          type: 'object',
          properties: { status: { type: 'string', enum: ['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'] } },
          required: ['status'],
          example: { status: 'PREPARING' }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            imageUrl: { type: 'string' },
            isAvailable: { type: 'boolean' },
            categoryId: { type: 'string' },
            stock: { type: 'integer' },
            trackStock: { type: 'boolean' }
          },
          example: { id: 'prod-1', name: 'Hamburguesa Clasica', description: 'Carne 150g, queso', price: 15000, imageUrl: '/uploads/burger.jpg', isAvailable: true, categoryId: 'cat-1', stock: 50, trackStock: true }
        },
        CreateProductRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2 },
            description: { type: 'string' },
            price: { type: 'number', minimum: 1 },
            imageUrl: { type: 'string' },
            categoryId: { type: 'string' },
            stock: { type: 'integer' },
            trackStock: { type: 'boolean' }
          },
          required: ['name', 'price', 'categoryId'],
          example: { name: 'Hamburguesa BBQ', description: 'Carne 200g, BBQ, cebolla crispy', price: 18000, categoryId: 'cat-1', stock: 30, trackStock: true }
        },
        ConfigResponse: {
          type: 'object',
          properties: {
            deliveryFee: { type: 'number' },
            freeDeliveryMin: { type: 'number' },
            deliveryZones: { type: 'array', items: { type: 'object' } },
            coupons: { type: 'array', items: { type: 'object' } },
            businessHours: { type: 'object' },
            loyaltyProgram: { type: 'object' }
          },
          example: { deliveryFee: 3000, freeDeliveryMin: 50000, deliveryZones: [{ name: 'Norte', fee: 3000 }], coupons: [{ code: '10OFF', discountType: 'percentage', discountValue: 10, isActive: true }], businessHours: { open: '08:00', close: '23:00' }, loyaltyProgram: { enabled: true, pointsPerPeso: 0.01, pointsValue: 10 } }
        },
        SuperAdminStats: {
          type: 'object',
          properties: {
            totalRestaurants: { type: 'integer' },
            totalOrders: { type: 'integer' },
            totalRevenue: { type: 'number' },
            totalCustomers: { type: 'integer' },
            totalStaff: { type: 'integer' }
          },
          example: { totalRestaurants: 3, totalOrders: 150, totalRevenue: 12500000, totalCustomers: 89, totalStaff: 12 }
        }
      }
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['System'],
          summary: 'Health check del servidor',
          responses: {
            200: {
              description: 'API saludable',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/HealthResponse' } } }
            }
          }
        }
      },
      '/api/menu': {
        get: {
          tags: ['Menu'],
          summary: 'Menu publico del restaurante',
          description: 'Retorna el menu completo con categorias y productos. Soporta busqueda por nombre.',
          parameters: [
            { name: 'restaurant', in: 'query', schema: { type: 'string' }, description: 'Slug del restaurante (default: demo-burger)', example: 'demo-burger' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Busqueda por nombre de producto', example: 'hamburguesa' }
          ],
          responses: {
            200: { description: 'Menu del restaurante', content: { 'application/json': { schema: { $ref: '#/components/schemas/MenuResponse' } } } },
            404: { description: 'Restaurante no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registrar nuevo usuario',
          description: 'Crea un nuevo usuario con rol admin para el restaurante demo.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
          },
          responses: {
            201: { description: 'Usuario creado exitosamente' },
            422: { description: 'Datos invalidos (email duplicado, password corto, etc)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Iniciar sesion',
          description: 'Autentica al usuario y setea una cookie HttpOnly con el JWT.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
          },
          responses: {
            200: { description: 'Login exitoso, cookie seteada', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
            401: { description: 'Credenciales invalidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            429: { description: 'Demasiados intentos de login' }
          }
        }
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Cerrar sesion',
          description: 'Limpia la cookie de autenticacion.',
          responses: { 200: { description: 'Sesion cerrada', content: { 'application/json': { example: { message: 'Sesion cerrada' } } } } }
        }
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Usuario actual',
          description: 'Retorna los datos del usuario autenticado via cookie.',
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: 'Datos del usuario', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
            401: { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/orders': {
        post: {
          tags: ['Orders'],
          summary: 'Crear pedido (publico)',
          description: 'Endpoint publico para crear un nuevo pedido. No requiere autenticacion.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderRequest' } } }
          },
          responses: {
            201: { description: 'Pedido creado exitosamente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
            400: { description: 'Stock insuficiente o error de negocio' },
            422: { description: 'Datos invalidos' }
          }
        }
      },
      '/api/orders/admin': {
        get: {
          tags: ['Orders'],
          summary: 'Listar pedidos (admin)',
          description: 'Retorna pedidos paginados, opcionalmente filtrados por estado.',
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'] }, description: 'Filtrar por estado' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Numero de pagina' }
          ],
          responses: { 200: { description: 'Lista paginada de pedidos' }, 401: { description: 'No autenticado' } }
        }
      },
      '/api/orders/{id}/status': {
        patch: {
          tags: ['Orders'],
          summary: 'Actualizar estado del pedido',
          description: 'Cambia el estado de un pedido y emite evento via Socket.IO.',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'order-1' }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateOrderStatusRequest' } } }
          },
          responses: { 200: { description: 'Estado actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } }, 401: { description: 'No autenticado' } }
        }
      },
      '/api/staff': {
        get: {
          tags: ['Staff'],
          summary: 'Listar empleados',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: 'Lista de empleados', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Staff' } } } } }, 401: { description: 'No autenticado' } }
        },
        post: {
          tags: ['Staff'],
          summary: 'Crear empleado',
          description: 'Crea un nuevo empleado con PIN numerico para acceso al panel.',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateStaffRequest' } } }
          },
          responses: { 201: { description: 'Empleado creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Staff' } } } }, 422: { description: 'Datos invalidos' } }
        }
      },
      '/api/staff/{id}': {
        put: {
          tags: ['Staff'],
          summary: 'Actualizar empleado',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'staff-1' }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, phone: { type: 'string' }, role: { type: 'string', enum: ['ADMIN', 'CASHIER', 'KITCHEN', 'DELIVERY'] }, isActive: { type: 'boolean' } } } } }
          },
          responses: { 200: { description: 'Empleado actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Staff' } } } }, 404: { description: 'Empleado no encontrado' } }
        },
        delete: {
          tags: ['Staff'],
          summary: 'Eliminar empleado',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'staff-1' }],
          responses: { 204: { description: 'Eliminado (sin contenido)' }, 404: { description: 'Empleado no encontrado' } }
        }
      },
      '/api/staff/verify-pin': {
        post: {
          tags: ['Staff'],
          summary: 'Verificar PIN de empleado',
          description: 'Verifica el PIN de un empleado y retorna sus datos. Usado para acceso rapido al panel.',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyPinRequest' } } }
          },
          responses: { 200: { description: 'PIN valido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Staff' } } } }, 401: { description: 'PIN invalido' } }
        }
      },
      '/api/restaurant-config': {
        get: {
          tags: ['Config'],
          summary: 'Configuracion publica del restaurante',
          description: 'Retorna la configuracion publica del restaurante (sin campos sensibles como wompiPrivateKey).',
          parameters: [{ name: 'restaurant', in: 'query', schema: { type: 'string' }, example: 'demo-burger' }],
          responses: { 200: { description: 'Configuracion publica', content: { 'application/json': { schema: { $ref: '#/components/schemas/ConfigResponse' } } } }, 404: { description: 'Restaurante no encontrado' } }
        },
        put: {
          tags: ['Config'],
          summary: 'Actualizar configuracion (admin)',
          description: 'Actualiza la configuracion completa del restaurante.',
          security: [{ cookieAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object' }, example: { deliveryFee: 3500, freeDeliveryMin: 45000, businessHours: { open: '09:00', close: '22:00' } } } }
          },
          responses: { 200: { description: 'Configuracion actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/ConfigResponse' } } } }, 401: { description: 'No autenticado' } }
        }
      },
      '/api/categories': {
        get: {
          tags: ['Categories'],
          summary: 'Listar categorias',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: 'Lista de categorias' } }
        },
        post: {
          tags: ['Categories'],
          summary: 'Crear categoria',
          security: [{ cookieAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] }, example: { name: 'Perros Calientes' } } }
          },
          responses: { 201: { description: 'Categoria creada' } }
        }
      },
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'Listar productos',
          description: 'Retorna productos paginados. Requiere autenticacion.',
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } }
          ],
          responses: { 200: { description: 'Lista paginada de productos' }, 401: { description: 'No autenticado' } }
        },
        post: {
          tags: ['Products'],
          summary: 'Crear producto',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProductRequest' } } }
          },
          responses: { 201: { description: 'Producto creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } }, 422: { description: 'Datos invalidos' } }
        }
      },
      '/api/products/{id}': {
        put: {
          tags: ['Products'],
          summary: 'Actualizar producto',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'prod-1' }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object' }, example: { name: 'Hamburguesa BBQ Deluxe', price: 20000, isAvailable: true } } }
          },
          responses: { 200: { description: 'Producto actualizado' }, 404: { description: 'Producto no encontrado' } }
        },
        delete: {
          tags: ['Products'],
          summary: 'Eliminar producto (soft-delete)',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'prod-1' }],
          responses: { 204: { description: 'Eliminado' }, 401: { description: 'No autenticado' } }
        }
      },
      '/api/customers': {
        get: {
          tags: ['Customers'],
          summary: 'Listar clientes',
          description: 'Retorna clientes paginados con total gastado. Requiere autenticacion.',
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }
          ],
          responses: { 200: { description: 'Lista paginada de clientes' }, 401: { description: 'No autenticado' } }
        }
      },
      '/api/customers/{id}': {
        get: {
          tags: ['Customers'],
          summary: 'Detalle del cliente con historial',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'cust-1' }],
          responses: { 200: { description: 'Datos del cliente con order historial' }, 404: { description: 'Cliente no encontrado' } }
        },
        patch: {
          tags: ['Customers'],
          summary: 'Actualizar notas del cliente',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'cust-1' }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { notes: { type: 'string' } }, required: ['notes'] }, example: { notes: 'Cliente alergico al lacteos' } } }
          },
          responses: { 200: { description: 'Notas actualizadas' }, 404: { description: 'Cliente no encontrado' } }
        }
      },
      '/api/payments/create-link': {
        post: {
          tags: ['Payments'],
          summary: 'Crear link de pago Wompi',
          description: 'Genera un link de pago en Wompi para que el cliente pague desde su banco.',
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { orderId: { type: 'string' }, customerEmail: { type: 'string' }, amount: { type: 'number' } }, required: ['orderId', 'customerEmail', 'amount'] }, example: { orderId: 'order-1', customerEmail: 'cliente@example.com', amount: 38000 } } }
          },
          responses: { 200: { description: 'Link de pago generado' } }
        }
      },
      '/api/payments/verify/{wompiId}': {
        get: {
          tags: ['Payments'],
          summary: 'Verificar estado del pago en Wompi',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'wompiId', in: 'path', required: true, schema: { type: 'string' }, example: 'wompi-txn-123' }],
          responses: { 200: { description: 'Estado actual del pago' } }
        }
      },
      '/api/payments/webhook': {
        post: {
          tags: ['Payments'],
          summary: 'Webhook Wompi',
          description: 'Endpoint para recibir notificaciones de Wompi sobre cambios en transacciones.',
          responses: { 200: { description: 'Procesado' } }
        }
      },
      '/api/superadmin/stats': {
        get: {
          tags: ['SuperAdmin'],
          summary: 'Estadisticas globales (superadmin)',
          description: 'Retorna estadisticas agregadas de todos los restaurantes. Solo superadmin.',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: 'Estadisticas', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuperAdminStats' } } } }, 403: { description: 'No autorizado (no superadmin)' } }
        }
      },
      '/api/superadmin/restaurants': {
        get: {
          tags: ['SuperAdmin'],
          summary: 'Listar restaurantes (superadmin)',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: 'Lista de restaurantes' } }
        },
        post: {
          tags: ['SuperAdmin'],
          summary: 'Crear nuevo restaurante',
          description: 'Crea un restaurante con su usuario admin, slug unico y configuracion inicial.',
          security: [{ cookieAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, slug: { type: 'string' }, adminEmail: { type: 'string' }, adminPassword: { type: 'string' } }, required: ['name', 'slug', 'adminEmail', 'adminPassword'] }, example: { name: 'Pizza Roma', slug: 'pizza-roma', adminEmail: 'admin@pizza.com', adminPassword: 'segura123' } } }
          },
          responses: { 201: { description: 'Restaurante creado' }, 409: { description: 'Slug duplicado' }, 422: { description: 'Datos invalidos' } }
        }
      },
      '/api/superadmin/restaurants/{id}': {
        get: {
          tags: ['SuperAdmin'],
          summary: 'Detalle del restaurante',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'rest-1' }],
          responses: { 200: { description: 'Datos del restaurante con categorias' }, 404: { description: 'Restaurante no encontrado' } }
        },
        put: {
          tags: ['SuperAdmin'],
          summary: 'Actualizar restaurante',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: 'rest-1' }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object' }, example: { name: 'Pizza Roma Actualizada', isActive: false } } }
          },
          responses: { 200: { description: 'Restaurante actualizado' } }
        }
      },
      '/api/maps/validate-address': {
        get: {
          tags: ['Maps'],
          summary: 'Validar direccion con geocerca',
          description: 'Verifica si una direccion esta dentro del area de cobertura del restaurante.',
          parameters: [{ name: 'address', in: 'query', required: true, schema: { type: 'string' }, example: 'Calle 1 # 2-3, Bogota' }],
          responses: { 200: { description: 'Resultado de validacion (dentro/fuera de cobertura)' } }
        }
      },
      '/api/reports/{type}': {
        get: {
          tags: ['Reports'],
          summary: 'Generar reporte',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['sales', 'products', 'general'] }, example: 'sales' }],
          responses: { 200: { description: 'Datos del reporte' } }
        }
      },
      '/api/export/orders': {
        get: {
          tags: ['Export'],
          summary: 'Exportar pedidos a CSV',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: 'Archivo CSV con pedidos' } }
        }
      },
      '/api/analytics': {
        get: {
          tags: ['Analytics'],
          summary: 'Analytics del restaurante',
          description: 'Metricas de ventas, pedidos por hora/dia, productos mas vendidos.',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: 'Datos analiticos' } }
        }
      }
    }
  },
  apis: []
});
