import { Request, Response } from 'express'
import db from '../config/database'

export class VisitaControllerTest {
  /**
   * Prueba simple de listado de visitas
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const query = `
        SELECT 
          id,
          id_orden,
          id_estado,
          fecha_inicio,
          duracion
        FROM visitas 
        WHERE activo = 1
        ORDER BY fecha_inicio DESC
        LIMIT 5
      `
      
      const visitas = await db.query(query, [])

      res.json({
        success: true,
        data: visitas,
        count: (visitas as any[]).length
      })
    } catch (error) {
      console.error('Error in test controller:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error
      })
    }
  }
}