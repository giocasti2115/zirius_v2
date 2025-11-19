import { Request, Response } from 'express'
import db from '../config/database'

export class DashboardControllerReal {
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      // Get basic counts from real database
      const [
        clientesResult,
        solicitudesResult,
        ordenesResult,
        solicitudesPorEstado,
        ordenesPorEstado
      ] = await Promise.all([
        db.query('SELECT COUNT(*) as total FROM clientes') as Promise<any[]>,
        db.query('SELECT COUNT(*) as total FROM solicitudes') as Promise<any[]>,
        db.query('SELECT COUNT(*) as total FROM ordenes') as Promise<any[]>,
        db.query(`
          SELECT e.estado, COUNT(s.id) as cantidad
          FROM solicitudes s
          LEFT JOIN solicitudes_estados e ON s.id_estado = e.id
          GROUP BY e.estado
        `) as Promise<any[]>,
        db.query(`
          SELECT e.estado, COUNT(o.id) as cantidad
          FROM ordenes o
          LEFT JOIN ordenes_estados e ON o.id_estado = e.id
          GROUP BY e.estado
        `) as Promise<any[]>
      ])

      const totalClientes = clientesResult[0]?.total || 0
      const totalSolicitudes = solicitudesResult[0]?.total || 0
      const totalOrdenes = ordenesResult[0]?.total || 0

      // Create dashboard stats with real data
      const stats = {
        clientes: {
          total: totalClientes,
          activos: totalClientes // Simplification
        },
        solicitudes: {
          total_solicitudes: totalSolicitudes,
          pendientes: 0,
          en_proceso: 0,
          completadas: 0,
          por_estado: solicitudesPorEstado
        },
        ordenes: {
          total_ordenes: totalOrdenes,
          pendientes: 0,
          en_proceso: 0,
          ejecutadas: 0,
          por_estado: ordenesPorEstado
        }
      }

      // Calculate counts by status
      solicitudesPorEstado.forEach((item: any) => {
        if (item.estado && item.estado.toLowerCase().includes('abierta')) {
          stats.solicitudes.pendientes += item.cantidad
        } else if (item.estado && item.estado.toLowerCase().includes('proceso')) {
          stats.solicitudes.en_proceso += item.cantidad
        } else if (item.estado && item.estado.toLowerCase().includes('cerrada')) {
          stats.solicitudes.completadas += item.cantidad
        }
      })

      ordenesPorEstado.forEach((item: any) => {
        if (item.estado && item.estado.toLowerCase().includes('abierta')) {
          stats.ordenes.pendientes += item.cantidad
        } else if (item.estado && item.estado.toLowerCase().includes('proceso')) {
          stats.ordenes.en_proceso += item.cantidad
        } else if (item.estado && item.estado.toLowerCase().includes('cerrada')) {
          stats.ordenes.ejecutadas += item.cantidad
        }
      })

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas del dashboard'
      })
    }
  }
}