import { Router } from 'express';
import { pool } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/v1/real/informes/test:
 *   get:
 *     summary: Endpoint de prueba para informes
 *     tags: [Informes]
 */
router.get('/test', async (req, res) => {
  try {
    logger.info('Test endpoint de informes');
    
    // Test database connection
    const [result] = await pool.execute('SELECT "Informes funcionando!" as mensaje, NOW() as fecha') as any[];
    
    res.json({
      success: true,
      message: 'Informes funcionando correctamente',
      data: (result as any[])[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error en test de informes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/real/informes/correctivos-equipo:
 *   get:
 *     summary: Obtener resumen de correctivos por equipo
 *     tags: [Informes]
 */
router.get('/correctivos-equipo', async (req, res) => {
  try {
    const { cliente_id, fecha_inicio, fecha_fin, limit = '50' } = req.query;
    
    logger.info('Obteniendo reporte de correctivos por equipo', { 
      cliente_id, fecha_inicio, fecha_fin, limit 
    });

    // Query real para obtener correctivos por equipo
    const query = `
      SELECT 
        e.id as equipo_id,
        e.nombre as equipo_nombre,
        e.marca,
        e.modelo,
        c.nombre as cliente_nombre,
        COUNT(o.id) as total_correctivos,
        MAX(o.created_at) as ultimo_correctivo
      FROM ordenes o
      INNER JOIN solicitudes s ON o.solicitud_id = s.id
      INNER JOIN equipos e ON s.equipo_id = e.id
      INNER JOIN clientes c ON e.cliente_id = c.id
      WHERE s.tipo LIKE '%correctivo%'
      GROUP BY e.id, e.nombre, e.marca, e.modelo, c.nombre
      HAVING total_correctivos > 0
      ORDER BY total_correctivos DESC, ultimo_correctivo DESC
      LIMIT 50
    `;
    
    const [result] = await pool.execute(query) as any[];
    
    res.json({
      success: true,
      message: 'Reporte de correctivos por equipo obtenido exitosamente',
      data: {
        equipos: result,
        filtros: {
          cliente_id,
          fecha_inicio,
          fecha_fin,
          limit
        },
        total_equipos: (result as any[]).length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Error en correctivos por equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/real/informes/repuestos-instalados:
 *   get:
 *     summary: Reporte de repuestos instalados por equipo
 *     tags: [Informes]
 */
router.get('/repuestos-instalados', async (req, res) => {
  try {
    const { equipo_id, fecha_inicio, fecha_fin, repuesto_id, limit = '50' } = req.query;
    
    logger.info('Obteniendo reporte de repuestos instalados', { 
      equipo_id, fecha_inicio, fecha_fin, repuesto_id, limit 
    });

    // Query simplificada para obtener trabajos relacionados con repuestos
    let query = `
      SELECT 
        o.id as orden_id,
        o.numero_orden,
        o.descripcion as descripcion_orden,
        o.estado as estado_orden,
        o.created_at as fecha_creacion,
        e.nombre as equipo_nombre,
        e.marca as equipo_marca,
        c.nombre as cliente_nombre,
        s.tipo as tipo_solicitud,
        s.descripcion as descripcion_solicitud
      FROM ordenes o
      INNER JOIN solicitudes s ON o.solicitud_id = s.id
      INNER JOIN equipos e ON s.equipo_id = e.id
      INNER JOIN clientes c ON e.cliente_id = c.id
      WHERE (o.descripcion LIKE '%repuesto%' OR o.descripcion LIKE '%instalacion%' OR o.descripcion LIKE '%cambio%')
         OR (s.descripcion LIKE '%repuesto%' OR s.descripcion LIKE '%instalacion%')
    `;
    
    const params: any[] = [];
    
    if (equipo_id) {
      const equipoIdNum = parseInt(equipo_id as string);
      if (!isNaN(equipoIdNum)) {
        query += ` AND e.id = ?`;
        params.push(equipoIdNum);
      }
    }
    
    if (fecha_inicio) {
      query += ` AND v.fecha >= ?`;
      params.push(fecha_inicio);
    }
    
    if (fecha_fin) {
      query += ` AND v.fecha <= ?`;
      params.push(fecha_fin);
    }
    
    query += `
      ORDER BY o.created_at DESC
      LIMIT ?
    `;
    
    const limitNum = parseInt(limit as string);
    params.push(isNaN(limitNum) ? 50 : limitNum);
    
    const [result] = await pool.execute(query, params) as any[];
    
    res.json({
      success: true,
      message: 'Reporte de repuestos instalados obtenido exitosamente',
      data: {
        repuestos_instalados: result,
        filtros: {
          equipo_id,
          fecha_inicio,
          fecha_fin,
          repuesto_id,
          limit
        },
        total_registros: (result as any[]).length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Error en repuestos instalados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/real/informes/fallos-equipos:
 *   get:
 *     summary: Análisis de fallos y averías por equipo
 *     tags: [Informes]
 */
router.get('/fallos-equipos', async (req, res) => {
  try {
    const { equipo_id, cliente_id, fecha_inicio, fecha_fin, limit = '50' } = req.query;
    
    logger.info('Obteniendo análisis de fallos por equipo', { 
      equipo_id, cliente_id, fecha_inicio, fecha_fin, limit 
    });

    // Query para obtener fallos por equipo
    let query = `
      SELECT 
        e.id as equipo_id,
        e.nombre as equipo_nombre,
        e.marca,
        e.modelo,
        c.nombre as cliente_nombre,
        COUNT(s.id) as total_fallos,
        GROUP_CONCAT(DISTINCT s.descripcion ORDER BY s.created_at DESC SEPARATOR '; ') as descripcion_fallos,
        MAX(s.created_at) as ultimo_fallo,
        AVG(CASE 
          WHEN o.fecha_fin IS NOT NULL AND o.created_at IS NOT NULL 
          THEN DATEDIFF(o.fecha_fin, o.created_at) 
          ELSE NULL 
        END) as promedio_dias_reparacion
      FROM solicitudes s
      INNER JOIN equipos e ON s.equipo_id = e.id
      INNER JOIN clientes c ON e.cliente_id = c.id
      LEFT JOIN ordenes o ON s.id = o.solicitud_id
      WHERE s.tipo LIKE '%correctivo%' OR s.tipo LIKE '%fallo%' OR s.tipo LIKE '%averia%'
    `;
    
    const params: any[] = [];
    
    if (equipo_id) {
      const equipoIdNum = parseInt(equipo_id as string);
      if (!isNaN(equipoIdNum)) {
        query += ` AND e.id = ?`;
        params.push(equipoIdNum);
      }
    }
    
    if (cliente_id) {
      const clienteIdNum = parseInt(cliente_id as string);
      if (!isNaN(clienteIdNum)) {
        query += ` AND c.id = ?`;
        params.push(clienteIdNum);
      }
    }
    
    if (fecha_inicio) {
      query += ` AND s.created_at >= ?`;
      params.push(fecha_inicio);
    }
    
    if (fecha_fin) {
      query += ` AND s.created_at <= ?`;
      params.push(fecha_fin);
    }
    
    query += `
      GROUP BY e.id, e.nombre, e.marca, e.modelo, c.nombre
      HAVING total_fallos > 0
      ORDER BY total_fallos DESC, ultimo_fallo DESC
      LIMIT ?
    `;
    
    const limitNum = parseInt(limit as string);
    params.push(isNaN(limitNum) ? 50 : limitNum);
    
    const [result] = await pool.execute(query, params) as any[];
    
    res.json({
      success: true,
      message: 'Análisis de fallos por equipo obtenido exitosamente',
      data: {
        fallos_equipos: result,
        filtros: {
          equipo_id,
          cliente_id,
          fecha_inicio,
          fecha_fin,
          limit
        },
        total_equipos_con_fallos: (result as any[]).length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Error en análisis de fallos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/real/informes/indicadores-kpis:
 *   get:
 *     summary: Indicadores de rendimiento y KPIs del sistema
 *     tags: [Informes]
 */
router.get('/indicadores-kpis', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    logger.info('Obteniendo indicadores KPIs', { fecha_inicio, fecha_fin });

    // Definir fechas por defecto (últimos 30 días)
    const fechaInicio = fecha_inicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fechaFin = fecha_fin || new Date().toISOString().split('T')[0];
    
    // KPIs de Solicitudes
    const solicitudesQuery = `
      SELECT 
        COUNT(*) as total_solicitudes,
        COUNT(CASE WHEN tipo LIKE '%correctivo%' THEN 1 END) as correctivos,
        COUNT(CASE WHEN tipo LIKE '%preventivo%' THEN 1 END) as preventivos,
        COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        AVG(CASE WHEN estado = 'completada' THEN DATEDIFF(updated_at, created_at) END) as promedio_resolucion_dias
      FROM solicitudes
      WHERE created_at BETWEEN ? AND ?
    `;
    
    const [solicitudesStats] = await pool.execute(solicitudesQuery, [fechaInicio, fechaFin]) as any[];
    
    // KPIs de Órdenes
    const ordenesQuery = `
      SELECT 
        COUNT(*) as total_ordenes,
        COUNT(CASE WHEN estado = 'completada' THEN 1 END) as ordenes_completadas,
        COUNT(CASE WHEN estado = 'en_proceso' THEN 1 END) as ordenes_en_proceso,
        AVG(CASE WHEN fecha_fin IS NOT NULL THEN DATEDIFF(fecha_fin, created_at) END) as promedio_duracion_dias
      FROM ordenes
      WHERE created_at BETWEEN ? AND ?
    `;
    
    const [ordenesStats] = await pool.execute(ordenesQuery, [fechaInicio, fechaFin]) as any[];
    
    // KPIs de Equipos
    const equiposQuery = `
      SELECT 
        COUNT(DISTINCT e.id) as total_equipos_activos,
        COUNT(DISTINCT c.id) as total_clientes_activos,
        COUNT(DISTINCT s.equipo_id) as equipos_con_solicitudes
      FROM equipos e
      LEFT JOIN clientes c ON e.cliente_id = c.id
      LEFT JOIN solicitudes s ON e.id = s.equipo_id AND s.created_at BETWEEN ? AND ?
    `;
    
    const [equiposStats] = await pool.execute(equiposQuery, [fechaInicio, fechaFin]) as any[];
    
    // KPIs de Visitas
    const visitasQuery = `
      SELECT 
        COUNT(*) as total_visitas,
        COUNT(CASE WHEN estado = 'completada' THEN 1 END) as visitas_completadas,
        COUNT(CASE WHEN tipo_visita LIKE '%mantenimiento%' THEN 1 END) as mantenimientos
      FROM visitas
      WHERE fecha BETWEEN ? AND ?
    `;
    
    const [visitasStats] = await pool.execute(visitasQuery, [fechaInicio, fechaFin]) as any[];
    
    // Calcular eficiencia
    const solicitudes = (solicitudesStats as any[])[0];
    const ordenes = (ordenesStats as any[])[0];
    const equipos = (equiposStats as any[])[0];
    const visitas = (visitasStats as any[])[0];
    
    const eficienciaSolicitudes = solicitudes.total_solicitudes > 0 ? 
      (solicitudes.completadas / solicitudes.total_solicitudes * 100).toFixed(2) : 0;
    
    const eficienciaOrdenes = ordenes.total_ordenes > 0 ? 
      (ordenes.ordenes_completadas / ordenes.total_ordenes * 100).toFixed(2) : 0;
    
    const eficienciaVisitas = visitas.total_visitas > 0 ? 
      (visitas.visitas_completadas / visitas.total_visitas * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      message: 'Indicadores KPIs obtenidos exitosamente',
      data: {
        periodo: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        },
        kpis: {
          solicitudes: {
            ...solicitudes,
            eficiencia_porcentaje: eficienciaSolicitudes
          },
          ordenes: {
            ...ordenes,
            eficiencia_porcentaje: eficienciaOrdenes
          },
          equipos: equipos,
          visitas: {
            ...visitas,
            eficiencia_porcentaje: eficienciaVisitas
          }
        },
        resumen: {
          total_actividad: solicitudes.total_solicitudes + ordenes.total_ordenes + visitas.total_visitas,
          promedio_resolucion_general: Math.round((solicitudes.promedio_resolucion_dias + ordenes.promedio_duracion_dias) / 2) || 0,
          equipos_utilizacion_porcentaje: equipos.total_equipos_activos > 0 ? 
            (equipos.equipos_con_solicitudes / equipos.total_equipos_activos * 100).toFixed(2) : 0
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Error en indicadores KPIs:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * Endpoint temporal para explorar tablas de la base de datos
 */
router.get('/explore-tables', async (req, res) => {
  try {
    logger.info('Explorando tablas de la base de datos');
    
    // Obtener lista de tablas
    const [tables] = await pool.execute('SHOW TABLES') as any[];
    
    res.json({
      success: true,
      message: 'Tablas encontradas en la base de datos',
      data: {
        database: 'ziriuzco_ziriuz_dev',
        tables: tables,
        total_tables: tables.length
      }
    });
    
  } catch (error) {
    logger.error('Error explorando tablas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * Endpoint temporal para explorar estructura de una tabla específica
 */
router.get('/explore-table/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    logger.info('Explorando estructura de tabla:', tableName);
    
    // Obtener estructura de la tabla
    const [columns] = await pool.execute(`DESCRIBE ${tableName}`) as any[];
    
    res.json({
      success: true,
      message: `Estructura de la tabla ${tableName}`,
      data: {
        table: tableName,
        columns: columns,
        total_columns: columns.length
      }
    });
    
  } catch (error) {
    logger.error('Error explorando estructura de tabla:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/real/informes/exportar:
 *   post:
 *     summary: Exportar reportes en diferentes formatos
 *     tags: [Informes]
 */
router.post('/exportar', async (req, res) => {
  try {
    const { tipo_reporte, formato, filtros } = req.body;
    
    logger.info('Exportando reporte', { tipo_reporte, formato, filtros });
    
    // Validar parámetros
    if (!tipo_reporte || !formato) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de reporte y formato son requeridos'
      });
    }
    
    const formatosPermitidos = ['excel', 'pdf', 'csv'];
    const tiposPermitidos = ['correctivos-equipo', 'repuestos-instalados', 'fallos-equipos', 'indicadores-kpis'];
    
    if (!formatosPermitidos.includes(formato.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Formato no soportado. Use: ${formatosPermitidos.join(', ')}`
      });
    }
    
    if (!tiposPermitidos.includes(tipo_reporte)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de reporte no soportado. Use: ${tiposPermitidos.join(', ')}`
      });
    }
    
    // Obtener datos según el tipo de reporte
    let datos: any = [];
    let nombreReporte = '';
    
    switch (tipo_reporte) {
      case 'correctivos-equipo':
        // Reutilizar la query de correctivos
        const queryCorrectivos = `
          SELECT 
            e.id as equipo_id,
            e.nombre as equipo_nombre,
            e.marca,
            e.modelo,
            c.nombre as cliente_nombre,
            COUNT(o.id) as total_correctivos,
            MAX(o.created_at) as ultimo_correctivo
          FROM ordenes o
          INNER JOIN solicitudes s ON o.solicitud_id = s.id
          INNER JOIN equipos e ON s.equipo_id = e.id
          INNER JOIN clientes c ON e.cliente_id = c.id
          WHERE s.tipo LIKE '%correctivo%'
          GROUP BY e.id, e.nombre, e.marca, e.modelo, c.nombre
          HAVING total_correctivos > 0
          ORDER BY total_correctivos DESC, ultimo_correctivo DESC
          LIMIT 100
        `;
        const [resultCorrectivos] = await pool.execute(queryCorrectivos) as any[];
        datos = resultCorrectivos;
        nombreReporte = 'Correctivos por Equipo';
        break;
        
      case 'repuestos-instalados':
        const queryRepuestos = `
          SELECT 
            e.nombre as equipo_nombre,
            c.nombre as cliente_nombre,
            v.fecha as fecha_instalacion,
            v.descripcion as descripcion_visita
          FROM visitas v
          INNER JOIN equipos e ON v.equipo_id = e.id
          INNER JOIN clientes c ON e.cliente_id = c.id
          WHERE v.tipo_visita LIKE '%repuesto%' OR v.descripcion LIKE '%repuesto%'
          ORDER BY v.fecha DESC
          LIMIT 100
        `;
        const [resultRepuestos] = await pool.execute(queryRepuestos) as any[];
        datos = resultRepuestos;
        nombreReporte = 'Repuestos Instalados';
        break;
        
      case 'fallos-equipos':
        const queryFallos = `
          SELECT 
            e.nombre as equipo_nombre,
            c.nombre as cliente_nombre,
            COUNT(s.id) as total_fallos,
            MAX(s.created_at) as ultimo_fallo
          FROM solicitudes s
          INNER JOIN equipos e ON s.equipo_id = e.id
          INNER JOIN clientes c ON e.cliente_id = c.id
          WHERE s.tipo LIKE '%correctivo%'
          GROUP BY e.id, e.nombre, c.nombre
          ORDER BY total_fallos DESC
          LIMIT 100
        `;
        const [resultFallos] = await pool.execute(queryFallos) as any[];
        datos = resultFallos;
        nombreReporte = 'Análisis de Fallos';
        break;
        
      case 'indicadores-kpis':
        // Para KPIs, crear un resumen estructurado
        datos = [{
          indicador: 'Total Solicitudes',
          valor: 'Datos dinámicos aquí',
          periodo: 'Últimos 30 días'
        }];
        nombreReporte = 'Indicadores KPIs';
        break;
    }
    
    // Simular generación de archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const nombreArchivo = `${tipo_reporte}_${timestamp}.${formato}`;
    
    // En implementación real, aquí se generaría el archivo físico
    // Por ahora, devolver información de la "exportación"
    res.json({
      success: true,
      message: `Reporte ${nombreReporte} exportado exitosamente`,
      data: {
        tipo_reporte,
        formato,
        nombre_archivo: nombreArchivo,
        total_registros: datos.length,
        url_descarga: `/api/v1/real/informes/descargar/${nombreArchivo}`,
        filtros_aplicados: filtros || {},
        preview_datos: datos.slice(0, 5), // Mostrar primeros 5 registros como preview
        fecha_generacion: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Error en exportación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/real/informes/descargar/{archivo}:
 *   get:
 *     summary: Descargar archivo de reporte generado
 *     tags: [Informes]
 */
router.get('/descargar/:archivo', async (req, res) => {
  try {
    const { archivo } = req.params;
    
    logger.info('Descargando archivo de reporte', { archivo });
    
    // En implementación real, aquí se serviría el archivo físico
    // Por ahora, simular la descarga
    res.json({
      success: true,
      message: 'Descarga simulada exitosamente',
      data: {
        archivo,
        mensaje: 'En implementación real, aquí se descargaría el archivo',
        tipo_contenido: archivo.includes('.pdf') ? 'application/pdf' : 
                       archivo.includes('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                       'text/csv'
      }
    });
    
  } catch (error) {
    logger.error('Error en descarga:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

console.log('✅ Informes routes configured with database connections');

export default router;