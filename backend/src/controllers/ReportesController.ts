import { Request, Response } from 'express'
import mysql from 'mysql2/promise'

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'zirius2024',
  database: 'zirius_desarrollo',
  port: 3307
}

/**
 * Obtener reporte general del sistema
 */
export const getReporteGeneral = async (req: Request, res: Response) => {
  let connection: mysql.Connection | null = null
  
  try {
    const { fecha_desde, fecha_hasta } = req.query

    connection = await mysql.createConnection(dbConfig)

    // Construir filtros de fecha
    let fechaFilter = ''
    const params: any[] = []

    if (fecha_desde && fecha_hasta) {
      fechaFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?'
      params.push(fecha_desde, fecha_hasta)
    } else if (fecha_desde) {
      fechaFilter = 'WHERE DATE(created_at) >= ?'
      params.push(fecha_desde)
    } else if (fecha_hasta) {
      fechaFilter = 'WHERE DATE(created_at) <= ?'
      params.push(fecha_hasta)
    }

    // Estadísticas de órdenes
    const [ordenesStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_ordenes,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'en_proceso' THEN 1 END) as en_proceso,
        COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas,
        COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as canceladas,
        COUNT(CASE WHEN estado = 'cerrada' THEN 1 END) as cerradas,
        COALESCE(AVG(CASE WHEN fecha_cierre IS NOT NULL 
          THEN DATEDIFF(fecha_cierre, fecha_orden) END), 0) as tiempo_promedio_resolucion
      FROM ordenes 
      ${fechaFilter.replace('created_at', 'fecha_orden')} 
        AND activo = 1
    `, params)

    // Estadísticas de visitas
    const [visitasStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_visitas,
        COUNT(CASE WHEN estado = 'programada' THEN 1 END) as programadas,
        COUNT(CASE WHEN estado = 'en_curso' THEN 1 END) as en_curso,
        COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas,
        COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as canceladas,
        COUNT(CASE WHEN estado = 'reprogramada' THEN 1 END) as reprogramadas,
        COUNT(CASE WHEN estado = 'cerrada' THEN 1 END) as cerradas,
        COALESCE(AVG(CASE WHEN fecha_cierre IS NOT NULL 
          THEN DATEDIFF(fecha_cierre, fecha_visita) END), 0) as tiempo_promedio_cierre
      FROM visitas 
      ${fechaFilter} 
        AND activo = 1
    `, params)

    // Estadísticas de cotizaciones
    const [cotizacionesStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_cotizaciones,
        COUNT(CASE WHEN estado = 'borrador' THEN 1 END) as borradores,
        COUNT(CASE WHEN estado = 'enviada' THEN 1 END) as enviadas,
        COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) as aprobadas,
        COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) as rechazadas,
        COUNT(CASE WHEN estado = 'vencida' THEN 1 END) as vencidas,
        COALESCE(SUM(monto_total), 0) as monto_total,
        COALESCE(SUM(CASE WHEN estado = 'aprobada' THEN monto_total ELSE 0 END), 0) as monto_aprobado,
        COALESCE(AVG(monto_total), 0) as monto_promedio,
        ROUND(COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2) as tasa_aprobacion
      FROM cotizaciones 
      ${fechaFilter} 
        AND activo = 1
    `, params)

    // Evolución temporal por mes
    const [evolucionMensual] = await connection.execute(`
      SELECT 
        DATE_FORMAT(fecha_orden, '%Y-%m') as mes,
        COUNT(DISTINCT o.id) as ordenes,
        COUNT(DISTINCT v.id) as visitas,
        COUNT(DISTINCT c.id) as cotizaciones,
        COALESCE(SUM(c.monto_total), 0) as monto_cotizaciones
      FROM ordenes o
      LEFT JOIN visitas v ON DATE_FORMAT(v.created_at, '%Y-%m') = DATE_FORMAT(o.fecha_orden, '%Y-%m')
      LEFT JOIN cotizaciones c ON DATE_FORMAT(c.created_at, '%Y-%m') = DATE_FORMAT(o.fecha_orden, '%Y-%m')
      WHERE o.activo = 1 
        ${fechaFilter ? 'AND ' + fechaFilter.replace('created_at', 'o.fecha_orden') : ''}
      GROUP BY DATE_FORMAT(fecha_orden, '%Y-%m')
      ORDER BY mes DESC
      LIMIT 12
    `, params)

    res.json({
      success: true,
      data: {
        resumen: {
          ordenes: (ordenesStats as any[])[0],
          visitas: (visitasStats as any[])[0],
          cotizaciones: (cotizacionesStats as any[])[0]
        },
        evolucion_mensual: evolucionMensual,
        fecha_reporte: new Date().toISOString(),
        filtros: {
          fecha_desde: fecha_desde || null,
          fecha_hasta: fecha_hasta || null
        }
      }
    })

  } catch (error) {
    console.error('Error en getReporteGeneral:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

/**
 * Obtener métricas de rendimiento
 */
export const getMetricasRendimiento = async (req: Request, res: Response) => {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)

    // Métricas de órdenes
    const [metricas] = await connection.execute(`
      SELECT 
        -- Órdenes
        (SELECT COUNT(*) FROM ordenes WHERE activo = 1) as total_ordenes,
        (SELECT COUNT(*) FROM ordenes WHERE estado = 'completada' AND activo = 1) as ordenes_completadas,
        (SELECT COUNT(*) FROM ordenes WHERE estado = 'pendiente' AND activo = 1) as ordenes_pendientes,
        
        -- Tiempo promedio de resolución de órdenes (en días)
        (SELECT COALESCE(AVG(DATEDIFF(fecha_cierre, fecha_orden)), 0) 
         FROM ordenes 
         WHERE fecha_cierre IS NOT NULL AND activo = 1) as tiempo_promedio_ordenes,
        
        -- Visitas
        (SELECT COUNT(*) FROM visitas WHERE activo = 1) as total_visitas,
        (SELECT COUNT(*) FROM visitas WHERE estado = 'completada' AND activo = 1) as visitas_completadas,
        (SELECT COUNT(*) FROM visitas WHERE estado = 'programada' AND activo = 1) as visitas_programadas,
        
        -- Tiempo promedio de cierre de visitas (en días)
        (SELECT COALESCE(AVG(DATEDIFF(fecha_cierre, fecha_visita)), 0) 
         FROM visitas 
         WHERE fecha_cierre IS NOT NULL AND activo = 1) as tiempo_promedio_visitas,
        
        -- Cotizaciones
        (SELECT COUNT(*) FROM cotizaciones WHERE activo = 1) as total_cotizaciones,
        (SELECT COUNT(*) FROM cotizaciones WHERE estado = 'aprobada' AND activo = 1) as cotizaciones_aprobadas,
        (SELECT COALESCE(SUM(monto_total), 0) FROM cotizaciones WHERE estado = 'aprobada' AND activo = 1) as monto_aprobado,
        
        -- Tasa de conversión de cotizaciones
        (SELECT ROUND(
          COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 2
        ) FROM cotizaciones WHERE activo = 1) as tasa_conversion_cotizaciones
    `)

    // Productividad por mes (últimos 6 meses)
    const [productividadMensual] = await connection.execute(`
      SELECT 
        DATE_FORMAT(fecha_mes, '%Y-%m') as mes,
        COALESCE(ordenes_completadas, 0) as ordenes_completadas,
        COALESCE(visitas_completadas, 0) as visitas_completadas,
        COALESCE(cotizaciones_aprobadas, 0) as cotizaciones_aprobadas,
        COALESCE(monto_aprobado, 0) as monto_aprobado
      FROM (
        SELECT DATE_FORMAT(fecha_orden, '%Y-%m-01') as fecha_mes,
               COUNT(CASE WHEN estado = 'completada' THEN 1 END) as ordenes_completadas,
               NULL as visitas_completadas,
               NULL as cotizaciones_aprobadas,
               NULL as monto_aprobado
        FROM ordenes 
        WHERE activo = 1 AND fecha_orden >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(fecha_orden, '%Y-%m')
        
        UNION ALL
        
        SELECT DATE_FORMAT(created_at, '%Y-%m-01') as fecha_mes,
               NULL as ordenes_completadas,
               COUNT(CASE WHEN estado = 'completada' THEN 1 END) as visitas_completadas,
               NULL as cotizaciones_aprobadas,
               NULL as monto_aprobado
        FROM visitas 
        WHERE activo = 1 AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        
        UNION ALL
        
        SELECT DATE_FORMAT(created_at, '%Y-%m-01') as fecha_mes,
               NULL as ordenes_completadas,
               NULL as visitas_completadas,
               COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) as cotizaciones_aprobadas,
               SUM(CASE WHEN estado = 'aprobada' THEN monto_total ELSE 0 END) as monto_aprobado
        FROM cotizaciones 
        WHERE activo = 1 AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ) subquery
      ORDER BY mes DESC
    `)

    // Análisis de tendencias
    const [tendencias] = await connection.execute(`
      SELECT 
        'ordenes' as tipo,
        COUNT(*) as total_actual,
        LAG(COUNT(*)) OVER (ORDER BY MONTH(fecha_orden)) as total_anterior,
        ROUND(
          (COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY MONTH(fecha_orden))) * 100.0 / 
          NULLIF(LAG(COUNT(*)) OVER (ORDER BY MONTH(fecha_orden)), 0), 2
        ) as variacion_porcentual
      FROM ordenes 
      WHERE activo = 1 AND fecha_orden >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
      GROUP BY MONTH(fecha_orden)
      
      UNION ALL
      
      SELECT 
        'visitas' as tipo,
        COUNT(*) as total_actual,
        LAG(COUNT(*)) OVER (ORDER BY MONTH(created_at)) as total_anterior,
        ROUND(
          (COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY MONTH(created_at))) * 100.0 / 
          NULLIF(LAG(COUNT(*)) OVER (ORDER BY MONTH(created_at)), 0), 2
        ) as variacion_porcentual
      FROM visitas 
      WHERE activo = 1 AND created_at >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
      GROUP BY MONTH(created_at)
      
      UNION ALL
      
      SELECT 
        'cotizaciones' as tipo,
        COUNT(*) as total_actual,
        LAG(COUNT(*)) OVER (ORDER BY MONTH(created_at)) as total_anterior,
        ROUND(
          (COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY MONTH(created_at))) * 100.0 / 
          NULLIF(LAG(COUNT(*)) OVER (ORDER BY MONTH(created_at)), 0), 2
        ) as variacion_porcentual
      FROM cotizaciones 
      WHERE activo = 1 AND created_at >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
      GROUP BY MONTH(created_at)
    `)

    res.json({
      success: true,
      data: {
        metricas_generales: (metricas as any[])[0],
        productividad_mensual: productividadMensual,
        tendencias: tendencias,
        fecha_reporte: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error en getMetricasRendimiento:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

/**
 * Obtener reporte de actividad por período
 */
export const getReporteActividad = async (req: Request, res: Response) => {
  let connection: mysql.Connection | null = null
  
  try {
    const { 
      fecha_desde, 
      fecha_hasta, 
      tipo = 'diario', // diario, semanal, mensual
      modulo = 'todos' // ordenes, visitas, cotizaciones, todos
    } = req.query

    connection = await mysql.createConnection(dbConfig)

    // Determinar el formato de agrupación
    let formatoFecha = '%Y-%m-%d'
    let intervalo = 'DAY'
    
    switch (tipo) {
      case 'semanal':
        formatoFecha = '%Y-%u'
        intervalo = 'WEEK'
        break
      case 'mensual':
        formatoFecha = '%Y-%m'
        intervalo = 'MONTH'
        break
    }

    // Construir consulta base
    const fechaInicio = fecha_desde || '2024-01-01'
    const fechaFin = fecha_hasta || new Date().toISOString().split('T')[0]

    let actividad: any[] = []

    if (modulo === 'todos' || modulo === 'ordenes') {
      const [ordenesActividad] = await connection.execute(`
        SELECT 
          DATE_FORMAT(fecha_orden, ?) as periodo,
          'ordenes' as modulo,
          COUNT(*) as total,
          COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado = 'en_proceso' THEN 1 END) as en_proceso
        FROM ordenes 
        WHERE activo = 1 
          AND DATE(fecha_orden) BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(fecha_orden, ?)
        ORDER BY periodo DESC
      `, [formatoFecha, fechaInicio, fechaFin, formatoFecha])
      
      actividad = actividad.concat(ordenesActividad)
    }

    if (modulo === 'todos' || modulo === 'visitas') {
      const [visitasActividad] = await connection.execute(`
        SELECT 
          DATE_FORMAT(created_at, ?) as periodo,
          'visitas' as modulo,
          COUNT(*) as total,
          COUNT(CASE WHEN estado = 'completada' THEN 1 END) as completadas,
          COUNT(CASE WHEN estado = 'programada' THEN 1 END) as programadas,
          COUNT(CASE WHEN estado = 'en_curso' THEN 1 END) as en_curso
        FROM visitas 
        WHERE activo = 1 
          AND DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(created_at, ?)
        ORDER BY periodo DESC
      `, [formatoFecha, fechaInicio, fechaFin, formatoFecha])
      
      actividad = actividad.concat(visitasActividad)
    }

    if (modulo === 'todos' || modulo === 'cotizaciones') {
      const [cotizacionesActividad] = await connection.execute(`
        SELECT 
          DATE_FORMAT(created_at, ?) as periodo,
          'cotizaciones' as modulo,
          COUNT(*) as total,
          COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) as aprobadas,
          COUNT(CASE WHEN estado = 'enviada' THEN 1 END) as enviadas,
          COUNT(CASE WHEN estado = 'borrador' THEN 1 END) as borradores,
          COALESCE(SUM(monto_total), 0) as monto_total,
          COALESCE(SUM(CASE WHEN estado = 'aprobada' THEN monto_total ELSE 0 END), 0) as monto_aprobado
        FROM cotizaciones 
        WHERE activo = 1 
          AND DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE_FORMAT(created_at, ?)
        ORDER BY periodo DESC
      `, [formatoFecha, fechaInicio, fechaFin, formatoFecha])
      
      actividad = actividad.concat(cotizacionesActividad)
    }

    // Resumen del período
    const [resumen] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM ordenes WHERE activo = 1 AND DATE(fecha_orden) BETWEEN ? AND ?) as total_ordenes,
        (SELECT COUNT(*) FROM visitas WHERE activo = 1 AND DATE(created_at) BETWEEN ? AND ?) as total_visitas,
        (SELECT COUNT(*) FROM cotizaciones WHERE activo = 1 AND DATE(created_at) BETWEEN ? AND ?) as total_cotizaciones,
        (SELECT COALESCE(SUM(monto_total), 0) FROM cotizaciones WHERE activo = 1 AND DATE(created_at) BETWEEN ? AND ?) as monto_total_periodo
    `, [fechaInicio, fechaFin, fechaInicio, fechaFin, fechaInicio, fechaFin, fechaInicio, fechaFin])

    res.json({
      success: true,
      data: {
        actividad: actividad,
        resumen_periodo: (resumen as any[])[0],
        configuracion: {
          fecha_desde: fechaInicio,
          fecha_hasta: fechaFin,
          tipo_agrupacion: tipo,
          modulo: modulo
        },
        fecha_reporte: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error en getReporteActividad:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

/**
 * Exportar datos para reportes
 */
export const exportarDatos = async (req: Request, res: Response) => {
  let connection: mysql.Connection | null = null
  
  try {
    const { 
      tipo = 'csv', // csv, json
      modulo, // ordenes, visitas, cotizaciones
      fecha_desde,
      fecha_hasta 
    } = req.query

    if (!modulo) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro módulo es requerido'
      })
    }

    connection = await mysql.createConnection(dbConfig)

    let datos: any[] = []
    let filename = ''
    let consulta = ''

    // Construir filtros de fecha
    const fechaInicio = fecha_desde || '2024-01-01'
    const fechaFin = fecha_hasta || new Date().toISOString().split('T')[0]

    switch (modulo) {
      case 'ordenes':
        consulta = `
          SELECT 
            o.id,
            o.numero_orden,
            o.descripcion,
            o.estado,
            o.prioridad,
            o.fecha_orden,
            o.fecha_cierre,
            o.observaciones,
            o.created_at,
            DATEDIFF(COALESCE(o.fecha_cierre, NOW()), o.fecha_orden) as dias_transcurridos
          FROM ordenes o
          WHERE o.activo = 1 
            AND DATE(o.fecha_orden) BETWEEN ? AND ?
          ORDER BY o.fecha_orden DESC
        `
        filename = `ordenes_${fechaInicio}_${fechaFin}`
        break

      case 'visitas':
        consulta = `
          SELECT 
            v.id,
            v.descripcion,
            v.estado,
            v.fecha_visita,
            v.hora_inicio,
            v.hora_fin,
            v.observaciones,
            v.fecha_aprobacion,
            v.fecha_rechazo,
            v.fecha_cierre,
            v.motivo_rechazo,
            v.created_at
          FROM visitas v
          WHERE v.activo = 1 
            AND DATE(v.created_at) BETWEEN ? AND ?
          ORDER BY v.created_at DESC
        `
        filename = `visitas_${fechaInicio}_${fechaFin}`
        break

      case 'cotizaciones':
        consulta = `
          SELECT 
            c.id,
            c.numero_cotizacion,
            c.descripcion,
            c.monto_total,
            c.estado,
            c.fecha_vencimiento,
            c.solicitud_id,
            c.cliente_id,
            c.created_at,
            c.updated_at
          FROM cotizaciones c
          WHERE c.activo = 1 
            AND DATE(c.created_at) BETWEEN ? AND ?
          ORDER BY c.created_at DESC
        `
        filename = `cotizaciones_${fechaInicio}_${fechaFin}`
        break

      default:
        return res.status(400).json({
          success: false,
          message: 'Módulo no válido'
        })
    }

    const [resultados] = await connection.execute(consulta, [fechaInicio, fechaFin])
    datos = resultados as any[]

    // Verificar si hay datos
    if (datos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay datos para exportar'
      })
    }

    if (tipo === 'csv') {
      // Generar CSV
      const headers = Object.keys(datos[0]).join(',')
      const rows = datos.map(row => 
        Object.values(row).map(value => {
          // Escapar comillas y envolver en comillas si contiene comas
          const stringValue = String(value || '')
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }).join(',')
      ).join('\n')

      const csv = `${headers}\n${rows}`

      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`)
      res.send(csv)
      return // Agregar return explícito

    } else if (tipo === 'json') {
      // Generar JSON
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`)
      res.json({
        success: true,
        data: datos,
        metadata: {
          total_registros: datos.length,
          fecha_desde: fechaInicio,
          fecha_hasta: fechaFin,
          modulo: modulo,
          fecha_exportacion: new Date().toISOString()
        }
      })
      return // Agregar return explícito

    } else {
      return res.status(400).json({
        success: false,
        message: 'Tipo de exportación no válido. Use: csv o json'
      })
    }

  } catch (error) {
    console.error('Error en exportarDatos:', error)
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}