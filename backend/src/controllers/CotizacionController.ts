import { Request, Response } from 'express';
import DatabaseConnection from '../config/database';
import Joi from 'joi';

// Esquemas de validación
const cotizacionQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  estado: Joi.string().valid('borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'),
  cliente_id: Joi.number().integer().positive(),
  sede_id: Joi.number().integer().positive(),
  solicitud_id: Joi.number().integer().positive(),
  created_by: Joi.number().integer().positive(),
  fecha_desde: Joi.date().iso(),
  fecha_hasta: Joi.date().iso(),
  monto_min: Joi.number().positive(),
  monto_max: Joi.number().positive(),
  search: Joi.string().min(1).max(255),
  sort_by: Joi.string().valid('fecha_creacion', 'fecha_vencimiento', 'total', 'estado', 'numero_cotizacion').default('fecha_creacion'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc')
});

const itemCotizacionSchema = Joi.object({
  tipo_item: Joi.string().valid('repuesto', 'servicio', 'mano_obra', 'desplazamiento', 'otros').required(),
  descripcion: Joi.string().min(5).max(500).required(),
  cantidad: Joi.number().positive().required(),
  precio_unitario: Joi.number().positive().required(),
  descuento_porcentaje: Joi.number().min(0).max(100).default(0),
  observaciones: Joi.string().max(255).allow('')
});

const cotizacionCreateSchema = Joi.object({
  solicitud_id: Joi.number().integer().positive().required(),
  cliente_id: Joi.number().integer().positive().required(),
  sede_id: Joi.number().integer().positive().required(),
  titulo: Joi.string().min(5).max(255).required(),
  descripcion: Joi.string().min(10).max(1000).required(),
  fecha_vencimiento: Joi.date().iso().min('now').required(),
  condiciones_comerciales: Joi.string().max(2000),
  tiempo_entrega: Joi.string().max(255),
  validez_oferta: Joi.string().max(255),
  forma_pago: Joi.string().max(255),
  garantia: Joi.string().max(255),
  observaciones: Joi.string().max(1000),
  items: Joi.array().items(itemCotizacionSchema).min(1).required()
});

const cotizacionUpdateSchema = Joi.object({
  titulo: Joi.string().min(5).max(255),
  descripcion: Joi.string().min(10).max(1000),
  fecha_vencimiento: Joi.date().iso().min('now'),
  estado: Joi.string().valid('borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'),
  condiciones_comerciales: Joi.string().max(2000).allow(''),
  tiempo_entrega: Joi.string().max(255).allow(''),
  validez_oferta: Joi.string().max(255).allow(''),
  forma_pago: Joi.string().max(255).allow(''),
  garantia: Joi.string().max(255).allow(''),
  observaciones: Joi.string().max(1000).allow(''),
  motivo_rechazo: Joi.string().max(500).allow(''),
  fecha_aprobacion: Joi.date().iso().allow(null),
  aprobada_por: Joi.number().integer().positive().allow(null)
});

export class CotizacionController {
  /**
   * Obtener todas las cotizaciones con filtros avanzados
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = cotizacionQuerySchema.validate(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de consulta inválidos',
          errors: error.details
        });
        return;
      }

      const {
        page,
        limit,
        estado,
        cliente_id,
        sede_id,
        solicitud_id,
        created_by,
        fecha_desde,
        fecha_hasta,
        monto_min,
        monto_max,
        search,
        sort_by,
        sort_order
      } = value;

      const offset = (page - 1) * limit;
      
      let whereConditions = ['1=1'];
      let queryParams: any[] = [];

      // Construir condiciones WHERE
      if (estado) {
        whereConditions.push(`cot.estado = ?`);
        queryParams.push(estado);
      }

      if (cliente_id) {
        whereConditions.push(`cot.cliente_id = ?`);
        queryParams.push(cliente_id);
      }

      if (sede_id) {
        whereConditions.push(`cot.sede_id = ?`);
        queryParams.push(sede_id);
      }

      if (solicitud_id) {
        whereConditions.push(`cot.solicitud_id = ?`);
        queryParams.push(solicitud_id);
      }

      if (created_by) {
        whereConditions.push(`cot.created_by = ?`);
        queryParams.push(created_by);
      }

      if (fecha_desde) {
        whereConditions.push(`cot.fecha_creacion >= ?`);
        queryParams.push(fecha_desde);
      }

      if (fecha_hasta) {
        whereConditions.push(`cot.fecha_creacion <= ?`);
        queryParams.push(fecha_hasta);
      }

      if (monto_min) {
        whereConditions.push(`cot.total >= ?`);
        queryParams.push(monto_min);
      }

      if (monto_max) {
        whereConditions.push(`cot.total <= ?`);
        queryParams.push(monto_max);
      }

      if (search) {
        whereConditions.push(`(
          cot.numero_cotizacion LIKE ? OR 
          cot.titulo LIKE ? OR
          cot.descripcion LIKE ? OR
          c.nombre LIKE ? OR
          s.nombre LIKE ?
        )`);
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
      }

      const whereClause = whereConditions.join(' AND ');

      // Query principal para obtener cotizaciones
      const cotizacionesQuery = `
        SELECT 
          cot.id,
          cot.numero_cotizacion,
          cot.solicitud_id,
          cot.cliente_id,
          cot.sede_id,
          cot.titulo,
          cot.descripcion,
          cot.estado,
          cot.subtotal,
          cot.descuento_total,
          cot.impuestos,
          cot.total,
          cot.fecha_creacion,
          cot.fecha_vencimiento,
          cot.fecha_aprobacion,
          cot.condiciones_comerciales,
          cot.tiempo_entrega,
          cot.validez_oferta,
          cot.forma_pago,
          cot.garantia,
          cot.observaciones,
          cot.motivo_rechazo,
          cot.created_by,
          cot.aprobada_por,
          cot.fecha_actualizacion,
          
          -- Información del cliente y sede
          c.nombre as cliente_nombre,
          c.tipo_cliente,
          c.nit as cliente_nit,
          s.nombre as sede_nombre,
          s.direccion as sede_direccion,
          s.telefono as sede_telefono,
          
          -- Información de la solicitud
          sol.tipo_solicitud,
          sol.prioridad as solicitud_prioridad,
          
          -- Información del creador
          u_creator.nombre as creador_nombre,
          u_creator.apellido as creador_apellido,
          
          -- Información de quien aprobó
          u_approver.nombre as aprobador_nombre,
          u_approver.apellido as aprobador_apellido,
          
          -- Contar items
          (SELECT COUNT(*) FROM cotizacion_items ci WHERE ci.cotizacion_id = cot.id) as total_items
          
        FROM cotizaciones cot
        LEFT JOIN clientes c ON cot.cliente_id = c.id
        LEFT JOIN sedes s ON cot.sede_id = s.id
        LEFT JOIN solicitudes sol ON cot.solicitud_id = sol.id
        LEFT JOIN usuarios u_creator ON cot.created_by = u_creator.id
        LEFT JOIN usuarios u_approver ON cot.aprobada_por = u_approver.id
        WHERE ${whereClause}
        ORDER BY cot.${sort_by} ${sort_order.toUpperCase()}
        LIMIT ? OFFSET ?
      `;

      queryParams.push(limit, offset);

      // Query para contar total de registros
      const countQuery = `
        SELECT COUNT(*) as total
        FROM cotizaciones cot
        LEFT JOIN clientes c ON cot.cliente_id = c.id
        LEFT JOIN sedes s ON cot.sede_id = s.id
        LEFT JOIN solicitudes sol ON cot.solicitud_id = sol.id
        WHERE ${whereClause}
      `;

      const countParams = queryParams.slice(0, -2); // Remover limit y offset

      const [cotizaciones, countResult] = await Promise.all([
        DatabaseConnection.query(cotizacionesQuery, queryParams),
        DatabaseConnection.query(countQuery, countParams)
      ]);

      const total = Array.isArray(countResult) && countResult.length > 0 ? countResult[0].total : 0;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: cotizaciones,
        pagination: {
          current_page: page,
          per_page: limit,
          total_items: total,
          total_pages: totalPages,
          has_next_page: page < totalPages,
          has_prev_page: page > 1
        }
      });

    } catch (error) {
      console.error('Error al obtener cotizaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtener una cotización por ID con sus items
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '0');
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de cotización inválido'
        });
        return;
      }

      // Query para obtener la cotización
      const cotizacionQuery = `
        SELECT 
          cot.*,
          
          -- Información del cliente y sede
          c.nombre as cliente_nombre,
          c.tipo_cliente,
          c.nit as cliente_nit,
          c.telefono as cliente_telefono,
          c.email as cliente_email,
          s.nombre as sede_nombre,
          s.direccion as sede_direccion,
          s.telefono as sede_telefono,
          s.contacto_principal as sede_contacto,
          
          -- Información de la solicitud
          sol.tipo_solicitud,
          sol.descripcion as solicitud_descripcion,
          sol.prioridad as solicitud_prioridad,
          
          -- Información del creador
          u_creator.nombre as creador_nombre,
          u_creator.apellido as creador_apellido,
          u_creator.email as creador_email,
          
          -- Información de quien aprobó
          u_approver.nombre as aprobador_nombre,
          u_approver.apellido as aprobador_apellido
          
        FROM cotizaciones cot
        LEFT JOIN clientes c ON cot.cliente_id = c.id
        LEFT JOIN sedes s ON cot.sede_id = s.id
        LEFT JOIN solicitudes sol ON cot.solicitud_id = sol.id
        LEFT JOIN usuarios u_creator ON cot.created_by = u_creator.id
        LEFT JOIN usuarios u_approver ON cot.aprobada_por = u_approver.id
        WHERE cot.id = ?
      `;

      // Query para obtener los items de la cotización
      const itemsQuery = `
        SELECT 
          id,
          tipo_item,
          descripcion,
          cantidad,
          precio_unitario,
          descuento_porcentaje,
          subtotal,
          observaciones
        FROM cotizacion_items
        WHERE cotizacion_id = ?
        ORDER BY id
      `;

      const [cotizacionResult, itemsResult] = await Promise.all([
        DatabaseConnection.query(cotizacionQuery, [id]),
        DatabaseConnection.query(itemsQuery, [id])
      ]);

      if (!Array.isArray(cotizacionResult) || cotizacionResult.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
        return;
      }

      const cotizacion = cotizacionResult[0];
      cotizacion.items = itemsResult || [];

      res.json({
        success: true,
        data: cotizacion
      });

    } catch (error) {
      console.error('Error al obtener cotización:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Crear nueva cotización
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = cotizacionCreateSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Datos de cotización inválidos',
          errors: error.details
        });
        return;
      }

      // Verificar que la solicitud existe
      const solicitudCheck = await DatabaseConnection.query(
        'SELECT id FROM solicitudes WHERE id = ?',
        [value.solicitud_id]
      );

      if (!Array.isArray(solicitudCheck) || solicitudCheck.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Solicitud no encontrada'
        });
        return;
      }

      // Verificar que el cliente existe
      const clienteCheck = await DatabaseConnection.query(
        'SELECT id FROM clientes WHERE id = ?',
        [value.cliente_id]
      );

      if (!Array.isArray(clienteCheck) || clienteCheck.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Cliente no encontrado'
        });
        return;
      }

      // Verificar que la sede existe y pertenece al cliente
      const sedeCheck = await DatabaseConnection.query(
        'SELECT id FROM sedes WHERE id = ? AND cliente_id = ?',
        [value.sede_id, value.cliente_id]
      );

      if (!Array.isArray(sedeCheck) || sedeCheck.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Sede no encontrada o no pertenece al cliente'
        });
        return;
      }

      // Calcular totales
      let subtotal = 0;
      let descuentoTotal = 0;
      
      const itemsCalculados = value.items.map((item: any) => {
        const subtotalItem = item.cantidad * item.precio_unitario;
        const descuentoItem = (subtotalItem * item.descuento_porcentaje) / 100;
        const subtotalConDescuento = subtotalItem - descuentoItem;
        
        subtotal += subtotalItem;
        descuentoTotal += descuentoItem;
        
        return {
          ...item,
          subtotal: subtotalConDescuento
        };
      });

      const impuestos = (subtotal - descuentoTotal) * 0.19; // IVA 19%
      const total = subtotal - descuentoTotal + impuestos;

      // Generar número de cotización
      const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
      const countResult = await DatabaseConnection.query(
        'SELECT COUNT(*) as count FROM cotizaciones WHERE DATE_FORMAT(fecha_creacion, "%Y%m") = ?',
        [yearMonth]
      );
      const consecutivo = (Array.isArray(countResult) ? countResult[0].count : 0) + 1;
      const numeroCotizacion = `COT-${yearMonth}-${consecutivo.toString().padStart(4, '0')}`;

      // Iniciar transacción
      await DatabaseConnection.query('START TRANSACTION');

      try {
        // Insertar cotización
        const insertCotizacionQuery = `
          INSERT INTO cotizaciones (
            numero_cotizacion, solicitud_id, cliente_id, sede_id, titulo, descripcion,
            estado, subtotal, descuento_total, impuestos, total, fecha_vencimiento,
            condiciones_comerciales, tiempo_entrega, validez_oferta, forma_pago,
            garantia, observaciones, created_by, fecha_creacion, fecha_actualizacion
          ) VALUES (?, ?, ?, ?, ?, ?, 'borrador', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const cotizacionResult = await DatabaseConnection.query(insertCotizacionQuery, [
          numeroCotizacion,
          value.solicitud_id,
          value.cliente_id,
          value.sede_id,
          value.titulo,
          value.descripcion,
          subtotal,
          descuentoTotal,
          impuestos,
          total,
          value.fecha_vencimiento,
          value.condiciones_comerciales || '',
          value.tiempo_entrega || '',
          value.validez_oferta || '',
          value.forma_pago || '',
          value.garantia || '',
          value.observaciones || '',
          (req as any).user?.id || 1 // Asignar usuario actual o admin por defecto
        ]);

        if (!cotizacionResult || typeof cotizacionResult !== 'object' || !('insertId' in cotizacionResult)) {
          throw new Error('No se pudo crear la cotización');
        }

        const cotizacionId = cotizacionResult.insertId;

        // Insertar items
        for (const item of itemsCalculados) {
          const insertItemQuery = `
            INSERT INTO cotizacion_items (
              cotizacion_id, tipo_item, descripcion, cantidad, precio_unitario,
              descuento_porcentaje, subtotal, observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          await DatabaseConnection.query(insertItemQuery, [
            cotizacionId,
            item.tipo_item,
            item.descripcion,
            item.cantidad,
            item.precio_unitario,
            item.descuento_porcentaje,
            item.subtotal,
            item.observaciones || ''
          ]);
        }

        await DatabaseConnection.query('COMMIT');

        // Obtener la cotización creada
        const newCotizacion = await DatabaseConnection.query(
          'SELECT * FROM cotizaciones WHERE id = ?',
          [cotizacionId]
        );

        res.status(201).json({
          success: true,
          message: 'Cotización creada exitosamente',
          data: Array.isArray(newCotizacion) ? newCotizacion[0] : null
        });

      } catch (transactionError) {
        await DatabaseConnection.query('ROLLBACK');
        throw transactionError;
      }

    } catch (error) {
      console.error('Error al crear cotización:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Actualizar cotización
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id || '0');
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: 'ID de cotización inválido'
        });
        return;
      }

      const { error, value } = cotizacionUpdateSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Datos de actualización inválidos',
          errors: error.details
        });
        return;
      }

      // Verificar que la cotización existe
      const cotizacionCheck = await DatabaseConnection.query(
        'SELECT id, estado FROM cotizaciones WHERE id = ?',
        [id]
      );

      if (!Array.isArray(cotizacionCheck) || cotizacionCheck.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Cotización no encontrada'
        });
        return;
      }

      const estadoActual = cotizacionCheck[0].estado;

      // Validaciones según el estado
      if (value.estado) {
        // No permitir cambios desde estado aprobada
        if (estadoActual === 'aprobada' && value.estado !== 'aprobada') {
          res.status(400).json({
            success: false,
            message: 'No se puede cambiar el estado de una cotización aprobada'
          });
          return;
        }

        // Validar campos requeridos para aprobación
        if (value.estado === 'aprobada') {
          value.fecha_aprobacion = new Date().toISOString();
          value.aprobada_por = (req as any).user?.id || 1;
        }

        if (value.estado === 'rechazada' && !value.motivo_rechazo) {
          res.status(400).json({
            success: false,
            message: 'El motivo de rechazo es requerido'
          });
          return;
        }
      }

      // Construir query de actualización dinámicamente
      const updateFields = [];
      const updateValues = [];

      Object.entries(value).forEach(([key, val]) => {
        if (val !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(val);
        }
      });

      if (updateFields.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No hay campos para actualizar'
        });
        return;
      }

      updateFields.push('fecha_actualizacion = NOW()');
      updateValues.push(id);

      const updateQuery = `
        UPDATE cotizaciones 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      await DatabaseConnection.query(updateQuery, updateValues);

      // Obtener la cotización actualizada
      const updatedCotizacion = await DatabaseConnection.query(
        'SELECT * FROM cotizaciones WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Cotización actualizada exitosamente',
        data: Array.isArray(updatedCotizacion) ? updatedCotizacion[0] : null
      });

    } catch (error) {
      console.error('Error al actualizar cotización:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Obtener estadísticas de cotizaciones
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_cotizaciones,
          SUM(CASE WHEN estado = 'borrador' THEN 1 ELSE 0 END) as borradores,
          SUM(CASE WHEN estado = 'enviada' THEN 1 ELSE 0 END) as enviadas,
          SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas,
          SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as rechazadas,
          SUM(CASE WHEN estado = 'vencida' THEN 1 ELSE 0 END) as vencidas,
          SUM(CASE WHEN estado = 'aprobada' THEN total ELSE 0 END) as valor_aprobado,
          AVG(CASE WHEN estado = 'aprobada' THEN total ELSE NULL END) as valor_promedio_aprobado,
          SUM(CASE WHEN fecha_vencimiento < CURDATE() AND estado IN ('borrador', 'enviada') THEN 1 ELSE 0 END) as por_vencer
        FROM cotizaciones
      `;

      const clientesQuery = `
        SELECT 
          c.id,
          c.nombre,
          COUNT(cot.id) as total_cotizaciones,
          SUM(CASE WHEN cot.estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas,
          SUM(CASE WHEN cot.estado = 'aprobada' THEN cot.total ELSE 0 END) as valor_total
        FROM clientes c
        LEFT JOIN cotizaciones cot ON c.id = cot.cliente_id
        GROUP BY c.id, c.nombre
        HAVING total_cotizaciones > 0
        ORDER BY valor_total DESC
        LIMIT 10
      `;

      const [generalStats, clientesStats] = await Promise.all([
        DatabaseConnection.query(statsQuery),
        DatabaseConnection.query(clientesQuery)
      ]);

      res.json({
        success: true,
        data: {
          general: Array.isArray(generalStats) ? generalStats[0] : {},
          por_cliente: clientesStats
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de cotizaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}