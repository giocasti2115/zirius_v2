import { Request, Response } from "express";
import DatabaseConnection from "../config/database";

export class CotizacionController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      const query = `SELECT * FROM cotizaciones ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      const countQuery = "SELECT COUNT(*) as total FROM cotizaciones";
      
      const [cotizaciones, countResult] = await Promise.all([
        DatabaseConnection.query(query),
        DatabaseConnection.query(countQuery)
      ]);
      
      const total = Array.isArray(countResult) && countResult[0] ? countResult[0].total : 0;
      
      res.json({ 
        success: true, 
        data: { 
          cotizaciones: cotizaciones || [],
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        } 
      });
    } catch (error) {
      console.error("Error en getAll cotizaciones:", error);
      res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas,
          SUM(CASE WHEN estado = 'enviada' THEN 1 ELSE 0 END) as enviadas,
          SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as rechazadas,
          SUM(CASE WHEN estado = 'borrador' THEN 1 ELSE 0 END) as borradores,
          SUM(monto_total) as monto_total
        FROM cotizaciones
      `;
      
      const stats = await DatabaseConnection.query(statsQuery);
      const result = Array.isArray(stats) && stats[0] ? stats[0] : {};
      
      res.json({
        success: true,
        data: {
          total: result.total || 0,
          aprobadas: result.aprobadas || 0,
          enviadas: result.enviadas || 0,
          rechazadas: result.rechazadas || 0,
          borradores: result.borradores || 0,
          montoTotal: parseFloat(result.monto_total || '0')
        }
      });
    } catch (error) {
      console.error("Error en getStats cotizaciones:", error);
      res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  }

  static async exportToExcel(req: Request, res: Response): Promise<void> {
    try {
      const query = "SELECT * FROM cotizaciones ORDER BY created_at DESC";
      const cotizaciones = await DatabaseConnection.query(query);
      
      // Por ahora devolvemos los datos en JSON, después se puede implementar Excel real
      res.json({
        success: true,
        data: { cotizaciones: cotizaciones || [] },
        message: "Datos preparados para exportación"
      });
    } catch (error) {
      console.error("Error en exportToExcel cotizaciones:", error);
      res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  }
}
