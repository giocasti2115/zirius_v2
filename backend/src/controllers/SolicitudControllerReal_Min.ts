import { Request, Response } from 'express'
import db from '../config/database'

export class SolicitudControllerReal {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Query mínima para BD real
      const query = `
        SELECT 
          s.id, s.creacion, s.id_creador, s.id_estado, s.aviso, s.observacion
        FROM solicitudes s
        ORDER BY s.id DESC
        LIMIT 5
      `

      const countQuery = 'SELECT COUNT(*) as total FROM solicitudes'

      const [solicitudes, countResult] = await Promise.all([
        db.query(query, []),
        db.query(countQuery, [])
      ])

      const total = (countResult as any[])[0]?.total || 0

      res.json({
        success: true,
        data: solicitudes,
        pagination: {
          page: 1,
          limit: 5,
          total,
          totalPages: Math.ceil(total / 5)
        }
      })
    } catch (error) {
      console.error('Error fetching solicitudes:', error)
      res.status(500).json({
        success: false,
        data: [],
        message: 'Error interno del servidor'
      })
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const totalResult = await db.query('SELECT COUNT(*) as total FROM solicitudes') as any[]

      res.json({
        success: true,
        data: { total: totalResult[0]?.total || 0 }
      })
    } catch (error) {
      console.error('Error fetching solicitud stats:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
}