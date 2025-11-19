import { Request, Response } from 'express'
import { ParsedQs } from 'qs'
import Joi from 'joi'

// Enums para estados de solicitudes
export enum EstadoSolicitud {
  PENDIENTE = 1,
  APROBADA = 2,
  RECHAZADA = 3
}

export enum TipoServicio {
  PREVENTIVO = 1,
  CORRECTIVO = 2,
  INSTALACION = 3,
  CALIBRACION = 4
}

// Interface principal para Solicitudes
export interface Solicitud {
  id: number
  creacion: Date
  id_creador: number
  id_servicio: number
  id_estado: EstadoSolicitud
  aviso: string
  id_equipo?: number
  cambio_estado?: Date
  id_cambiador?: number
  observacion: string
  observacion_estado: string
  
  // Campos calculados/relacionados
  estado?: string
  creador_nombre?: string
  cambiador_nombre?: string
  equipo_nombre?: string
  servicio_nombre?: string
}

// Interface para crear nueva solicitud
export interface CrearSolicitudRequest {
  id_servicio: number
  aviso: string
  id_equipo?: number
  observacion: string
}

// Interface para actualizar solicitud
export interface ActualizarSolicitudRequest {
  id_servicio?: number
  aviso?: string
  id_equipo?: number
  observacion?: string
  observacion_estado?: string
}

// Interface para cambio de estado
export interface CambiarEstadoSolicitudRequest {
  id_estado: EstadoSolicitud
  observacion_estado: string
}

// Interface para filtros de búsqueda
export interface FiltrosSolicitudes {
  estado?: EstadoSolicitud | EstadoSolicitud[]
  id_creador?: number
  id_servicio?: number
  fecha_desde?: string
  fecha_hasta?: string
  aviso?: string
  page?: number
  limit?: number
  sortBy?: 'creacion' | 'id_estado' | 'aviso'
  sortOrder?: 'ASC' | 'DESC'
}

// Response interfaces
export interface SolicitudResponse {
  success: boolean
  message: string
  data?: Solicitud
}

export interface SolicitudesListResponse {
  success: boolean
  message: string
  data?: {
    solicitudes: Solicitud[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface EstadisticasSolicitudes {
  total: number
  pendientes: number
  aprobadas: number
  rechazadas: number
  porcentaje_aprobacion: number
  promedio_tiempo_aprobacion?: number
}

export interface EstadisticasSolicitudesResponse {
  success: boolean
  message: string
  data?: EstadisticasSolicitudes
}

// Request interfaces para Express
export interface CrearSolicitudRequestBody extends Request {
  body: CrearSolicitudRequest
}

export interface ActualizarSolicitudRequestBody extends Request {
  body: ActualizarSolicitudRequest
  params: { id: string }
}

export interface CambiarEstadoSolicitudRequestBody extends Request {
  body: CambiarEstadoSolicitudRequest
  params: { id: string }
}

export interface ListarSolicitudesRequest extends Request {
  query: FiltrosSolicitudes & ParsedQs
}

// Tipos para validación
export const EstadosValidos = [
  EstadoSolicitud.PENDIENTE,
  EstadoSolicitud.APROBADA,
  EstadoSolicitud.RECHAZADA
] as const

export const TiposServicioValidos = [
  TipoServicio.PREVENTIVO,
  TipoServicio.CORRECTIVO,
  TipoServicio.INSTALACION,
  TipoServicio.CALIBRACION
] as const