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
 * Exportar cotizaciones a CSV
 */
export const exportarCotizacionesCSV = async (req: Request, res: Response): Promise<void> => {
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

    // Aplicar límite por defecto para evitar consultas muy grandes
    const exportLimit = limit ? parseInt(limit as string) : 100

    // Consulta para exportación (sin límite)
    const exportQuery = `
      SELECT 
        c.id as 'ID',
        c.id_cliente as 'ID Cliente',
        c.id_orden as 'ID Orden',
        c.creacion as 'Fecha Creación',
        c.id_creador as 'ID Creador',
        CASE c.id_estado 
          WHEN 1 THEN 'Pendiente'
          WHEN 2 THEN 'Aprobada'
          WHEN 3 THEN 'Rechazada'
          ELSE 'Desconocido'
        END as 'Estado',
        c.cambio_estado as 'Fecha Cambio Estado',
        c.id_cambiador as 'ID Cambiador',
        c.mensaje as 'Mensaje',
        c.observacion_estado as 'Observación Estado',
        c.condiciones as 'Condiciones'
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

    // Importar fast-csv dinámicamente
    const csv = require('fast-csv')
    
    csv.write(cotizaciones as any[], { headers: true })
      .pipe(res)

  } catch (error) {
    console.error('Error en exportarCotizacionesCSV:', error)
    res.status(500).json({
      success: false,
      message: 'Error al exportar cotizaciones'
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

/**
 * Exportar cotizaciones a Excel
 */
export const exportarCotizacionesExcel = async (req: Request, res: Response): Promise<void> => {
  let connection: mysql.Connection | null = null

  try {
    const { id_estado, id_cliente, fecha_desde, fecha_hasta, buscar, limit } = req.query

    connection = await mysql.createConnection(dbConfig)

    // Construir consulta con filtros (misma lógica que CSV)
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

    // Aplicar límite por defecto para evitar consultas muy grandes
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

    // Crear workbook de Excel
    const ExcelJS = require('exceljs')
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Cotizaciones')

    // Definir columnas
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'ID Cliente', key: 'id_cliente', width: 15 },
      { header: 'ID Orden', key: 'id_orden', width: 15 },
      { header: 'Fecha Creación', key: 'creacion', width: 20 },
      { header: 'ID Creador', key: 'id_creador', width: 15 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Fecha Cambio Estado', key: 'cambio_estado', width: 20 },
      { header: 'ID Cambiador', key: 'id_cambiador', width: 15 },
      { header: 'Mensaje', key: 'mensaje', width: 30 },
      { header: 'Observación Estado', key: 'observacion_estado', width: 30 },
      { header: 'Condiciones', key: 'condiciones', width: 30 }
    ] as any

    // Agregar datos
    (cotizaciones as any[]).forEach((row: any) => {
      worksheet.addRow(row)
    })

    // Estilo para encabezados
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    // Configurar respuesta Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="cotizaciones_${new Date().toISOString().split('T')[0]}.xlsx"`)

    await workbook.xlsx.write(res)

  } catch (error) {
    console.error('Error en exportarCotizacionesExcel:', error)
    res.status(500).json({
      success: false,
      message: 'Error al exportar cotizaciones'
    })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}