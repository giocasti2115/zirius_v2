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
 * Obtener todas las cotizaciones - VERSION ULTRA SIMPLIFICADA
 */
export const getAllCotizaciones = async (req: Request, res: Response): Promise<void> => {
  let connection: mysql.Connection | null = null
  
  try {
    connection = await mysql.createConnection(dbConfig)

    // Consulta simple sin filtros
    const mainQuery = `
      SELECT 
        c.id,
        c.id_cliente,
        c.creacion,
        c.id_estado,
        c.mensaje
      FROM cotizaciones c 
      ORDER BY c.creacion DESC
      LIMIT 5
    `

    const [cotizaciones] = await connection.execute(mainQuery)

    res.json({
      success: true,
      data: {
        cotizaciones,
        message: 'Consulta simplificada funcionando'
      }
    })

  } catch (error) {
    console.error('Error en getAllCotizaciones:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

/**
 * Obtener cotización por ID (stub)
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