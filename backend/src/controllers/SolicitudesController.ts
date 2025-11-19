import { Response } from 'express'
import db from '../config/database'
import { 
  Solicitud, 
  CrearSolicitudRequestBody, 
  ActualizarSolicitudRequestBody,
  CambiarEstadoSolicitudRequestBody,
  ListarSolicitudesRequest,
  SolicitudResponse,
  SolicitudesListResponse,
  EstadisticasSolicitudesResponse,
  EstadoSolicitud,
  FiltrosSolicitudes
} from '../types/solicitudes'
import Joi from 'joi'

// Esquemas de validación
const crearSolicitudSchema = Joi.object({
  id_servicio: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID del servicio debe ser un número',
    'number.positive': 'El ID del servicio debe ser positivo',
    'any.required': 'El ID del servicio es requerido'
  }),
  aviso: Joi.string().max(20).required().messages({
    'string.max': 'El aviso no puede exceder 20 caracteres',
    'any.required': 'El aviso es requerido'
  }),
  id_equipo: Joi.number().integer().positive().optional().messages({
    'number.base': 'El ID del equipo debe ser un número',
    'number.positive': 'El ID del equipo debe ser positivo'
  }),
  observacion: Joi.string().max(2000).required().messages({
    'string.max': 'La observación no puede exceder 2000 caracteres',
    'any.required': 'La observación es requerida'
  })
})

const actualizarSolicitudSchema = Joi.object({
  id_servicio: Joi.number().integer().positive().optional(),
  aviso: Joi.string().max(20).optional(),
  id_equipo: Joi.number().integer().positive().optional().allow(null),
  observacion: Joi.string().max(2000).optional(),
  observacion_estado: Joi.string().max(600).optional()
})

const cambiarEstadoSchema = Joi.object({
  id_estado: Joi.number().integer().valid(1, 2, 3).required().messages({
    'any.only': 'El estado debe ser 1 (Pendiente), 2 (Aprobada) o 3 (Rechazada)',
    'any.required': 'El estado es requerido'
  }),
  observacion_estado: Joi.string().max(600).required().messages({
    'string.max': 'La observación del estado no puede exceder 600 caracteres',
    'any.required': 'La observación del estado es requerida'
  })
})

export class SolicitudesController {
  /**
   * Listar solicitudes con filtros y paginación
   */
  static async listar(req: ListarSolicitudesRequest, res: Response<SolicitudesListResponse>): Promise<void> {
    try {
      const filtros: FiltrosSolicitudes = req.query
      const page = parseInt(String(filtros.page)) || 1
      const limit = parseInt(String(filtros.limit)) || 50
      const offset = (page - 1) * limit

      // Construir query base con joins
      let baseQuery = `
        SELECT 
          s.*,
          e.estado,
          uc.nombre as creador_nombre,
          uca.nombre as cambiador_nombre
        FROM solicitudes s
        LEFT JOIN solicitudes_estados e ON s.id_estado = e.id
        LEFT JOIN usuarios uc ON s.id_creador = uc.id
        LEFT JOIN usuarios uca ON s.id_cambiador = uca.id
      `

      let whereConditions: string[] = []
      let queryParams: any[] = []

      // Aplicar filtros
      if (filtros.estado) {
        if (Array.isArray(filtros.estado)) {
          whereConditions.push(`s.id_estado IN (${filtros.estado.map(() => '?').join(',')})`)
          queryParams.push(...filtros.estado)
        } else {
          whereConditions.push('s.id_estado = ?')
          queryParams.push(filtros.estado)
        }
      }

      if (filtros.id_creador) {
        whereConditions.push('s.id_creador = ?')
        queryParams.push(filtros.id_creador)
      }

      if (filtros.id_servicio) {
        whereConditions.push('s.id_servicio = ?')
        queryParams.push(filtros.id_servicio)
      }

      if (filtros.fecha_desde) {
        whereConditions.push('DATE(s.creacion) >= ?')
        queryParams.push(filtros.fecha_desde)
      }

      if (filtros.fecha_hasta) {
        whereConditions.push('DATE(s.creacion) <= ?')
        queryParams.push(filtros.fecha_hasta)
      }

      if (filtros.aviso) {
        whereConditions.push('s.aviso LIKE ?')
        queryParams.push(`%${filtros.aviso}%`)
      }

      // Agregar WHERE si hay condiciones
      if (whereConditions.length > 0) {
        baseQuery += ' WHERE ' + whereConditions.join(' AND ')
      }

      // Agregar ORDER BY
      const sortBy = filtros.sortBy || 'creacion'
      const sortOrder = filtros.sortOrder || 'DESC'
      baseQuery += ` ORDER BY s.${sortBy} ${sortOrder}`

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM solicitudes s 
        ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}
      `

      // Ejecutar queries - versión simplificada para debugging
      const limitNum = Number(limit)
      const offsetNum = Number(offset)
      const finalQuery = baseQuery + ` LIMIT ${limitNum} OFFSET ${offsetNum}`
      const finalCountQuery = countQuery
      
      console.log(`🔍 Query final: ${finalQuery}`)
      console.log(`🔍 Count query: ${finalCountQuery}`)
      console.log(`🔍 Parámetros query: ${JSON.stringify(queryParams)}`)
      
      const [solicitudes, countResult] = await Promise.all([
        db.query(finalQuery, queryParams) as Promise<Solicitud[]>,
        db.query(finalCountQuery, queryParams) as Promise<{ total: number }[]>
      ])

      const total = countResult[0]?.total || 0
      const totalPages = Math.ceil(total / limit)

      console.log(`✅ Solicitudes listadas: ${solicitudes.length} de ${total} total`)

      res.json({
        success: true,
        message: 'Solicitudes obtenidas exitosamente',
        data: {
          solicitudes,
          total,
          page,
          limit,
          totalPages
        }
      })
    } catch (error) {
      console.error('Error listando solicitudes:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener solicitud por ID
   */
  static async obtenerPorId(req: { params: { id: string } }, res: Response<SolicitudResponse>): Promise<void> {
    try {
      const { id } = req.params

      const query = `
        SELECT 
          s.*,
          e.estado,
          uc.nombre as creador_nombre,
          uca.nombre as cambiador_nombre
        FROM solicitudes s
        LEFT JOIN solicitudes_estados e ON s.id_estado = e.id
        LEFT JOIN usuarios uc ON s.id_creador = uc.id
        LEFT JOIN usuarios uca ON s.id_cambiador = uca.id
        WHERE s.id = ?
      `

      const solicitudes = await db.query(query, [id]) as Solicitud[]

      if (!solicitudes || solicitudes.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        })
        return
      }

      console.log(`✅ Solicitud obtenida: ${id}`)

      res.json({
        success: true,
        message: 'Solicitud obtenida exitosamente',
        data: solicitudes[0]
      })
    } catch (error) {
      console.error('Error obteniendo solicitud:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Crear nueva solicitud
   */
  static async crear(req: CrearSolicitudRequestBody, res: Response<SolicitudResponse>): Promise<void> {
    try {
      const { error, value } = crearSolicitudSchema.validate(req.body)
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details?.[0]?.message || 'Error de validación'
        })
        return
      }

      const { id_servicio, aviso, id_equipo, observacion } = value
      const id_creador = (req as any).user?.id // Del middleware de autenticación

      if (!id_creador) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        })
        return
      }

      const query = `
        INSERT INTO solicitudes (
          id_creador, id_servicio, id_estado, aviso, id_equipo, observacion, observacion_estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `

      const resultado = await db.query(query, [
        id_creador,
        id_servicio,
        EstadoSolicitud.PENDIENTE,
        aviso,
        id_equipo || null,
        observacion,
        ''
      ]) as any

      console.log(`✅ Solicitud creada: ${resultado.insertId} por usuario ${id_creador}`)

      // Obtener la solicitud creada
      const solicitudCreada = await SolicitudesController.obtenerPorIdInterno(resultado.insertId)

      if (!solicitudCreada) {
        res.status(500).json({
          success: false,
          message: 'Error obteniendo la solicitud creada'
        })
        return
      }

      res.status(201).json({
        success: true,
        message: 'Solicitud creada exitosamente',
        data: solicitudCreada
      })
    } catch (error) {
      console.error('Error creando solicitud:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Cambiar estado de solicitud
   */
  static async cambiarEstado(req: CambiarEstadoSolicitudRequestBody, res: Response<SolicitudResponse>): Promise<void> {
    try {
      const { error, value } = cambiarEstadoSchema.validate(req.body)
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details?.[0]?.message || 'Error de validación'
        })
        return
      }

      const { id } = req.params
      const { id_estado, observacion_estado } = value
      const id_cambiador = (req as any).user?.id

      if (!id_cambiador) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        })
        return
      }

      // Verificar que la solicitud existe
      const solicitudExiste = await SolicitudesController.obtenerPorIdInterno(parseInt(id))
      if (!solicitudExiste) {
        res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada'
        })
        return
      }

      const query = `
        UPDATE solicitudes 
        SET id_estado = ?, observacion_estado = ?, id_cambiador = ?, cambio_estado = NOW()
        WHERE id = ?
      `

      await db.query(query, [id_estado, observacion_estado, id_cambiador, id])

      console.log(`✅ Estado cambiado: Solicitud ${id} → Estado ${id_estado} por usuario ${id_cambiador}`)

      // Obtener solicitud actualizada
      const solicitudActualizada = await SolicitudesController.obtenerPorIdInterno(parseInt(id))

      if (!solicitudActualizada) {
        res.status(500).json({
          success: false,
          message: 'Error obteniendo la solicitud actualizada'
        })
        return
      }

      res.json({
        success: true,
        message: 'Estado de solicitud actualizado exitosamente',
        data: solicitudActualizada
      })
    } catch (error) {
      console.error('Error cambiando estado de solicitud:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Obtener estadísticas de solicitudes
   */
  static async obtenerEstadisticas(req: any, res: Response<EstadisticasSolicitudesResponse>): Promise<void> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN id_estado = 1 THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN id_estado = 2 THEN 1 ELSE 0 END) as aprobadas,
          SUM(CASE WHEN id_estado = 3 THEN 1 ELSE 0 END) as rechazadas,
          ROUND((SUM(CASE WHEN id_estado = 2 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as porcentaje_aprobacion
        FROM solicitudes
      `

      const resultado = await db.query(query) as any[]
      const stats = resultado[0]

      console.log(`✅ Estadísticas obtenidas: ${stats.total} solicitudes totales`)

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          total: stats.total,
          pendientes: stats.pendientes,
          aprobadas: stats.aprobadas,
          rechazadas: stats.rechazadas,
          porcentaje_aprobacion: stats.porcentaje_aprobacion
        }
      })
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Método interno para obtener solicitud por ID
   */
  private static async obtenerPorIdInterno(id: number): Promise<Solicitud | null> {
    try {
      const query = `
        SELECT 
          s.*,
          e.estado,
          uc.nombre as creador_nombre,
          uca.nombre as cambiador_nombre
        FROM solicitudes s
        LEFT JOIN solicitudes_estados e ON s.id_estado = e.id
        LEFT JOIN usuarios uc ON s.id_creador = uc.id
        LEFT JOIN usuarios uca ON s.id_cambiador = uca.id
        WHERE s.id = ?
      `

      const solicitudes = await db.query(query, [id]) as Solicitud[]
      return solicitudes && solicitudes.length > 0 ? solicitudes[0] || null : null
    } catch (error) {
      console.error('Error obteniendo solicitud interna:', error)
      return null
    }
  }
}