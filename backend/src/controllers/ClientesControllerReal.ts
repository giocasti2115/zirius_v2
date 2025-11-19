import { Request, Response } from "express";
import DatabaseConnection from "../config/database";

export class ClientesController {
  static async obtenerEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      console.log("Obteniendo estadísticas de clientes...");
      
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
          SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos
        FROM clientes
      `;
      
      const resultado = await DatabaseConnection.query(query);
      const stats = Array.isArray(resultado) && resultado[0] ? resultado[0] : {};
      
      res.json({
        success: true,
        data: {
          total: stats.total || 0,
          activos: stats.activos || 0,
          inactivos: stats.inactivos || 0
        }
      });
    } catch (error) {
      console.error("Error en obtenerEstadisticas clientes:", error);
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
      const buscar = req.query.buscar as string;
      
      let query = `SELECT * FROM clientes`;
      let countQuery = `SELECT COUNT(*) as total FROM clientes`;
      const params: any[] = [];
      const countParams: any[] = [];
      
      // Agregar filtro de búsqueda si existe
      if (buscar && buscar.trim()) {
        const whereClause = ` WHERE nombre LIKE ? OR documento LIKE ? OR email LIKE ?`;
        query += whereClause;
        countQuery += whereClause;
        const searchTerm = `%${buscar.trim()}%`;
        params.push(searchTerm, searchTerm, searchTerm);
        countParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      
      const [clientes, countResult] = await Promise.all([
        DatabaseConnection.query(query, params),
        DatabaseConnection.query(countQuery, countParams)
      ]);
      
      const total = Array.isArray(countResult) && countResult[0] ? countResult[0].total : 0;
      
      res.json({ 
        success: true, 
        data: { 
          clientes: clientes || [],
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        } 
      });
    } catch (error) {
      console.error("Error en listar clientes:", error);
      res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  }

  static async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const query = `SELECT * FROM clientes WHERE id = ? AND activo = 1`;
      const resultado = await DatabaseConnection.query(query, [id]);
      
      if (!Array.isArray(resultado) || resultado.length === 0) {
        res.status(404).json({
          success: false,
          message: "Cliente no encontrado"
        });
        return;
      }
      
      res.json({
        success: true,
        data: resultado[0]
      });
    } catch (error) {
      console.error("Error en obtenerPorId cliente:", error);
      res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  }

  static async crear(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, documento, telefono, email, direccion } = req.body;
      
      // Validaciones básicas
      if (!nombre || nombre.trim() === '') {
        res.status(400).json({
          success: false,
          message: "El nombre es requerido"
        });
        return;
      }
      
      const query = `
        INSERT INTO clientes (nombre, documento, telefono, email, direccion, activo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
      `;
      
      const resultado = await DatabaseConnection.query(query, [
        nombre.trim(),
        documento || null,
        telefono || null,
        email || null,
        direccion || null
      ]);
      
      res.status(201).json({
        success: true,
        message: "Cliente creado exitosamente",
        data: { 
          id: (resultado as any).insertId,
          nombre: nombre.trim(),
          documento,
          telefono,
          email,
          direccion
        }
      });
    } catch (error) {
      console.error("Error en crear cliente:", error);
      res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  }

  static async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nombre, documento, telefono, email, direccion } = req.body;
      
      // Verificar que el cliente existe
      const existeQuery = `SELECT id FROM clientes WHERE id = ? AND activo = 1`;
      const existe = await DatabaseConnection.query(existeQuery, [id]);
      
      if (!Array.isArray(existe) || existe.length === 0) {
        res.status(404).json({
          success: false,
          message: "Cliente no encontrado"
        });
        return;
      }
      
      const query = `
        UPDATE clientes 
        SET nombre = ?, documento = ?, telefono = ?, email = ?, direccion = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      await DatabaseConnection.query(query, [
        nombre || null,
        documento || null,
        telefono || null,
        email || null,
        direccion || null,
        id
      ]);
      
      res.json({
        success: true,
        message: "Cliente actualizado exitosamente"
      });
    } catch (error) {
      console.error("Error en actualizar cliente:", error);
      res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  }

  static async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Soft delete - marcamos como inactivo
      const query = `UPDATE clientes SET activo = 0, updated_at = NOW() WHERE id = ?`;
      const resultado = await DatabaseConnection.query(query, [id]);
      
      if ((resultado as any).affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: "Cliente no encontrado"
        });
        return;
      }
      
      res.json({
        success: true,
        message: "Cliente eliminado exitosamente"
      });
    } catch (error) {
      console.error("Error en eliminar cliente:", error);
      res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
  }
}