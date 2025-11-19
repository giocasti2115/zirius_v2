import { Router } from 'express';
import { Request, Response } from 'express';
import db from '../config/database';

const router = Router();

// Ruta simple para obtener estadísticas de dar de baja
router.get('/stats', async (req: Request, res: Response) => {
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
});

// Ruta para obtener lista de solicitudes de baja
router.get('/public', async (req: Request, res: Response) => {
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
    const solicitudesFormateadas = (solicitudes as any[]).map(solicitud => ({
      ...solicitud,
      fecha_solicitud: new Date(solicitud.fecha_solicitud).toISOString(),
      fecha_aprobacion: solicitud.fecha_aprobacion ? 
        new Date(solicitud.fecha_aprobacion).toISOString() : null,
      fecha_ejecucion: solicitud.fecha_ejecucion ? 
        new Date(solicitud.fecha_ejecucion).toISOString() : null
    }));

    res.json({
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
});

// Ruta para obtener solicitud específica
router.get('/public/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🔍 [Dar de Baja] Obteniendo solicitud ID: ${id}`);

    const solicitudQuery = `
      SELECT sb.*
      FROM solicitudes_baja sb
      WHERE sb.id = ?
    `;

    const resultado = await db.query(solicitudQuery, [id]);
    const solicitudes = resultado as any[];

    if (!solicitudes || solicitudes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de baja no encontrada'
      });
    }

    const solicitud = solicitudes[0];

    console.log(`✅ [Dar de Baja] Solicitud obtenida: ${id}`);

    return res.json({
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
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;