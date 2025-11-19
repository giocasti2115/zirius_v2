import database, { DatabaseConnection } from '../config/database';
import { logger } from '../utils/logger';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

/**
 * Servicio de integración para conectar los módulos de configuración general
 * con el resto del sistema (equipos, solicitudes, órdenes, etc.)
 */
export class IntegracionGeneralesService {
  private db: any;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  /**
   * Obtiene los tipos de equipos para usar en formularios de equipos
   */
  async getTiposEquiposParaSelect(): Promise<any[]> {
    try {
      const [rows] = await this.db.query(`
        SELECT id, nombre, categoria, clasificacion_riesgo
        FROM tipos_equipos 
        WHERE activo = true 
        ORDER BY categoria, nombre
      `);
      return rows as any[];
    } catch (error) {
      logger.error('Error getting tipos equipos for select:', error);
      throw error;
    }
  }

  /**
   * Obtiene las marcas activas para usar en formularios de equipos
   */
  async getMarcasParaSelect(): Promise<any[]> {
    try {
      const [rows] = await this.db.query(`
        SELECT id, nombre, pais_origen
        FROM marcas 
        WHERE activo = true 
        ORDER BY nombre
      `);
      return rows as any[];
    } catch (error) {
      logger.error('Error getting marcas for select:', error);
      throw error;
    }
  }

  /**
   * Obtiene los estados disponibles para un módulo específico
   */
  async getEstadosPorModulo(modulo: string): Promise<any[]> {
    try {
      const [rows] = await this.db.query(`
        SELECT id, nombre, descripcion, color, icono, es_final
        FROM estados 
        WHERE modulo = ? AND activo = true 
        ORDER BY orden
      `, [modulo]);
      return rows as any[];
    } catch (error) {
      logger.error('Error getting estados by module:', error);
      throw error;
    }
  }

  /**
   * Obtiene las prioridades activas ordenadas por nivel
   */
  async getPrioridadesParaSelect(): Promise<any[]> {
    try {
      const [rows] = await this.db.query(`
        SELECT id, nombre, nivel, color, tiempo_respuesta_horas
        FROM prioridades 
        WHERE activo = true 
        ORDER BY nivel
      `);
      return rows as any[];
    } catch (error) {
      logger.error('Error getting prioridades for select:', error);
      throw error;
    }
  }

  /**
   * Obtiene departamentos y ciudades para formularios de ubicación
   */
  async getUbicacionesParaSelect(): Promise<any> {
    try {
      const [departamentos] = await this.db.query(`
        SELECT id, nombre, codigo, region
        FROM departamentos 
        WHERE activo = true 
        ORDER BY nombre
      `);

      const [ciudades] = await this.db.query(`
        SELECT c.id, c.nombre, c.departamento_id, d.nombre as departamento_nombre, d.region
        FROM ciudades c
        INNER JOIN departamentos d ON c.departamento_id = d.id
        WHERE c.activo = true AND d.activo = true
        ORDER BY d.nombre, c.nombre
      `);

      return {
        departamentos: departamentos as any[],
        ciudades: ciudades as any[]
      };
    } catch (error) {
      logger.error('Error getting ubicaciones for select:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un equipo y registra el cambio en logs
   */
  async actualizarEstadoEquipo(equipoId: number, nuevoEstadoId: number, usuarioId: number, motivo?: string): Promise<void> {
    const connection = await this.db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Obtener información del equipo actual
      const [equipoActual] = await connection.execute(`
        SELECT id, serie, estado_actual
        FROM equipos 
        WHERE id = ?
      `, [equipoId]);

      if ((equipoActual as any[]).length === 0) {
        throw new Error('Equipo no encontrado');
      }

      const equipo = (equipoActual as any[])[0];

      // Obtener información del nuevo estado
      const [estadoInfo] = await connection.execute(`
        SELECT nombre, descripcion
        FROM estados 
        WHERE id = ? AND modulo = 'equipos'
      `, [nuevoEstadoId]);

      if ((estadoInfo as any[]).length === 0) {
        throw new Error('Estado no válido para equipos');
      }

      const estado = (estadoInfo as any[])[0];

      // Actualizar el estado del equipo
      await connection.execute(`
        UPDATE equipos 
        SET estado_actual = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
        WHERE id = ?
      `, [nuevoEstadoId, usuarioId, equipoId]);

      // Registrar el cambio en logs
      await this.registrarLogCambioEstado(
        connection,
        'equipos',
        equipoId,
        equipo.serie,
        equipo.estado_actual,
        nuevoEstadoId,
        usuarioId,
        motivo
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      logger.error('Error updating equipo estado:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Actualiza el estado de una solicitud
   */
  async actualizarEstadoSolicitud(solicitudId: number, nuevoEstadoId: number, usuarioId: number, motivo?: string): Promise<void> {
    const connection = await this.db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Obtener información de la solicitud actual
      const [solicitudActual] = await connection.execute(`
        SELECT id, numero, estado_actual
        FROM solicitudes 
        WHERE id = ?
      `, [solicitudId]);

      if ((solicitudActual as any[]).length === 0) {
        throw new Error('Solicitud no encontrada');
      }

      const solicitud = (solicitudActual as any[])[0];

      // Validar que el nuevo estado sea válido para solicitudes
      const [estadoInfo] = await connection.execute(`
        SELECT nombre, descripcion, es_final
        FROM estados 
        WHERE id = ? AND modulo = 'solicitudes'
      `, [nuevoEstadoId]);

      if ((estadoInfo as any[]).length === 0) {
        throw new Error('Estado no válido para solicitudes');
      }

      const estado = (estadoInfo as any[])[0];

      // Actualizar el estado de la solicitud
      await connection.execute(`
        UPDATE solicitudes 
        SET estado_actual = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
        WHERE id = ?
      `, [nuevoEstadoId, usuarioId, solicitudId]);

      // Si el estado es final, actualizar fecha de completado
      if (estado.es_final) {
        await connection.execute(`
          UPDATE solicitudes 
          SET fecha_completado = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [solicitudId]);
      }

      // Registrar el cambio en logs
      await this.registrarLogCambioEstado(
        connection,
        'solicitudes',
        solicitudId,
        solicitud.numero,
        solicitud.estado_actual,
        nuevoEstadoId,
        usuarioId,
        motivo
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      logger.error('Error updating solicitud estado:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Registra un log de cambio de estado
   */
  private async registrarLogCambioEstado(
    connection: any,
    modulo: string,
    registroId: number,
    identificador: string,
    estadoAnteriorId: number,
    estadoNuevoId: number,
    usuarioId: number,
    motivo?: string
  ): Promise<void> {
    try {
      // Obtener nombres de los estados
      const [estados] = await connection.execute(`
        SELECT id, nombre 
        FROM estados 
        WHERE id IN (?, ?)
      `, [estadoAnteriorId, estadoNuevoId]);

      const estadosMap = new Map();
      (estados as any[]).forEach(estado => {
        estadosMap.set(estado.id, estado.nombre);
      });

      // Obtener información del usuario
      const [usuario] = await connection.execute(`
        SELECT nombre, email 
        FROM usuarios 
        WHERE id = ?
      `, [usuarioId]);

      const usuarioInfo = (usuario as any[])[0];

      // Registrar en logs
      await connection.execute(`
        INSERT INTO logs (
          nivel, modulo, usuario, accion, descripcion, detalles
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        'info',
        modulo,
        usuarioInfo?.email || 'sistema',
        'CAMBIO_ESTADO',
        `Estado cambiado de "${estadosMap.get(estadoAnteriorId)}" a "${estadosMap.get(estadoNuevoId)}" para ${modulo} ${identificador}`,
        JSON.stringify({
          registro_id: registroId,
          identificador: identificador,
          estado_anterior: {
            id: estadoAnteriorId,
            nombre: estadosMap.get(estadoAnteriorId)
          },
          estado_nuevo: {
            id: estadoNuevoId,
            nombre: estadosMap.get(estadoNuevoId)
          },
          usuario: {
            id: usuarioId,
            nombre: usuarioInfo?.nombre,
            email: usuarioInfo?.email
          },
          motivo: motivo || null,
          timestamp: new Date().toISOString()
        })
      ]);
    } catch (error) {
      logger.error('Error registering estado change log:', error);
      // No propagar el error para no afectar la transacción principal
    }
  }

  /**
   * Obtiene estadísticas de estados por módulo
   */
  async getEstadisticasEstados(modulo: string): Promise<any[]> {
    try {
      let tabla = '';
      let campoEstado = 'estado_actual';
      
      switch (modulo) {
        case 'equipos':
          tabla = 'equipos';
          break;
        case 'solicitudes':
          tabla = 'solicitudes';
          break;
        case 'ordenes':
          tabla = 'ordenes';
          break;
        case 'visitas':
          tabla = 'visitas';
          break;
        default:
          throw new Error('Módulo no válido');
      }

      const [rows] = await this.db.query(`
        SELECT 
          e.id,
          e.nombre,
          e.color,
          COUNT(t.id) as cantidad,
          ROUND((COUNT(t.id) * 100.0 / (SELECT COUNT(*) FROM ${tabla})), 2) as porcentaje
        FROM estados e
        LEFT JOIN ${tabla} t ON e.id = t.${campoEstado}
        WHERE e.modulo = ? AND e.activo = true
        GROUP BY e.id, e.nombre, e.color, e.orden
        ORDER BY e.orden
      `, [modulo]);

      return rows as any[];
    } catch (error) {
      logger.error('Error getting estadisticas estados:', error);
      throw error;
    }
  }

  /**
   * Obtiene una variable de sistema por su clave
   */
  async getVariableSistema(clave: string): Promise<any> {
    try {
      const [rows] = await this.db.query(`
        SELECT clave, valor, tipo, descripcion
        FROM variables_sistema 
        WHERE clave = ?
      `, [clave]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      const variable = (rows as any[])[0];
      
      // Convertir el valor según el tipo
      switch (variable.tipo) {
        case 'boolean':
          variable.valor = variable.valor === 'true';
          break;
        case 'number':
          variable.valor = parseFloat(variable.valor);
          break;
        case 'json':
          try {
            variable.valor = JSON.parse(variable.valor);
          } catch {
            // Si no se puede parsear, mantener como string
          }
          break;
      }

      return variable;
    } catch (error) {
      logger.error('Error getting variable sistema:', error);
      throw error;
    }
  }

  /**
   * Valida que un departamento y ciudad sean compatibles
   */
  async validarUbicacion(departamentoId: number, ciudadId: number): Promise<boolean> {
    try {
      const [rows] = await this.db.query(`
        SELECT COUNT(*) as count
        FROM ciudades c
        INNER JOIN departamentos d ON c.departamento_id = d.id
        WHERE c.id = ? AND d.id = ? AND c.activo = true AND d.activo = true
      `, [ciudadId, departamentoId]);

      return (rows as any[])[0].count > 0;
    } catch (error) {
      logger.error('Error validating ubicacion:', error);
      return false;
    }
  }

  /**
   * Registra un evento en el sistema de logs
   */
  async registrarEvento(
    nivel: 'info' | 'warning' | 'error' | 'debug' | 'success',
    modulo: string,
    accion: string,
    descripcion: string,
    usuario?: string,
    detalles?: any,
    ipAddress?: string
  ): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO logs (
          nivel, modulo, usuario, ip_address, accion, descripcion, detalles
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        nivel,
        modulo,
        usuario || null,
        ipAddress || null,
        accion,
        descripcion,
        detalles ? JSON.stringify(detalles) : null
      ]);
    } catch (error) {
      logger.error('Error registering evento:', error);
      // No propagar el error para no afectar la operación principal
    }
  }
}
