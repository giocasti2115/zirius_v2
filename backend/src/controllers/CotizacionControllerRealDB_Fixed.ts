import { Request, Response } from 'express'
import mysql from 'mysql2/promise'

// Configuración de la base de datos
const dbConfig = {
  host: 'database',
  user: 'root',
  password: 'rootpassword',
  database: 'ziriuzco_ziriuz_real',
  port: 3306
}

/**
 * Estados válidos para las cotizaciones (según tabla cotizaciones_estados)
 */
const ESTADOS_COTIZACION = {
  PENDIENTE: 1,
  APROBADA: 2,
  RECHAZADA: 3
} as const

/**
 * Obtener todas las cotizaciones con filtros y paginación
 */
export const getAllCotizaciones = async (req: Request, res: Response): Promise<void> => {
  let connection: mysql.Connection | null = null
  
  try {
    const {
      page = 1,
      limit = 10,
      id_estado,
      id_cliente,
      fecha_desde,
      fecha_hasta,
      buscar
    } = req.query

    connection = await mysql.createConnection(dbConfig)

    // Construir la consulta base
    let whereConditions = []
    const queryParams: any[] = []

    // Filtro por estado
    if (id_estado) {
      whereConditions.push('c.id_estado = ?')
      queryParams.push(parseInt(id_estado as string))
    }

    // Filtro por cliente
    if (id_cliente) {
      whereConditions.push('c.id_cliente = ?')
      queryParams.push(parseInt(id_cliente as string))
    }

    // Filtro por rango de fechas
    if (fecha_desde) {
      whereConditions.push('DATE(c.creacion) >= ?')
      queryParams.push(fecha_desde)
    }

    if (fecha_hasta) {
      whereConditions.push('DATE(c.creacion) <= ?')
      queryParams.push(fecha_hasta)
    }

    // Filtro de búsqueda
    if (buscar && typeof buscar === 'string' && buscar.trim()) {
      whereConditions.push('(c.mensaje LIKE ? OR c.observacion_estado LIKE ?)')
      const searchTerm = `%${buscar.trim()}%`
      queryParams.push(searchTerm, searchTerm)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM cotizaciones c 
      ${whereClause}
    `

    const [countResult] = await connection.execute(countQuery, queryParams)
    const totalRecords = (countResult as any[])[0].total

    // Calcular paginación
    const pageNumber = Math.max(1, parseInt(page as string) || 1)
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit as string) || 10))
    const offset = (pageNumber - 1) * limitNumber
    const totalPages = Math.ceil(totalRecords / limitNumber)

    // Consulta principal con paginación - SIMPLIFICADA PARA EVITAR JOINS PROBLEMÁTICOS
    const mainQuery = `
      SELECT 
        c.id,
        c.id_cliente,
        c.id_orden,
        c.creacion,
        c.id_creador,
        c.id_estado,
        c.cambio_estado,
        c.id_cambiador,
        c.mensaje,
        c.observacion_estado,
        c.condiciones
      FROM cotizaciones c 
      ${whereClause}
      ORDER BY c.creacion DESC
      LIMIT ? OFFSET ?
    `

    // Preparar parámetros finales
    const finalParams = [...queryParams, limitNumber, offset]
    const [cotizaciones] = await connection.execute(mainQuery, finalParams)

    // Obtener estadísticas simples
    const [estadisticas] = await connection.execute(`
      SELECT 
        id_estado,
        COUNT(*) as cantidad
      FROM cotizaciones
      GROUP BY id_estado
    `)

    const stats = {
      total: totalRecords,
      por_estado: estadisticas
    }

    res.json({
      success: true,
      data: {
        cotizaciones,
        pagination: {
          current_page: pageNumber,
          total_pages: totalPages,
          total_records: totalRecords,
          limit: limitNumber,
          offset: offset
        },
        stats
      }
    })

  } catch (error) {
    console.error('Error en getAllCotizaciones:', error)
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
 * Obtener cotización por ID con detalles completos
 */
export const getCotizacionById = async (req: Request, res: Response): Promise<void> => {
  let connection: mysql.Connection | null = null
  
  try {
    const { id } = req.params
    const cotizacionId = parseInt(id || '0')

    if (!cotizacionId) {
      res.status(400).json({
        success: false,
        message: 'ID de cotización requerido'
      })
      return
    }

    connection = await mysql.createConnection(dbConfig)

    // Obtener cotización principal
    const [cotizacionResult] = await connection.execute(`
      SELECT 
        c.*
      FROM cotizaciones c 
      WHERE c.id = ?
    `, [cotizacionId])

    const cotizaciones = cotizacionResult as any[]
    
    if (cotizaciones.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      })
      return
    }

    const cotizacion = cotizaciones[0]

    // Obtener repuestos asociados
    const [repuestos] = await connection.execute(`
      SELECT * FROM cotizaciones_repuestos 
      WHERE id_cotizacion = ?
      ORDER BY id
    `, [cotizacionId])

    // Obtener items adicionales
    const [itemsAdicionales] = await connection.execute(`
      SELECT * FROM cotizaciones_items_adicionales 
      WHERE id_cotizacion = ?
      ORDER BY id
    `, [cotizacionId])

    res.json({
      success: true,
      data: {
        cotizacion,
        repuestos,
        items_adicionales: itemsAdicionales
      }
    })

  } catch (error) {
    console.error('Error en getCotizacionById:', error)
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
 * Cambiar estado de una cotización
 */
export const cambiarEstadoCotizacion = async (req: Request, res: Response): Promise<void> => {
  let connection: mysql.Connection | null = null
  
  try {
    const { id } = req.params
    const { id_estado, observacion } = req.body
    const cotizacionId = parseInt(id || '0')

    if (!cotizacionId) {
      res.status(400).json({
        success: false,
        message: 'ID de cotización requerido'
      })
      return
    }

    if (!id_estado || !Object.values(ESTADOS_COTIZACION).includes(id_estado)) {
      res.status(400).json({
        success: false,
        message: 'Estado válido requerido (1=Pendiente, 2=Aprobada, 3=Rechazada)'
      })
      return
    }

    connection = await mysql.createConnection(dbConfig)

    // Verificar que la cotización existe
    const [existeResult] = await connection.execute(
      'SELECT id FROM cotizaciones WHERE id = ?',
      [cotizacionId]
    )

    if ((existeResult as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      })
      return
    }

    // Actualizar estado
    await connection.execute(`
      UPDATE cotizaciones 
      SET 
        id_estado = ?,
        cambio_estado = CURRENT_TIMESTAMP,
        id_cambiador = ?,
        observacion_estado = ?
      WHERE id = ?
    `, [id_estado, 1, observacion || '', cotizacionId]) // Usar usuario ID 1 por defecto

    res.json({
      success: true,
      message: 'Estado de cotización actualizado correctamente'
    })

  } catch (error) {
    console.error('Error en cambiarEstadoCotizacion:', error)
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
 * Obtener estadísticas de cotizaciones
 */
export const getEstadisticasCotizaciones = async (req: Request, res: Response): Promise<void> => {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)

    // Estadísticas por estado
    const [estadoStats] = await connection.execute(`
      SELECT 
        c.id_estado,
        ce.estado as estado_nombre,
        COUNT(*) as cantidad
      FROM cotizaciones c
      LEFT JOIN cotizaciones_estados ce ON c.id_estado = ce.id
      GROUP BY c.id_estado, ce.estado
      ORDER BY c.id_estado
    `)

    // Estadísticas por mes (últimos 12 meses)
    const [mesStats] = await connection.execute(`
      SELECT 
        DATE_FORMAT(creacion, '%Y-%m') as mes,
        COUNT(*) as cantidad
      FROM cotizaciones 
      WHERE creacion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(creacion, '%Y-%m')
      ORDER BY mes DESC
    `)

    // Estadísticas generales
    const [generalStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_cotizaciones,
        COUNT(CASE WHEN id_estado = 1 THEN 1 END) as pendientes,
        COUNT(CASE WHEN id_estado = 2 THEN 1 END) as aprobadas,
        COUNT(CASE WHEN id_estado = 3 THEN 1 END) as rechazadas,
        COUNT(CASE WHEN DATE(creacion) = CURDATE() THEN 1 END) as hoy,
        COUNT(CASE WHEN creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as esta_semana,
        COUNT(CASE WHEN creacion >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as este_mes
      FROM cotizaciones
    `)

    res.json({
      success: true,
      data: {
        general: (generalStats as any[])[0],
        por_estado: estadoStats,
        por_mes: mesStats
      }
    })

  } catch (error) {
    console.error('Error en getEstadisticasCotizaciones:', error)
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