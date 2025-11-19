import { Request, Response } from 'express'
import db from '../config/database'

export class VisitaControllerReal {
  /**
   * Obtener todas las visitas con paginación y filtros
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        estado,
        responsable_id,
        orden_id,
        ejecutar_sede,
        fecha_desde,
        fecha_hasta,
        buscar
      } = req.query as any

      const offset = (parseInt(page) - 1) * parseInt(limit)
      let whereConditions: string[] = ['v.activo = 1']
      let queryParams: any[] = []

      // Filtro por estado
      if (estado) {
        whereConditions.push('v.id_estado = ?')
        queryParams.push(parseInt(estado))
      }

      // Filtro por responsable
      if (responsable_id) {
        whereConditions.push('v.id_responsable = ?')
        queryParams.push(parseInt(responsable_id))
      }

      // Filtro por orden
      if (orden_id) {
        whereConditions.push('v.id_orden = ?')
        queryParams.push(parseInt(orden_id))
      }

      // Filtro por ejecutar en sede
      if (ejecutar_sede !== undefined) {
        whereConditions.push('v.ejecutar_sede = ?')
        queryParams.push(ejecutar_sede === 'true' ? 1 : 0)
      }

      // Filtro por fecha desde
      if (fecha_desde) {
        whereConditions.push('DATE(v.fecha_inicio) >= ?')
        queryParams.push(fecha_desde)
      }

      // Filtro por fecha hasta
      if (fecha_hasta) {
        whereConditions.push('DATE(v.fecha_inicio) <= ?')
        queryParams.push(fecha_hasta)
      }

      // Búsqueda por texto
      if (buscar) {
        whereConditions.push('(v.actividades LIKE ? OR v.observacion_aprobacion LIKE ?)')
        const searchTerm = `%${buscar}%`
        queryParams.push(searchTerm, searchTerm)
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

      const query = `
        SELECT 
          v.id,
          v.id_orden,
          v.id_estado,
          v.id_responsable,
          v.fecha_inicio,
          v.ejecutar_sede,
          v.duracion,
          v.fecha_creacion,
          v.id_creador,
          v.fecha_aprobacion,
          v.id_aprobador,
          v.observacion_aprobacion,
          v.fecha_cierre,
          v.id_cerrador,
          v.actividades
        FROM visitas v
        ${whereClause}
        ORDER BY v.fecha_inicio DESC
        LIMIT ? OFFSET ?
      `

      const countQuery = `
        SELECT COUNT(*) as total
        FROM visitas v
        ${whereClause}
      `

      // Agregar parámetros de paginación
      const finalQueryParams = [...queryParams, parseInt(limit), offset]
      
      const [visitas, countResult] = await Promise.all([
        db.query(query, finalQueryParams),
        db.query(countQuery, queryParams)
      ])

      const total = (countResult as any[])[0]?.total || 0
      const totalPages = Math.ceil(total / parseInt(limit))

      res.json({
        success: true,
        data: visitas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      })
    } catch (error) {
      console.error('Error fetching visitas:', error)
      res.status(500).json({
        success: false,
        data: [],
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener visita por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const query = `
        SELECT 
          v.id,
          v.id_orden,
          v.id_estado,
          ve.estado as estado_nombre,
          v.id_responsable,
          ur.nombre as responsable_nombre,
          v.fecha_inicio,
          v.ejecutar_sede,
          v.duracion,
          v.fecha_creacion,
          v.id_creador,
          uc.nombre as creador_nombre,
          v.fecha_aprobacion,
          v.id_aprobador,
          ua.nombre as aprobador_nombre,
          v.observacion_aprobacion,
          v.fecha_cierre,
          v.id_cerrador,
          ucr.nombre as cerrador_nombre,
          v.actividades,
          o.observaciones_cierre as orden_observaciones
        FROM visitas v
        LEFT JOIN visitas_estados ve ON v.id_estado = ve.id
        LEFT JOIN usuarios ur ON v.id_responsable = ur.id
        LEFT JOIN usuarios uc ON v.id_creador = uc.id
        LEFT JOIN usuarios ua ON v.id_aprobador = ua.id
        LEFT JOIN usuarios ucr ON v.id_cerrador = ucr.id
        LEFT JOIN ordenes o ON v.id_orden = o.id
        WHERE v.id = ? AND v.activo = 1
      `

      const result = await db.query(query, [id]) as any[]

      if (result.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        })
        return
      }

      res.json({
        success: true,
        data: result[0]
      })
    } catch (error) {
      console.error('Error fetching visita:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Crear nueva visita
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        id_orden,
        id_responsable,
        fecha_inicio,
        ejecutar_sede,
        duracion,
        actividades
      } = req.body
      
      // Usar el ID del usuario autenticado
      const id_creador = (req as any).user?.userId || (req as any).user?.id || 1
      
      // Verificar que la orden existe
      const ordenQuery = 'SELECT id FROM ordenes WHERE id = ?'
      const ordenResult = await db.query(ordenQuery, [id_orden]) as any[]
      
      if (ordenResult.length === 0) {
        res.status(400).json({
          success: false,
          message: 'La orden especificada no existe'
        })
        return
      }

      const query = `
        INSERT INTO visitas (
          id_orden, 
          id_estado, 
          id_responsable, 
          fecha_inicio, 
          ejecutar_sede, 
          duracion, 
          id_creador, 
          fecha_creacion, 
          observacion_aprobacion, 
          actividades,
          activo
        ) VALUES (?, 1, ?, ?, ?, ?, ?, NOW(), '', ?, 1)
      `
      
      const result = await db.query(query, [
        id_orden,
        id_responsable || null,
        fecha_inicio,
        ejecutar_sede !== undefined ? ejecutar_sede : 1,
        duracion || 30,
        id_creador,
        actividades || ''
      ]) as any
      
      // Obtener la visita recién creada
      const nuevaVisita = await db.query(`
        SELECT 
          v.id,
          v.id_orden,
          v.id_estado,
          ve.estado as estado_nombre,
          v.id_responsable,
          ur.nombre as responsable_nombre,
          v.fecha_inicio,
          v.ejecutar_sede,
          v.duracion,
          v.fecha_creacion,
          v.id_creador,
          uc.nombre as creador_nombre,
          v.actividades
        FROM visitas v
        LEFT JOIN visitas_estados ve ON v.id_estado = ve.id
        LEFT JOIN usuarios ur ON v.id_responsable = ur.id
        LEFT JOIN usuarios uc ON v.id_creador = uc.id
        WHERE v.id = ?
      `, [result.insertId]) as any[]
      
      res.status(201).json({
        success: true,
        data: nuevaVisita[0],
        message: 'Visita creada exitosamente'
      })
    } catch (error) {
      console.error('Error creating visita:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Actualizar visita (solo si está pendiente)
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const {
        id_responsable,
        fecha_inicio,
        ejecutar_sede,
        duracion,
        actividades
      } = req.body

      // Verificar que la visita existe y está pendiente
      const visitaQuery = 'SELECT id, id_estado FROM visitas WHERE id = ? AND activo = 1'
      const visitaResult = await db.query(visitaQuery, [id]) as any[]
      
      if (visitaResult.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        })
        return
      }

      if (visitaResult[0].id_estado !== 1) {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden editar visitas pendientes'
        })
        return
      }

      let updates: string[] = []
      let params: any[] = []

      if (id_responsable !== undefined) {
        updates.push('id_responsable = ?')
        params.push(id_responsable)
      }

      if (fecha_inicio !== undefined) {
        updates.push('fecha_inicio = ?')
        params.push(fecha_inicio)
      }

      if (ejecutar_sede !== undefined) {
        updates.push('ejecutar_sede = ?')
        params.push(ejecutar_sede ? 1 : 0)
      }

      if (duracion !== undefined) {
        updates.push('duracion = ?')
        params.push(duracion)
      }

      if (actividades !== undefined) {
        updates.push('actividades = ?')
        params.push(actividades)
      }

      if (updates.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No se proporcionaron campos para actualizar'
        })
        return
      }

      const query = `UPDATE visitas SET ${updates.join(', ')} WHERE id = ?`
      params.push(id)

      await db.query(query, params)

      // Obtener la visita actualizada
      const visitaActualizada = await db.query(`
        SELECT 
          v.id,
          v.id_orden,
          v.id_estado,
          ve.estado as estado_nombre,
          v.id_responsable,
          ur.nombre as responsable_nombre,
          v.fecha_inicio,
          v.ejecutar_sede,
          v.duracion,
          v.fecha_creacion,
          v.id_creador,
          uc.nombre as creador_nombre,
          v.actividades
        FROM visitas v
        LEFT JOIN visitas_estados ve ON v.id_estado = ve.id
        LEFT JOIN usuarios ur ON v.id_responsable = ur.id
        LEFT JOIN usuarios uc ON v.id_creador = uc.id
        WHERE v.id = ?
      `, [id]) as any[]

      res.json({
        success: true,
        data: visitaActualizada[0],
        message: 'Visita actualizada exitosamente'
      })
    } catch (error) {
      console.error('Error updating visita:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Aprobar visita
   */
  static async aprobar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { observacion_aprobacion } = req.body
      const id_aprobador = (req as any).user?.userId || (req as any).user?.id || 1

      // Verificar que la visita existe y está pendiente
      const visitaQuery = 'SELECT id, id_estado FROM visitas WHERE id = ? AND activo = 1'
      const visitaResult = await db.query(visitaQuery, [id]) as any[]
      
      if (visitaResult.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        })
        return
      }

      if (visitaResult[0].id_estado !== 1) {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden aprobar visitas pendientes'
        })
        return
      }

      const query = `
        UPDATE visitas 
        SET id_estado = 2, 
            id_aprobador = ?, 
            fecha_aprobacion = NOW(), 
            observacion_aprobacion = ?
        WHERE id = ?
      `
      
      await db.query(query, [id_aprobador, observacion_aprobacion, id])

      // Obtener la visita aprobada
      const visitaAprobada = await db.query(`
        SELECT 
          v.id,
          v.id_orden,
          v.id_estado,
          ve.estado as estado_nombre,
          v.id_responsable,
          ur.nombre as responsable_nombre,
          v.fecha_inicio,
          v.ejecutar_sede,
          v.duracion,
          v.fecha_creacion,
          v.id_creador,
          uc.nombre as creador_nombre,
          v.fecha_aprobacion,
          v.id_aprobador,
          ua.nombre as aprobador_nombre,
          v.observacion_aprobacion,
          v.actividades
        FROM visitas v
        LEFT JOIN visitas_estados ve ON v.id_estado = ve.id
        LEFT JOIN usuarios ur ON v.id_responsable = ur.id
        LEFT JOIN usuarios uc ON v.id_creador = uc.id
        LEFT JOIN usuarios ua ON v.id_aprobador = ua.id
        WHERE v.id = ?
      `, [id]) as any[]

      res.json({
        success: true,
        data: visitaAprobada[0],
        message: 'Visita aprobada exitosamente'
      })
    } catch (error) {
      console.error('Error approving visita:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Rechazar visita
   */
  static async rechazar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { observacion_aprobacion } = req.body
      const id_aprobador = (req as any).user?.userId || (req as any).user?.id || 1

      // Verificar que la visita existe y está pendiente
      const visitaQuery = 'SELECT id, id_estado FROM visitas WHERE id = ? AND activo = 1'
      const visitaResult = await db.query(visitaQuery, [id]) as any[]
      
      if (visitaResult.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        })
        return
      }

      if (visitaResult[0].id_estado !== 1) {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden rechazar visitas pendientes'
        })
        return
      }

      const query = `
        UPDATE visitas 
        SET id_estado = 4, 
            id_aprobador = ?, 
            fecha_aprobacion = NOW(), 
            observacion_aprobacion = ?
        WHERE id = ?
      `
      
      await db.query(query, [id_aprobador, observacion_aprobacion, id])

      // Obtener la visita rechazada
      const visitaRechazada = await db.query(`
        SELECT 
          v.id,
          v.id_orden,
          v.id_estado,
          ve.estado as estado_nombre,
          v.id_responsable,
          ur.nombre as responsable_nombre,
          v.fecha_inicio,
          v.ejecutar_sede,
          v.duracion,
          v.fecha_creacion,
          v.id_creador,
          uc.nombre as creador_nombre,
          v.fecha_aprobacion,
          v.id_aprobador,
          ua.nombre as aprobador_nombre,
          v.observacion_aprobacion,
          v.actividades
        FROM visitas v
        LEFT JOIN visitas_estados ve ON v.id_estado = ve.id
        LEFT JOIN usuarios ur ON v.id_responsable = ur.id
        LEFT JOIN usuarios uc ON v.id_creador = uc.id
        LEFT JOIN usuarios ua ON v.id_aprobador = ua.id
        WHERE v.id = ?
      `, [id]) as any[]

      res.json({
        success: true,
        data: visitaRechazada[0],
        message: 'Visita rechazada'
      })
    } catch (error) {
      console.error('Error rejecting visita:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Cerrar visita
   */
  static async cerrar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { actividades } = req.body
      const id_cerrador = (req as any).user?.userId || (req as any).user?.id || 1

      // Verificar que la visita existe y está abierta
      const visitaQuery = 'SELECT id, id_estado FROM visitas WHERE id = ? AND activo = 1'
      const visitaResult = await db.query(visitaQuery, [id]) as any[]
      
      if (visitaResult.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        })
        return
      }

      if (visitaResult[0].id_estado !== 2) {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden cerrar visitas que estén abiertas'
        })
        return
      }

      const query = `
        UPDATE visitas 
        SET id_estado = 3, 
            id_cerrador = ?, 
            fecha_cierre = NOW(), 
            actividades = ?
        WHERE id = ?
      `
      
      await db.query(query, [id_cerrador, actividades, id])

      // Obtener la visita cerrada
      const visitaCerrada = await db.query(`
        SELECT 
          v.id,
          v.id_orden,
          v.id_estado,
          ve.estado as estado_nombre,
          v.id_responsable,
          ur.nombre as responsable_nombre,
          v.fecha_inicio,
          v.ejecutar_sede,
          v.duracion,
          v.fecha_creacion,
          v.id_creador,
          uc.nombre as creador_nombre,
          v.fecha_aprobacion,
          v.id_aprobador,
          ua.nombre as aprobador_nombre,
          v.observacion_aprobacion,
          v.fecha_cierre,
          v.id_cerrador,
          ucr.nombre as cerrador_nombre,
          v.actividades
        FROM visitas v
        LEFT JOIN visitas_estados ve ON v.id_estado = ve.id
        LEFT JOIN usuarios ur ON v.id_responsable = ur.id
        LEFT JOIN usuarios uc ON v.id_creador = uc.id
        LEFT JOIN usuarios ua ON v.id_aprobador = ua.id
        LEFT JOIN usuarios ucr ON v.id_cerrador = ucr.id
        WHERE v.id = ?
      `, [id]) as any[]

      res.json({
        success: true,
        data: visitaCerrada[0],
        message: 'Visita cerrada exitosamente'
      })
    } catch (error) {
      console.error('Error closing visita:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener estadísticas de visitas
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN id_estado = 1 THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN id_estado = 2 THEN 1 ELSE 0 END) as abiertas,
          SUM(CASE WHEN id_estado = 3 THEN 1 ELSE 0 END) as cerradas,
          SUM(CASE WHEN id_estado = 4 THEN 1 ELSE 0 END) as rechazadas,
          SUM(CASE WHEN DATE(fecha_inicio) = CURDATE() THEN 1 ELSE 0 END) as hoy,
          SUM(CASE WHEN WEEK(fecha_inicio) = WEEK(CURDATE()) AND YEAR(fecha_inicio) = YEAR(CURDATE()) THEN 1 ELSE 0 END) as esta_semana,
          SUM(CASE WHEN MONTH(fecha_inicio) = MONTH(CURDATE()) AND YEAR(fecha_inicio) = YEAR(CURDATE()) THEN 1 ELSE 0 END) as este_mes,
          SUM(CASE WHEN ejecutar_sede = 1 THEN 1 ELSE 0 END) as en_sede,
          AVG(duracion) as duracion_promedio
        FROM visitas
        WHERE activo = 1
      `

      const result = await db.query(statsQuery) as any[]
      const stats = result[0]

      res.json({
        success: true,
        data: {
          total: stats.total || 0,
          por_estado: {
            pendientes: stats.pendientes || 0,
            abiertas: stats.abiertas || 0,
            cerradas: stats.cerradas || 0,
            rechazadas: stats.rechazadas || 0
          },
          por_periodo: {
            hoy: stats.hoy || 0,
            esta_semana: stats.esta_semana || 0,
            este_mes: stats.este_mes || 0
          },
          por_ubicacion: {
            en_sede: stats.en_sede || 0,
            fuera_sede: (stats.total || 0) - (stats.en_sede || 0)
          },
          duracion_promedio: Math.round(stats.duracion_promedio || 30)
        }
      })
    } catch (error) {
      console.error('Error fetching visita stats:', error)
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
      const query = 'SELECT id, estado FROM visitas_estados ORDER BY id'
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

  /**
   * Obtener calendario de visitas
   */
  static async getCalendario(req: Request, res: Response): Promise<void> {
    try {
      const { fecha_inicio, fecha_fin } = req.query as any

      const query = `
        SELECT 
          v.id,
          v.id_orden,
          v.id_estado,
          ve.estado as estado_nombre,
          v.id_responsable,
          ur.nombre as responsable_nombre,
          v.fecha_inicio,
          v.duracion,
          v.ejecutar_sede,
          v.actividades
        FROM visitas v
        LEFT JOIN visitas_estados ve ON v.id_estado = ve.id
        LEFT JOIN usuarios ur ON v.id_responsable = ur.id
        WHERE v.activo = 1 
          AND v.fecha_inicio BETWEEN ? AND ?
          AND v.id_estado IN (1, 2)
        ORDER BY v.fecha_inicio ASC
      `

      const visitas = await db.query(query, [fecha_inicio, fecha_fin])

      res.json({
        success: true,
        data: visitas
      })
    } catch (error) {
      console.error('Error fetching calendario:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
}