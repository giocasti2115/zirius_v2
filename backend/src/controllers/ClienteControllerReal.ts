import { Request, Response } from 'express'
import db from '../config/database'
import { Cliente, ApiResponse, PaginatedResponse } from '../types/models'
import Joi from 'joi'

// Validation schemas - BD Real
const clienteCreateSchema = Joi.object({
  nombre: Joi.string().required().max(200),
  nit: Joi.string().optional().max(20),
  telefonos: Joi.string().optional().max(200),
  correo: Joi.string().email().optional().max(200),
  direccion: Joi.string().optional().max(200),
  activo: Joi.boolean().default(true)
})

const clienteUpdateSchema = Joi.object({
  nombre: Joi.string().max(200),
  nit: Joi.string().max(20),
  telefonos: Joi.string().max(200),
  correo: Joi.string().email().max(200),
  direccion: Joi.string().max(200),
  activo: Joi.boolean()
}).min(1)

export class ClienteControllerReal {
  /**
   * Obtener todos los clientes con paginación
   */
  static async getAll(req: Request, res: Response<PaginatedResponse<Cliente>>): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const search = req.query.search as string || ''
      const offset = (page - 1) * limit

      // Query simple para debug BD real
      let query = `
        SELECT id, nombre, nit, telefonos, correo, direccion, activo
        FROM clientes
        WHERE activo = 1
        ORDER BY nombre ASC 
        LIMIT 5
      `
      let countQuery = 'SELECT COUNT(*) as total FROM clientes WHERE activo = 1'
      const params: any[] = []

      const [clientes, countResult] = await Promise.all([
        db.query(query, params),
        db.query(countQuery, [])
      ])

      const total = (countResult as any[])[0]?.total || 0
      const totalPages = Math.ceil(total / limit)

      res.json({
        success: true,
        data: clientes as Cliente[],
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      })
    } catch (error) {
      console.error('Error getting clientes:', error)
      res.status(500).json({
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener cliente por ID
   */
  static async getById(req: Request, res: Response<ApiResponse<Cliente>>): Promise<void> {
    try {
      const { id } = req.params

      const query = `
        SELECT id, nombre, nit, telefonos, correo, direccion, activo
        FROM clientes 
        WHERE id = ?
      `

      const result = await db.query(query, [id])
      const clientes = result as Cliente[]

      if (!clientes || clientes.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        })
        return
      }

      res.json({
        success: true,
        data: clientes[0]
      })
    } catch (error) {
      console.error('Error getting cliente:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Crear nuevo cliente
   */
  static async create(req: Request, res: Response<ApiResponse<Cliente>>): Promise<void> {
    try {
      const { error, value } = clienteCreateSchema.validate(req.body)
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details?.[0]?.message || 'Error de validación'
        })
        return
      }

      const { nombre, nit, telefonos, correo, direccion, activo } = value

      const query = `
        INSERT INTO clientes (nombre, nit, telefonos, correo, direccion, activo)
        VALUES (?, ?, ?, ?, ?, ?)
      `

      const result = await db.query(query, [nombre, nit, telefonos, correo, direccion, activo])
      const insertResult = result as any

      // Obtener el cliente creado
      const getQuery = `
        SELECT id, nombre, nit, telefonos, correo, direccion, activo
        FROM clientes 
        WHERE id = ?
      `
      const clienteResult = await db.query(getQuery, [insertResult.insertId])
      const cliente = (clienteResult as Cliente[])[0]

      res.status(201).json({
        success: true,
        data: cliente,
        message: 'Cliente creado exitosamente'
      })
    } catch (error) {
      console.error('Error creating cliente:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Actualizar cliente
   */
  static async update(req: Request, res: Response<ApiResponse<Cliente>>): Promise<void> {
    try {
      const { id } = req.params
      const { error, value } = clienteUpdateSchema.validate(req.body)
      
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details?.[0]?.message || 'Error de validación'
        })
        return
      }

      // Construir query dinámico
      const fields = Object.keys(value)
      const setClause = fields.map(field => `${field} = ?`).join(', ')
      const values = [...Object.values(value), id]

      const query = `
        UPDATE clientes 
        SET ${setClause}, updated_at = NOW()
        WHERE id = ?
      `

      await db.query(query, values)

      // Obtener cliente actualizado
      const getQuery = `
        SELECT id, nombre, nit, telefonos, correo, direccion, activo
        FROM clientes 
        WHERE id = ?
      `
      const result = await db.query(getQuery, [id])
      const cliente = (result as Cliente[])[0]

      if (!cliente) {
        res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        })
        return
      }

      res.json({
        success: true,
        data: cliente,
        message: 'Cliente actualizado exitosamente'
      })
    } catch (error) {
      console.error('Error updating cliente:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Eliminar cliente (soft delete)
   */
  static async delete(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params

      const query = 'UPDATE clientes SET activo = false WHERE id = ?'
      await db.query(query, [id])

      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente'
      })
    } catch (error) {
      console.error('Error deleting cliente:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener sedes de un cliente
   */
  static async getSedes(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params

      const query = `
        SELECT s.id, s.nombre, s.direccion, s.telefono, s.contacto, s.activo, s.created_at, s.updated_at
        FROM sedes s
        WHERE s.id_cliente = ? AND s.activo = true
        ORDER BY s.nombre ASC
      `

      const sedes = await db.query(query, [id])

      res.json({
        success: true,
        data: sedes
      })
    } catch (error) {
      console.error('Error getting sedes:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener estadísticas de clientes
   */
  static async getStats(req: Request, res: Response<ApiResponse>): Promise<void> {
    try {
      const queries = [
        'SELECT COUNT(*) as total FROM clientes WHERE activo = true',
        'SELECT COUNT(*) as con_solicitudes FROM clientes c WHERE EXISTS(SELECT 1 FROM solicitudes s WHERE s.id_cliente = c.id)',
        'SELECT COUNT(*) as con_equipos FROM clientes c WHERE EXISTS(SELECT 1 FROM sedes se WHERE se.id_cliente = c.id AND EXISTS(SELECT 1 FROM equipos e WHERE e.id_sede = se.id))'
      ]

      const [totalResult, conSolicitudesResult, conEquiposResult] = await Promise.all(
        queries.map(query => db.query(query))
      )

      const stats = {
        total: (totalResult as any[])[0]?.total || 0,
        con_solicitudes: (conSolicitudesResult as any[])[0]?.con_solicitudes || 0,
        con_equipos: (conEquiposResult as any[])[0]?.con_equipos || 0
      }

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error getting stats:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
}