import { Request, Response } from 'express'
import mysql from 'mysql2/promise'

// Configuración de la base de datos
const dbConfig = {
  host: 'database',
  user: 'root',
  password: 'rootpassword',
  database: 'ziriuzco_ziriuz_real',
  port: 3306
}

/**
 * Exportar cotizaciones a CSV simple (sin fast-csv)
 */
export const exportarCotizacionesCSVSimple = async (req: Request, res: Response): Promise<void> => {
  let connection: mysql.Connection | null = null

  try {
    const { limit } = req.query
    const exportLimit = limit ? parseInt(limit as string) : 10

    connection = await mysql.createConnection(dbConfig)

    const exportQuery = `
      SELECT 
        c.id,
        c.id_cliente,
        c.id_orden,
        c.creacion,
        CASE c.id_estado 
          WHEN 1 THEN 'Pendiente'
          WHEN 2 THEN 'Aprobada'
          WHEN 3 THEN 'Rechazada'
          ELSE 'Desconocido'
        END as estado
      FROM cotizaciones c
      ORDER BY c.creacion DESC
      LIMIT ${exportLimit}
    `

    const [cotizaciones] = await connection.execute(exportQuery, [])

    // Configurar respuesta CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="cotizaciones_${new Date().toISOString().split('T')[0]}.csv"`)
    
    // Escribir CSV manualmente
    const headers = ['ID', 'ID Cliente', 'ID Orden', 'Fecha Creación', 'Estado']
    res.write(headers.join(',') + '\n')

    // Escribir datos
    for (const row of cotizaciones as any[]) {
      const values = [
        row.id,
        row.id_cliente || '',
        row.id_orden || '',
        new Date(row.creacion).toLocaleDateString('es-ES') + ' ' + new Date(row.creacion).toLocaleTimeString('es-ES'),
        row.estado
      ]
      res.write(values.map(v => `"${v}"`).join(',') + '\n')
    }

    res.end()

  } catch (error) {
    console.error('Error en exportarCotizacionesCSVSimple:', error)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error al exportar cotizaciones'
      })
    }
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

/**
 * Exportar cotizaciones a CSV completo (sin fast-csv)
 */
export const exportarCotizacionesCSVCompleto = async (req: Request, res: Response): Promise<void> => {
  let connection: mysql.Connection | null = null

  try {
    const { id_estado, id_cliente, fecha_desde, fecha_hasta, buscar, limit } = req.query

    connection = await mysql.createConnection(dbConfig)

    // Construir consulta con filtros
    const whereConditions: string[] = []
    const queryParams: any[] = []

    if (id_estado) {
      whereConditions.push('c.id_estado = ?')
      queryParams.push(parseInt(id_estado as string))
    }

    if (id_cliente) {
      whereConditions.push('c.id_cliente = ?')
      queryParams.push(parseInt(id_cliente as string))
    }

    if (fecha_desde) {
      whereConditions.push('DATE(c.creacion) >= ?')
      queryParams.push(fecha_desde)
    }

    if (fecha_hasta) {
      whereConditions.push('DATE(c.creacion) <= ?')
      queryParams.push(fecha_hasta)
    }

    if (buscar && typeof buscar === 'string' && buscar.trim()) {
      whereConditions.push('(c.mensaje LIKE ? OR c.observacion_estado LIKE ?)')
      const searchTerm = `%${buscar.trim()}%`
      queryParams.push(searchTerm, searchTerm)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Aplicar límite por defecto
    const exportLimit = limit ? parseInt(limit as string) : 100

    const exportQuery = `
      SELECT 
        c.id,
        c.id_cliente,
        c.id_orden,
        c.creacion,
        c.id_creador,
        CASE c.id_estado 
          WHEN 1 THEN 'Pendiente'
          WHEN 2 THEN 'Aprobada'
          WHEN 3 THEN 'Rechazada'
          ELSE 'Desconocido'
        END as estado,
        c.cambio_estado,
        c.id_cambiador,
        c.mensaje,
        c.observacion_estado,
        c.condiciones
      FROM cotizaciones c
      ${whereClause}
      ORDER BY c.creacion DESC
      LIMIT ${exportLimit}
    `

    const [cotizaciones] = await connection.execute(exportQuery, queryParams)

    // Configurar respuesta CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="cotizaciones_${new Date().toISOString().split('T')[0]}.csv"`)
    
    // Escribir BOM para UTF-8
    res.write('\uFEFF')

    // Escribir headers
    const headers = [
      'ID', 'ID Cliente', 'ID Orden', 'Fecha Creación', 'ID Creador', 
      'Estado', 'Fecha Cambio Estado', 'ID Cambiador', 'Mensaje', 
      'Observación Estado', 'Condiciones'
    ]
    res.write(headers.map(h => `"${h}"`).join(',') + '\n')

    // Escribir datos
    for (const row of cotizaciones as any[]) {
      const values = [
        row.id,
        row.id_cliente || '',
        row.id_orden || '',
        row.creacion ? new Date(row.creacion).toLocaleDateString('es-ES') + ' ' + new Date(row.creacion).toLocaleTimeString('es-ES') : '',
        row.id_creador || '',
        row.estado || '',
        row.cambio_estado ? new Date(row.cambio_estado).toLocaleDateString('es-ES') + ' ' + new Date(row.cambio_estado).toLocaleTimeString('es-ES') : '',
        row.id_cambiador || '',
        (row.mensaje || '').replace(/"/g, '""'),
        (row.observacion_estado || '').replace(/"/g, '""'),
        (row.condiciones || '').replace(/"/g, '""')
      ]
      res.write(values.map(v => `"${v}"`).join(',') + '\n')
    }

    res.end()

  } catch (error) {
    console.error('Error en exportarCotizacionesCSVCompleto:', error)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error al exportar cotizaciones'
      })
    }
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}