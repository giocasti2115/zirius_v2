import { Request, Response } from 'express';
import db from '../config/database';
import Joi from 'joi';

// Validation schemas
const createSolicitudSchema = Joi.object({
  id_cliente: Joi.number().required(),
  id_sede: Joi.number().required(),
  id_equipo: Joi.number().optional(),
  tipo_solicitud: Joi.string().valid('bodega', 'decommission', 'maintenance').required(),
  prioridad: Joi.string().valid('baja', 'media', 'alta', 'urgente').default('media'),
  descripcion: Joi.string().required(),
  id_usuario_solicita: Joi.number().required()
});

const updateSolicitudSchema = Joi.object({
  estado: Joi.string().valid('pendiente', 'aprobada', 'despachada', 'terminada', 'rechazada').optional(),
  observaciones: Joi.string().optional(),
  id_usuario_aprueba: Joi.number().optional()
});

export class SolicitudController {
  
  // GET /solicitudes - Obtener todas las solicitudes
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const tipo_solicitud = req.query.tipo as string;
      const estado = req.query.estado as string;
      const id_cliente = req.query.id_cliente as string;

      const offset = (page - 1) * limit;
      let query = `
        SELECT s.*, 
               c.nombre as cliente_nombre, 
               sed.nombre as sede_nombre,
               e.nombre as equipo_nombre,
               e.marca as equipo_marca,
               e.modelo as equipo_modelo,
               u1.nombre as usuario_solicita_nombre,
               u2.nombre as usuario_aprueba_nombre
        FROM solicitudes s
        LEFT JOIN clientes c ON s.id_cliente = c.id
        LEFT JOIN sedes sed ON s.id_sede = sed.id  
        LEFT JOIN equipos e ON s.id_equipo = e.id
        LEFT JOIN usuarios u1 ON s.id_usuario_solicita = u1.id
        LEFT JOIN usuarios u2 ON s.id_usuario_aprueba = u2.id
        WHERE s.activo = 1
      `;
      const params: any[] = [];

      if (tipo_solicitud) {
        query += ' AND s.tipo_solicitud = ?';
        params.push(tipo_solicitud);
      }

      if (estado) {
        query += ' AND s.estado = ?';
        params.push(estado);
      }

      if (id_cliente) {
        query += ' AND s.id_cliente = ?';
        params.push(id_cliente);
      }

      if (search) {
        query += ' AND (s.descripcion LIKE ? OR c.nombre LIKE ? OR sed.nombre LIKE ? OR e.nombre LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY s.fecha_solicitud DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const solicitudes = await db.query(query, params);

      // Count total for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM solicitudes s LEFT JOIN clientes c ON s.id_cliente = c.id LEFT JOIN sedes sed ON s.id_sede = sed.id LEFT JOIN equipos e ON s.id_equipo = e.id WHERE s.activo = 1';
      const countParams: any[] = [];
      
      if (tipo_solicitud) {
        countQuery += ' AND s.tipo_solicitud = ?';
        countParams.push(tipo_solicitud);
      }

      if (estado) {
        countQuery += ' AND s.estado = ?';
        countParams.push(estado);
      }

      if (id_cliente) {
        countQuery += ' AND s.id_cliente = ?';
        countParams.push(id_cliente);
      }

      if (search) {
        countQuery += ' AND (s.descripcion LIKE ? OR c.nombre LIKE ? OR sed.nombre LIKE ? OR e.nombre LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      const countResult = await db.query(countQuery, countParams);
      const total = countResult[0].total;

      res.status(200).json({
        success: true,
        data: {
          solicitudes,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error getting solicitudes:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // GET /solicitudes/:id - Obtener solicitud por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const solicitudes = await db.query(
        `SELECT s.*, 
                c.nombre as cliente_nombre, c.correo as cliente_email, c.telefonos as cliente_telefono,
                sed.nombre as sede_nombre, sed.direccion as sede_direccion,
                e.nombre as equipo_nombre, e.marca as equipo_marca, e.modelo as equipo_modelo, e.serie as equipo_serie,
                u1.nombre as usuario_solicita_nombre, u1.correo as usuario_solicita_email,
                u2.nombre as usuario_aprueba_nombre, u2.correo as usuario_aprueba_email
         FROM solicitudes s
         LEFT JOIN clientes c ON s.id_cliente = c.id
         LEFT JOIN sedes sed ON s.id_sede = sed.id  
         LEFT JOIN equipos e ON s.id_equipo = e.id
         LEFT JOIN usuarios u1 ON s.id_usuario_solicita = u1.id
         LEFT JOIN usuarios u2 ON s.id_usuario_aprueba = u2.id
         WHERE s.id = ? AND s.activo = 1`,
        [id]
      );

      if (solicitudes.length === 0) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Solicitud no encontrada',
            statusCode: 404
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: solicitudes[0]
      });

    } catch (error) {
      console.error('Error getting solicitud by ID:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // POST /solicitudes - Crear nueva solicitud
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createSolicitudSchema.validate(req.body);
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

      const { id_cliente, id_sede, id_equipo, tipo_solicitud, prioridad, descripcion, id_usuario_solicita } = value;

      const result = await db.query(
        'INSERT INTO solicitudes (id_cliente, id_sede, id_equipo, tipo_solicitud, prioridad, descripcion, id_usuario_solicita, activo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        [id_cliente, id_sede, id_equipo || null, tipo_solicitud, prioridad, descripcion, id_usuario_solicita]
      );

      const newSolicitud = await db.query(
        `SELECT s.*, 
                c.nombre as cliente_nombre,
                sed.nombre as sede_nombre,
                e.nombre as equipo_nombre,
                u1.nombre as usuario_solicita_nombre
         FROM solicitudes s
         LEFT JOIN clientes c ON s.id_cliente = c.id
         LEFT JOIN sedes sed ON s.id_sede = sed.id  
         LEFT JOIN equipos e ON s.id_equipo = e.id
         LEFT JOIN usuarios u1 ON s.id_usuario_solicita = u1.id
         WHERE s.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        data: newSolicitud[0],
        message: 'Solicitud creada exitosamente'
      });

    } catch (error) {
      console.error('Error creating solicitud:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // PUT /solicitudes/:id - Actualizar solicitud
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { error, value } = updateSolicitudSchema.validate(req.body);
      
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

      // Check if solicitud exists
      const existing = await db.query(
        'SELECT * FROM solicitudes WHERE id = ? AND activo = 1',
        [id]
      );

      if (existing.length === 0) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Solicitud no encontrada',
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

      // Add response date if estado is being updated
      if (value.estado) {
        updates.push('fecha_respuesta = CURRENT_TIMESTAMP');
      }

      params.push(id);

      await db.query(
        `UPDATE solicitudes SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      const updated = await db.query(
        `SELECT s.*, 
                c.nombre as cliente_nombre,
                sed.nombre as sede_nombre,
                e.nombre as equipo_nombre,
                u1.nombre as usuario_solicita_nombre,
                u2.nombre as usuario_aprueba_nombre
         FROM solicitudes s
         LEFT JOIN clientes c ON s.id_cliente = c.id
         LEFT JOIN sedes sed ON s.id_sede = sed.id  
         LEFT JOIN equipos e ON s.id_equipo = e.id
         LEFT JOIN usuarios u1 ON s.id_usuario_solicita = u1.id
         LEFT JOIN usuarios u2 ON s.id_usuario_aprueba = u2.id
         WHERE s.id = ?`,
        [id]
      );

      res.status(200).json({
        success: true,
        data: updated[0],
        message: 'Solicitud actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error updating solicitud:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error interno del servidor',
          statusCode: 500
        }
      });
    }
  }

  // GET /solicitudes/stats - Obtener estadísticas de solicitudes
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas,
          SUM(CASE WHEN estado = 'despachada' THEN 1 ELSE 0 END) as despachadas,
          SUM(CASE WHEN estado = 'terminada' THEN 1 ELSE 0 END) as terminadas,
          SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as rechazadas,
          SUM(CASE WHEN tipo_solicitud = 'bodega' THEN 1 ELSE 0 END) as bodega,
          SUM(CASE WHEN tipo_solicitud = 'decommission' THEN 1 ELSE 0 END) as decommission,
          SUM(CASE WHEN prioridad = 'urgente' THEN 1 ELSE 0 END) as urgentes,
          SUM(CASE WHEN prioridad = 'alta' THEN 1 ELSE 0 END) as alta_prioridad
        FROM solicitudes 
        WHERE activo = 1
      `;

      const stats = await db.query(statsQuery);

      res.status(200).json({
        success: true,
        data: stats[0]
      });

    } catch (error) {
      console.error('Error getting solicitudes stats:', error);
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