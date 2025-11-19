import { Request, Response } from 'express'
import db from '../config/database'

export class EquipoControllerReal {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const offset = (page - 1) * limit

      // Simple query without parameters first
      const query = `SELECT * FROM equipos WHERE activo = 1 ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`
      const equipos = await db.query(query)

      // Count total
      const countQuery = `SELECT COUNT(*) as total FROM equipos WHERE activo = 1`
      const countResult = await db.query(countQuery)
      const total = countResult[0].total

      res.json({
        success: true,
        data: {
          equipos,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        },
        message: 'Equipos obtenidos exitosamente'
      })

    } catch (error) {
      console.error('Error fetching equipos:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const query = `
        SELECT e.*
        FROM equipos e 
        WHERE e.id = ? AND e.activo = 1
      `

      const equipos = await db.query(query, [id])

      if (equipos.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Equipo no encontrado'
        })
        return
      }

      res.json({
        success: true,
        data: equipos[0],
        message: 'Equipo obtenido exitosamente'
      })

    } catch (error) {
      console.error('Error fetching equipo by ID:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_equipos,
          COUNT(CASE WHEN mtto = 'CORRECTIVO' THEN 1 END) as correctivos,
          COUNT(CASE WHEN mtto = 'PREVENTIVO' THEN 1 END) as preventivos,
          COUNT(CASE WHEN mtto = 'CALIBRACION' THEN 1 END) as calibraciones
        FROM equipos 
        WHERE activo = 1
      `

      const stats = await db.query(statsQuery)

      res.json({
        success: true,
        data: stats[0],
        message: 'Estadísticas de equipos obtenidas exitosamente'
      })

    } catch (error) {
      console.error('Error fetching equipos stats:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}