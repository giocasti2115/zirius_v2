import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Schema para crear orden
const createOrdenSchema = Joi.object({
  id_solicitud: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'ID de la solicitud debe ser un número',
      'number.integer': 'ID de la solicitud debe ser un número entero',
      'number.positive': 'ID de la solicitud debe ser positivo',
      'any.required': 'ID de la solicitud es requerido'
    }),
  
  observaciones_cierre: Joi.string().max(2000).optional().allow('')
    .messages({
      'string.base': 'Las observaciones deben ser una cadena de texto',
      'string.max': 'Las observaciones no pueden exceder 2000 caracteres'
    }),
  
  nombre_recibe: Joi.string().max(200).required()
    .messages({
      'string.base': 'El nombre quien recibe debe ser una cadena de texto',
      'string.max': 'El nombre no puede exceder 200 caracteres',
      'any.required': 'El nombre quien recibe es requerido'
    }),
  
  cedula_recibe: Joi.string().max(200).required()
    .messages({
      'string.base': 'La cédula debe ser una cadena de texto',
      'string.max': 'La cédula no puede exceder 200 caracteres',
      'any.required': 'La cédula es requerida'
    }),
  
  total: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'El total debe ser un número',
      'number.integer': 'El total debe ser un número entero',
      'number.min': 'El total no puede ser negativo'
    })
});

// Schema para actualizar orden
const updateOrdenSchema = Joi.object({
  id_estado: Joi.number().integer().valid(1, 2, 3).optional()
    .messages({
      'number.base': 'El estado debe ser un número',
      'number.integer': 'El estado debe ser un número entero',
      'any.only': 'El estado debe ser 1 (Abierta), 2 (Cerrada) o 3 (Anulada)'
    }),
  
  observaciones_cierre: Joi.string().max(2000).optional().allow('')
    .messages({
      'string.base': 'Las observaciones deben ser una cadena de texto',
      'string.max': 'Las observaciones no pueden exceder 2000 caracteres'
    }),
  
  nombre_recibe: Joi.string().max(200).optional()
    .messages({
      'string.base': 'El nombre quien recibe debe ser una cadena de texto',
      'string.max': 'El nombre no puede exceder 200 caracteres'
    }),
  
  cedula_recibe: Joi.string().max(200).optional()
    .messages({
      'string.base': 'La cédula debe ser una cadena de texto',
      'string.max': 'La cédula no puede exceder 200 caracteres'
    }),
  
  total: Joi.number().integer().min(0).optional()
    .messages({
      'number.base': 'El total debe ser un número',
      'number.integer': 'El total debe ser un número entero',
      'number.min': 'El total no puede ser negativo'
    })
});

// Schema para cerrar orden
const cerrarOrdenSchema = Joi.object({
  observaciones_cierre: Joi.string().min(10).max(2000).required()
    .messages({
      'string.base': 'Las observaciones de cierre deben ser una cadena de texto',
      'string.min': 'Las observaciones deben tener al menos 10 caracteres',
      'string.max': 'Las observaciones no pueden exceder 2000 caracteres',
      'any.required': 'Las observaciones de cierre son requeridas'
    })
});

// Schema para cambio de estado con comentario
const cambiarEstadoOrdenSchema = Joi.object({
  id_sub_estado: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID del sub estado debe ser un número',
      'number.integer': 'ID del sub estado debe ser un número entero',
      'number.positive': 'ID del sub estado debe ser positivo'
    }),
  
  comentario: Joi.string().min(5).max(600).required()
    .messages({
      'string.base': 'El comentario debe ser una cadena de texto',
      'string.min': 'El comentario debe tener al menos 5 caracteres',
      'string.max': 'El comentario no puede exceder 600 caracteres',
      'any.required': 'El comentario es requerido'
    })
});

// Schema para parámetros de listado
const listOrdenesSchema = Joi.object({
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
      'any.only': 'El estado debe ser 1 (Abierta), 2 (Cerrada) o 3 (Anulada)'
    }),
  
  solicitud_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID de la solicitud debe ser un número',
      'number.integer': 'ID de la solicitud debe ser un número entero',
      'number.positive': 'ID de la solicitud debe ser positivo'
    }),
  
  creador_id: Joi.number().integer().positive().optional()
    .messages({
      'number.base': 'ID del creador debe ser un número',
      'number.integer': 'ID del creador debe ser un número entero',
      'number.positive': 'ID del creador debe ser positivo'
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
export const createOrdenValidation = validate(createOrdenSchema, 'body');
export const updateOrdenValidation = validate(updateOrdenSchema, 'body');
export const cerrarOrdenValidation = validate(cerrarOrdenSchema, 'body');
export const cambiarEstadoOrdenValidation = validate(cambiarEstadoOrdenSchema, 'body');
export const listOrdenesValidation = validate(listOrdenesSchema, 'query');

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