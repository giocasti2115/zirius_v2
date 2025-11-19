export interface Solicitud {
  id: number
  creacion: string
  id_creador: number
  id_servicio: number
  id_estado: number
  aviso: string
  id_equipo?: number
  cambio_estado?: string
  id_cambiador?: number
  observacion: string
  observacion_estado: string
  estado?: string
  creador_nombre?: string
  cambiador_nombre?: string
}

export interface EstadisticasSolicitudes {
  total: number
  pendientes: string
  aprobadas: string
  rechazadas: string
  porcentaje_aprobacion: string
}

export interface SolicitudesResponse {
  success: boolean
  message: string
  data: {
    solicitudes: Solicitud[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface EstadisticasResponse {
  success: boolean
  message: string
  data: EstadisticasSolicitudes
}

export interface CrearSolicitudRequest {
  id_servicio: number
  aviso: string
  id_equipo?: number
  observacion: string
}

export interface FiltrosSolicitudes {
  page?: number
  limit?: number
  estado?: number
  id_creador?: number
  id_servicio?: number
  fecha_desde?: string
  fecha_hasta?: string
  aviso?: string
}

export const ESTADOS_SOLICITUD = {
  PENDIENTE: 1,
  APROBADA: 2,
  RECHAZADA: 3
} as const

export const NOMBRES_ESTADOS = {
  [ESTADOS_SOLICITUD.PENDIENTE]: 'Pendiente',
  [ESTADOS_SOLICITUD.APROBADA]: 'Aprobada',
  [ESTADOS_SOLICITUD.RECHAZADA]: 'Rechazada'
} as const

export const COLORES_ESTADOS = {
  [ESTADOS_SOLICITUD.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
  [ESTADOS_SOLICITUD.APROBADA]: 'bg-green-100 text-green-800',
  [ESTADOS_SOLICITUD.RECHAZADA]: 'bg-red-100 text-red-800'
} as const