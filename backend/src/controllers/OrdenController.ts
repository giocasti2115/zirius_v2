import { Request, Response } from 'express';
import DatabaseConnection from '../config/database';
import Joi from 'joi';

// Esquemas de validación
const ordenQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  estado: Joi.string().valid('pendiente', 'en_proceso', 'ejecutada', 'cancelada'),
  tipo_orden: Joi.string().valid('mantenimiento_preventivo', 'mantenimiento_correctivo', 'calibracion', 'inspeccion', 'instalacion'),
  cliente_id: Joi.number().integer().positive(),
  sede_id: Joi.number().integer().positive(),
  equipo_id: Joi.number().integer().positive(),
  tecnico_id: Joi.number().integer().positive(),
  fecha_desde: Joi.date().iso(),
  fecha_hasta: Joi.date().iso(),
  search: Joi.string().min(1).max(255),
  sort_by: Joi.string().valid('fecha_programada', 'fecha_creacion', 'estado', 'tipo_orden', 'prioridad').default('fecha_programada'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc')
});

const ordenCreateSchema = Joi.object({
  solicitud_id: Joi.number().integer().positive().required(),
  equipo_id: Joi.number().integer().positive().required(),
  tipo_orden: Joi.string().valid('mantenimiento_preventivo', 'mantenimiento_correctivo', 'calibracion', 'inspeccion', 'instalacion').required(),
  descripcion: Joi.string().min(10).max(1000).required(),
  fecha_programada: Joi.date().iso().required(),
  prioridad: Joi.string().valid('baja', 'media', 'alta', 'urgente').default('media'),
  tecnico_asignado_id: Joi.number().integer().positive(),
  tiempo_estimado: Joi.number().integer().positive(), // en minutos
  materiales_requeridos: Joi.string().max(500),
  observaciones: Joi.string().max(1000)
});

const ordenUpdateSchema = Joi.object({
  tipo_orden: Joi.string().valid('mantenimiento_preventivo', 'mantenimiento_correctivo', 'calibracion', 'inspeccion', 'instalacion'),
  descripcion: Joi.string().min(10).max(1000),
  fecha_programada: Joi.date().iso(),
  prioridad: Joi.string().valid('baja', 'media', 'alta', 'urgente'),
  estado: Joi.string().valid('pendiente', 'en_proceso', 'ejecutada', 'cancelada'),
  tecnico_asignado_id: Joi.number().integer().positive().allow(null),
  tiempo_estimado: Joi.number().integer().positive(),
  materiales_requeridos: Joi.string().max(500).allow(''),
  observaciones: Joi.string().max(1000).allow(''),
  fecha_inicio: Joi.date().iso().allow(null),
  fecha_finalizacion: Joi.date().iso().allow(null),
  resultado: Joi.string().max(1000).allow('')
});

export class OrdenController {
  /**
   * Obtener todas las órdenes con filtros avanzados
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = ordenQuerySchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: error.details
        });
        return;
      }

      const {
        page,
        limit,
        estado,
        tipo_orden,
        cliente_id,
        sede_id,
        equipo_id,
        tecnico_id,
        fecha_desde,
        fecha_hasta,
        search,
        sort_by,
        sort_order
      } = value;

      const offset = (page - 1) * limit;
      
      let whereConditions = ['1=1'];
      let queryParams: any[] = [];
      let paramIndex = 1;

      // Construir condiciones WHERE
      if (estado) {
        whereConditions.push(`o.estado = ?`);
        queryParams.push(estado);
      }

      if (tipo_orden) {
        whereConditions.push(`o.tipo_orden = ?`);
        queryParams.push(tipo_orden);
      }

      if (cliente_id) {
        whereConditions.push(`c.id = ?`);
        queryParams.push(cliente_id);
      }

      if (sede_id) {
        whereConditions.push(`s.id = ?`);
        queryParams.push(sede_id);
      }

      if (equipo_id) {
        whereConditions.push(`e.id = ?`);
        queryParams.push(equipo_id);
      }

      if (tecnico_id) {
        whereConditions.push(`o.tecnico_asignado_id = ?`);
        queryParams.push(tecnico_id);
      }

      if (fecha_desde) {
        whereConditions.push(`o.fecha_programada >= ?`);
        queryParams.push(fecha_desde);
      }

      if (fecha_hasta) {
        whereConditions.push(`o.fecha_programada <= ?`);
        queryParams.push(fecha_hasta);
      }

      if (search) {
        whereConditions.push(`(
          o.descripcion LIKE ? OR 
          e.numero_serie LIKE ? OR 
          e.referencia LIKE ? OR
          c.nombre LIKE ? OR
          s.nombre LIKE ? OR
          u.nombre LIKE ? OR
          u.apellido LIKE ?
        )`);
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      const whereClause = whereConditions.join(' AND ');

      // Query principal para obtener órdenes
      const ordenesQuery = `
        SELECT 
          o.id,
          o.solicitud_id,
          o.equipo_id,
          o.tipo_orden,
          o.descripcion,
          o.fecha_programada,
          o.fecha_inicio,
          o.fecha_finalizacion,
          o.estado,
          o.prioridad,
          o.tecnico_asignado_id,
          o.tiempo_estimado,
          o.materiales_requeridos,
          o.observaciones,
          o.resultado,
          o.fecha_creacion,
          o.fecha_actualizacion,
          
          -- Información del equipo
          e.numero_serie as equipo_numero_serie,
          e.referencia as equipo_referencia,
          e.ubicacion as equipo_ubicacion,
          
          -- Información del cliente y sede
          c.id as cliente_id,
          c.nombre as cliente_nombre,
          c.tipo_cliente,
          s.id as sede_id,
          s.nombre as sede_nombre,
          s.direccion as sede_direccion,
          s.telefono as sede_telefono,
          
          -- Información del técnico asignado
          u.nombre as tecnico_nombre,
          u.apellido as tecnico_apellido,
          u.email as tecnico_email,
          u.telefono as tecnico_telefono,
          
          -- Información de la solicitud origen
          sol.estado as solicitud_estado,
          sol.prioridad as solicitud_prioridad
          
        FROM ordenes o
        LEFT JOIN equipos e ON o.equipo_id = e.id
        LEFT JOIN sedes s ON e.sede_id = s.id
        LEFT JOIN clientes c ON s.cliente_id = c.id
        LEFT JOIN usuarios u ON o.tecnico_asignado_id = u.id
        LEFT JOIN solicitudes sol ON o.solicitud_id = sol.id
        WHERE ${whereClause}
        ORDER BY o.${sort_by} ${sort_order.toUpperCase()}
        LIMIT ? OFFSET ?
      `;

      queryParams.push(limit, offset);

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total
        FROM ordenes o
        LEFT JOIN equipos e ON o.equipo_id = e.id
        LEFT JOIN sedes s ON e.sede_id = s.id
        LEFT JOIN clientes c ON s.cliente_id = c.id
        LEFT JOIN usuarios u ON o.tecnico_asignado_id = u.id
        LEFT JOIN solicitudes sol ON o.solicitud_id = sol.id
        WHERE ${whereClause}
      `;

      const countParams = queryParams.slice(0, -2); // Remover limit y offset

      const [ordenes, countResult] = await Promise.all([
        DatabaseConnection.query(ordenesQuery, queryParams),
        DatabaseConnection.query(countQuery, countParams)
      ]);

      const total = Array.isArray(countResult) && countResult.length > 0 ? countResult[0].total : 0;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: ordenes,
        pagination: {
          current_page: page,
          per_page: limit,
          total_items: total,
          total_pages: totalPages,
          has_next_page: page < totalPages,
          has_prev_page: page > 1
        }
      });

    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtener una orden por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '0');
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de orden inválido'
        });
        return;
      }

      const query = `
        SELECT 
          o.*,
          
          -- Información del equipo
          e.numero_serie as equipo_numero_serie,
          e.referencia as equipo_referencia,
          e.ubicacion as equipo_ubicacion,
          e.fecha_instalacion as equipo_fecha_instalacion,
          
          -- Información del cliente y sede
          c.id as cliente_id,
          c.nombre as cliente_nombre,
          c.tipo_cliente,
          c.nit as cliente_nit,
          s.id as sede_id,
          s.nombre as sede_nombre,
          s.direccion as sede_direccion,
          s.telefono as sede_telefono,
          s.contacto_principal as sede_contacto,
          
          -- Información del técnico asignado
          u.nombre as tecnico_nombre,
          u.apellido as tecnico_apellido,
          u.email as tecnico_email,
          u.telefono as tecnico_telefono,
          u.especialidad as tecnico_especialidad,
          
          -- Información de la solicitud origen
          sol.estado as solicitud_estado,
          sol.prioridad as solicitud_prioridad,
          sol.descripcion as solicitud_descripcion,
          sol.fecha_solicitud
          
        FROM ordenes o
        LEFT JOIN equipos e ON o.equipo_id = e.id
        LEFT JOIN sedes s ON e.sede_id = s.id
        LEFT JOIN clientes c ON s.cliente_id = c.id
        LEFT JOIN usuarios u ON o.tecnico_asignado_id = u.id
        LEFT JOIN solicitudes sol ON o.solicitud_id = sol.id
        WHERE o.id = ?
      `;

      const result = await DatabaseConnection.query(query, [id]);

      if (!Array.isArray(result) || result.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: result[0]
      });

    } catch (error) {
      console.error('Error al obtener orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Crear nueva orden
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = ordenCreateSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Datos de orden inválidos',
          errors: error.details
        });
        return;
      }

      // Verificar que la solicitud existe
      const solicitudCheck = await DatabaseConnection.query(
        'SELECT id FROM solicitudes WHERE id = ?',
        [value.solicitud_id]
      );

      if (!Array.isArray(solicitudCheck) || solicitudCheck.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Verificar que el equipo existe
      const equipoCheck = await DatabaseConnection.query(
        'SELECT id FROM equipos WHERE id = ?',
        [value.equipo_id]
      );

      if (!Array.isArray(equipoCheck) || equipoCheck.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Equipo no encontrado'
        });
        return;
      }

      // Verificar técnico si se asigna
      if (value.tecnico_asignado_id) {
        const tecnicoCheck = await DatabaseConnection.query(
          'SELECT id FROM usuarios WHERE id = ? AND rol IN ("tecnico", "admin")',
          [value.tecnico_asignado_id]
        );

        if (!Array.isArray(tecnicoCheck) || tecnicoCheck.length === 0) {
          res.status(400).json({
            success: false,
            message: 'Técnico no encontrado o no válido'
          });
          return;
        }
      }

      const insertQuery = `
        INSERT INTO ordenes (
          solicitud_id, equipo_id, tipo_orden, descripcion, fecha_programada,
          prioridad, tecnico_asignado_id, tiempo_estimado, materiales_requeridos,
          observaciones, estado, fecha_creacion, fecha_actualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW(), NOW())
      `;

      const result = await DatabaseConnection.query(insertQuery, [
        value.solicitud_id,
        value.equipo_id,
        value.tipo_orden,
        value.descripcion,
        value.fecha_programada,
        value.prioridad,
        value.tecnico_asignado_id || null,
        value.tiempo_estimado || null,
        value.materiales_requeridos || '',
        value.observaciones || ''
      ]);

      if (result && typeof result === 'object' && 'insertId' in result) {
        const newOrden = await DatabaseConnection.query(
          'SELECT * FROM ordenes WHERE id = ?',
          [result.insertId]
        );

        res.status(201).json({
          success: true,
          message: 'Orden creada exitosamente',
          data: Array.isArray(newOrden) ? newOrden[0] : null
        });
      } else {
        throw new Error('No se pudo crear la orden');
      }

    } catch (error) {
      console.error('Error al crear orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Actualizar orden
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '0');
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de orden inválido'
        });
        return;
      }

      const { error, value } = ordenUpdateSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Datos de actualización inválidos',
          errors: error.details
        });
        return;
      }

      // Verificar que la orden existe
      const ordenCheck = await DatabaseConnection.query(
        'SELECT id FROM ordenes WHERE id = ?',
        [id]
      );

      if (!Array.isArray(ordenCheck) || ordenCheck.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        });
        return;
      }

      // Verificar técnico si se está actualizando
      if (value.tecnico_asignado_id) {
        const tecnicoCheck = await DatabaseConnection.query(
          'SELECT id FROM usuarios WHERE id = ? AND rol IN ("tecnico", "admin")',
          [value.tecnico_asignado_id]
        );

        if (!Array.isArray(tecnicoCheck) || tecnicoCheck.length === 0) {
          res.status(400).json({
            success: false,
            message: 'Técnico no encontrado o no válido'
          });
          return;
        }
      }

      // Construir query de actualización dinámicamente
      const updateFields = [];
      const updateValues = [];

      Object.entries(value).forEach(([key, val]) => {
        if (val !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(val);
        }
      });

      if (updateFields.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No hay campos para actualizar'
        });
        return;
      }

      updateFields.push('fecha_actualizacion = NOW()');
      updateValues.push(id);

      const updateQuery = `
        UPDATE ordenes 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      await DatabaseConnection.query(updateQuery, updateValues);

      // Obtener la orden actualizada
      const updatedOrden = await DatabaseConnection.query(
        'SELECT * FROM ordenes WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Orden actualizada exitosamente',
        data: Array.isArray(updatedOrden) ? updatedOrden[0] : null
      });

    } catch (error) {
      console.error('Error al actualizar orden:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtener estadísticas de órdenes
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_ordenes,
          SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
          SUM(CASE WHEN estado = 'ejecutada' THEN 1 ELSE 0 END) as ejecutadas,
          SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
          SUM(CASE WHEN prioridad = 'alta' OR prioridad = 'urgente' THEN 1 ELSE 0 END) as alta_prioridad,
          SUM(CASE WHEN fecha_programada < CURDATE() AND estado IN ('pendiente', 'en_proceso') THEN 1 ELSE 0 END) as vencidas,
          AVG(CASE WHEN tiempo_estimado IS NOT NULL THEN tiempo_estimado ELSE NULL END) as tiempo_promedio_estimado
        FROM ordenes
      `;

      const tipoOrdenQuery = `
        SELECT 
          tipo_orden,
          COUNT(*) as cantidad,
          SUM(CASE WHEN estado = 'ejecutada' THEN 1 ELSE 0 END) as ejecutadas
        FROM ordenes
        GROUP BY tipo_orden
      `;

      const tecnicosQuery = `
        SELECT 
          u.id,
          u.nombre,
          u.apellido,
          COUNT(o.id) as ordenes_asignadas,
          SUM(CASE WHEN o.estado = 'ejecutada' THEN 1 ELSE 0 END) as ordenes_completadas
        FROM usuarios u
        LEFT JOIN ordenes o ON u.id = o.tecnico_asignado_id
        WHERE u.rol IN ('tecnico', 'admin')
        GROUP BY u.id, u.nombre, u.apellido
        HAVING ordenes_asignadas > 0
        ORDER BY ordenes_asignadas DESC
      `;

      const [generalStats, tipoOrdenStats, tecnicosStats] = await Promise.all([
        DatabaseConnection.query(statsQuery),
        DatabaseConnection.query(tipoOrdenQuery),
        DatabaseConnection.query(tecnicosQuery)
      ]);

      res.json({
        success: true,
        data: {
          general: Array.isArray(generalStats) ? generalStats[0] : {},
          por_tipo_orden: tipoOrdenStats,
          por_tecnico: tecnicosStats
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de órdenes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}