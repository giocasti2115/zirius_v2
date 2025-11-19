import { Request, Response } from 'express';
import db from '../config/database';
import { Equipo } from '../models/types';
import Joi from 'joi';

// Test data for development
const TEST_EQUIPOS = [
  {
    id: 1,
    id_sede: 1,
    nombre: "Silla Dental Principal",
    marca: "Sirona",
    modelo: "C4+",
    serie: "SD001",
    ubicacion: "Consultorio 1",
    activo: 1
  },
  {
    id: 2,
    id_sede: 1,
    nombre: "Rayos X Digital",
    marca: "Planmeca",
    modelo: "ProMax 3D",
    serie: "RX002",
    ubicacion: "Sala de Rayos X",
    activo: 1
  },
  {
    id: 3,
    id_sede: 2,
    nombre: "Autoclave",
    marca: "Tuttnauer",
    modelo: "2540M",
    serie: "AC003",
    ubicacion: "Esterilización",
    activo: 1
  },
  {
    id: 4,
    id_sede: 3,
    nombre: "Compresor Dental",
    marca: "Jun-Air",
    modelo: "OF302",
    serie: "CP004",
    ubicacion: "Cuarto Técnico",
    activo: 1
  },
  {
    id: 5,
    id_sede: 1,
    nombre: "Lámpara de Fotocurado",
    marca: "3M ESPE",
    modelo: "Elipar S10",
    serie: "LC005",
    ubicacion: "Consultorio 2",
    activo: 1
  }
];

// Validation schemas
const createEquipoSchema = Joi.object({
  id_sede: Joi.number().required().messages({
    'number.base': 'ID de la sede debe ser un número',
    'any.required': 'ID de la sede es requerido'
  }),
  nombre: Joi.string().required().messages({
    'string.empty': 'Nombre es requerido',
    'any.required': 'Nombre es requerido'
  }),
  marca: Joi.string().optional(),
  modelo: Joi.string().optional(),
  serie: Joi.string().optional(),
  ubicacion: Joi.string().optional()
});

const updateEquipoSchema = Joi.object({
  id_sede: Joi.number().optional(),
  nombre: Joi.string().optional(),
  marca: Joi.string().optional(),
  modelo: Joi.string().optional(),
  serie: Joi.string().optional(),
  ubicacion: Joi.string().optional()
});

export class EquipoController {
  
  // GET /equipos - Obtener todos los equipos
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const id_sede = req.query.id_sede as string;
      const id_cliente = req.query.id_cliente as string;

      const offset = (page - 1) * limit;
      let query = `
        SELECT e.*, s.nombre as sede_nombre, c.nombre as cliente_nombre,
               m.nombre as marca_nombre, cl.nombre as clase_nombre
        FROM equipos e 
        LEFT JOIN sedes s ON e.id_sede = s.id 
        LEFT JOIN clientes c ON s.id_cliente = c.id 
        LEFT JOIN marcas m ON e.marca = m.nombre
        LEFT JOIN clases cl ON e.nombre LIKE CONCAT('%', cl.nombre, '%')
        WHERE e.activo = 1
      `;
      const params: any[] = [];

      if (id_sede) {
        query += ' AND e.id_sede = ?';
        params.push(id_sede);
      }

      if (id_cliente) {
        query += ' AND s.id_cliente = ?';
        params.push(id_cliente);
      }

      if (search) {
        query += ' AND (e.nombre LIKE ? OR e.marca LIKE ? OR e.modelo LIKE ? OR e.serie LIKE ? OR e.ubicacion LIKE ? OR s.nombre LIKE ? OR c.nombre LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY c.nombre ASC, s.nombre ASC, e.nombre ASC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const equipos = await db.query(query, params);

      // Count total for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM equipos e 
        LEFT JOIN sedes s ON e.id_sede = s.id 
        LEFT JOIN clientes c ON s.id_cliente = c.id 
        WHERE e.activo = 1
      `;
      const countParams: any[] = [];
      
      if (id_sede) {
        countQuery += ' AND e.id_sede = ?';
        countParams.push(id_sede);
      }

      if (id_cliente) {
        countQuery += ' AND s.id_cliente = ?';
        countParams.push(id_cliente);
      }

      if (search) {
        countQuery += ' AND (e.nombre LIKE ? OR e.marca LIKE ? OR e.modelo LIKE ? OR e.serie LIKE ? OR e.ubicacion LIKE ? OR s.nombre LIKE ? OR c.nombre LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      const countResult = await db.query(countQuery, countParams);
      const total = countResult[0].total;

      res.status(200).json({
        success: true,
        data: {
          equipos,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error getting equipos:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // GET /equipos/:id - Obtener equipo por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Try database first, fallback to test data
      try {
        const equipos = await db.query(
          `SELECT e.*, s.nombre as sede_nombre, c.nombre as cliente_nombre 
           FROM equipos e 
           LEFT JOIN sedes s ON e.id_sede = s.id 
           LEFT JOIN clientes c ON s.id_cliente = c.id 
           WHERE e.id = ? AND e.activo = 1`,
          [id]
        );

        if (equipos.length === 0) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Equipo no encontrado',
              statusCode: 404
            }
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: equipos[0]
        });

      } catch (dbError) {
        console.log('Database unavailable, using test data...');
        
        const equipo = TEST_EQUIPOS.find(e => e.id === parseInt(id as string) && e.activo === 1);
        if (!equipo) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Equipo no encontrado',
              statusCode: 404
            }
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: equipo,
          message: 'Datos de prueba - configura MySQL para usar datos reales'
        });
      }

    } catch (error) {
      console.error('Error getting equipo by ID:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // POST /equipos - Crear nuevo equipo
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createEquipoSchema.validate(req.body);
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

      const { id_sede, nombre, marca, modelo, serie, ubicacion } = value;

      try {
        // Verify sede exists
        const sede = await db.query(
          'SELECT id FROM sedes WHERE id = ? AND activo = 1',
          [id_sede]
        );

        if (sede.length === 0) {
          res.status(400).json({
            success: false,
            error: {
              message: 'Sede no encontrada',
              statusCode: 400
            }
          });
          return;
        }

        const result = await db.query(
          'INSERT INTO equipos (id_sede, nombre, marca, modelo, serie, ubicacion, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
          [id_sede, nombre, marca || null, modelo || null, serie || null, ubicacion || null]
        );

        const newEquipo = await db.query(
          `SELECT e.*, s.nombre as sede_nombre, c.nombre as cliente_nombre 
           FROM equipos e 
           LEFT JOIN sedes s ON e.id_sede = s.id 
           LEFT JOIN clientes c ON s.id_cliente = c.id 
           WHERE e.id = ?`,
          [result.insertId]
        );

        res.status(201).json({
          success: true,
          data: newEquipo[0],
          message: 'Equipo creado exitosamente'
        });

      } catch (dbError) {
        // Fallback: simulate creation with test data
        const newId = Math.max(...TEST_EQUIPOS.map(e => e.id)) + 1;
        const newEquipo = {
          id: newId,
          id_sede,
          nombre,
          marca: marca || '',
          modelo: modelo || '',
          serie: serie || '',
          ubicacion: ubicacion || '',
          activo: 1
        };

        res.status(201).json({
          success: true,
          data: newEquipo,
          message: 'Equipo creado exitosamente (simulado - configura MySQL para persistencia real)'
        });
      }

    } catch (error) {
      console.error('Error creating equipo:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // PUT /equipos/:id - Actualizar equipo
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { error, value } = updateEquipoSchema.validate(req.body);
      
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
        // Check if equipo exists
        const existing = await db.query(
          'SELECT * FROM equipos WHERE id = ? AND activo = 1',
          [id]
        );

        if (existing.length === 0) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Equipo no encontrado',
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
          `UPDATE equipos SET ${updates.join(', ')} WHERE id = ?`,
          params
        );

        const updated = await db.query(
          `SELECT e.*, s.nombre as sede_nombre, c.nombre as cliente_nombre 
           FROM equipos e 
           LEFT JOIN sedes s ON e.id_sede = s.id 
           LEFT JOIN clientes c ON s.id_cliente = c.id 
           WHERE e.id = ?`,
          [id]
        );

        res.status(200).json({
          success: true,
          data: updated[0],
          message: 'Equipo actualizado exitosamente'
        });

      } catch (dbError) {
        res.status(200).json({
          success: true,
          data: { id: parseInt(id as string), ...value },
          message: 'Equipo actualizado exitosamente (simulado - configura MySQL para persistencia real)'
        });
      }

    } catch (error) {
      console.error('Error updating equipo:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // DELETE /equipos/:id - Eliminar equipo (soft delete)
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      try {
        // Check if equipo exists
        const existing = await db.query(
          'SELECT * FROM equipos WHERE id = ? AND activo = 1',
          [id]
        );

        if (existing.length === 0) {
          res.status(404).json({
            success: false,
            error: {
              message: 'Equipo no encontrado',
              statusCode: 404
            }
          });
          return;
        }

        // Soft delete
        await db.query(
          'UPDATE equipos SET activo = 0 WHERE id = ?',
          [id]
        );

        res.status(200).json({
          success: true,
          message: 'Equipo eliminado exitosamente'
        });

      } catch (dbError) {
        res.status(200).json({
          success: true,
          message: 'Equipo eliminado exitosamente (simulado - configura MySQL para persistencia real)'
        });
      }

    } catch (error) {
      console.error('Error deleting equipo:', error);
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