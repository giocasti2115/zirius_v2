import { Request, Response } from 'express';
import DatabaseConnection from '../config/database';
import Joi from 'joi';

// Esquemas de validación
const visitaQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  estado: Joi.string().valid('programada', 'en_curso', 'completada', 'cancelada'),
  tipo_visita: Joi.string().valid('mantenimiento_preventivo', 'mantenimiento_correctivo', 'calibracion', 'inspeccion', 'instalacion', 'capacitacion'),
  orden_id: Joi.number().integer().positive(),
  cliente_id: Joi.number().integer().positive(),
  sede_id: Joi.number().integer().positive(),
  equipo_id: Joi.number().integer().positive(),
  tecnico_id: Joi.number().integer().positive(),
  fecha_desde: Joi.date().iso(),
  fecha_hasta: Joi.date().iso(),
  search: Joi.string().min(1).max(255),
  sort_by: Joi.string().valid('fecha_programada', 'fecha_creacion', 'estado', 'tipo_visita', 'duracion_estimada').default('fecha_programada'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc')
});

const visitaCreateSchema = Joi.object({
  orden_id: Joi.number().integer().positive().required(),
  tecnico_asignado_id: Joi.number().integer().positive().required(),
  tipo_visita: Joi.string().valid('mantenimiento_preventivo', 'mantenimiento_correctivo', 'calibracion', 'inspeccion', 'instalacion', 'capacitacion').required(),
  fecha_programada: Joi.date().iso().required(),
  hora_inicio_programada: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  duracion_estimada: Joi.number().integer().positive().required(), // en minutos
  descripcion: Joi.string().min(10).max(1000).required(),
  materiales_necesarios: Joi.string().max(500),
  herramientas_necesarias: Joi.string().max(500),
  observaciones_programacion: Joi.string().max(1000),
  requiere_parada_equipo: Joi.boolean().default(false),
  contacto_sede: Joi.string().max(255)
});

const visitaUpdateSchema = Joi.object({
  fecha_programada: Joi.date().iso(),
  hora_inicio_programada: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  hora_inicio_real: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  hora_fin_real: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  duracion_estimada: Joi.number().integer().positive(),
  estado: Joi.string().valid('programada', 'en_curso', 'completada', 'cancelada'),
  descripcion: Joi.string().min(10).max(1000),
  materiales_necesarios: Joi.string().max(500).allow(''),
  herramientas_necesarias: Joi.string().max(500).allow(''),
  observaciones_programacion: Joi.string().max(1000).allow(''),
  requiere_parada_equipo: Joi.boolean(),
  contacto_sede: Joi.string().max(255).allow(''),
  
  // Campos de resultado
  trabajo_realizado: Joi.string().max(2000).allow(''),
  materiales_utilizados: Joi.string().max(1000).allow(''),
  observaciones_tecnicas: Joi.string().max(2000).allow(''),
  recomendaciones: Joi.string().max(1000).allow(''),
  equipo_funcionando: Joi.boolean(),
  requiere_seguimiento: Joi.boolean(),
  proxima_visita_recomendada: Joi.date().iso().allow(null),
  calificacion_cliente: Joi.number().integer().min(1).max(5).allow(null),
  comentarios_cliente: Joi.string().max(1000).allow(''),
  motivo_cancelacion: Joi.string().max(500).allow('')
});

export class VisitaController {
  /**
   * Obtener todas las visitas con filtros avanzados
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = visitaQuerySchema.validate(req.query);
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
        tipo_visita,
        orden_id,
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

      // Construir condiciones WHERE
      if (estado) {
        whereConditions.push(`v.estado = ?`);
        queryParams.push(estado);
      }

      if (tipo_visita) {
        whereConditions.push(`v.tipo_visita = ?`);
        queryParams.push(tipo_visita);
      }

      if (orden_id) {
        whereConditions.push(`v.orden_id = ?`);
        queryParams.push(orden_id);
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
        whereConditions.push(`v.tecnico_asignado_id = ?`);
        queryParams.push(tecnico_id);
      }

      if (fecha_desde) {
        whereConditions.push(`v.fecha_programada >= ?`);
        queryParams.push(fecha_desde);
      }

      if (fecha_hasta) {
        whereConditions.push(`v.fecha_programada <= ?`);
        queryParams.push(fecha_hasta);
      }

      if (search) {
        whereConditions.push(`(
          v.descripcion LIKE ? OR 
          v.trabajo_realizado LIKE ? OR
          e.numero_serie LIKE ? OR 
          e.referencia LIKE ? OR
          c.nombre LIKE ? OR
          s.nombre LIKE ? OR
          u.nombre LIKE ? OR
          u.apellido LIKE ?
        )`);
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      const whereClause = whereConditions.join(' AND ');

      // Query principal para obtener visitas
      const visitasQuery = `
        SELECT 
          v.id,
          v.orden_id,
          v.tecnico_asignado_id,
          v.tipo_visita,
          v.fecha_programada,
          v.hora_inicio_programada,
          v.hora_inicio_real,
          v.hora_fin_real,
          v.duracion_estimada,
          v.estado,
          v.descripcion,
          v.materiales_necesarios,
          v.herramientas_necesarias,
          v.observaciones_programacion,
          v.requiere_parada_equipo,
          v.contacto_sede,
          v.trabajo_realizado,
          v.materiales_utilizados,
          v.observaciones_tecnicas,
          v.recomendaciones,
          v.equipo_funcionando,
          v.requiere_seguimiento,
          v.proxima_visita_recomendada,
          v.calificacion_cliente,
          v.comentarios_cliente,
          v.motivo_cancelacion,
          v.fecha_creacion,
          v.fecha_actualizacion,
          
          -- Información de la orden
          o.tipo_orden,
          o.estado as orden_estado,
          o.prioridad as orden_prioridad,
          
          -- Información del equipo
          e.id as equipo_id,
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
          u.especialidad as tecnico_especialidad
          
        FROM visitas v
        LEFT JOIN ordenes o ON v.orden_id = o.id
        LEFT JOIN equipos e ON o.equipo_id = e.id
        LEFT JOIN sedes s ON e.sede_id = s.id
        LEFT JOIN clientes c ON s.cliente_id = c.id
        LEFT JOIN usuarios u ON v.tecnico_asignado_id = u.id
        WHERE ${whereClause}
        ORDER BY v.${sort_by} ${sort_order.toUpperCase()}
        LIMIT ? OFFSET ?
      `;

      queryParams.push(limit, offset);

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total
        FROM visitas v
        LEFT JOIN ordenes o ON v.orden_id = o.id
        LEFT JOIN equipos e ON o.equipo_id = e.id
        LEFT JOIN sedes s ON e.sede_id = s.id
        LEFT JOIN clientes c ON s.cliente_id = c.id
        LEFT JOIN usuarios u ON v.tecnico_asignado_id = u.id
        WHERE ${whereClause}
      `;

      const countParams = queryParams.slice(0, -2); // Remover limit y offset

      const [visitas, countResult] = await Promise.all([
        DatabaseConnection.query(visitasQuery, queryParams),
        DatabaseConnection.query(countQuery, countParams)
      ]);

      const total = Array.isArray(countResult) && countResult.length > 0 ? countResult[0].total : 0;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: visitas,
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
      console.error('Error al obtener visitas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtener una visita por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '0');
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de visita inválido'
        });
        return;
      }

      const query = `
        SELECT 
          v.*,
          
          -- Información de la orden
          o.tipo_orden,
          o.estado as orden_estado,
          o.prioridad as orden_prioridad,
          o.descripcion as orden_descripcion,
          
          -- Información del equipo
          e.id as equipo_id,
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
          u.fecha_ingreso as tecnico_fecha_ingreso
          
        FROM visitas v
        LEFT JOIN ordenes o ON v.orden_id = o.id
        LEFT JOIN equipos e ON o.equipo_id = e.id
        LEFT JOIN sedes s ON e.sede_id = s.id
        LEFT JOIN clientes c ON s.cliente_id = c.id
        LEFT JOIN usuarios u ON v.tecnico_asignado_id = u.id
        WHERE v.id = ?
      `;

      const result = await DatabaseConnection.query(query, [id]);

      if (!Array.isArray(result) || result.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: result[0]
      });

    } catch (error) {
      console.error('Error al obtener visita:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Crear nueva visita
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = visitaCreateSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Datos de visita inválidos',
          errors: error.details
        });
        return;
      }

      // Verificar que la orden existe
      const ordenCheck = await DatabaseConnection.query(
        'SELECT id, estado FROM ordenes WHERE id = ?',
        [value.orden_id]
      );

      if (!Array.isArray(ordenCheck) || ordenCheck.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Orden no encontrada'
        });
        return;
      }

      if (ordenCheck[0].estado === 'cancelada') {
        res.status(400).json({
          success: false,
          message: 'No se puede crear visita para una orden cancelada'
        });
        return;
      }

      // Verificar técnico
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

      const insertQuery = `
        INSERT INTO visitas (
          orden_id, tecnico_asignado_id, tipo_visita, fecha_programada,
          hora_inicio_programada, duracion_estimada, descripcion, materiales_necesarios,
          herramientas_necesarias, observaciones_programacion, requiere_parada_equipo,
          contacto_sede, estado, fecha_creacion, fecha_actualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'programada', NOW(), NOW())
      `;

      const result = await DatabaseConnection.query(insertQuery, [
        value.orden_id,
        value.tecnico_asignado_id,
        value.tipo_visita,
        value.fecha_programada,
        value.hora_inicio_programada,
        value.duracion_estimada,
        value.descripcion,
        value.materiales_necesarios || '',
        value.herramientas_necesarias || '',
        value.observaciones_programacion || '',
        value.requiere_parada_equipo,
        value.contacto_sede || ''
      ]);

      if (result && typeof result === 'object' && 'insertId' in result) {
        const newVisita = await DatabaseConnection.query(
          'SELECT * FROM visitas WHERE id = ?',
          [result.insertId]
        );

        res.status(201).json({
          success: true,
          message: 'Visita creada exitosamente',
          data: Array.isArray(newVisita) ? newVisita[0] : null
        });
      } else {
        throw new Error('No se pudo crear la visita');
      }

    } catch (error) {
      console.error('Error al crear visita:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Actualizar visita
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '0');
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de visita inválido'
        });
        return;
      }

      const { error, value } = visitaUpdateSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Datos de actualización inválidos',
          errors: error.details
        });
        return;
      }

      // Verificar que la visita existe
      const visitaCheck = await DatabaseConnection.query(
        'SELECT id, estado FROM visitas WHERE id = ?',
        [id]
      );

      if (!Array.isArray(visitaCheck) || visitaCheck.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        });
        return;
      }

      // Validaciones específicas según el estado
      if (value.estado) {
        const estadoActual = visitaCheck[0].estado;
        
        // No permitir cambios desde estado completada o cancelada
        if ((estadoActual === 'completada' || estadoActual === 'cancelada') && value.estado !== estadoActual) {
          res.status(400).json({
            success: false,
            message: `No se puede cambiar el estado desde '${estadoActual}'`
          });
          return;
        }

        // Validar campos requeridos según el estado
        if (value.estado === 'completada') {
          if (!value.trabajo_realizado) {
            res.status(400).json({
              success: false,
              message: 'El campo trabajo_realizado es requerido para completar la visita'
            });
            return;
          }
          if (value.equipo_funcionando === undefined) {
            res.status(400).json({
              success: false,
              message: 'Debe indicar si el equipo está funcionando'
            });
            return;
          }
        }

        if (value.estado === 'cancelada' && !value.motivo_cancelacion) {
          res.status(400).json({
            success: false,
            message: 'El motivo de cancelación es requerido'
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
        UPDATE visitas 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      await DatabaseConnection.query(updateQuery, updateValues);

      // Obtener la visita actualizada
      const updatedVisita = await DatabaseConnection.query(
        'SELECT * FROM visitas WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Visita actualizada exitosamente',
        data: Array.isArray(updatedVisita) ? updatedVisita[0] : null
      });

    } catch (error) {
      console.error('Error al actualizar visita:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtener estadísticas de visitas
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_visitas,
          SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as programadas,
          SUM(CASE WHEN estado = 'en_curso' THEN 1 ELSE 0 END) as en_curso,
          SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
          AVG(CASE WHEN calificacion_cliente IS NOT NULL THEN calificacion_cliente ELSE NULL END) as calificacion_promedio,
          SUM(CASE WHEN fecha_programada < CURDATE() AND estado IN ('programada', 'en_curso') THEN 1 ELSE 0 END) as atrasadas,
          AVG(CASE WHEN duracion_estimada IS NOT NULL THEN duracion_estimada ELSE NULL END) as duracion_promedio_estimada
        FROM visitas
      `;

      const tipoVisitaQuery = `
        SELECT 
          tipo_visita,
          COUNT(*) as cantidad,
          SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
          AVG(CASE WHEN calificacion_cliente IS NOT NULL THEN calificacion_cliente ELSE NULL END) as calificacion_promedio
        FROM visitas
        GROUP BY tipo_visita
      `;

      const tecnicosQuery = `
        SELECT 
          u.id,
          u.nombre,
          u.apellido,
          COUNT(v.id) as visitas_asignadas,
          SUM(CASE WHEN v.estado = 'completada' THEN 1 ELSE 0 END) as visitas_completadas,
          AVG(CASE WHEN v.calificacion_cliente IS NOT NULL THEN v.calificacion_cliente ELSE NULL END) as calificacion_promedio
        FROM usuarios u
        LEFT JOIN visitas v ON u.id = v.tecnico_asignado_id
        WHERE u.rol IN ('tecnico', 'admin')
        GROUP BY u.id, u.nombre, u.apellido
        HAVING visitas_asignadas > 0
        ORDER BY visitas_asignadas DESC
      `;

      const [generalStats, tipoVisitaStats, tecnicosStats] = await Promise.all([
        DatabaseConnection.query(statsQuery),
        DatabaseConnection.query(tipoVisitaQuery),
        DatabaseConnection.query(tecnicosQuery)
      ]);

      res.json({
        success: true,
        data: {
          general: Array.isArray(generalStats) ? generalStats[0] : {},
          por_tipo_visita: tipoVisitaStats,
          por_tecnico: tecnicosStats
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de visitas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}