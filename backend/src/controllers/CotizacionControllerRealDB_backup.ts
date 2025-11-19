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
    let whereConditions = ['1 = 1']
    const queryParams: any[] = []

    // Filtro por estado
    if (id_estado) {
      whereConditions.push('c.id_estado = ?')
      queryParams.push(id_estado)
    }

    // Filtro por cliente
    if (id_cliente) {
      whereConditions.push('c.id_cliente = ?')
      queryParams.push(id_cliente)
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

    // Consulta principal con paginación
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
        c.condiciones,
        ce.estado as estado_nombre,
        cl.nombre as cliente_nombre,
        cl.correo as cliente_email,
        uc.nombre as creador_nombre,
        uch.nombre as cambiador_nombre
      FROM cotizaciones c 
      LEFT JOIN cotizaciones_estados ce ON c.id_estado = ce.id
      LEFT JOIN clientes cl ON c.id_cliente = cl.id
      LEFT JOIN usuarios uc ON c.id_creador = uc.id
      LEFT JOIN usuarios uch ON c.id_cambiador = uch.id
      ${whereClause}
      ORDER BY c.creacion DESC
      LIMIT ? OFFSET ?
    `

    // Clonar los parámetros para la consulta principal y agregar limit/offset
    const finalParams = [...queryParams, limitNumber, offset]
    const [cotizaciones] = await connection.execute(mainQuery, finalParams)

    // Obtener estadísticas
    const statsQuery = `
      SELECT 
        ce.estado,
        COUNT(*) as cantidad
      FROM cotizaciones c
      LEFT JOIN cotizaciones_estados ce ON c.id_estado = ce.id
      GROUP BY c.id_estado, ce.estado
    `

    const [estadisticas] = await connection.execute(statsQuery)

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
          has_next: pageNumber < totalPages,
          has_prev: pageNumber > 1
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
 * Obtener una cotización por ID con sus items
 */
export const getCotizacionById = async (req: Request, res: Response): Promise<void> => {
  let connection: mysql.Connection | null = null
  
  try {
    const { id } = req.params
    const cotizacionId = parseInt(id || '0')

    if (isNaN(cotizacionId)) {
      res.status(400).json({
        success: false,
        message: 'ID de cotización inválido'
      })
      return
    }

    connection = await mysql.createConnection(dbConfig)

    // Obtener cotización principal
    const [cotizacionResult] = await connection.execute(`
      SELECT 
        c.*,
        ce.estado as estado_nombre,
        cl.nombre as cliente_nombre,
        cl.correo as cliente_email,
        cl.telefonos as cliente_telefono,
        uc.nombre as creador_nombre,
        uch.nombre as cambiador_nombre
      FROM cotizaciones c 
      LEFT JOIN cotizaciones_estados ce ON c.id_estado = ce.id
      LEFT JOIN clientes cl ON c.id_cliente = cl.id
      LEFT JOIN usuarios uc ON c.id_creador = uc.id
      LEFT JOIN usuarios uch ON c.id_cambiador = uch.id
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

    // Obtener repuestos de la cotización
    const [repuestos] = await connection.execute(`
      SELECT 
        cr.*,
        r.referencia,
        r.descripcion as descripcion_repuesto
      FROM cotizaciones_repuestos cr
      LEFT JOIN repuestos r ON cr.id_repuesto = r.id
      WHERE cr.id_cotizacion = ?
    `, [cotizacionId])

    // Obtener items adicionales
    const [itemsAdicionales] = await connection.execute(`
      SELECT * FROM cotizaciones_items_adicionales 
      WHERE id_cotizacion = ?
    `, [cotizacionId])

    res.json({
      success: true,
      data: {
        ...cotizacion,
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
    const { id_estado, observacion = '' } = req.body
    const cotizacionId = parseInt(id || '0')

    if (isNaN(cotizacionId)) {
      res.status(400).json({
        success: false,
        message: 'ID de cotización inválido'
      })
      return
    }

    // Validar estado
    const estadosValidos = [ESTADOS_COTIZACION.PENDIENTE, ESTADOS_COTIZACION.APROBADA, ESTADOS_COTIZACION.RECHAZADA]
    const estadoNumerico = parseInt(id_estado)
    if (!estadosValidos.includes(estadoNumerico as 1 | 2 | 3)) {
      res.status(400).json({
        success: false,
        message: 'Estado inválido'
      })
      return
    }

    connection = await mysql.createConnection(dbConfig)

    // Verificar que la cotización existe
    const [existingResult] = await connection.execute(
      'SELECT id, id_estado FROM cotizaciones WHERE id = ?',
      [cotizacionId]
    )

    if ((existingResult as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      })
      return
    }

    // Actualizar el estado
    await connection.execute(
      `UPDATE cotizaciones 
       SET id_estado = ?, 
           cambio_estado = NOW(), 
           observacion_estado = ?
       WHERE id = ?`,
      [id_estado, observacion, cotizacionId]
    )

    // Obtener la cotización actualizada
    const [updatedCotizacion] = await connection.execute(
      `SELECT 
        c.*,
        ce.estado as estado_nombre,
        cl.nombre as cliente_nombre
      FROM cotizaciones c 
      LEFT JOIN cotizaciones_estados ce ON c.id_estado = ce.id
      LEFT JOIN clientes cl ON c.id_cliente = cl.id
      WHERE c.id = ?`,
      [cotizacionId]
    )

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: (updatedCotizacion as any[])[0]
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

    // Estadísticas generales
    const [generalStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_cotizaciones,
        COUNT(CASE WHEN id_estado = 1 THEN 1 END) as pendientes,
        COUNT(CASE WHEN id_estado = 2 THEN 1 END) as aprobadas,
        COUNT(CASE WHEN id_estado = 3 THEN 1 END) as rechazadas
      FROM cotizaciones
    `)

    // Estadísticas por mes (últimos 12 meses)
    const [monthlyStats] = await connection.execute(`
      SELECT 
        DATE_FORMAT(creacion, '%Y-%m') as mes,
        COUNT(*) as cantidad,
        COUNT(CASE WHEN id_estado = 2 THEN 1 END) as aprobadas
      FROM cotizaciones 
      WHERE creacion >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(creacion, '%Y-%m')
      ORDER BY mes DESC
    `)

    // Estados disponibles
    const [estados] = await connection.execute(`
      SELECT * FROM cotizaciones_estados ORDER BY id
    `)

    res.json({
      success: true,
      data: {
        estadisticas_generales: (generalStats as any[])[0],
        estadisticas_mensuales: monthlyStats,
        estados_disponibles: estados
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