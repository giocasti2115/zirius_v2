import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Schema para crear solicitud
const createSolicitudSchema = Joi.object({
  id_servicio: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID del servicio debe ser un número',
      'number.integer': 'ID del servicio debe ser un número entero',
      'number.positive': 'ID del servicio debe ser positivo',
      'any.required': 'ID del servicio es requerido'
    }),
  
  aviso: Joi.string().max(20).required()
    .messages({
      'string.base': 'El aviso debe ser una cadena de texto',
      'string.max': 'El aviso no puede exceder 20 caracteres',
      'any.required': 'El aviso es requerido'
    }),
  
  id_equipo: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID del equipo debe ser un número',
      'number.integer': 'ID del equipo debe ser un número entero',
      'number.positive': 'ID del equipo debe ser positivo'
    }),
  
  observacion: Joi.string().min(10).max(2000).required()
    .messages({
      'string.base': 'La observación debe ser una cadena de texto',
      'string.min': 'La observación debe tener al menos 10 caracteres',
      'string.max': 'La observación no puede exceder 2000 caracteres',
      'any.required': 'La observación es requerida'
    })
});

// Schema para actualizar solicitud
const updateSolicitudSchema = Joi.object({
  id_servicio: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID del servicio debe ser un número',
      'number.integer': 'ID del servicio debe ser un número entero',
      'number.positive': 'ID del servicio debe ser positivo'
    }),
  
  aviso: Joi.string().max(20).optional()
    .messages({
      'string.base': 'El aviso debe ser una cadena de texto',
      'string.max': 'El aviso no puede exceder 20 caracteres'
    }),
  
  id_equipo: Joi.number().integer().positive().optional().allow(null)
    .messages({
      'number.base': 'ID del equipo debe ser un número',
      'number.integer': 'ID del equipo debe ser un número entero',
      'number.positive': 'ID del equipo debe ser positivo'
    }),
  
  observacion: Joi.string().min(10).max(2000).optional()
    .messages({
      'string.base': 'La observación debe ser una cadena de texto',
      'string.min': 'La observación debe tener al menos 10 caracteres',
      'string.max': 'La observación no puede exceder 2000 caracteres'
    }),
  
  observacion_estado: Joi.string().max(600).optional()
    .messages({
      'string.base': 'La observación del estado debe ser una cadena de texto',
      'string.max': 'La observación del estado no puede exceder 600 caracteres'
    })
});

// Schema para cambiar estado
const changeEstadoSchema = Joi.object({
  estado: Joi.number().integer().valid(1, 2, 3).required()
    .messages({
      'number.base': 'El estado debe ser un número',
      'number.integer': 'El estado debe ser un número entero',
      'any.only': 'El estado debe ser 1 (Pendiente), 2 (Aprobada) o 3 (Rechazada)',
      'any.required': 'El estado es requerido'
    }),
  
  observaciones: Joi.string().max(600).optional()
    .messages({
      'string.base': 'Las observaciones deben ser una cadena de texto',
      'string.max': 'Las observaciones no pueden exceder 600 caracteres'
    })
});

// Schema para parámetros de listado
const listSolicitudesSchema = Joi.object({
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
  
  estado: Joi.number().integer().valid(1, 2, 3).optional()
    .messages({
      'number.base': 'El estado debe ser un número',
      'number.integer': 'El estado debe ser un número entero',
      'any.only': 'El estado debe ser 1 (Pendiente), 2 (Aprobada) o 3 (Rechazada)'
    }),
  
  prioridad: Joi.string().valid('baja', 'media', 'alta', 'critica').optional()
    .messages({
      'string.base': 'La prioridad debe ser una cadena de texto',
      'any.only': 'La prioridad debe ser: baja, media, alta o critica'
    }),
  
  cliente_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID del cliente debe ser un número',
      'number.integer': 'ID del cliente debe ser un número entero',
      'number.positive': 'ID del cliente debe ser positivo'
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
export const createSolicitudValidation = validate(createSolicitudSchema, 'body');
export const updateSolicitudValidation = validate(updateSolicitudSchema, 'body');
export const changeEstadoValidation = validate(changeEstadoSchema, 'body');
export const listSolicitudesValidation = validate(listSolicitudesSchema, 'query');

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