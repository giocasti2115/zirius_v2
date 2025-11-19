import { Request, Response } from 'express'
import db from '../config/database'

export class OrdenControllerReal {
  /**
   * Obtener todas las órdenes con paginación y filtros
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const offset = (page - 1) * limit

      // Simple query without complex JOINs
      const query = `
        SELECT 
          o.id,
          o.id_solicitud,
          o.id_estado,
          o.creacion,
          o.cierre,
          o.observaciones_cierre,
          o.nombre_recibe,
          o.cedula_recibe,
          o.total,
          o.id_creador
        FROM ordenes o
        ORDER BY o.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `

      const countQuery = `SELECT COUNT(*) as total FROM ordenes`
      
      const [ordenes, countResult] = await Promise.all([
        db.query(query),
        db.query(countQuery)
      ])

      const total = (countResult as any[])[0]?.total || 0
      const totalPages = Math.ceil(total / limit)

      res.json({
        success: true,
        data: ordenes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages
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

  /**
   * Obtener orden por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const query = `
        SELECT 
          o.id,
          o.id_solicitud,
          o.id_estado,
          oe.estado as estado_nombre,
          o.creacion,
          o.cierre,
          o.observaciones_cierre,
          o.nombre_recibe,
          o.cedula_recibe,
          o.total,
          o.id_creador,
          u.nombre as creador_nombre,
          s.aviso as solicitud_aviso,
          s.observacion as solicitud_observacion
        FROM ordenes o
        LEFT JOIN ordenes_estados oe ON o.id_estado = oe.id
        LEFT JOIN usuarios u ON o.id_creador = u.id
        LEFT JOIN solicitudes s ON o.id_solicitud = s.id
        WHERE o.id = ?
      `

      const result = await db.query(query, [id]) as any[]

      if (result.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        })
        return
      }

      // Obtener cambios de estado de la orden
      const cambiosQuery = `
        SELECT 
          oc.id,
          oc.comentario,
          oc.fecha,
          oc.id_creador,
          u.nombre as creador_nombre
        FROM ordenes_cambios oc
        LEFT JOIN usuarios u ON oc.id_creador = u.id
        WHERE oc.id_orden = ? AND oc.activo = 1
        ORDER BY oc.fecha DESC
      `

      const cambios = await db.query(cambiosQuery, [id])

      res.json({
        success: true,
        data: {
          ...result[0],
          cambios
        }
      })
    } catch (error) {
      console.error('Error fetching orden:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Crear nueva orden
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        id_solicitud,
        observaciones_cierre,
        nombre_recibe,
        cedula_recibe,
        total
      } = req.body
      
      // Usar el ID del usuario autenticado
      const id_creador = (req as any).user?.userId || (req as any).user?.id || 1
      
      // Verificar que la solicitud existe
      const solicitudQuery = 'SELECT id FROM solicitudes WHERE id = ?'
      const solicitudResult = await db.query(solicitudQuery, [id_solicitud]) as any[]
      
      if (solicitudResult.length === 0) {
        res.status(400).json({
          success: false,
          message: 'La solicitud especificada no existe'
        })
        return
      }

      const query = `
        INSERT INTO ordenes (
          id_solicitud, 
          id_estado, 
          id_creador, 
          creacion, 
          observaciones_cierre, 
          nombre_recibe, 
          cedula_recibe, 
          total,
          sub_estados,
          ids_causa_falla,
          ids_modo_falla,
          ids_falla_modos,
          ids_act_img
        ) VALUES (?, 1, ?, NOW(), ?, ?, ?, ?, '', '', '', '', '')
      `
      
      const result = await db.query(query, [
        id_solicitud,
        id_creador,
        observaciones_cierre || '',
        nombre_recibe,
        cedula_recibe,
        total || 0
      ]) as any
      
      // Obtener la orden recién creada
      const nuevaOrden = await db.query(`
        SELECT 
          o.id,
          o.id_solicitud,
          o.id_estado,
          oe.estado as estado_nombre,
          o.creacion,
          o.observaciones_cierre,
          o.nombre_recibe,
          o.cedula_recibe,
          o.total,
          o.id_creador,
          u.nombre as creador_nombre
        FROM ordenes o
        LEFT JOIN ordenes_estados oe ON o.id_estado = oe.id
        LEFT JOIN usuarios u ON o.id_creador = u.id
        WHERE o.id = ?
      `, [result.insertId]) as any[]
      
      res.status(201).json({
        success: true,
        data: nuevaOrden[0],
        message: 'Orden creada exitosamente'
      })
    } catch (error) {
      console.error('Error creating orden:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Cerrar orden con observaciones
   */
  static async cerrar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { observaciones_cierre } = req.body
      const id_cerrador = (req as any).user?.userId || (req as any).user?.id || 1

      // Verificar que la orden existe y está abierta
      const ordenQuery = 'SELECT id, id_estado FROM ordenes WHERE id = ?'
      const ordenResult = await db.query(ordenQuery, [id]) as any[]
      
      if (ordenResult.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        })
        return
      }

      if (ordenResult[0].id_estado !== 1) {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden cerrar órdenes que estén abiertas'
        })
        return
      }

      const query = `
        UPDATE ordenes 
        SET id_estado = 2, 
            cierre = NOW(), 
            id_cerrador = ?, 
            observaciones_cierre = ?
        WHERE id = ?
      `
      
      await db.query(query, [id_cerrador, observaciones_cierre, id])

      // Obtener la orden cerrada
      const ordenCerrada = await db.query(`
        SELECT 
          o.id,
          o.id_solicitud,
          o.id_estado,
          oe.estado as estado_nombre,
          o.creacion,
          o.cierre,
          o.observaciones_cierre,
          o.nombre_recibe,
          o.cedula_recibe,
          o.total,
          o.id_creador,
          u.nombre as creador_nombre,
          uc.nombre as cerrador_nombre
        FROM ordenes o
        LEFT JOIN ordenes_estados oe ON o.id_estado = oe.id
        LEFT JOIN usuarios u ON o.id_creador = u.id
        LEFT JOIN usuarios uc ON o.id_cerrador = uc.id
        WHERE o.id = ?
      `, [id]) as any[]

      res.json({
        success: true,
        data: ordenCerrada[0],
        message: 'Orden cerrada exitosamente'
      })
    } catch (error) {
      console.error('Error closing orden:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Agregar cambio de estado con comentario
   */
  static async agregarCambio(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { id_sub_estado, comentario } = req.body
      const id_creador = (req as any).user?.userId || (req as any).user?.id || 1

      // Verificar que la orden existe
      const ordenExiste = await db.query('SELECT id FROM ordenes WHERE id = ?', [id]) as any[]
      
      if (ordenExiste.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Orden no encontrada'
        })
        return
      }

      const query = `
        INSERT INTO ordenes_cambios (id_orden, id_sub_estado, id_creador, comentario, fecha, activo)
        VALUES (?, ?, ?, ?, NOW(), 1)
      `
      
      const result = await db.query(query, [id, id_sub_estado || null, id_creador, comentario]) as any
      
      // Obtener el cambio recién creado
      const nuevoCambio = await db.query(`
        SELECT 
          oc.id,
          oc.comentario,
          oc.fecha,
          oc.id_creador,
          u.nombre as creador_nombre
        FROM ordenes_cambios oc
        LEFT JOIN usuarios u ON oc.id_creador = u.id
        WHERE oc.id = ?
      `, [result.insertId]) as any[]
      
      res.status(201).json({
        success: true,
        data: nuevoCambio[0],
        message: 'Cambio agregado exitosamente'
      })
    } catch (error) {
      console.error('Error adding cambio:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN id_estado = 1 THEN 1 ELSE 0 END) as abiertas,
          SUM(CASE WHEN id_estado = 2 THEN 1 ELSE 0 END) as cerradas,
          SUM(CASE WHEN id_estado = 3 THEN 1 ELSE 0 END) as anuladas,
          SUM(CASE WHEN DATE(creacion) = CURDATE() THEN 1 ELSE 0 END) as hoy,
          SUM(CASE WHEN WEEK(creacion) = WEEK(CURDATE()) AND YEAR(creacion) = YEAR(CURDATE()) THEN 1 ELSE 0 END) as esta_semana,
          SUM(CASE WHEN MONTH(creacion) = MONTH(CURDATE()) AND YEAR(creacion) = YEAR(CURDATE()) THEN 1 ELSE 0 END) as este_mes
        FROM ordenes
      `

      const result = await db.query(statsQuery) as any[]
      const stats = result[0]

      res.json({
        success: true,
        data: {
          total: stats.total || 0,
          por_estado: {
            abiertas: stats.abiertas || 0,
            cerradas: stats.cerradas || 0,
            anuladas: stats.anuladas || 0
          },
          por_periodo: {
            hoy: stats.hoy || 0,
            esta_semana: stats.esta_semana || 0,
            este_mes: stats.este_mes || 0
          }
        }
      })
    } catch (error) {
      console.error('Error fetching orden stats:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener estados disponibles
   */
  static async getEstados(req: Request, res: Response): Promise<void> {
    try {
      const query = 'SELECT id, estado FROM ordenes_estados ORDER BY id'
      const estados = await db.query(query)

      res.json({
        success: true,
        data: estados
      })
    } catch (error) {
      console.error('Error fetching estados:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
}