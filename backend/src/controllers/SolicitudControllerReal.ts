import { Request, Response } from 'express'
import db from '../config/database'

export class SolicitudControllerReal {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 [SolicitudControllerReal] Obteniendo solicitudes reales de la BD');
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      // Construir condiciones WHERE
      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      // Filtro por estado
      if (req.query.estado) {
        const estados = Array.isArray(req.query.estado) 
          ? req.query.estado.map(e => parseInt(e as string))
          : [parseInt(req.query.estado as string)];
        
        whereConditions.push(`s.id_estado IN (${estados.map(() => '?').join(',')})`);
        queryParams.push(...estados);
      }

      // Filtro por aviso
      if (req.query.aviso) {
        whereConditions.push('s.aviso LIKE ?');
        queryParams.push(`%${req.query.aviso}%`);
      }

      // Filtro por rango de fechas
      if (req.query.fecha_desde) {
        whereConditions.push('DATE(s.creacion) >= ?');
        queryParams.push(req.query.fecha_desde);
      }

      if (req.query.fecha_hasta) {
        whereConditions.push('DATE(s.creacion) <= ?');
        queryParams.push(req.query.fecha_hasta);
      }

      // Construir WHERE clause
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      // Query principal con JOIN para obtener el estado
      const solicitudesQuery = `
        SELECT 
          s.id,
          s.aviso,
          s.creacion,
          s.id_estado,
          se.estado,
          s.id_equipo,
          s.id_servicio,
          s.id_creador,
          s.observacion,
          s.observacion_estado,
          s.cambio_estado,
          s.id_cambiador,
          uc.nombre as creador_nombre,
          uca.nombre as cambiador_nombre
        FROM solicitudes s
        LEFT JOIN solicitudes_estados se ON s.id_estado = se.id
        LEFT JOIN usuarios uc ON s.id_creador = uc.id
        LEFT JOIN usuarios uca ON s.id_cambiador = uca.id
        ${whereClause}
        ORDER BY s.creacion DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes s
        ${whereClause}
      `;

      console.log('📊 [SolicitudControllerReal] Query principal:', solicitudesQuery);

      // Ejecutar ambas queries
      const [solicitudes, countResult] = await Promise.all([
        db.query(solicitudesQuery, queryParams),
        db.query(countQuery, queryParams)
      ]);

      const total = (countResult as any[])[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      console.log(`✅ [SolicitudControllerReal] Obtenidas: ${(solicitudes as any[]).length} de ${total} total`);

      res.json({
        success: true,
        message: 'Solicitudes obtenidas exitosamente',
        data: {
          solicitudes,
          total,
          page,
          limit,
          totalPages
        }
      });

    } catch (error) {
      console.error('❌ [SolicitudControllerReal] Error obteniendo solicitudes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log(`🔍 [SolicitudControllerReal] Obteniendo solicitud ID: ${id}`);

      const solicitudQuery = `
        SELECT 
          s.id,
          s.aviso,
          s.creacion,
          s.id_estado,
          se.estado,
          s.id_equipo,
          s.id_servicio,
          s.id_creador,
          s.observacion,
          s.observacion_estado,
          s.cambio_estado,
          s.id_cambiador,
          uc.nombre as creador_nombre,
          uca.nombre as cambiador_nombre
        FROM solicitudes s
        LEFT JOIN solicitudes_estados se ON s.id_estado = se.id
        LEFT JOIN usuarios uc ON s.id_creador = uc.id
        LEFT JOIN usuarios uca ON s.id_cambiador = uca.id
        WHERE s.id = ?
      `;

      const resultado = await db.query(solicitudQuery, [id]);
      const solicitudes = resultado as any[];

      if (!solicitudes || solicitudes.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      const solicitud = solicitudes[0];

      console.log(`✅ [SolicitudControllerReal] Solicitud obtenida: ${id}`);

      res.json({
        success: true,
        message: 'Solicitud obtenida exitosamente',
        data: solicitud
      });

    } catch (error) {
      console.error(`❌ [SolicitudControllerReal] Error obteniendo solicitud ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { id_servicio, aviso, observacion, id_equipo } = req.body;
      console.log('📝 [SolicitudControllerReal] Creando nueva solicitud:', req.body);
      
      // Usar el ID del usuario autenticado (viene del middleware de auth)
      const id_creador = (req as any).user?.userId || 1;
      
      const query = `
        INSERT INTO solicitudes (id_servicio, aviso, observacion, id_equipo, id_creador, id_estado, creacion)
        VALUES (?, ?, ?, ?, ?, 1, NOW())
      `;
      
      const result = await db.query(query, [id_servicio, aviso, observacion, id_equipo || null, id_creador]) as any;
      
      console.log(`✅ [SolicitudControllerReal] Solicitud creada con ID: ${result.insertId}`);
      
      // Obtener la solicitud recién creada
      const nuevaSolicitud = await db.query(`
        SELECT 
          s.id,
          s.aviso,
          s.creacion,
          s.id_estado,
          se.estado,
          s.id_equipo,
          s.id_servicio,
          s.id_creador,
          s.observacion,
          s.observacion_estado
        FROM solicitudes s
        LEFT JOIN solicitudes_estados se ON s.id_estado = se.id
        WHERE s.id = ?
      `, [result.insertId]) as any[];
      
      res.status(201).json({
        success: true,
        data: nuevaSolicitud[0],
        message: 'Solicitud creada exitosamente'
      });
    } catch (error) {
      console.error('❌ [SolicitudControllerReal] Error creando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  static async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;
      
      console.log(`🔄 [SolicitudControllerReal] Cambiando estado solicitud ${id}:`, req.body);
      
      const query = `
        UPDATE solicitudes 
        SET id_estado = ?, observacion_estado = ?, id_cambiador = ?, cambio_estado = NOW()
        WHERE id = ?
      `;
      
      const id_cambiador = (req as any).user?.userId || 1;
      
      await db.query(query, [estado, observaciones || null, id_cambiador, id]);
      
      console.log(`✅ [SolicitudControllerReal] Estado actualizado para solicitud ${id}`);
      
      // Obtener la solicitud actualizada
      const solicitudActualizada = await db.query(`
        SELECT 
          s.id,
          s.aviso,
          s.creacion,
          s.id_estado,
          se.estado,
          s.id_equipo,
          s.id_servicio,
          s.id_creador,
          s.observacion,
          s.observacion_estado,
          s.cambio_estado,
          s.id_cambiador
        FROM solicitudes s
        LEFT JOIN solicitudes_estados se ON s.id_estado = se.id
        WHERE s.id = ?
      `, [id]) as any[];
      
      if (solicitudActualizada.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }
      
      res.json({
        success: true,
        data: solicitudActualizada[0],
        message: 'Estado de solicitud actualizado exitosamente'
      });
    } catch (error) {
      console.error('❌ [SolicitudControllerReal] Error updating solicitud estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 [SolicitudControllerReal] Obteniendo estadísticas reales');

      const estadisticasQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN id_estado = 1 THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN id_estado = 2 THEN 1 ELSE 0 END) as aprobadas,
          SUM(CASE WHEN id_estado = 3 THEN 1 ELSE 0 END) as rechazadas,
          ROUND(
            (SUM(CASE WHEN id_estado = 2 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 
            2
          ) as porcentaje_aprobacion
        FROM solicitudes
      `;

      const resultado = await db.query(estadisticasQuery);
      const stats = (resultado as any[])[0];

      console.log('✅ [SolicitudControllerReal] Estadísticas obtenidas:', stats);

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          total: parseInt(stats.total) || 0,
          pendientes: parseInt(stats.pendientes) || 0,
          aprobadas: parseInt(stats.aprobadas) || 0,
          rechazadas: parseInt(stats.rechazadas) || 0,
          porcentaje_aprobacion: parseFloat(stats.porcentaje_aprobacion) || 0
        }
      });

    } catch (error) {
      console.error('❌ [SolicitudControllerReal] Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}