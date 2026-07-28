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
          }
        },
        MenuResponse: {
          type: 'object',
          properties: {
            restaurant: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                slug: { type: 'string' },
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
          }
        }
      }
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          responses: {
            200: {
              description: 'API saludable',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      timestamp: { type: 'string' },
                      uptime: { type: 'number' },
                      environment: { type: 'string' },
                      db: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/menu': {
        get: {
          tags: ['Menu'],
          summary: 'Menu publico del restaurante',
          parameters: [
            { name: 'restaurant', in: 'query', schema: { type: 'string' }, description: 'Slug del restaurante (default: demo-burger)' },
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Busqueda por nombre de producto' }
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
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } }, required: ['name', 'email', 'password'] } } }
          },
          responses: {
            201: { description: 'Usuario creado' },
            422: { description: 'Datos invalidos' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Iniciar sesion',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } } }
          },
          responses: {
            200: { description: 'Login exitoso, cookie seteada' },
            401: { description: 'Credenciales invalidas' }
          }
        }
      },
      '/api/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Cerrar sesion',
          responses: { 200: { description: 'Cookie eliminada' } }
        }
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Usuario actual',
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: 'Datos del usuario' },
            401: { description: 'No autenticado' }
          }
        }
      },
      '/api/orders': {
        post: {
          tags: ['Orders'],
          summary: 'Crear pedido (publico)',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { restaurantSlug: { type: 'string' }, customer: { type: 'object' }, items: { type: 'array', items: { type: 'object', properties: { productId: { type: 'string' }, quantity: { type: 'integer' } } } }, paymentMethod: { type: 'string' }, couponCode: { type: 'string' }, deliveryZoneName: { type: 'string' } } } } }
          },
          responses: {
            201: { description: 'Pedido creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
            422: { description: 'Datos invalidos' }
          }
        }
      },
      '/api/orders/admin': {
        get: {
          tags: ['Orders'],
          summary: 'Listar pedidos (admin)',
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } }
          ],
          responses: { 200: { description: 'Lista de pedidos' } }
        }
      },
      '/api/orders/{id}/status': {
        patch: {
          tags: ['Orders'],
          summary: 'Actualizar estado del pedido',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'] } } } } }
          },
          responses: { 200: { description: 'Estado actualizado' } }
        }
      },
      '/api/staff': {
        get: {
          tags: ['Staff'],
          summary: 'Listar empleados',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: 'Lista de empleados', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Staff' } } } } } }
        },
        post: {
          tags: ['Staff'],
          summary: 'Crear empleado',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, pin: { type: 'string' }, role: { type: 'string', enum: ['ADMIN', 'CASHIER', 'KITCHEN', 'DELIVERY'] } }, required: ['name', 'email', 'pin'] } } }
          },
          responses: { 201: { description: 'Empleado creado' } }
        }
      },
      '/api/staff/{id}': {
        put: {
          tags: ['Staff'],
          summary: 'Actualizar empleado',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Empleado actualizado' } }
        },
        delete: {
          tags: ['Staff'],
          summary: 'Eliminar empleado',
          security: [{ cookieAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 204: { description: 'Eliminado' } }
        }
      },
      '/api/staff/verify-pin': {
        post: {
          tags: ['Staff'],
          summary: 'Verificar PIN de empleado',
          security: [{ cookieAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, pin: { type: 'string' } }, required: ['email', 'pin'] } } }
          },
          responses: { 200: { description: 'PIN valido' }, 401: { description: 'PIN invalido' } }
        }
      },
      '/api/restaurant-config': {
        get: {
          tags: ['Config'],
          summary: 'Configuracion publica del restaurante',
          parameters: [{ name: 'restaurant', in: 'query', schema: { type: 'string' } }],
          responses: { 200: { description: 'Configuracion (sin campos sensibles)' } }
        },
        put: {
          tags: ['Config'],
          summary: 'Actualizar configuracion (admin)',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: 'Configuracion actualizada' } }
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
          responses: { 201: { description: 'Categoria creada' } }
        }
      },
      '/api/products': {
        get: {
          tags: ['Products'],
          summary: 'Listar productos',
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: 'Lista de productos' } }
        },
        post: {
          tags: ['Products'],
          summary: 'Crear producto',
          security: [{ cookieAuth: [] }],
          responses: { 201: { description: 'Producto creado' } }
        }
      },
      '/api/products/{id}': {
        put: { tags: ['Products'], summary: 'Actualizar producto', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Producto actualizado' } } },
        delete: { tags: ['Products'], summary: 'Eliminar producto', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Eliminado' } } }
      },
      '/api/customers': {
        get: { tags: ['Customers'], summary: 'Listar clientes', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Lista de clientes' } } }
      },
      '/api/customers/{id}': {
        get: { tags: ['Customers'], summary: 'Detalle del cliente', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Datos del cliente' } } },
        patch: { tags: ['Customers'], summary: 'Actualizar notas del cliente', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Notas actualizadas' } } }
      },
      '/api/payments/create-link': {
        post: { tags: ['Payments'], summary: 'Crear link de pago Wompi', responses: { 200: { description: 'Link de pago' } } }
      },
      '/api/payments/verify/{wompiId}': {
        get: { tags: ['Payments'], summary: 'Verificar estado del pago', security: [{ cookieAuth: [] }], parameters: [{ name: 'wompiId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Estado del pago' } } }
      },
      '/api/payments/webhook': {
        post: { tags: ['Payments'], summary: 'Webhook Wompi', responses: { 200: { description: 'Procesado' } } }
      },
      '/api/superadmin/stats': {
        get: { tags: ['SuperAdmin'], summary: 'Estadisticas globales', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Estadisticas' } } }
      },
      '/api/superadmin/restaurants': {
        get: { tags: ['SuperAdmin'], summary: 'Listar restaurantes', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Lista de restaurantes' } } },
        post: { tags: ['SuperAdmin'], summary: 'Crear restaurante', security: [{ cookieAuth: [] }], responses: { 201: { description: 'Restaurante creado' } } }
      },
      '/api/superadmin/restaurants/{id}': {
        get: { tags: ['SuperAdmin'], summary: 'Detalle del restaurante', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Datos del restaurante' } } },
        put: { tags: ['SuperAdmin'], summary: 'Actualizar restaurante', security: [{ cookieAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Restaurante actualizado' } } }
      },
      '/api/maps/validate-address': {
        get: { tags: ['Maps'], summary: 'Validar direccion con geocerca', parameters: [{ name: 'address', in: 'query', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Resultado de validacion' } } }
      },
      '/api/reports/{type}': {
        get: { tags: ['Reports'], summary: 'Generar reporte', security: [{ cookieAuth: [] }], parameters: [{ name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['sales', 'products', 'general'] } }], responses: { 200: { description: 'Reporte' } } }
      },
      '/api/export/orders': {
        get: { tags: ['Export'], summary: 'Exportar pedidos a CSV', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Archivo CSV' } } }
      },
      '/api/analytics': {
        get: { tags: ['Analytics'], summary: 'Analytics del restaurante', security: [{ cookieAuth: [] }], responses: { 200: { description: 'Datos analiticos' } } }
      }
    }
  },
  apis: []
});
