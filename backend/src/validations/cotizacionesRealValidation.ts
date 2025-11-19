import Joi from 'joi'

/**
 * Esquema para cambiar estado de cotización
 */
const cambiarEstadoSchema = Joi.object({
  id_estado: Joi.number().integer().valid(1, 2, 3).required()
    .messages({
      'any.only': 'El estado debe ser: 1 (Pendiente), 2 (Aprobada), 3 (Rechazada)',
      'any.required': 'El estado es requerido'
    }),

  observacion: Joi.string().max(600).allow('')
    .messages({
      'string.max': 'La observación no puede exceder 600 caracteres'
    })
})

/**
 * Esquema para filtros de búsqueda
 */
const filterCotizacionesSchema = Joi.object({
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
      'number.max': 'El límite máximo es 100'
    }),

  id_estado: Joi.number().integer().valid(1, 2, 3)
    .messages({
      'any.only': 'El estado debe ser: 1 (Pendiente), 2 (Aprobada), 3 (Rechazada)'
    }),

  id_cliente: Joi.number().integer().positive()
    .messages({
      'number.base': 'El ID del cliente debe ser un número',
      'number.integer': 'El ID del cliente debe ser un número entero',
      'number.positive': 'El ID del cliente debe ser positivo'
    }),

  fecha_desde: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      'string.pattern.base': 'La fecha desde debe tener el formato YYYY-MM-DD'
    }),

  fecha_hasta: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      'string.pattern.base': 'La fecha hasta debe tener el formato YYYY-MM-DD'
    }),

  buscar: Joi.string().max(255).allow('')
    .messages({
      'string.max': 'El término de búsqueda no puede exceder 255 caracteres'
    })
})

// Funciones de validación para middleware
export const validateCambiarEstado = (req: any, res: any, next: any) => {
  const { error } = cambiarEstadoSchema.validate(req.body)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details?.[0]?.message || 'Error de validación'
    })
  }
  next()
}

export const validateFilterCotizaciones = (req: any, res: any, next: any) => {
  const { error } = filterCotizacionesSchema.validate(req.query)
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details?.[0]?.message || 'Error de validación'
    })
  }
  next()
}