import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Schema para crear visita
const createVisitaSchema = Joi.object({
  id_orden: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID de la orden debe ser un número',
      'number.integer': 'ID de la orden debe ser un número entero',
      'number.positive': 'ID de la orden debe ser positivo',
      'any.required': 'ID de la orden es requerido'
    }),
  
  id_responsable: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID del responsable debe ser un número',
      'number.integer': 'ID del responsable debe ser un número entero',
      'number.positive': 'ID del responsable debe ser positivo'
    }),
  
  fecha_inicio: Joi.date().iso().min('now').required()
    .messages({
      'date.base': 'La fecha de inicio debe ser una fecha válida',
      'date.format': 'La fecha de inicio debe estar en formato ISO',
      'date.min': 'La fecha de inicio no puede ser en el pasado',
      'any.required': 'La fecha de inicio es requerida'
    }),
  
  ejecutar_sede: Joi.boolean().default(true)
    .messages({
      'boolean.base': 'Ejecutar en sede debe ser verdadero o falso'
    }),
  
  duracion: Joi.number().integer().min(15).max(480).default(30)
    .messages({
      'number.base': 'La duración debe ser un número',
      'number.integer': 'La duración debe ser un número entero',
      'number.min': 'La duración mínima es 15 minutos',
      'number.max': 'La duración máxima es 480 minutos (8 horas)'
    }),
  
  actividades: Joi.string().max(200).optional().allow('')
    .messages({
      'string.base': 'Las actividades deben ser una cadena de texto',
      'string.max': 'Las actividades no pueden exceder 200 caracteres'
    })
});

// Schema para actualizar visita
const updateVisitaSchema = Joi.object({
  id_responsable: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID del responsable debe ser un número',
      'number.integer': 'ID del responsable debe ser un número entero',
      'number.positive': 'ID del responsable debe ser positivo'
    }),
  
  fecha_inicio: Joi.date().iso().optional()
    .messages({
      'date.base': 'La fecha de inicio debe ser una fecha válida',
      'date.format': 'La fecha de inicio debe estar en formato ISO'
    }),
  
  ejecutar_sede: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Ejecutar en sede debe ser verdadero o falso'
    }),
  
  duracion: Joi.number().integer().min(15).max(480).optional()
    .messages({
      'number.base': 'La duración debe ser un número',
      'number.integer': 'La duración debe ser un número entero',
      'number.min': 'La duración mínima es 15 minutos',
      'number.max': 'La duración máxima es 480 minutos (8 horas)'
    }),
  
  actividades: Joi.string().max(200).optional().allow('')
    .messages({
      'string.base': 'Las actividades deben ser una cadena de texto',
      'string.max': 'Las actividades no pueden exceder 200 caracteres'
    })
});

// Schema para aprobar visita
const aprobarVisitaSchema = Joi.object({
  observacion_aprobacion: Joi.string().min(5).max(600).required()
    .messages({
      'string.base': 'La observación de aprobación debe ser una cadena de texto',
      'string.min': 'La observación debe tener al menos 5 caracteres',
      'string.max': 'La observación no puede exceder 600 caracteres',
      'any.required': 'La observación de aprobación es requerida'
    })
});

// Schema para rechazar visita
const rechazarVisitaSchema = Joi.object({
  observacion_aprobacion: Joi.string().min(10).max(600).required()
    .messages({
      'string.base': 'La razón del rechazo debe ser una cadena de texto',
      'string.min': 'La razón debe tener al menos 10 caracteres',
      'string.max': 'La razón no puede exceder 600 caracteres',
      'any.required': 'La razón del rechazo es requerida'
    })
});

// Schema para cerrar visita
const cerrarVisitaSchema = Joi.object({
  actividades: Joi.string().min(10).max(200).required()
    .messages({
      'string.base': 'Las actividades realizadas deben ser una cadena de texto',
      'string.min': 'Las actividades deben tener al menos 10 caracteres',
      'string.max': 'Las actividades no pueden exceder 200 caracteres',
      'any.required': 'Las actividades realizadas son requeridas'
    })
});

// Schema para parámetros de listado
const listVisitasSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1)
    .messages({
      'number.base': 'La página debe ser un número',
      'number.integer': 'La página debe ser un número entero',
      'number.min': 'La página debe ser mayor a 0'
    }),
  
  limit: Joi.number().integer().min(1).max(100).default(10)
    .messages({
      'number.base': 'El límite debe ser un número',
      'number.integer': 'El límite debe ser un número entero',
      'number.min': 'El límite debe ser mayor a 0',
      'number.max': 'El límite no puede ser mayor a 100'
    }),
  
  estado: Joi.number().integer().valid(1, 2, 3, 4).optional()
    .messages({
      'number.base': 'El estado debe ser un número',
      'number.integer': 'El estado debe ser un número entero',
      'any.only': 'El estado debe ser 1 (Pendiente), 2 (Abierta), 3 (Cerrada) o 4 (Rechazada)'
    }),
  
  responsable_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID del responsable debe ser un número',
      'number.integer': 'ID del responsable debe ser un número entero',
      'number.positive': 'ID del responsable debe ser positivo'
    }),
  
  orden_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID de la orden debe ser un número',
      'number.integer': 'ID de la orden debe ser un número entero',
      'number.positive': 'ID de la orden debe ser positivo'
    }),
  
  ejecutar_sede: Joi.boolean().optional()
    .messages({
      'boolean.base': 'Ejecutar en sede debe ser verdadero o falso'
    }),
  
  fecha_desde: Joi.date().iso().optional()
    .messages({
      'date.base': 'La fecha desde debe ser una fecha válida',
      'date.format': 'La fecha desde debe estar en formato ISO (YYYY-MM-DD)'
    }),
  
  fecha_hasta: Joi.date().iso().min(Joi.ref('fecha_desde')).optional()
    .messages({
      'date.base': 'La fecha hasta debe ser una fecha válida',
      'date.format': 'La fecha hasta debe estar en formato ISO (YYYY-MM-DD)',
      'date.min': 'La fecha hasta debe ser posterior a la fecha desde'
    }),
  
  buscar: Joi.string().min(2).max(100).optional()
    .messages({
      'string.base': 'El término de búsqueda debe ser una cadena de texto',
      'string.min': 'El término de búsqueda debe tener al menos 2 caracteres',
      'string.max': 'El término de búsqueda no puede exceder 100 caracteres'
    })
});

// Middleware de validación genérico
const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
      return;
    }

    // Reemplazar los datos validados y procesados
    req[property] = value;
    next();
  };
};

// Middleware específicos para cada endpoint
export const createVisitaValidation = validate(createVisitaSchema, 'body');
export const updateVisitaValidation = validate(updateVisitaSchema, 'body');
export const aprobarVisitaValidation = validate(aprobarVisitaSchema, 'body');
export const rechazarVisitaValidation = validate(rechazarVisitaSchema, 'body');
export const cerrarVisitaValidation = validate(cerrarVisitaSchema, 'body');
export const listVisitasValidation = validate(listVisitasSchema, 'query');

// Funciones de validación simplificadas para uso en rutas
export const validateCreateVisita = (req: any, res: any, next: any) => {
  const { error } = createVisitaSchema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details?.[0]?.message || 'Error de validación'
    })
  }
  next()
}

export const validateUpdateVisita = (req: any, res: any, next: any) => {
  const { error } = updateVisitaSchema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details?.[0]?.message || 'Error de validación'
    })
  }
  next()
}

export const validateAprobarVisita = (req: any, res: any, next: any) => {
  const { error } = aprobarVisitaSchema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details?.[0]?.message || 'Error de validación'
    })
  }
  next()
}

export const validateRechazarVisita = (req: any, res: any, next: any) => {
  const { error } = rechazarVisitaSchema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details?.[0]?.message || 'Error de validación'
    })
  }
  next()
}

export const validateCerrarVisita = (req: any, res: any, next: any) => {
  const { error } = cerrarVisitaSchema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details?.[0]?.message || 'Error de validación'
    })
  }
  next()
}

export const validateFilterVisitas = (req: any, res: any, next: any) => {
  const { error } = listVisitasSchema.validate(req.query)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details?.[0]?.message || 'Error de validación'
    })
  }
  next()
}

// Validación para parámetros de ID
export const idParamValidation = validate(
  Joi.object({
    id: Joi.number().integer().positive().required()
      .messages({
        'number.base': 'El ID debe ser un número',
        'number.integer': 'El ID debe ser un número entero',
        'number.positive': 'El ID debe ser positivo',
        'any.required': 'El ID es requerido'
      })
  }),
  'params'
);