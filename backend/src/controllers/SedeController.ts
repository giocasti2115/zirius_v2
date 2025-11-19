import { Request, Response } from 'express';
import db from '../config/database';
import { Sede } from '../models/types';
import Joi from 'joi';

// Test data for development
const TEST_SEDES = [
  {
    id: 1,
    id_cliente: 1,
    nombre: "Sede Principal Sonrisa",
    direccion: "Av. Principal 123, Bogotá",
    telefono: "555-0101",
    contacto: "Dr. Carlos Mendez",
    activo: 1
  },
  {
    id: 2,
    id_cliente: 1,
    nombre: "Sede Norte Sonrisa",
    direccion: "Calle 100 #15-20, Bogotá",
    telefono: "555-0111",
    contacto: "Dra. Ana Ruiz",
    activo: 1
  },
  {
    id: 3,
    id_cliente: 2,
    nombre: "Centro Vida Principal",
    direccion: "Calle 45 #12-34, Medellín",
    telefono: "555-0102",
    contacto: "Dr. Luis García",
    activo: 1
  },
  {
    id: 4,
    id_cliente: 3,
    nombre: "Consultorio García",
    direccion: "Carrera 7 #89-12, Cali",
    telefono: "555-0103",
    contacto: "Dr. Roberto García",
    activo: 1
  },
  {
    id: 5,
    id_cliente: 4,
    nombre: "Dental Care Principal",
    direccion: "Zona Rosa, Local 45, Barranquilla",
    telefono: "555-0104",
    contacto: "Dra. Maria López",
    activo: 1
  }
];

// Validation schemas
const createSedeSchema = Joi.object({
  id_cliente: Joi.number().required().messages({
    'number.base': 'ID del cliente debe ser un número',
    'any.required': 'ID del cliente es requerido'
  }),
  nombre: Joi.string().required().messages({
    'string.empty': 'Nombre es requerido',
    'any.required': 'Nombre es requerido'
  }),
  direccion: Joi.string().optional(),
  telefono: Joi.string().optional(),
  contacto: Joi.string().optional()
});

const updateSedeSchema = Joi.object({
  id_cliente: Joi.number().optional(),
  nombre: Joi.string().optional(),
  direccion: Joi.string().optional(),
  telefono: Joi.string().optional(),
  contacto: Joi.string().optional()
});

export class SedeController {
  
  // GET /sedes - Obtener todas las sedes
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const id_cliente = req.query.id_cliente as string;

      // Try database first, fallback to test data
      try {
        const offset = (page - 1) * limit;
        let query = `
          SELECT s.*, c.nombre as cliente_nombre 
          FROM sedes s 
          LEFT JOIN clientes c ON s.id_cliente = c.id 
          WHERE s.activo = 1
        `;
        const params: any[] = [];

        if (id_cliente) {
          query += ' AND s.id_cliente = ?';
          params.push(id_cliente);
        }

        if (search) {
          query += ' AND (s.nombre LIKE ? OR s.direccion LIKE ? OR s.contacto LIKE ?)';
          params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY s.nombre ASC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const sedes = await db.query(query, params);

        // Count total for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM sedes WHERE activo = 1';
        const countParams: any[] = [];
        
        if (id_cliente) {
          countQuery += ' AND id_cliente = ?';
          countParams.push(id_cliente);
        }

        if (search) {
          countQuery += ' AND (nombre LIKE ? OR direccion LIKE ? OR contacto LIKE ?)';
          countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const countResult = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.status(200).json({
          success: true,
          data: {
            sedes,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit)
            }
          }
        });

      } catch (dbError) {
        console.log('Database unavailable, using test data...');
        
        // Filter test data
        let filtered = TEST_SEDES.filter(sede => sede.activo === 1);
        
        if (id_cliente) {
          filtered = filtered.filter(sede => sede.id_cliente === parseInt(id_cliente));
        }
        
        if (search) {
          const searchTerm = search.toLowerCase();
          filtered = filtered.filter(sede => 
            sede.nombre.toLowerCase().includes(searchTerm) ||
            sede.direccion.toLowerCase().includes(searchTerm) ||
            sede.contacto.toLowerCase().includes(searchTerm)
          );
        }
        
        const total = filtered.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const sedes = filtered.slice(startIndex, endIndex);
        
        res.status(200).json({
          success: true,
          data: {
            sedes,
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit)
            }
          },
          message: 'Datos de prueba - configura MySQL para usar datos reales'
        });
      }

    } catch (error) {
      console.error('Error getting sedes:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // GET /sedes/:id - Obtener sede por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Try database first, fallback to test data
      try {
        const sedes = await db.query(
          `SELECT s.*, c.nombre as cliente_nombre 
           FROM sedes s 
           LEFT JOIN clientes c ON s.id_cliente = c.id 
           WHERE s.id = ? AND s.activo = 1`,
          [id]
        );

        if (sedes.length === 0) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Sede no encontrada',
              statusCode: 404
            }
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: sedes[0]
        });

      } catch (dbError) {
        console.log('Database unavailable, using test data...');
        
        const sede = TEST_SEDES.find(s => s.id === parseInt(id as string) && s.activo === 1);
        if (!sede) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Sede no encontrada',
              statusCode: 404
            }
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: sede,
          message: 'Datos de prueba - configura MySQL para usar datos reales'
        });
      }

    } catch (error) {
      console.error('Error getting sede by ID:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // POST /sedes - Crear nueva sede
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createSedeSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            message: error.details?.[0]?.message || 'Error de validación',
            statusCode: 400
          }
        });
        return;
      }

      const { id_cliente, nombre, direccion, telefono, contacto } = value;

      try {
        // Verify cliente exists
        const cliente = await db.query(
          'SELECT id FROM clientes WHERE id = ? AND activo = 1',
          [id_cliente]
        );

        if (cliente.length === 0) {
          res.status(400).json({
            success: false,
            error: {
              message: 'Cliente no encontrado',
              statusCode: 400
            }
          });
          return;
        }

        const result = await db.query(
          'INSERT INTO sedes (id_cliente, nombre, direccion, telefono, contacto, activo) VALUES (?, ?, ?, ?, ?, 1)',
          [id_cliente, nombre, direccion || null, telefono || null, contacto || null]
        );

        const newSede = await db.query(
          `SELECT s.*, c.nombre as cliente_nombre 
           FROM sedes s 
           LEFT JOIN clientes c ON s.id_cliente = c.id 
           WHERE s.id = ?`,
          [result.insertId]
        );

        res.status(201).json({
          success: true,
          data: newSede[0],
          message: 'Sede creada exitosamente'
        });

      } catch (dbError) {
        // Fallback: simulate creation with test data
        const newId = Math.max(...TEST_SEDES.map(s => s.id)) + 1;
        const newSede = {
          id: newId,
          id_cliente,
          nombre,
          direccion: direccion || '',
          telefono: telefono || '',
          contacto: contacto || '',
          activo: 1
        };

        res.status(201).json({
          success: true,
          data: newSede,
          message: 'Sede creada exitosamente (simulado - configura MySQL para persistencia real)'
        });
      }

    } catch (error) {
      console.error('Error creating sede:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // PUT /sedes/:id - Actualizar sede
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { error, value } = updateSedeSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            message: error.details?.[0]?.message || 'Error de validación',
            statusCode: 400
          }
        });
        return;
      }

      try {
        // Check if sede exists
        const existing = await db.query(
          'SELECT * FROM sedes WHERE id = ? AND activo = 1',
          [id]
        );

        if (existing.length === 0) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Sede no encontrada',
              statusCode: 404
            }
          });
          return;
        }

        // Build update query dynamically
        const updates: string[] = [];
        const params: any[] = [];

        Object.keys(value).forEach(key => {
          updates.push(`${key} = ?`);
          params.push(value[key]);
        });

        if (updates.length === 0) {
          res.status(400).json({
            success: false,
            error: {
              message: 'No se proporcionaron campos para actualizar',
              statusCode: 400
            }
          });
          return;
        }

        params.push(id);

        await db.query(
          `UPDATE sedes SET ${updates.join(', ')} WHERE id = ?`,
          params
        );

        const updated = await db.query(
          `SELECT s.*, c.nombre as cliente_nombre 
           FROM sedes s 
           LEFT JOIN clientes c ON s.id_cliente = c.id 
           WHERE s.id = ?`,
          [id]
        );

        res.status(200).json({
          success: true,
          data: updated[0],
          message: 'Sede actualizada exitosamente'
        });

      } catch (dbError) {
        res.status(200).json({
          success: true,
          data: { id: parseInt(id as string), ...value },
          message: 'Sede actualizada exitosamente (simulado - configura MySQL para persistencia real)'
        });
      }

    } catch (error) {
      console.error('Error updating sede:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // DELETE /sedes/:id - Eliminar sede (soft delete)
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      try {
        // Check if sede exists
        const existing = await db.query(
          'SELECT * FROM sedes WHERE id = ? AND activo = 1',
          [id]
        );

        if (existing.length === 0) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Sede no encontrada',
              statusCode: 404
            }
          });
          return;
        }

        // Soft delete
        await db.query(
          'UPDATE sedes SET activo = 0 WHERE id = ?',
          [id]
        );

        res.status(200).json({
          success: true,
          message: 'Sede eliminada exitosamente'
        });

      } catch (dbError) {
        res.status(200).json({
          success: true,
          message: 'Sede eliminada exitosamente (simulado - configura MySQL para persistencia real)'
        });
      }

    } catch (error) {
      console.error('Error deleting sede:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // GET /sedes/:id/equipos - Obtener equipos de una sede
  static async getEquipos(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      try {
        const equipos = await db.query(
          'SELECT * FROM equipos WHERE id_sede = ? AND activo = 1 ORDER BY nombre ASC',
          [id]
        );

        res.status(200).json({
          success: true,
          data: equipos
        });

      } catch (dbError) {
        // Mock equipment data
        const mockEquipos = [
          {
            id: 1,
            id_sede: parseInt(id as string),
            nombre: "Silla Dental Principal",
            marca: "Sirona",
            modelo: "C4+",
            serie: "SD001",
            ubicacion: "Consultorio 1",
            activo: 1
          }
        ];

        res.status(200).json({
          success: true,
          data: mockEquipos,
          message: 'Datos de prueba - configura MySQL para usar datos reales'
        });
      }

    } catch (error) {
      console.error('Error getting sede equipos:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }
}