import { Request, Response } from 'express'
import mysql from 'mysql2/promise'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import logger from '../utils/logger'

// Configuración de la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ziriuzco_ziriuz',
  charset: 'utf8',
  timezone: '-05:00',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Interfaces para órdenes de servicio
interface OrdenServicio extends RowDataPacket {
  id: number
  numero_orden: string
  cliente: string
  equipo: string
  tipo_servicio: 'mantenimiento' | 'reparacion' | 'instalacion' | 'diagnostico'
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'
  estado: 'pendiente' | 'asignada' | 'en_progreso' | 'en_reparacion' | 'completada' | 'cancelada'
  descripcion: string
  fecha_programada: Date
  tiempo_estimado: number
  tecnico_id?: number
  ubicacion_latitud: number
  ubicacion_longitud: number
  ubicacion_direccion: string
  created_at: Date
  updated_at: Date
}

interface TrackingOrden extends RowDataPacket {
  id: number
  orden_id: number
  tecnico_id: number
  latitud: number
  longitud: number
  precision: number
  timestamp: Date
  estado: string
  observaciones?: string
}

interface CheckInOutOrden extends RowDataPacket {
  id: number
  orden_id: number
  tecnico_id: number
  tipo: 'check_in' | 'check_out'
  latitud: number
  longitud: number
  timestamp: Date
  foto_url?: string
  observaciones: string
  estado_equipo_inicial?: string
  estado_equipo_final?: string
  trabajos_realizados?: string
  materiales_utilizados?: string
  tiempo_trabajo?: number
  requiere_visita_adicional: boolean
}

interface FotoOrden extends RowDataPacket {
  id: number
  orden_id: number
  nombre_archivo: string
  ruta_archivo: string
  tipo: 'inicial' | 'progreso' | 'final' | 'evidencia' | 'problema'
  categoria: 'equipo' | 'reparacion' | 'instalacion' | 'ambiente' | 'documentacion'
  descripcion: string
  metadata: any
  tecnico_id: number
  timestamp: Date
}

export class OrdenServicioTrackingController {
  
  // **TRACKING GPS**
  
  // Obtener tracking de órdenes activas
  static async obtenerTrackingOrdenes(req: Request, res: Response) {
    try {
      const { estado, tecnico_id, fecha_inicio, fecha_fin } = req.query

      let query = `
        SELECT 
          o.*,
          t.nombre as tecnico_nombre,
          t.telefono as tecnico_telefono,
          COALESCE(tr.latitud, o.ubicacion_latitud) as latitud_actual,
          COALESCE(tr.longitud, o.ubicacion_longitud) as longitud_actual,
          tr.precision,
          tr.timestamp as ultima_actualizacion,
          tr.observaciones as estado_tracking
        FROM ordenes_servicio o
        LEFT JOIN tecnicos t ON o.tecnico_id = t.id
        LEFT JOIN (
          SELECT DISTINCT orden_id, latitud, longitud, precision, timestamp, observaciones,
                 ROW_NUMBER() OVER (PARTITION BY orden_id ORDER BY timestamp DESC) as rn
          FROM tracking_ordenes
        ) tr ON o.id = tr.orden_id AND tr.rn = 1
        WHERE 1=1
      `

      const params: any[] = []

      if (estado) {
        query += ` AND o.estado = ?`
        params.push(estado)
      }

      if (tecnico_id) {
        query += ` AND o.tecnico_id = ?`
        params.push(tecnico_id)
      }

      if (fecha_inicio) {
        query += ` AND o.fecha_programada >= ?`
        params.push(fecha_inicio)
      }

      if (fecha_fin) {
        query += ` AND o.fecha_programada <= ?`
        params.push(fecha_fin)
      }

      query += ` ORDER BY o.prioridad = 'urgente' DESC, o.prioridad = 'alta' DESC, o.fecha_programada ASC`

      const [ordenes] = await pool.execute<OrdenServicio[]>(query, params)

      res.json({
        success: true,
        data: ordenes,
        total: ordenes.length
      })

    } catch (error) {
      logger.error('Error al obtener tracking de órdenes:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Registrar ubicación GPS del técnico
  static async registrarUbicacionTecnico(req: Request, res: Response): Promise<void> {
    try {
      const { orden_id } = req.params
      const { 
        tecnico_id, 
        latitud, 
        longitud, 
        precision, 
        estado, 
        observaciones 
      } = req.body

      // Validar que la orden existe y está asignada al técnico
      const [ordenes] = await pool.execute<OrdenServicio[]>(
        'SELECT * FROM ordenes_servicio WHERE id = ? AND tecnico_id = ?',
        [orden_id, tecnico_id]
      )

      if (ordenes.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Orden no encontrada o no asignada al técnico'
        })
        return
      }

      // Registrar tracking
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO tracking_ordenes 
         (orden_id, tecnico_id, latitud, longitud, precision, estado, observaciones) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orden_id, tecnico_id, latitud, longitud, precision, estado, observaciones]
      )

      // Actualizar estado de la orden si es necesario
      if (estado && ['en_progreso', 'completada', 'cancelada'].includes(estado)) {
        await pool.execute(
          'UPDATE ordenes_servicio SET estado = ?, updated_at = NOW() WHERE id = ?',
          [estado, orden_id]
        )
      }

      res.json({
        success: true,
        message: 'Ubicación registrada correctamente',
        tracking_id: result.insertId
      })

    } catch (error) {
      logger.error('Error al registrar ubicación:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // **CHECK-IN/CHECK-OUT**
  
  // Realizar check-in
  static async realizarCheckIn(req: Request, res: Response): Promise<void> {
    try {
      const { orden_id } = req.params
      const {
        tecnico_id,
        latitud,
        longitud,
        observaciones,
        estado_equipo_inicial,
        foto_url
      } = req.body

      // Validar orden
      const [ordenes] = await pool.execute<OrdenServicio[]>(
        'SELECT * FROM ordenes_servicio WHERE id = ? AND tecnico_id = ?',
        [orden_id, tecnico_id]
      )

      if (ordenes.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Orden no encontrada o no asignada al técnico'
        })
        return
      }

      // Verificar que no haya check-in previo sin check-out
      const [checkInsPrevios] = await pool.execute<CheckInOutOrden[]>(
        `SELECT * FROM checkin_checkout_ordenes 
         WHERE orden_id = ? AND tipo = 'check_in' 
         AND NOT EXISTS (
           SELECT 1 FROM checkin_checkout_ordenes co 
           WHERE co.orden_id = ? AND co.tipo = 'check_out' 
           AND co.timestamp > checkin_checkout_ordenes.timestamp
         )`,
        [orden_id, orden_id]
      )

      if (checkInsPrevios.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Ya existe un check-in activo para esta orden'
        })
        return
      }

      // Registrar check-in
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO checkin_checkout_ordenes 
         (orden_id, tecnico_id, tipo, latitud, longitud, observaciones, estado_equipo_inicial, foto_url) 
         VALUES (?, ?, 'check_in', ?, ?, ?, ?, ?)`,
        [orden_id, tecnico_id, latitud, longitud, observaciones, estado_equipo_inicial, foto_url]
      )

      // Actualizar estado de la orden
      await pool.execute(
        'UPDATE ordenes_servicio SET estado = "en_progreso", updated_at = NOW() WHERE id = ?',
        [orden_id]
      )

      // Registrar en tracking
      await pool.execute(
        `INSERT INTO tracking_ordenes 
         (orden_id, tecnico_id, latitud, longitud, precision, estado, observaciones) 
         VALUES (?, ?, ?, ?, 10, 'check_in', ?)`,
        [orden_id, tecnico_id, latitud, longitud, 'Check-in realizado']
      )

      res.json({
        success: true,
        message: 'Check-in realizado correctamente',
        checkin_id: result.insertId
      })

    } catch (error) {
      logger.error('Error al realizar check-in:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Realizar check-out
  static async realizarCheckOut(req: Request, res: Response): Promise<void> {
    try {
      const { orden_id } = req.params
      const {
        tecnico_id,
        latitud,
        longitud,
        observaciones,
        estado_equipo_final,
        trabajos_realizados,
        materiales_utilizados,
        requiere_visita_adicional,
        foto_url
      } = req.body

      // Verificar que existe check-in activo
      const [checkIns] = await pool.execute<CheckInOutOrden[]>(
        `SELECT * FROM checkin_checkout_ordenes 
         WHERE orden_id = ? AND tecnico_id = ? AND tipo = 'check_in' 
         AND NOT EXISTS (
           SELECT 1 FROM checkin_checkout_ordenes co 
           WHERE co.orden_id = ? AND co.tipo = 'check_out' 
           AND co.timestamp > checkin_checkout_ordenes.timestamp
         )`,
        [orden_id, tecnico_id, orden_id]
      )

      if (checkIns.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No hay check-in activo para esta orden'
        })
        return
      }

      const checkIn = checkIns[0]
      const tiempo_trabajo = Math.floor((Date.now() - new Date(checkIn?.timestamp || Date.now()).getTime()) / (1000 * 60))

      // Registrar check-out
      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO checkin_checkout_ordenes 
         (orden_id, tecnico_id, tipo, latitud, longitud, observaciones, 
          estado_equipo_final, trabajos_realizados, materiales_utilizados, 
          tiempo_trabajo, requiere_visita_adicional, foto_url) 
         VALUES (?, ?, 'check_out', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orden_id, tecnico_id, latitud, longitud, observaciones, 
         estado_equipo_final, trabajos_realizados, materiales_utilizados, 
         tiempo_trabajo, requiere_visita_adicional, foto_url]
      )

      // Determinar estado final de la orden
      let estadoFinal = 'completada'
      if (requiere_visita_adicional || estado_equipo_final === 'no_operativo') {
        estadoFinal = 'requiere_seguimiento'
      }

      // Actualizar orden
      await pool.execute(
        'UPDATE ordenes_servicio SET estado = ?, updated_at = NOW() WHERE id = ?',
        [estadoFinal, orden_id]
      )

      // Registrar en tracking
      await pool.execute(
        `INSERT INTO tracking_ordenes 
         (orden_id, tecnico_id, latitud, longitud, precision, estado, observaciones) 
         VALUES (?, ?, ?, ?, 10, 'check_out', ?)`,
        [orden_id, tecnico_id, latitud, longitud, 'Check-out realizado']
      )

      res.json({
        success: true,
        message: 'Check-out realizado correctamente',
        checkout_id: result.insertId,
        tiempo_trabajo: tiempo_trabajo,
        estado_final: estadoFinal
      })

    } catch (error) {
      logger.error('Error al realizar check-out:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // **GESTIÓN DE FOTOS**
  
  // Subir foto de orden
  static async subirFotoOrden(req: Request, res: Response) {
    try {
      const { orden_id } = req.params
      const {
        tecnico_id,
        nombre_archivo,
        ruta_archivo,
        tipo,
        categoria,
        descripcion,
        metadata
      } = req.body

      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO fotos_ordenes 
         (orden_id, tecnico_id, nombre_archivo, ruta_archivo, tipo, categoria, descripcion, metadata) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orden_id, tecnico_id, nombre_archivo, ruta_archivo, tipo, categoria, descripcion, JSON.stringify(metadata)]
      )

      res.json({
        success: true,
        message: 'Foto subida correctamente',
        foto_id: result.insertId
      })

    } catch (error) {
      logger.error('Error al subir foto:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener fotos de una orden
  static async obtenerFotosOrden(req: Request, res: Response) {
    try {
      const { orden_id } = req.params
      const { tipo, categoria } = req.query

      let query = `
        SELECT f.*, t.nombre as tecnico_nombre
        FROM fotos_ordenes f
        LEFT JOIN tecnicos t ON f.tecnico_id = t.id
        WHERE f.orden_id = ?
      `
      const params: any[] = [orden_id]

      if (tipo) {
        query += ` AND f.tipo = ?`
        params.push(tipo)
      }

      if (categoria) {
        query += ` AND f.categoria = ?`
        params.push(categoria)
      }

      query += ` ORDER BY f.timestamp DESC`

      const [fotos] = await pool.execute<FotoOrden[]>(query, params)

      // Parsear metadata JSON
      const fotosConMetadata = fotos.map((foto: any) => ({
        ...foto,
        metadata: typeof foto.metadata === 'string' ? JSON.parse(foto.metadata) : foto.metadata
      }))

      res.json({
        success: true,
        data: fotosConMetadata
      })

    } catch (error) {
      logger.error('Error al obtener fotos:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // **DASHBOARD Y MÉTRICAS**
  
  // Obtener métricas del dashboard
  static async obtenerMetricasDashboard(req: Request, res: Response) {
    try {
      const { periodo = '7d' } = req.query

      // Calcular fechas según período
      let fechaInicio: Date
      const fechaFin = new Date()

      switch (periodo) {
        case '1d':
          fechaInicio = new Date(Date.now() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          fechaInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          fechaInicio = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          fechaInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }

      // Métricas básicas
      const [metricasBasicas] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total_ordenes,
          SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as ordenes_pendientes,
          SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as ordenes_en_progreso,
          SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as ordenes_completadas,
          SUM(CASE WHEN prioridad = 'urgente' THEN 1 ELSE 0 END) as ordenes_urgentes
        FROM ordenes_servicio 
        WHERE created_at >= ? AND created_at <= ?`,
        [fechaInicio, fechaFin]
      )

      // Tiempo promedio de resolución
      const [tiempoPromedio] = await pool.execute<RowDataPacket[]>(
        `SELECT AVG(tiempo_trabajo) as tiempo_promedio_resolucion
        FROM checkin_checkout_ordenes 
        WHERE tipo = 'check_out' AND timestamp >= ? AND timestamp <= ?`,
        [fechaInicio, fechaFin]
      )

      // Eficiencia de técnicos
      const [eficienciaTecnicos] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          AVG(CASE WHEN estado = 'completada' THEN 100 ELSE 0 END) as eficiencia_tecnicos
        FROM ordenes_servicio o
        JOIN tecnicos t ON o.tecnico_id = t.id
        WHERE o.updated_at >= ? AND o.updated_at <= ?`,
        [fechaInicio, fechaFin]
      )

      // SLA Cumplimiento (simulado)
      const slaCumplimiento = 94.2

      // Rendimiento por técnico
      const [rendimientoTecnicos] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          t.id,
          t.nombre,
          COUNT(o.id) as ordenes_asignadas,
          SUM(CASE WHEN o.estado = 'completada' THEN 1 ELSE 0 END) as ordenes_completadas,
          AVG(co.tiempo_trabajo) as tiempo_promedio,
          4.7 as calificacion,
          (SUM(CASE WHEN o.estado = 'completada' THEN 1 ELSE 0 END) / COUNT(o.id) * 100) as eficiencia,
          'Activo' as ubicacion_actual,
          CASE 
            WHEN COUNT(CASE WHEN o.estado = 'en_progreso' THEN 1 END) > 0 THEN 'ocupado'
            ELSE 'disponible'
          END as estado
        FROM tecnicos t
        LEFT JOIN ordenes_servicio o ON t.id = o.tecnico_id AND o.created_at >= ? AND o.created_at <= ?
        LEFT JOIN checkin_checkout_ordenes co ON o.id = co.orden_id AND co.tipo = 'check_out'
        GROUP BY t.id, t.nombre`,
        [fechaInicio, fechaFin]
      )

      // Órdenes críticas
      const [ordenesCriticas] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          o.*,
          t.nombre as tecnico_nombre,
          TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) as tiempo_transcurrido,
          o.tiempo_estimado as tiempo_limite
        FROM ordenes_servicio o
        LEFT JOIN tecnicos t ON o.tecnico_id = t.id
        WHERE o.prioridad IN ('urgente', 'alta') 
        AND o.estado IN ('pendiente', 'en_progreso')
        ORDER BY o.prioridad = 'urgente' DESC, o.created_at ASC
        LIMIT 10`
      )

      // Equipos críticos (simulado)
      const equiposCriticos = [
        {
          id: 1,
          nombre: 'Resonancia Magnética Siemens #001',
          cliente: 'Hospital San Rafael',
          tipo: 'Resonancia Magnética',
          ultimo_mantenimiento: '2024-08-15',
          proxima_revision: '2024-11-20',
          estado_salud: 78,
          criticidad: 'alta',
          alertas_pendientes: 2
        }
      ]

      const metricas = {
        ...metricasBasicas[0],
        tiempo_promedio_resolucion: tiempoPromedio[0]?.tiempo_promedio_resolucion || 0,
        eficiencia_tecnicos: eficienciaTecnicos[0]?.eficiencia_tecnicos || 0,
        sla_cumplimiento: slaCumplimiento,
        equipos_criticos: equiposCriticos.length
      }

      res.json({
        success: true,
        data: {
          metricas,
          rendimiento_tecnicos: rendimientoTecnicos,
          ordenes_criticas: ordenesCriticas,
          equipos_criticos: equiposCriticos
        }
      })

    } catch (error) {
      logger.error('Error al obtener métricas del dashboard:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  // Obtener tendencias operacionales
  static async obtenerTendenciasOperacionales(req: Request, res: Response) {
    try {
      const { periodo = '7d' } = req.query

      let intervalo: string
      let fechaInicio: Date

      switch (periodo) {
        case '1d':
          intervalo = '%H:00'
          fechaInicio = new Date(Date.now() - 24 * 60 * 60 * 1000)
          break
        case '7d':
          intervalo = '%Y-%m-%d'
          fechaInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          intervalo = '%Y-%m-%d'
          fechaInicio = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          intervalo = '%Y-%U'
          fechaInicio = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          break
        default:
          intervalo = '%Y-%m-%d'
          fechaInicio = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }

      const [tendencias] = await pool.execute<RowDataPacket[]>(
        `SELECT 
          DATE_FORMAT(updated_at, ?) as fecha,
          COUNT(CASE WHEN estado = 'completada' THEN 1 END) as ordenes_completadas,
          AVG(CASE WHEN estado = 'completada' THEN tiempo_estimado END) as tiempo_promedio,
          (COUNT(CASE WHEN estado = 'completada' THEN 1 END) / COUNT(*) * 100) as eficiencia,
          4.7 as satisfaccion_cliente
        FROM ordenes_servicio 
        WHERE updated_at >= ?
        GROUP BY DATE_FORMAT(updated_at, ?)
        ORDER BY fecha ASC`,
        [intervalo, fechaInicio, intervalo]
      )

      res.json({
        success: true,
        data: tendencias
      })

    } catch (error) {
      logger.error('Error al obtener tendencias:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }
}