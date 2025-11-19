import { Request, Response } from 'express';
import db from '../config/database';

// Interface para las solicitudes de baja
export interface SolicitudBajaReal {
  id: number;
  codigo_solicitud: string;
  codigo_equipo: string;
  nombre_equipo: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  ubicacion?: string;
  responsable: string;
  solicitante: string;
  tipo_baja: string;
  justificacion_tecnica: string;
  justificacion_economica?: string;
  valor_recuperable?: number;
  observaciones?: string;
  estado: string;
  fecha_solicitud: string;
  fecha_aprobacion?: string;
  fecha_ejecucion?: string;
  evaluador?: string;
  observaciones_evaluacion?: string;
  recomendaciones?: string;
  valor_recuperable_aprobado?: number;
  ejecutor?: string;
  observaciones_ejecucion?: string;
}

export class DarDeBajaController {
  
  // Obtener estadísticas de las solicitudes de baja
  static async obtenerEstadisticas(req: Request, res: Response) {
    try {
      console.log('📊 [Dar de Baja] Obteniendo estadísticas');

      const estadisticasQuery = `
        SELECT 
          COUNT(*) as total_solicitudes,
          SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as solicitudes_pendientes,
          SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as solicitudes_aprobadas,
          SUM(CASE WHEN estado = 'ejecutada' THEN 1 ELSE 0 END) as solicitudes_ejecutadas,
          SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as solicitudes_rechazadas,
          SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as solicitudes_en_proceso,
          SUM(CASE WHEN valor_recuperable_aprobado IS NOT NULL THEN valor_recuperable_aprobado ELSE 0 END) as valor_total_recuperable
        FROM solicitudes_baja
      `;

      const resultado = await db.query(estadisticasQuery);
      const stats = (resultado as any[])[0];

      console.log('✅ [Dar de Baja] Estadísticas obtenidas:', stats);

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          totalSolicitudes: parseInt(stats.total_solicitudes) || 0,
          solicitudesPendientes: parseInt(stats.solicitudes_pendientes) || 0,
          solicitudesAprobadas: parseInt(stats.solicitudes_aprobadas) || 0,
          solicitudesEjecutadas: parseInt(stats.solicitudes_ejecutadas) || 0,
          solicitudesRechazadas: parseInt(stats.solicitudes_rechazadas) || 0,
          solicitudesEnProceso: parseInt(stats.solicitudes_en_proceso) || 0,
          valorTotalRecuperable: parseFloat(stats.valor_total_recuperable) || 0
        }
      });

    } catch (error) {
      console.error('❌ [Dar de Baja] Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Obtener lista de solicitudes de baja
  static async listar(req: Request, res: Response) {
    try {
      console.log('🔍 [Dar de Baja] Obteniendo solicitudes de baja de la BD');
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 15;
      const offset = (page - 1) * limit;

      // Construir condiciones WHERE
      const whereConditions: string[] = [];
      const queryParams: any[] = [];

      // Filtro por estado
      if (req.query.estado) {
        whereConditions.push('sb.estado = ?');
        queryParams.push(req.query.estado);
      }

      // Filtro por código de solicitud
      if (req.query.search) {
        whereConditions.push('(sb.codigo_solicitud LIKE ? OR sb.codigo_equipo LIKE ? OR sb.nombre_equipo LIKE ?)');
        const searchTerm = `%${req.query.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      // Filtro por tipo de baja
      if (req.query.tipo_baja) {
        whereConditions.push('sb.tipo_baja = ?');
        queryParams.push(req.query.tipo_baja);
      }

      // Filtro por rango de fechas
      if (req.query.fecha_desde) {
        whereConditions.push('DATE(sb.fecha_solicitud) >= ?');
        queryParams.push(req.query.fecha_desde);
      }

      if (req.query.fecha_hasta) {
        whereConditions.push('DATE(sb.fecha_solicitud) <= ?');
        queryParams.push(req.query.fecha_hasta);
      }

      // Construir WHERE clause
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      // Query principal
      const solicitudesQuery = `
        SELECT 
          sb.*
        FROM solicitudes_baja sb
        ${whereClause}
        ORDER BY sb.fecha_solicitud DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes_baja sb
        ${whereClause}
      `;

      console.log('📊 [Dar de Baja] Query principal:', solicitudesQuery);
      console.log('📊 [Dar de Baja] Parámetros:', queryParams);

      // Ejecutar ambas queries
      const [solicitudes, countResult] = await Promise.all([
        db.query(solicitudesQuery, queryParams),
        db.query(countQuery, queryParams)
      ]);

      const total = (countResult as any[])[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      console.log(`✅ [Dar de Baja] Obtenidas: ${(solicitudes as any[]).length} de ${total} total`);

      // Formatear fechas
      const solicitudesFormateadas = (solicitudes as SolicitudBajaReal[]).map(solicitud => ({
        ...solicitud,
        fecha_solicitud: new Date(solicitud.fecha_solicitud).toISOString(),
        fecha_aprobacion: solicitud.fecha_aprobacion ? 
          new Date(solicitud.fecha_aprobacion).toISOString() : null,
        fecha_ejecucion: solicitud.fecha_ejecucion ? 
          new Date(solicitud.fecha_ejecucion).toISOString() : null
      }));

      return res.json({
        success: true,
        message: 'Solicitudes de baja obtenidas exitosamente',
        data: {
          solicitudes: solicitudesFormateadas,
          pagination: {
            total,
            page,
            limit,
            totalPages
          }
        }
      });

    } catch (error) {
      console.error('❌ [Dar de Baja] Error obteniendo solicitudes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Obtener solicitud por ID
  static async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(`🔍 [Dar de Baja] Obteniendo solicitud ID: ${id}`);

      const solicitudQuery = `
        SELECT sb.*
        FROM solicitudes_baja sb
        WHERE sb.id = ?
      `;

      const resultado = await db.query(solicitudQuery, [id]);
      const solicitudes = resultado as SolicitudBajaReal[];

      if (!solicitudes || solicitudes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud de baja no encontrada'
        });
      }

      const solicitud = solicitudes[0];

      console.log(`✅ [Dar de Baja] Solicitud obtenida: ${id}`);

      res.json({
        success: true,
        message: 'Solicitud obtenida exitosamente',
        data: {
          ...solicitud,
          fecha_solicitud: new Date(solicitud.fecha_solicitud).toISOString(),
          fecha_aprobacion: solicitud.fecha_aprobacion ? 
            new Date(solicitud.fecha_aprobacion).toISOString() : null,
          fecha_ejecucion: solicitud.fecha_ejecucion ? 
            new Date(solicitud.fecha_ejecucion).toISOString() : null
        }
      });

    } catch (error) {
      console.error(`❌ [Dar de Baja] Error obteniendo solicitud ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Crear nueva solicitud de baja
  static async crear(req: Request, res: Response) {
    try {
      const {
        codigo_equipo,
        nombre_equipo,
        marca,
        modelo,
        numero_serie,
        ubicacion,
        responsable,
        solicitante,
        tipo_baja,
        justificacion_tecnica,
        justificacion_economica,
        valor_recuperable,
        observaciones
      } = req.body;

      console.log('📝 [Dar de Baja] Creando nueva solicitud:', req.body);

      // Validaciones básicas
      if (!codigo_equipo || !nombre_equipo || !responsable || !solicitante || !tipo_baja || !justificacion_tecnica) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: codigo_equipo, nombre_equipo, responsable, solicitante, tipo_baja, justificacion_tecnica'
        });
      }

      // Generar código de solicitud
      const codigoSolicitud = `SB-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      // Insertar nueva solicitud
      const insertQuery = `
        INSERT INTO solicitudes_baja (
          codigo_solicitud, codigo_equipo, nombre_equipo, marca, modelo, numero_serie,
          ubicacion, responsable, solicitante, tipo_baja, justificacion_tecnica,
          justificacion_economica, valor_recuperable, observaciones, estado, fecha_solicitud
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW())
      `;

      const resultado = await db.query(insertQuery, [
        codigoSolicitud,
        codigo_equipo,
        nombre_equipo,
        marca || null,
        modelo || null,
        numero_serie || null,
        ubicacion || null,
        responsable,
        solicitante,
        tipo_baja,
        justificacion_tecnica,
        justificacion_economica || null,
        valor_recuperable || null,
        observaciones || null
      ]);

      const insertId = (resultado as any).insertId;

      console.log(`✅ [Dar de Baja] Solicitud creada con ID: ${insertId}`);

      // Obtener la solicitud creada
      const solicitudCreada = await db.query(`
        SELECT * FROM solicitudes_baja WHERE id = ?
      `, [insertId]);

      const solicitud = (solicitudCreada as SolicitudBajaReal[])[0];

      res.status(201).json({
        success: true,
        message: 'Solicitud de baja creada exitosamente',
        data: {
          ...solicitud,
          fecha_solicitud: new Date(solicitud.fecha_solicitud).toISOString()
        }
      });

    } catch (error) {
      console.error('❌ [Dar de Baja] Error creando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Aprobar solicitud de baja
  static async aprobar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        evaluador, 
        observaciones_evaluacion, 
        recomendaciones, 
        valor_recuperable_aprobado 
      } = req.body;
      
      console.log(`🟢 [Dar de Baja] Aprobando solicitud ${id}:`, req.body);

      // Validaciones
      if (!evaluador || !observaciones_evaluacion) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: evaluador, observaciones_evaluacion'
        });
      }

      // Actualizar solicitud
      const updateQuery = `
        UPDATE solicitudes_baja 
        SET estado = 'aprobada', 
            fecha_aprobacion = NOW(),
            evaluador = ?, 
            observaciones_evaluacion = ?, 
            recomendaciones = ?,
            valor_recuperable_aprobado = ?
        WHERE id = ? AND estado = 'pendiente'
      `;

      const resultado = await db.query(updateQuery, [
        evaluador,
        observaciones_evaluacion,
        recomendaciones || null,
        valor_recuperable_aprobado || null,
        id
      ]);

      if ((resultado as any).affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada o no está en estado pendiente'
        });
      }

      console.log(`✅ [Dar de Baja] Solicitud ${id} aprobada`);

      // Obtener solicitud actualizada
      const solicitudActualizada = await db.query(`
        SELECT * FROM solicitudes_baja WHERE id = ?
      `, [id]);

      const solicitud = (solicitudActualizada as SolicitudBajaReal[])[0];

      res.json({
        success: true,
        message: 'Solicitud aprobada exitosamente',
        data: {
          ...solicitud,
          fecha_solicitud: new Date(solicitud.fecha_solicitud).toISOString(),
          fecha_aprobacion: solicitud.fecha_aprobacion ? 
            new Date(solicitud.fecha_aprobacion).toISOString() : null
        }
      });

    } catch (error) {
      console.error(`❌ [Dar de Baja] Error aprobando solicitud ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}