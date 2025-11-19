import { Request, Response } from 'express'
import db from '../config/database'

export class SolicitudBodegaControllerReal {
  
  // Obtener estadísticas de las solicitudes de bodega
  static async obtenerEstadisticas(req: Request, res: Response) {
    try {
      console.log('📊 [SolicitudesBodega] Obteniendo estadísticas');

      const estadisticasQuery = `
        SELECT 
          COUNT(*) as totalSolicitudes,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as solicitudesPendientes,
          COUNT(CASE WHEN estado = 'aprobada' THEN 1 END) as solicitudesAprobadas,
          COUNT(CASE WHEN estado = 'despachada' THEN 1 END) as solicitudesDespachadas,
          COUNT(CASE WHEN estado = 'terminada' THEN 1 END) as solicitudesTerminadas,
          COUNT(CASE WHEN estado = 'rechazada' THEN 1 END) as solicitudesRechazadas,
          COALESCE(SUM(CASE WHEN estado = 'aprobada' THEN valor_total END), 0) as valorTotalAprobado,
          COALESCE(AVG(CASE WHEN estado = 'terminada' THEN DATEDIFF(fecha_terminacion, fecha_solicitud) END), 0) as promedioDiasResolucion
        FROM solicitudes_bodega
        WHERE activo = 1
      `;

      const resultado = await db.query(estadisticasQuery);
      const estadisticas = (resultado as any[])[0];

      console.log('✅ [SolicitudesBodega] Estadísticas obtenidas:', estadisticas);

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: {
          totalSolicitudes: parseInt(estadisticas.totalSolicitudes) || 0,
          solicitudesPendientes: parseInt(estadisticas.solicitudesPendientes) || 0,
          solicitudesAprobadas: parseInt(estadisticas.solicitudesAprobadas) || 0,
          solicitudesDespachadas: parseInt(estadisticas.solicitudesDespachadas) || 0,
          solicitudesTerminadas: parseInt(estadisticas.solicitudesTerminadas) || 0,
          solicitudesRechazadas: parseInt(estadisticas.solicitudesRechazadas) || 0,
          valorTotalAprobado: parseFloat(estadisticas.valorTotalAprobado) || 0,
          promedioDiasResolucion: parseFloat(estadisticas.promedioDiasResolucion) || 0
        }
      });

    } catch (error) {
      console.error('❌ [SolicitudesBodega] Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Obtener lista de solicitudes de bodega
  static async listar(req: Request, res: Response) {
    try {
      console.log('🔍 [SolicitudesBodega] Obteniendo solicitudes de bodega de la BD');
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 15;
      const offset = (page - 1) * limit;

      // Construir condiciones WHERE
      const whereConditions: string[] = ['sb.activo = 1'];
      const queryParams: any[] = [];

      // Filtro por estado
      if (req.query.estado) {
        whereConditions.push('sb.estado = ?');
        queryParams.push(req.query.estado);
      }

      // Filtro por aviso
      if (req.query.aviso) {
        whereConditions.push('sb.aviso = ?');
        queryParams.push(req.query.aviso);
      }

      // Filtro por cliente
      if (req.query.id_cliente) {
        whereConditions.push('sb.id_cliente = ?');
        queryParams.push(req.query.id_cliente);
      }

      // Filtro por creador
      if (req.query.id_creador) {
        whereConditions.push('sb.id_creador = ?');
        queryParams.push(req.query.id_creador);
      }

      // Filtro por búsqueda general
      if (req.query.search) {
        whereConditions.push('(sb.aviso LIKE ? OR sb.observaciones LIKE ? OR c.nombre LIKE ? OR u.nombre LIKE ?)');
        const searchTerm = `%${req.query.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Filtro por rango de fechas
      if (req.query.fecha_desde) {
        whereConditions.push('DATE(sb.fecha_solicitud) >= ?');
        queryParams.push(req.query.fecha_desde);
      }

      if (req.query.fecha_hasta) {
        whereConditions.push('DATE(sb.fecha_solicitud) <= ?');
        queryParams.push(req.query.fecha_hasta);
      }

      // Construir WHERE clause
      const whereClause = whereConditions.length > 0 
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      // Query principal con JOINs (solo tablas existentes)
      const solicitudesQuery = `
        SELECT 
          sb.*,
          c.nombre as cliente_nombre,
          'N/A' as sede_nombre,
          COALESCE(e.nombre, 'N/A') as equipo_nombre,
          COALESCE(e.marca, 'N/A') as equipo_marca,
          COALESCE(e.modelo, 'N/A') as equipo_modelo,
          COALESCE(e.serie, 'N/A') as equipo_serie,
          COALESCE(u.nombre, 'Usuario Desconocido') as creador_nombre,
          COALESCE(ua.nombre, 'N/A') as aprobador_nombre,
          'N/A' as orden_relacionada
        FROM solicitudes_bodega sb
        LEFT JOIN clientes c ON sb.id_cliente = c.id
        LEFT JOIN equipos e ON sb.id_equipo = e.id
        LEFT JOIN users u ON sb.id_creador = u.id
        LEFT JOIN users ua ON sb.id_aprobador = ua.id
        ${whereClause}
        ORDER BY sb.fecha_solicitud DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Query para contar total
      const countQuery = `
        SELECT COUNT(*) as total
        FROM solicitudes_bodega sb
        LEFT JOIN clientes c ON sb.id_cliente = c.id
        LEFT JOIN users u ON sb.id_creador = u.id
        ${whereClause}
      `;

      console.log('📊 [SolicitudesBodega] Query principal:', solicitudesQuery);
      console.log('📊 [SolicitudesBodega] Parámetros:', queryParams);

      // Ejecutar ambas queries
      const [solicitudes, countResult] = await Promise.all([
        db.query(solicitudesQuery, queryParams),
        db.query(countQuery, queryParams)
      ]);

      const total = (countResult as any[])[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      // Formatear solicitudes
      const solicitudesFormateadas = (solicitudes as any[]).map(solicitud => ({
        id: solicitud.id,
        aviso: solicitud.aviso,
        estado: solicitud.estado,
        cliente: solicitud.cliente_nombre || 'Sin cliente',
        sede: solicitud.sede_nombre || 'Sin sede',
        equipo: solicitud.equipo_nombre || 'Sin equipo',
        equipoMarca: solicitud.equipo_marca,
        equipoModelo: solicitud.equipo_modelo,
        equipoSerie: solicitud.equipo_serie,
        creador: solicitud.creador_nombre || 'Sin creador',
        aprobador: solicitud.aprobador_nombre,
        ordenRelacionada: solicitud.orden_relacionada,
        fechaSolicitud: solicitud.fecha_solicitud,
        fechaAprobacion: solicitud.fecha_aprobacion,
        fechaDespacho: solicitud.fecha_despacho,
        fechaTerminacion: solicitud.fecha_terminacion,
        observaciones: solicitud.observaciones,
        valorTotal: solicitud.valor_total,
        prioridad: solicitud.prioridad,
        tipoServicio: solicitud.tipo_servicio,
        ubicacionEquipo: solicitud.ubicacion_equipo,
        contactoSede: solicitud.contacto_sede,
        telefonoContacto: solicitud.telefono_contacto
      }));

      console.log(`✅ [SolicitudesBodega] ${solicitudesFormateadas.length} solicitudes obtenidas de ${total} total`);

      res.json({
        success: true,
        message: 'Solicitudes de bodega obtenidas exitosamente',
        data: {
          solicitudes: solicitudesFormateadas,
          pagination: {
            total,
            page,
            limit,
            totalPages
          }
        }
      });

    } catch (error) {
      console.error('❌ [SolicitudesBodega] Error obteniendo solicitudes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Obtener solicitud por ID
  static async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log(`🔍 [SolicitudesBodega] Obteniendo solicitud ID: ${id}`);

      const solicitudQuery = `
        SELECT 
          sb.*,
          c.nombre as cliente_nombre,
          c.documento as cliente_documento,
          c.telefono as cliente_telefono,
          c.email as cliente_email,
          'N/A' as sede_nombre,
          'N/A' as sede_direccion,
          'N/A' as sede_telefono,
          COALESCE(e.nombre, 'N/A') as equipo_nombre,
          COALESCE(e.marca, 'N/A') as equipo_marca,
          COALESCE(e.modelo, 'N/A') as equipo_modelo,
          COALESCE(e.serie, 'N/A') as equipo_serie,
          COALESCE(u.nombre, 'Usuario Desconocido') as creador_nombre,
          COALESCE(ua.nombre, 'N/A') as aprobador_nombre,
          'N/A' as orden_relacionada
        FROM solicitudes_bodega sb
        LEFT JOIN clientes c ON sb.id_cliente = c.id
        LEFT JOIN equipos e ON sb.id_equipo = e.id
        LEFT JOIN users u ON sb.id_creador = u.id
        LEFT JOIN users ua ON sb.id_aprobador = ua.id
        WHERE sb.id = ? AND sb.activo = 1
      `;

      const resultado = await db.query(solicitudQuery, [id]);
      const solicitudes = resultado as any[];

      if (solicitudes.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud de bodega no encontrada'
        });
      }

      const solicitud = solicitudes[0];

      // Obtener repuestos de la solicitud (simplificado sin tabla repuestos)
      const repuestosQuery = `
        SELECT 
          sbr.*,
          sbr.descripcion as repuesto_nombre,
          'N/A' as repuesto_codigo,
          sbr.precio_unitario as repuesto_precio
        FROM solicitudes_bodega_repuestos sbr
        WHERE sbr.id_solicitud = ?
        ORDER BY sbr.id
      `;

      const repuestos = await db.query(repuestosQuery, [id]);

      // Obtener items adicionales
      const itemsQuery = `
        SELECT *
        FROM solicitudes_bodega_items_adicionales sbia
        WHERE sbia.id_solicitud = ?
        ORDER BY sbia.id
      `;

      const itemsAdicionales = await db.query(itemsQuery, [id]);

      // Obtener historial de cambios
      const cambiosQuery = `
        SELECT 
          sbn.*,
          u.nombre as usuario_nombre
        FROM solicitudes_bodega_novedades sbn
        LEFT JOIN users u ON sbn.id_usuario = u.id
        WHERE sbn.id_solicitud = ?
        ORDER BY sbn.fecha_novedad DESC
      `;

      const cambios = await db.query(cambiosQuery, [id]);

      const solicitudCompleta = {
        ...solicitud,
        cliente: {
          nombre: solicitud.cliente_nombre,
          documento: solicitud.cliente_documento,
          telefono: solicitud.cliente_telefono,
          email: solicitud.cliente_email
        },
        sede: {
          nombre: solicitud.sede_nombre,
          direccion: solicitud.sede_direccion,
          telefono: solicitud.sede_telefono
        },
        equipo: {
          nombre: solicitud.equipo_nombre,
          marca: solicitud.equipo_marca,
          modelo: solicitud.equipo_modelo,
          serie: solicitud.equipo_serie
        },
        creador: solicitud.creador_nombre,
        aprobador: solicitud.aprobador_nombre,
        ordenRelacionada: solicitud.orden_relacionada,
        repuestos: repuestos,
        itemsAdicionales: itemsAdicionales,
        cambios: cambios
      };

      console.log(`✅ [SolicitudesBodega] Solicitud ${id} obtenida exitosamente`);

      res.json({
        success: true,
        message: 'Solicitud de bodega obtenida exitosamente',
        data: solicitudCompleta
      });

    } catch (error) {
      console.error('❌ [SolicitudesBodega] Error obteniendo solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Crear nueva solicitud de bodega
  static async crear(req: Request, res: Response) {
    try {
      const {
        aviso,
        id_cliente,
        id_sede,
        id_equipo,
        id_orden,
        tipo_servicio,
        prioridad,
        observaciones,
        ubicacion_equipo,
        contacto_sede,
        telefono_contacto,
        repuestos,
        itemsAdicionales
      } = req.body;

      // Obtener ID del usuario creador del token/sesión
      const id_creador = (req as any).user?.id || 1; // Temporal: usar ID 1 por defecto

      console.log('📝 [SolicitudesBodega] Creando nueva solicitud:', req.body);

      // Validaciones básicas
      if (!aviso || !id_cliente || !id_creador) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: aviso, id_cliente, id_creador'
        });
      }

      // Insertar nueva solicitud
      const insertQuery = `
        INSERT INTO solicitudes_bodega (
          aviso, id_cliente, id_sede, id_equipo, id_orden, id_creador,
          tipo_servicio, prioridad, observaciones, ubicacion_equipo,
          contacto_sede, telefono_contacto, estado, fecha_solicitud, activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', NOW(), 1)
      `;

      const resultado = await db.query(insertQuery, [
        aviso,
        id_cliente,
        id_sede || null,
        id_equipo || null,
        id_orden || null,
        id_creador,
        tipo_servicio || 'correctivo',
        prioridad || 'media',
        observaciones || null,
        ubicacion_equipo || null,
        contacto_sede || null,
        telefono_contacto || null
      ]);

      const id_solicitud = (resultado as any).insertId;

      // Insertar repuestos si los hay
      if (repuestos && Array.isArray(repuestos) && repuestos.length > 0) {
        const repuestosQuery = `
          INSERT INTO solicitudes_bodega_repuestos (
            id_solicitud, id_repuesto, cantidad, precio_unitario, observaciones
          ) VALUES ?
        `;

        const repuestosValues = repuestos.map((repuesto: any) => [
          id_solicitud,
          repuesto.id_repuesto,
          repuesto.cantidad,
          repuesto.precio_unitario || 0,
          repuesto.observaciones || null
        ]);

        await db.query(repuestosQuery, [repuestosValues]);
      }

      // Insertar items adicionales si los hay
      if (itemsAdicionales && Array.isArray(itemsAdicionales) && itemsAdicionales.length > 0) {
        const itemsQuery = `
          INSERT INTO solicitudes_bodega_items_adicionales (
            id_solicitud, descripcion, cantidad, precio_unitario, observaciones
          ) VALUES ?
        `;

        const itemsValues = itemsAdicionales.map((item: any) => [
          id_solicitud,
          item.descripcion,
          item.cantidad,
          item.precio_unitario || 0,
          item.observaciones || null
        ]);

        await db.query(itemsQuery, [itemsValues]);
      }

      // Registrar novedad de creación
      const novedadQuery = `
        INSERT INTO solicitudes_bodega_novedades (
          id_solicitud, id_usuario, accion, observaciones, fecha_novedad
        ) VALUES (?, ?, 'creada', 'Solicitud de bodega creada', NOW())
      `;

      await db.query(novedadQuery, [id_solicitud, id_creador]);

      console.log(`✅ [SolicitudesBodega] Solicitud ${id_solicitud} creada exitosamente`);

      res.status(201).json({
        success: true,
        message: 'Solicitud de bodega creada exitosamente',
        data: {
          id: id_solicitud,
          aviso: aviso,
          estado: 'pendiente'
        }
      });

    } catch (error) {
      console.error('❌ [SolicitudesBodega] Error creando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Cambiar estado de solicitud
  static async cambiarEstado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;

      console.log(`📝 [SolicitudesBodega] Cambiando estado de solicitud ${id} a: ${estado}`);

      // Validar estado
      const estadosValidos = ['pendiente', 'aprobada', 'despachada', 'terminada', 'rechazada'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido. Estados permitidos: ' + estadosValidos.join(', ')
        });
      }

      const id_usuario = (req as any).user?.id || 1; // Temporal

      // Actualizar estado
      const updateQuery = `
        UPDATE solicitudes_bodega 
        SET estado = ?, fecha_${estado === 'aprobada' ? 'aprobacion' : estado === 'despachada' ? 'despacho' : 'terminacion'} = NOW(),
            id_${estado === 'aprobada' ? 'aprobador' : 'procesador'} = ?
        WHERE id = ? AND activo = 1
      `;

      const resultado = await db.query(updateQuery, [estado, id_usuario, id]);

      if ((resultado as any).affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud de bodega no encontrada'
        });
      }

      // Registrar novedad
      const novedadQuery = `
        INSERT INTO solicitudes_bodega_novedades (
          id_solicitud, id_usuario, accion, observaciones, fecha_novedad
        ) VALUES (?, ?, ?, ?, NOW())
      `;

      await db.query(novedadQuery, [id, id_usuario, `cambio_estado_${estado}`, observaciones || `Estado cambiado a ${estado}`]);

      console.log(`✅ [SolicitudesBodega] Estado de solicitud ${id} cambiado a ${estado}`);

      res.json({
        success: true,
        message: `Solicitud ${estado} exitosamente`,
        data: {
          id: parseInt(id),
          estado: estado
        }
      });

    } catch (error) {
      console.error('❌ [SolicitudesBodega] Error cambiando estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Aprobar solicitud de bodega
  static async aprobar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { observaciones } = req.body;

      req.body.estado = 'aprobada';
      req.body.observaciones = observaciones || 'Solicitud aprobada';

      return this.cambiarEstado(req, res);

    } catch (error) {
      console.error('❌ [SolicitudesBodega] Error aprobando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Rechazar solicitud de bodega
  static async rechazar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { observaciones } = req.body;

      if (!observaciones) {
        return res.status(400).json({
          success: false,
          message: 'Las observaciones son requeridas para rechazar una solicitud'
        });
      }

      req.body.estado = 'rechazada';

      return this.cambiarEstado(req, res);

    } catch (error) {
      console.error('❌ [SolicitudesBodega] Error rechazando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
