import { Request, Response } from 'express'
import db from '../config/database'

export class OrdenControllerReal {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Query mínima para BD real
      const query = `
        SELECT 
          o.id, o.id_solicitud, o.id_estado, o.creacion, 
          o.id_creador, o.total, o.observaciones_cierre
        FROM ordenes o
        ORDER BY o.id DESC
        LIMIT 10
      `

      const countQuery = 'SELECT COUNT(*) as total FROM ordenes'

      const [ordenes, countResult] = await Promise.all([
        db.query(query, []),
        db.query(countQuery, [])
      ])

      const total = (countResult as any[])[0]?.total || 0

      res.json({
        success: true,
        data: ordenes,
        pagination: {
          page: 1,
          limit: 10,
          total,
          totalPages: Math.ceil(total / 10)
        }
      })
    } catch (error) {
      console.error('Error fetching ordenes:', error)
      res.status(500).json({
        success: false,
        data: [],
        message: 'Error interno del servidor'
      })
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const [totalResult, estadosResult] = await Promise.all([
        db.query('SELECT COUNT(*) as total FROM ordenes') as Promise<any[]>,
        db.query(`
          SELECT e.estado, COUNT(o.id) as cantidad
          FROM ordenes o
          JOIN ordenes_estados e ON o.id_estado = e.id
          GROUP BY e.estado
        `) as Promise<any[]>
      ])

      const stats = {
        total: totalResult[0]?.total || 0,
        por_estado: estadosResult
      }

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error fetching orden stats:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
}