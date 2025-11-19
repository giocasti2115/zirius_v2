import { Request, Response } from "express";
import DatabaseConnection from "../config/database";

export class SolicitudesController {
  static async obtenerEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      console.log("Obteniendo estadísticas de solicitudes...");
      
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
          SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
        FROM solicitudes
      `;
      
      const resultado = await DatabaseConnection.query(query);
      const stats = Array.isArray(resultado) && resultado[0] ? resultado[0] : {};
      
      res.json({
        success: true,
        data: {
          total: stats.total || 0,
          pendientes: stats.pendientes || 0,
          en_proceso: stats.en_proceso || 0,
          completadas: stats.completadas || 0,
          canceladas: stats.canceladas || 0
        }
      });
    } catch (error) {
      console.error("Error en obtenerEstadisticas solicitudes:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor"
      });
    }
  }

  static async listar(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      const query = `SELECT * FROM solicitudes ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      const countQuery = "SELECT COUNT(*) as total FROM solicitudes";
      
      const [solicitudes, countResult] = await Promise.all([
        DatabaseConnection.query(query),
        DatabaseConnection.query(countQuery)
      ]);
      
      const total = Array.isArray(countResult) && countResult[0] ? countResult[0].total : 0;
      
      res.json({ 
        success: true, 
        data: { 
          solicitudes: solicitudes || [],
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        } 
      });
    } catch (error) {
      console.error("Error en listar solicitudes:", error);
      res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  }

  // Métodos placeholder para otros endpoints
  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    res.json({ success: false, message: "Método no implementado" });
  }

  static async crear(req: Request, res: Response): Promise<void> {
    res.json({ success: false, message: "Método no implementado" });
  }

  static async cambiarEstado(req: Request, res: Response): Promise<void> {
    res.json({ success: false, message: "Método no implementado" });
  }
}