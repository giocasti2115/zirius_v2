import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zirius V2 API',
      version: '1.0.0',
      description: `
        # Zirius V2 - Sistema de Gestión de Mantenimiento

        API RESTful completa para el sistema de gestión de mantenimiento Zirius V2, 
        migrado de PHP a Node.js + TypeScript.

        ## Características principales:
        - 🔐 Autenticación JWT
        - 👥 Gestión de usuarios y roles
        - 🏢 Administración de clientes y sedes
        - 🔧 Gestión de equipos y mantenimiento
        - 📋 Sistema de órdenes y cotizaciones
        - 📊 Dashboard con estadísticas en tiempo real

        ## Autenticación:
        La mayoría de endpoints requieren autenticación JWT. Incluye el token en el header:
        \`Authorization: Bearer <tu-token>\`

        ## Códigos de respuesta:
        - **200**: Éxito
        - **201**: Creado exitosamente
        - **400**: Error en los datos enviados
        - **401**: No autorizado
        - **403**: Acceso denegado
        - **404**: Recurso no encontrado
        - **500**: Error interno del servidor
      `,
      contact: {
        name: 'Equipo de Desarrollo Zirius',
        email: 'dev@zirius.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3002/api/v1',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.zirius.com/v1',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint de login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['error', 'message'],
          properties: {
            error: {
              type: 'string',
              description: 'Tipo de error'
            },
            message: {
              type: 'string',
              description: 'Descripción detallada del error'
            },
            details: {
              type: 'object',
              description: 'Información adicional sobre el error'
            }
          }
        },
        User: {
          type: 'object',
          required: ['id', 'email', 'nombre'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo del usuario'
            },
            rol: {
              type: 'string',
              enum: ['admin', 'tecnico', 'cliente'],
              description: 'Rol del usuario en el sistema'
            },
            activo: {
              type: 'boolean',
              description: 'Estado del usuario'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            }
          }
        },
        Cliente: {
          type: 'object',
          required: ['id', 'nombre'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del cliente'
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la empresa cliente'
            },
            nit: {
              type: 'string',
              description: 'NIT de la empresa'
            },
            telefono: {
              type: 'string',
              description: 'Teléfono de contacto'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email de contacto'
            },
            direccion: {
              type: 'string',
              description: 'Dirección física'
            },
            activo: {
              type: 'boolean',
              description: 'Estado del cliente'
            }
          }
        },
        Sede: {
          type: 'object',
          required: ['id', 'nombre', 'cliente_id'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la sede'
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la sede'
            },
            cliente_id: {
              type: 'integer',
              description: 'ID del cliente propietario'
            },
            direccion: {
              type: 'string',
              description: 'Dirección de la sede'
            },
            telefono: {
              type: 'string',
              description: 'Teléfono de la sede'
            },
            responsable: {
              type: 'string',
              description: 'Nombre del responsable de la sede'
            }
          }
        },
        Equipo: {
          type: 'object',
          required: ['id', 'nombre', 'sede_id'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del equipo'
            },
            nombre: {
              type: 'string',
              description: 'Nombre del equipo'
            },
            marca: {
              type: 'string',
              description: 'Marca del equipo'
            },
            modelo: {
              type: 'string',
              description: 'Modelo del equipo'
            },
            serie: {
              type: 'string',
              description: 'Número de serie'
            },
            sede_id: {
              type: 'integer',
              description: 'ID de la sede donde está ubicado'
            },
            activo: {
              type: 'boolean',
              description: 'Estado del equipo'
            }
          }
        },
        Orden: {
          type: 'object',
          required: ['id', 'numero', 'equipo_id', 'tipo'],
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la orden'
            },
            numero: {
              type: 'string',
              description: 'Número de orden único'
            },
            equipo_id: {
              type: 'integer',
              description: 'ID del equipo'
            },
            tipo: {
              type: 'string',
              enum: ['preventivo', 'correctivo', 'instalacion'],
              description: 'Tipo de mantenimiento'
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'en_proceso', 'completada', 'cancelada'],
              description: 'Estado actual de la orden'
            },
            fecha_programada: {
              type: 'string',
              format: 'date',
              description: 'Fecha programada para el mantenimiento'
            },
            observaciones: {
              type: 'string',
              description: 'Observaciones adicionales'
            }
          }
        },
        DashboardStats: {
          type: 'object',
          properties: {
            ordenes: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                pendientes: { type: 'integer' },
                en_proceso: { type: 'integer' },
                completadas: { type: 'integer' }
              }
            },
            clientes: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                activos: { type: 'integer' }
              }
            },
            equipos: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                activos: { type: 'integer' },
                en_mantenimiento: { type: 'integer' }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .info .description { font-size: 14px; }
    `,
    customSiteTitle: 'Zirius V2 API Documentation',
    customfavIcon: '/favicon.ico'
  }));

  // Raw JSON docs
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;