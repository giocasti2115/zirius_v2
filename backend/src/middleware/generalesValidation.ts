import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { IntegracionGeneralesService } from '../services/IntegracionGeneralesService';

/**
 * Middleware de validación específico para módulos de configuración general
 */

/**
 * Valida que el usuario tenga permisos para modificar configuraciones generales
 */
export const validateGeneralesPermissions = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar si el usuario es administrador
      if (user.rol === 'ADMIN' || user.rol === 'SUPER_ADMIN') {
        return next();
      }

      // Verificar permisos específicos
      // TODO: Implementar verificación de permisos granulares desde la BD
      const allowedRoles = ['COORDINADOR', 'ANALISTA'];
      
      if (!allowedRoles.includes(user.rol)) {
        logger.warn(`Access denied for user ${user.email} to ${requiredPermission}`, {
          userId: user.id,
          userRole: user.rol,
          requiredPermission,
          endpoint: req.originalUrl,
          method: req.method
        });

        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para realizar esta acción'
        });
      }

      next();
    } catch (error) {
      logger.error('Error validating generales permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

/**
 * Valida que solo administradores puedan modificar variables críticas del sistema
 */
export const validateSystemVariablePermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Obtener información de la variable
    const integracionService = new IntegracionGeneralesService();
    const variable = await integracionService.getVariableSistema(`SELECT * FROM variables_sistema WHERE id = ${id}`);

    if (!variable) {
      return res.status(404).json({
        success: false,
        message: 'Variable no encontrada'
      });
    }

    // Variables críticas que solo pueden modificar super administradores
    const criticalVariables = [
      'sistema.version',
      'respaldos.auto_enabled',
      'logs.retention_days'
    ];

    if (criticalVariables.includes(variable.clave) && user.rol !== 'SUPER_ADMIN') {
      logger.warn(`Attempt to modify critical variable by non-super-admin`, {
        userId: user.id,
        userRole: user.rol,
        variable: variable.clave
      });

      return res.status(403).json({
        success: false,
        message: 'Solo los super administradores pueden modificar esta variable crítica'
      });
    }

    next();
  } catch (error) {
    logger.error('Error validating system variable permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Sanitiza datos de entrada para prevenir inyecciones
 */
export const sanitizeGeneralesInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Lista de campos que pueden contener HTML/texto enriquecido
    const allowedHtmlFields = ['descripcion', 'contenido'];
    
    // Función para limpiar strings
    const sanitizeString = (str: string, allowHtml: boolean = false): string => {
      if (!str || typeof str !== 'string') return str;
      
      // Remover caracteres de control
      str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      
      if (!allowHtml) {
        // Escapar caracteres HTML básicos
        str = str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      }
      
      return str.trim();
    };

    // Función recursiva para sanitizar objetos
    const sanitizeObject = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      if (typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string') {
            const allowHtml = allowedHtmlFields.includes(key);
            sanitized[key] = sanitizeString(value, allowHtml);
          } else {
            sanitized[key] = sanitizeObject(value);
          }
        }
        return sanitized;
      }
      
      return obj;
    };

    // Sanitizar body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitizar query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    next();
  } catch (error) {
    logger.error('Error sanitizing input:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando los datos de entrada'
    });
  }
};

/**
 * Valida límites de rate limiting para operaciones críticas
 */
export const validateRateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const clientId = user?.id || req.ip;
      const now = Date.now();

      // Limpiar entradas expiradas
      for (const [key, data] of requests.entries()) {
        if (now > data.resetTime) {
          requests.delete(key);
        }
      }

      // Obtener o crear entrada para el cliente
      let clientData = requests.get(clientId);
      if (!clientData) {
        clientData = { count: 0, resetTime: now + windowMs };
        requests.set(clientId, clientData);
      }

      // Verificar límite
      if (clientData.count >= maxRequests) {
        logger.warn(`Rate limit exceeded for client ${clientId}`, {
          clientId,
          count: clientData.count,
          maxRequests,
          endpoint: req.originalUrl
        });

        return res.status(429).json({
          success: false,
          message: 'Demasiadas solicitudes. Intente nuevamente más tarde.',
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
        });
      }

      // Incrementar contador
      clientData.count++;

      // Agregar headers informativos
      res.set({
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': (maxRequests - clientData.count).toString(),
        'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
      });

      next();
    } catch (error) {
      logger.error('Error in rate limiting:', error);
      next(); // Continuar en caso de error para no bloquear el sistema
    }
  };
};

/**
 * Valida la integridad de datos críticos antes de modificaciones
 */
export const validateDataIntegrity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { method, originalUrl } = req;
    
    // Solo validar en operaciones de modificación
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next();
    }

    // Validaciones específicas por endpoint
    if (originalUrl.includes('/estados')) {
      await validateEstadoIntegrity(req, res, next);
    } else if (originalUrl.includes('/variables-sistema')) {
      await validateVariableIntegrity(req, res, next);
    } else {
      next();
    }
  } catch (error) {
    logger.error('Error validating data integrity:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando integridad de datos'
    });
  }
};

/**
 * Valida la integridad de estados antes de modificaciones
 */
const validateEstadoIntegrity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body, method, params } = req;
    
    if (method === 'DELETE' || (method === 'PUT' && body.activo === false)) {
      const estadoId = params.id;
      
      // Verificar si el estado está siendo usado
      const integracionService = new IntegracionGeneralesService();
      
      // TODO: Implementar verificación de uso del estado en diferentes módulos
      // Por ejemplo, verificar si hay equipos, solicitudes u órdenes usando este estado
      
      logger.info(`Validating estado integrity for ID ${estadoId}`);
    }
    
    next();
  } catch (error) {
    logger.error('Error validating estado integrity:', error);
    throw error;
  }
};

/**
 * Valida la integridad de variables de sistema
 */
const validateVariableIntegrity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req;
    
    if (body.valor !== undefined) {
      // Validar formato según tipo de variable
      const { tipo, validacion_regex, valor } = body;
      
      if (validacion_regex) {
        const regex = new RegExp(validacion_regex);
        if (!regex.test(valor)) {
          return res.status(400).json({
            success: false,
            message: 'El valor no cumple con el formato requerido'
          });
        }
      }
      
      // Validaciones específicas por tipo
      if (tipo === 'number' && isNaN(Number(valor))) {
        return res.status(400).json({
          success: false,
          message: 'El valor debe ser un número válido'
        });
      }
      
      if (tipo === 'boolean' && !['true', 'false'].includes(valor.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'El valor debe ser true o false'
        });
      }
      
      if (tipo === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valor)) {
          return res.status(400).json({
            success: false,
            message: 'El valor debe ser un email válido'
          });
        }
      }
      
      if (tipo === 'json') {
        try {
          JSON.parse(valor);
        } catch {
          return res.status(400).json({
            success: false,
            message: 'El valor debe ser un JSON válido'
          });
        }
      }
    }
    
    next();
  } catch (error) {
    logger.error('Error validating variable integrity:', error);
    throw error;
  }
};

/**
 * Middleware de auditoría para registrar cambios importantes
 */
export const auditGeneralesChanges = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    try {
      const user = (req as any).user;
      const { method, originalUrl, body, params } = req;
      
      // Solo auditar operaciones de modificación exitosas
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && res.statusCode < 400) {
        const integracionService = new IntegracionGeneralesService();
        
        integracionService.registrarEvento(
          'info',
          'configuracion',
          `${method}_${originalUrl.split('/').pop()}`,
          `${method} operation on ${originalUrl}`,
          user?.email || 'sistema',
          {
            endpoint: originalUrl,
            method,
            params,
            body: method !== 'GET' ? body : undefined,
            statusCode: res.statusCode,
            timestamp: new Date().toISOString()
          },
          req.ip
        ).catch(error => {
          logger.error('Error in audit logging:', error);
        });
      }
    } catch (error) {
      logger.error('Error in audit middleware:', error);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};