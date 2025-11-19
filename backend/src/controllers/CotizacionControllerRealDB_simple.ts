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
 * Obtener todas las cotizaciones con filtros y paginación (versión simplificada)
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

    // Calcular paginación
    const pageNumber = Math.max(1, parseInt(page as string) || 1)
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit as string) || 10))
    const offset = (pageNumber - 1) * limitNumber

    // Construir la consulta base con filtros
    let whereConditions = ['1 = 1']
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

    const whereClause = whereConditions.length > 1 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM cotizaciones c 
      ${whereClause}
    `

    const [countResult] = await connection.execute(countQuery, queryParams)
    const totalRecords = (countResult as any[])[0].total
    const totalPages = Math.ceil(totalRecords / limitNumber)

    // Consulta principal simplificada
    const mainQuery = `
      SELECT 
        c.id,
        c.id_cliente,
        c.creacion,
        c.id_estado,
        c.mensaje,
        c.observacion_estado
      FROM cotizaciones c 
      ${whereClause}
      ORDER BY c.creacion DESC
      LIMIT ? OFFSET ?
    `

    // Clonar los parámetros para la consulta principal y agregar limit/offset
    const finalParams = [...queryParams, limitNumber, offset]
    const [cotizaciones] = await connection.execute(mainQuery, finalParams)

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
        stats: {
          total: totalRecords
        }
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
 * Obtener cotización por ID con detalles completos (stub)
 */
export const getCotizacionById = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'getCotizacionById no implementado aún'
  })
}

/**
 * Cambiar estado de una cotización (stub)
 */
export const cambiarEstadoCotizacion = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'cambiarEstadoCotizacion no implementado aún'
  })
}

/**
 * Obtener estadísticas de cotizaciones (stub)
 */
export const getEstadisticasCotizaciones = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'getEstadisticasCotizaciones no implementado aún'
  })
}