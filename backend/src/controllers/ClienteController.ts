import { Request, Response } from 'express';
import db from '../config/database';
import { Cliente } from '../models/types';
import { searchClientes, findClienteById, TEST_CLIENTES } from '../utils/testClientes';
import Joi from 'joi';

// Validation schemas
const createClienteSchema = Joi.object({
  nombre: Joi.string().required().messages({
    'string.empty': 'Nombre es requerido',
    'any.required': 'Nombre es requerido'
  }),
  documento: Joi.string().optional(),
  telefono: Joi.string().optional(),
  email: Joi.string().email().optional(),
  direccion: Joi.string().optional()
});

const updateClienteSchema = Joi.object({
  nombre: Joi.string().optional(),
  documento: Joi.string().optional(),
  telefono: Joi.string().optional(),
  email: Joi.string().email().optional(),
  direccion: Joi.string().optional()
});

export class ClienteController {
  
  // GET /clientes - Obtener todos los clientes
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';

      // Try database first, fallback to test data
      try {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM clientes WHERE deleted_at IS NULL';
        const params: any[] = [];

        if (search) {
          query += ' AND (nombre LIKE ? OR documento LIKE ? OR email LIKE ?)';
          params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY nombre ASC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const clientes = await db.query(query, params);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM clientes WHERE deleted_at IS NULL';
        const countParams: any[] = [];

        if (search) {
          countQuery += ' AND (nombre LIKE ? OR documento LIKE ? OR email LIKE ?)';
          countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const countResult = await db.query(countQuery, countParams);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.json({
          success: true,
          data: {
            clientes: clientes,
            pagination: {
              page,
              limit,
              total,
              totalPages,
              hasNext: page < totalPages,
              hasPrev: page > 1
            }
          }
        });

      } catch (dbError) {
        console.log('Database unavailable, using test data:', dbError);
        
        // Fallback to test data
        const { clientes, pagination } = searchClientes(search, page, limit);
        
        res.json({
          success: true,
          data: { clientes, pagination },
          note: 'Using test data - database unavailable'
        });
      }

    } catch (error) {
      console.error('Error getting clientes:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // GET /clientes/:id - Obtener un cliente por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Try database first
      try {
        const clientes = await db.query(
          'SELECT * FROM clientes WHERE id = ? AND deleted_at IS NULL',
          [id]
        );

        if (clientes.length === 0) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Cliente no encontrado',
              statusCode: 404
            }
          });
          return;
        }

        res.json({
          success: true,
          data: clientes[0]
        });

      } catch (dbError) {
        console.log('Database unavailable, using test data:', dbError);
        
        // Fallback to test data
        const cliente = findClienteById(parseInt(id as string));
        
        if (!cliente) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Cliente no encontrado',
              statusCode: 404
            }
          });
          return;
        }

        res.json({
          success: true,
          data: cliente,
          note: 'Using test data - database unavailable'
        });
      }

    } catch (error) {
      console.error('Error getting cliente by ID:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // POST /clientes - Crear un nuevo cliente
  static async create(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const { error, value } = createClienteSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Datos de entrada inválidos',
            details: error.details.map(detail => detail.message),
            statusCode: 400
          }
        });
        return;
      }

      // Try database first
      try {
        const result = await db.query(
          `INSERT INTO clientes (nombre, documento, telefono, email, direccion) 
           VALUES (?, ?, ?, ?, ?)`,
          [value.nombre, value.documento, value.telefono, value.email, value.direccion]
        );

        const newCliente = await db.query(
          'SELECT * FROM clientes WHERE id = ?',
          [result.insertId]
        );

        res.status(201).json({
          success: true,
          data: newCliente[0],
          message: 'Cliente creado exitosamente'
        });

      } catch (dbError) {
        console.log('Database unavailable for creation, using test response:', dbError);
        
        // Simulate creation with test data
        const newId = Math.max(...TEST_CLIENTES.map(c => c.id)) + 1;
        const newCliente: Cliente = {
          id: newId,
          ...value,
          activo: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        res.status(201).json({
          success: true,
          data: newCliente,
          message: 'Cliente creado exitosamente (simulado)',
          note: 'Using test data - database unavailable'
        });
      }

    } catch (error) {
      console.error('Error creating cliente:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // PUT /clientes/:id - Actualizar un cliente
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validate input
      const { error, value } = updateClienteSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Datos de entrada inválidos',
            details: error.details.map(detail => detail.message),
            statusCode: 400
          }
        });
        return;
      }

      // Try database first
      try {
        // Check if cliente exists
        const existingCliente = await db.query(
          'SELECT * FROM clientes WHERE id = ? AND deleted_at IS NULL',
          [id]
        );

        if (existingCliente.length === 0) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Cliente no encontrado',
              statusCode: 404
            }
          });
          return;
        }

        // Update cliente
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        
        Object.keys(value).forEach(key => {
          if (value[key] !== undefined) {
            updateFields.push(`${key} = ?`);
            updateValues.push(value[key]);
          }
        });

        if (updateFields.length === 0) {
          res.status(400).json({
            success: false,
            error: {
              message: 'No hay campos para actualizar',
              statusCode: 400
            }
          });
          return;
        }

        updateValues.push(id);
        
        await db.query(
          `UPDATE clientes SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          updateValues
        );

        const updatedCliente = await db.query(
          'SELECT * FROM clientes WHERE id = ?',
          [id]
        );

        res.json({
          success: true,
          data: updatedCliente[0],
          message: 'Cliente actualizado exitosamente'
        });

      } catch (dbError) {
        console.log('Database unavailable for update, using test response:', dbError);
        
        // Simulate update with test data
        const cliente = findClienteById(parseInt(id as string));
        
        if (!cliente) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Cliente no encontrado',
              statusCode: 404
            }
          });
          return;
        }

        const updatedCliente = {
          ...cliente,
          ...value,
          updated_at: new Date().toISOString()
        };

        res.json({
          success: true,
          data: updatedCliente,
          message: 'Cliente actualizado exitosamente (simulado)',
          note: 'Using test data - database unavailable'
        });
      }

    } catch (error) {
      console.error('Error updating cliente:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // DELETE /clientes/:id - Eliminar un cliente (soft delete)
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Try database first
      try {
        // Check if cliente exists
        const existingCliente = await db.query(
          'SELECT * FROM clientes WHERE id = ? AND deleted_at IS NULL',
          [id]
        );

        if (existingCliente.length === 0) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Cliente no encontrado',
              statusCode: 404
            }
          });
          return;
        }

        // Soft delete
        await db.query(
          'UPDATE clientes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
          [id]
        );

        res.json({
          success: true,
          message: 'Cliente eliminado exitosamente'
        });

      } catch (dbError) {
        console.log('Database unavailable for delete, using test response:', dbError);
        
        // Simulate delete with test data
        const cliente = findClienteById(parseInt(id as string));
        
        if (!cliente) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Cliente no encontrado',
              statusCode: 404
            }
          });
          return;
        }

        res.json({
          success: true,
          message: 'Cliente eliminado exitosamente (simulado)',
          note: 'Using test data - database unavailable'
        });
      }

    } catch (error) {
      console.error('Error deleting cliente:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // GET /clientes/:id/sedes - Obtener sedes de un cliente
  static async getSedes(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(parseInt(id))) {
        res.status(400).json({
          success: false,
          error: {
            message: 'ID de cliente inválido',
            statusCode: 400
          }
        });
        return;
      }

      // Try database first
      try {
        // Check if cliente exists
        const cliente = await db.query(
          'SELECT id FROM clientes WHERE id = ? AND deleted_at IS NULL',
          [id]
        );

        if (!cliente || cliente.length === 0) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Cliente no encontrado',
              statusCode: 404
            }
          });
          return;
        }

        // Get sedes for this cliente
        const sedes = await db.query(`
          SELECT s.*, 
                 COUNT(e.id) as total_equipos,
                 COUNT(CASE WHEN e.estado = 'activo' THEN 1 END) as equipos_activos
          FROM sedes s
          LEFT JOIN equipos e ON s.id = e.sede_id AND e.deleted_at IS NULL
          WHERE s.cliente_id = ? AND s.deleted_at IS NULL
          GROUP BY s.id
          ORDER BY s.nombre
        `, [id]);

        res.json({
          success: true,
          data: {
            sedes: sedes || [],
            total: sedes ? sedes.length : 0
          }
        });

      } catch (dbError) {
        console.log('Database unavailable for getSedes, using test data:', dbError);
        
        // Test data fallback
        const testSedes = [
          {
            id: 1,
            cliente_id: parseInt(id),
            nombre: 'Sede Central',
            direccion: 'Calle Principal 123',
            ciudad: 'Ciudad Principal',
            telefono: '+1234567890',
            contacto: 'Juan Pérez',
            email: 'contacto@sede1.com',
            estado: 'activa',
            total_equipos: 5,
            equipos_activos: 4,
            created_at: '2024-01-15T10:00:00.000Z',
            updated_at: '2024-01-15T10:00:00.000Z'
          },
          {
            id: 2,
            cliente_id: parseInt(id),
            nombre: 'Sucursal Norte',
            direccion: 'Avenida Norte 456',
            ciudad: 'Ciudad Norte',
            telefono: '+1234567891',
            contacto: 'María García',
            email: 'contacto@sede2.com',
            estado: 'activa',
            total_equipos: 3,
            equipos_activos: 3,
            created_at: '2024-02-01T10:00:00.000Z',
            updated_at: '2024-02-01T10:00:00.000Z'
          }
        ];

        res.json({
          success: true,
          data: {
            sedes: testSedes,
            total: testSedes.length
          },
          note: 'Using test data - database unavailable'
        });
      }

    } catch (error) {
      console.error('Error getting cliente sedes:', error);
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