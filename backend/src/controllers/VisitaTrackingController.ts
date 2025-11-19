import { Request, Response } from 'express'
import db from '../config/database'

export class VisitaTrackingController {
  /**
   * Registrar evento de tracking
   */
  static async registrarEvento(req: Request, res: Response): Promise<void> {
    try {
      const { visita_id, latitud, longitud, precision, direccion, timestamp, evento_tipo, descripcion, metadata } = req.body

      // Validar datos requeridos
      if (!visita_id || !latitud || !longitud) {
        res.status(400).json({
          success: false,
          message: 'Datos de tracking incompletos'
        })
        return
      }

      // Insertar evento de tracking
      const query = `
        INSERT INTO visitas_tracking 
        (visita_id, latitud, longitud, precision_gps, direccion, timestamp, evento_tipo, descripcion, metadata, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `

      const result = await db.query(query, [
        visita_id,
        latitud,
        longitud,
        precision || 0,
        direccion || null,
        timestamp,
        evento_tipo,
        descripcion || null,
        metadata ? JSON.stringify(metadata) : null
      ])

      // Actualizar ubicación actual de la visita
      await db.query(`
        UPDATE visitas 
        SET 
          ubicacion_actual_lat = ?, 
          ubicacion_actual_lng = ?,
          ultima_actualizacion = NOW()
        WHERE id = ?
      `, [latitud, longitud, visita_id])

      res.status(201).json({
        success: true,
        message: 'Evento de tracking registrado exitosamente',
        data: {
          id: result.insertId || 0,
          timestamp: timestamp
        }
      })

    } catch (error) {
      console.error('Error registrando evento de tracking:', error)
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      })
    }
  }

  /**
   * Procesar check-in
   */
  static async checkIn(req: Request, res: Response): Promise<void> {
    try {
      const { visita_id, tecnico_id, ubicacion, fecha_hora, observaciones, qr_codigo, fotos } = req.body

      // Validar datos requeridos
      if (!visita_id || !tecnico_id || !ubicacion) {
        res.status(400).json({
          success: false,
          message: 'Datos de check-in incompletos'
        })
        return
      }

      // Registrar check-in
      const checkInQuery = `
        INSERT INTO visitas_checkin_checkout 
        (visita_id, tecnico_id, tipo, latitud, longitud, precision_gps, direccion, 
         fecha_hora, observaciones, qr_codigo, created_at) 
        VALUES (?, ?, 'check_in', ?, ?, ?, ?, ?, ?, ?, NOW())
      `

      const checkInResult = await db.query(checkInQuery, [
        visita_id,
        tecnico_id,
        ubicacion.latitud,
        ubicacion.longitud,
        ubicacion.precision || 0,
        ubicacion.direccion || null,
        fecha_hora,
        observaciones || null,
        qr_codigo || null
      ])

      // Actualizar estado de la visita
      await db.query(`
        UPDATE visitas 
        SET 
          estado = 'en_curso',
          fecha_inicio_real = ?,
          ubicacion_actual_lat = ?,
          ubicacion_actual_lng = ?,
          tecnico_actual_id = ?,
          ultima_actualizacion = NOW()
        WHERE id = ?
      `, [
        fecha_hora,
        ubicacion.latitud,
        ubicacion.longitud,
        tecnico_id,
        visita_id
      ])

      // Registrar evento de tracking
      await db.query(`
        INSERT INTO visitas_tracking 
        (visita_id, latitud, longitud, precision_gps, direccion, timestamp, evento_tipo, descripcion, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, 'check_in', 'Check-in realizado exitosamente', NOW())
      `, [
        visita_id,
        ubicacion.latitud,
        ubicacion.longitud,
        ubicacion.precision || 0,
        ubicacion.direccion || null,
        fecha_hora
      ])

      // Procesar fotos si las hay
      if (fotos && fotos.length > 0) {
        for (const fotoUrl of fotos) {
          await db.query(`
            INSERT INTO visitas_fotos 
            (visita_id, nombre, url, miniatura, etiquetas, tipo_evento, created_at) 
            VALUES (?, ?, ?, ?, '["check_in"]', 'check_in', NOW())
          `, [
            visita_id,
            `checkin_${Date.now()}.jpg`,
            fotoUrl,
            fotoUrl
          ])
        }
      }

      res.status(201).json({
        success: true,
        message: 'Check-in registrado exitosamente',
        data: {
          checkin_id: checkInResult.insertId || 0,
          visita_id: visita_id,
          fecha_hora: fecha_hora,
          ubicacion: ubicacion
        }
      })

    } catch (error) {
      console.error('Error en check-in:', error)
      res.status(500).json({
        success: false,
        message: 'Error procesando check-in'
      })
    }
  }

  /**
   * Procesar check-out
   */
  static async checkOut(req: Request, res: Response): Promise<void> {
    try {
      const { visita_id, tecnico_id, ubicacion, fecha_hora, observaciones } = req.body

      // Validar datos requeridos
      if (!visita_id || !tecnico_id) {
        res.status(400).json({
          success: false,
          message: 'Datos de check-out incompletos'
        })
        return
      }

      // Registrar check-out
      const checkOutQuery = `
        INSERT INTO visitas_checkin_checkout 
        (visita_id, tecnico_id, tipo, latitud, longitud, precision_gps, direccion, 
         fecha_hora, observaciones, created_at) 
        VALUES (?, ?, 'check_out', ?, ?, ?, ?, ?, ?, NOW())
      `

      const checkOutResult = await db.query(checkOutQuery, [
        visita_id,
        tecnico_id,
        ubicacion?.latitud || null,
        ubicacion?.longitud || null,
        ubicacion?.precision || 0,
        ubicacion?.direccion || null,
        fecha_hora,
        observaciones || null
      ])

      // Calcular duración de la visita
      const checkInRecord = await db.query(`
        SELECT fecha_hora FROM visitas_checkin_checkout 
        WHERE visita_id = ? AND tipo = 'check_in' 
        ORDER BY created_at DESC LIMIT 1
      `, [visita_id])

      let duracionMinutos = 0
      if (checkInRecord && checkInRecord.length > 0) {
        const checkInTime = new Date(checkInRecord[0].fecha_hora)
        const checkOutTime = new Date(fecha_hora)
        duracionMinutos = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60))
      }

      // Actualizar estado de la visita
      await db.query(`
        UPDATE visitas 
        SET 
          estado = 'completada',
          fecha_fin_real = ?,
          duracion_minutos = ?,
          ultima_actualizacion = NOW()
        WHERE id = ?
      `, [fecha_hora, duracionMinutos, visita_id])

      // Registrar evento de tracking
      await db.query(`
        INSERT INTO visitas_tracking 
        (visita_id, latitud, longitud, precision_gps, timestamp, evento_tipo, descripcion, created_at) 
        VALUES (?, ?, ?, ?, ?, 'check_out', ?, NOW())
      `, [
        visita_id,
        ubicacion?.latitud || null,
        ubicacion?.longitud || null,
        ubicacion?.precision || 0,
        fecha_hora,
        `Check-out realizado. Duración: ${duracionMinutos} minutos`
      ])

      res.status(200).json({
        success: true,
        message: 'Check-out registrado exitosamente',
        data: {
          checkout_id: checkOutResult.insertId || 0,
          visita_id: visita_id,
          duracion_minutos: duracionMinutos,
          fecha_hora: fecha_hora
        }
      })

    } catch (error) {
      console.error('Error en check-out:', error)
      res.status(500).json({
        success: false,
        message: 'Error procesando check-out'
      })
    }
  }

  /**
   * Subir fotos de visita
   */
  static async subirFotos(req: Request, res: Response): Promise<void> {
    try {
      const { visita_id } = req.params
      const { fotos } = req.body

      if (!fotos || fotos.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No se proporcionaron fotos para subir'
        })
        return
      }

      const fotosSubidas = []

      for (const foto of fotos) {
        const query = `
          INSERT INTO visitas_fotos 
          (visita_id, nombre, url, miniatura, tamaño, descripcion, etiquetas, 
           ubicacion_lat, ubicacion_lng, metadata, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `

        const result = await db.query(query, [
          parseInt(visita_id as string),
          foto.nombre,
          foto.url,
          foto.miniatura,
          foto.tamaño,
          foto.descripcion || null,
          JSON.stringify(foto.etiquetas),
          foto.ubicacion?.latitud || null,
          foto.ubicacion?.longitud || null,
          JSON.stringify(foto.metadata)
        ])

        fotosSubidas.push({
          id: result.insertId || 0,
          nombre: foto.nombre,
          url: foto.url
        })
      }

      // Registrar evento de tracking
      await db.query(`
        INSERT INTO visitas_tracking 
        (visita_id, timestamp, evento_tipo, descripcion, metadata, created_at) 
        VALUES (?, NOW(), 'foto_subida', ?, ?, NOW())
      `, [
        parseInt(visita_id as string),
        `${fotos.length} foto(s) subida(s)`,
        JSON.stringify({ cantidad_fotos: fotos.length })
      ])

      res.status(201).json({
        success: true,
        message: `${fotos.length} foto(s) subida(s) exitosamente`,
        data: {
          fotos_subidas: fotosSubidas,
          total: fotos.length
        }
      })

    } catch (error) {
      console.error('Error subiendo fotos:', error)
      res.status(500).json({
        success: false,
        message: 'Error subiendo fotos'
      })
    }
  }

  /**
   * Obtener historial de tracking de una visita
   */
  static async getHistorialTracking(req: Request, res: Response): Promise<void> {
    try {
      const { visita_id } = req.params

      const query = `
        SELECT 
          id,
          latitud,
          longitud,
          precision_gps,
          direccion,
          timestamp,
          evento_tipo,
          descripcion,
          metadata,
          created_at
        FROM visitas_tracking 
        WHERE visita_id = ? 
        ORDER BY created_at DESC
      `

      const rows = await db.query(query, [parseInt(visita_id as string)])

      res.status(200).json({
        success: true,
        data: {
          visita_id: parseInt(visita_id as string),
          eventos: rows.map((row: any) => ({
            ...row,
            metadata: row.metadata ? JSON.parse(row.metadata) : null
          })),
          total: rows.length
        }
      })

    } catch (error) {
      console.error('Error obteniendo historial de tracking:', error)
      res.status(500).json({
        success: false,
        message: 'Error obteniendo historial de tracking'
      })
    }
  }

  /**
   * Obtener fotos de una visita
   */
  static async getFotosVisita(req: Request, res: Response): Promise<void> {
    try {
      const { visita_id } = req.params

      const query = `
        SELECT 
          id,
          nombre,
          url,
          miniatura,
          tamaño,
          descripcion,
          etiquetas,
          ubicacion_lat,
          ubicacion_lng,
          metadata,
          tipo_evento,
          created_at
        FROM visitas_fotos 
        WHERE visita_id = ? 
        ORDER BY created_at DESC
      `

      const rows = await db.query(query, [parseInt(visita_id as string)])

      const fotos = rows.map((row: any) => ({
        id: row.id,
        nombre: row.nombre,
        url: row.url,
        miniatura: row.miniatura,
        tamaño: row.tamaño,
        descripcion: row.descripcion,
        etiquetas: row.etiquetas ? JSON.parse(row.etiquetas) : [],
        ubicacion: row.ubicacion_lat && row.ubicacion_lng ? {
          latitud: row.ubicacion_lat,
          longitud: row.ubicacion_lng
        } : null,
        metadata: row.metadata ? JSON.parse(row.metadata) : {},
        tipo_evento: row.tipo_evento,
        fecha_subida: row.created_at,
        favorita: false,
        comentarios: []
      }))

      res.status(200).json({
        success: true,
        data: {
          visita_id: parseInt(visita_id as string),
          fotos: fotos,
          total: fotos.length
        }
      })

    } catch (error) {
      console.error('Error obteniendo fotos de visita:', error)
      res.status(500).json({
        success: false,
        message: 'Error obteniendo fotos de visita'
      })
    }
  }

  /**
   * Obtener estadísticas de dashboard en tiempo real
   */
  static async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      // Estadísticas del día actual
      const hoy = new Date().toISOString().split('T')[0]

      const statsQuery = `
        SELECT 
          COUNT(*) as total_hoy,
          SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as programadas,
          SUM(CASE WHEN estado = 'en_curso' THEN 1 ELSE 0 END) as en_curso,
          SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
          AVG(CASE WHEN duracion_minutos > 0 THEN duracion_minutos ELSE NULL END) as tiempo_promedio
        FROM visitas 
        WHERE DATE(fecha_programada) = ? AND activo = 1
      `

      const statsRows = await db.query(statsQuery, [hoy])
      const stats = statsRows[0] || {}

      // Técnicos activos
      const tecnicosQuery = `
        SELECT 
          t.id,
          t.nombre,
          t.telefono,
          COUNT(v.id) as visitas_asignadas,
          SUM(CASE WHEN v.estado = 'completada' THEN 1 ELSE 0 END) as visitas_completadas
        FROM tecnicos t
        LEFT JOIN visitas v ON t.id = v.tecnico_id AND DATE(v.fecha_programada) = ?
        WHERE t.activo = 1
        GROUP BY t.id, t.nombre, t.telefono
      `

      const tecnicosRows = await db.query(tecnicosQuery, [hoy])

      // Alertas activas (visitas con retraso)
      const alertasQuery = `
        SELECT 
          v.id,
          v.numero_visita,
          v.cliente_nombre,
          v.estado,
          v.fecha_programada,
          TIMESTAMPDIFF(MINUTE, v.fecha_programada, NOW()) as minutos_retraso
        FROM visitas v
        WHERE v.estado IN ('programada', 'en_curso') 
        AND v.fecha_programada < NOW() 
        AND DATE(v.fecha_programada) = ?
        AND v.activo = 1
        HAVING minutos_retraso > 30
      `

      const alertasRows = await db.query(alertasQuery, [hoy])

      res.status(200).json({
        success: true,
        data: {
          estadisticas: {
            total_hoy: stats.total_hoy || 0,
            programadas: stats.programadas || 0,
            en_curso: stats.en_curso || 0,
            completadas: stats.completadas || 0,
            canceladas: stats.canceladas || 0,
            tiempo_promedio: Math.round(stats.tiempo_promedio || 0),
            eficiencia_tecnico: stats.completadas > 0 ? 
              Math.round((stats.completadas / (stats.total_hoy || 1)) * 100) : 0,
            satisfaccion_cliente: 94.2
          },
          tecnicos: (tecnicosRows as any[]).map((tecnico: any) => ({
            id: tecnico.id,
            nombre: tecnico.nombre,
            visitas_asignadas: tecnico.visitas_asignadas || 0,
            visitas_completadas: tecnico.visitas_completadas || 0,
            eficiencia: tecnico.visitas_asignadas > 0 ? 
              Math.round((tecnico.visitas_completadas / tecnico.visitas_asignadas) * 100) : 100
          })),
          alertas: (alertasRows as any[]).map((alerta: any) => ({
            id: alerta.id,
            tipo: 'retraso',
            prioridad: alerta.minutos_retraso > 60 ? 'alta' : 'media',
            titulo: `Visita ${alerta.numero_visita} con retraso`,
            descripcion: `${alerta.cliente_nombre} - ${alerta.minutos_retraso} minutos de retraso`,
            visita_id: alerta.id,
            tiempo_transcurrido: alerta.minutos_retraso,
            requiere_accion: alerta.minutos_retraso > 60
          }))
        }
      })

    } catch (error) {
      console.error('Error obteniendo estadísticas de dashboard:', error)
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de dashboard'
      })
    }
  }

  /**
   * Obtener ubicaciones de técnicos en tiempo real
   */
  static async getTecnicosEnCampo(req: Request, res: Response): Promise<void> {
    try {
      const query = `
        SELECT 
          t.id,
          t.nombre,
          t.telefono,
          vt.latitud,
          vt.longitud,
          vt.direccion,
          vt.timestamp as ultima_ubicacion,
          v.id as visita_actual_id,
          v.numero_visita,
          v.cliente_nombre,
          v.estado as estado_visita,
          CASE 
            WHEN v.estado = 'en_curso' THEN 'en_visita'
            WHEN vt.timestamp > DATE_SUB(NOW(), INTERVAL 5 MINUTE) THEN 'en_ruta'
            WHEN vt.timestamp > DATE_SUB(NOW(), INTERVAL 30 MINUTE) THEN 'disponible'
            ELSE 'desconectado'
          END as estado_tecnico
        FROM tecnicos t
        LEFT JOIN visitas v ON t.id = v.tecnico_id 
          AND v.estado IN ('programada', 'en_curso') 
          AND DATE(v.fecha_programada) = CURDATE()
        LEFT JOIN visitas_tracking vt ON v.id = vt.visita_id 
          AND vt.id = (
            SELECT MAX(id) FROM visitas_tracking vt2 
            WHERE vt2.visita_id = v.id
          )
        WHERE t.activo = 1
        ORDER BY t.nombre
      `

      const rows = await db.query(query)

      const tecnicos = (rows as any[]).map((row: any) => ({
        id: row.id,
        nombre: row.nombre,
        telefono: row.telefono,
        estado: row.estado_tecnico,
        ubicacion: row.latitud && row.longitud ? {
          latitud: row.latitud,
          longitud: row.longitud,
          direccion: row.direccion || 'Ubicación desconocida'
        } : null,
        ultima_actividad: row.ultima_ubicacion || new Date().toISOString(),
        visita_actual: row.visita_actual_id ? {
          id: row.visita_actual_id,
          numero_visita: row.numero_visita,
          cliente: row.cliente_nombre,
          estado: row.estado_visita
        } : null
      }))

      res.status(200).json({
        success: true,
        data: {
          tecnicos,
          total: tecnicos.length,
          conectados: tecnicos.filter((t: any) => t.estado !== 'desconectado').length,
          en_campo: tecnicos.filter((t: any) => ['en_visita', 'en_ruta'].includes(t.estado)).length
        }
      })

    } catch (error) {
      console.error('Error obteniendo técnicos en campo:', error)
      res.status(500).json({
        success: false,
        message: 'Error obteniendo técnicos en campo'
      })
    }
  }
}