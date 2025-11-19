import { api, ApiResponse } from './client'

export interface Servicio {
  id: number
  solicitud_id: number
  equipo_id: number
  equipo_nombre?: string
  sede_id: number
  sede_nombre?: string
  cliente_id: number
  cliente_nombre?: string
  tipo_servicio: 'preventivo' | 'correctivo' | 'instalacion' | 'calibracion'
  estado: 'pendiente' | 'programado' | 'en_proceso' | 'completado' | 'cancelado'
  urgencia: 'baja' | 'media' | 'alta' | 'critica'
  fecha_solicitud: string
  fecha_programada?: string
  fecha_inicio?: string
  fecha_completado?: string
  tecnico_id?: number
  tecnico_nombre?: string
  descripcion: string
  observaciones?: string
  problema_reportado?: string
  solucion_aplicada?: string
  duracion?: number // en horas
  costo?: number
  materiales_utilizados?: string
  creacion: string
  actualizacion: string
}

export interface CreateServicioData {
  solicitud_id: number
  equipo_id: number
  tipo_servicio: 'preventivo' | 'correctivo' | 'instalacion' | 'calibracion'
  urgencia: 'baja' | 'media' | 'alta' | 'critica'
  descripcion: string
  fecha_programada?: string
  tecnico_id?: number
  observaciones?: string
}

export interface UpdateServicioData {
  tipo_servicio?: 'preventivo' | 'correctivo' | 'instalacion' | 'calibracion'
  estado?: 'pendiente' | 'programado' | 'en_proceso' | 'completado' | 'cancelado'
  urgencia?: 'baja' | 'media' | 'alta' | 'critica'
  fecha_programada?: string
  fecha_inicio?: string
  fecha_completado?: string
  tecnico_id?: number
  descripcion?: string
  observaciones?: string
  problema_reportado?: string
  solucion_aplicada?: string
  duracion?: number
  costo?: number
  materiales_utilizados?: string
}

export interface ServicioQueryParams {
  page?: number
  limit?: number
  search?: string
  tipo_servicio?: 'preventivo' | 'correctivo' | 'instalacion' | 'calibracion'
  estado?: 'pendiente' | 'programado' | 'en_proceso' | 'completado' | 'cancelado'
  urgencia?: 'baja' | 'media' | 'alta' | 'critica'
  equipo_id?: number
  sede_id?: number
  cliente_id?: number
  tecnico_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  sort_by?: 'fecha_solicitud' | 'fecha_programada' | 'fecha_completado' | 'urgencia'
  sort_order?: 'asc' | 'desc'
}

export interface ServiciosResponse {
  servicios: Servicio[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface ServicioStats {
  total: number
  por_tipo: {
    preventivo: number
    correctivo: number
    instalacion: number
    calibracion: number
  }
  por_estado: {
    pendiente: number
    programado: number
    en_proceso: number
    completado: number
    cancelado: number
  }
  por_urgencia: {
    baja: number
    media: number
    alta: number
    critica: number
  }
  metricas: {
    tiempo_promedio_respuesta: number // en horas
    tiempo_promedio_resolucion: number // en horas
    tasa_completitud: number // porcentaje
    costo_promedio: number
    servicios_mes_actual: number
    servicios_mes_anterior: number
  }
}

export interface TecnicoDisponible {
  id: number
  nombre: string
  especialidades: string[]
  servicios_asignados: number
  disponible: boolean
}

class ServicioAPI {
  /**
   * Obtener todos los servicios con filtros y paginación
   */
  async getAll(params: ServicioQueryParams = {}): Promise<ApiResponse<ServiciosResponse>> {
    try {
      const queryParams = new URLSearchParams()
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          queryParams.append(key, value.toString())
        }
      })

      const response = await api.get(`/real/servicios?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching servicios:', error)
      throw error
    }
  }

  /**
   * Obtener servicio por ID
   */
  async getById(id: number): Promise<ApiResponse<Servicio>> {
    try {
      const response = await api.get(`/real/servicios/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching servicio:', error)
      throw error
    }
  }

  /**
   * Crear nuevo servicio
   */
  async create(data: CreateServicioData): Promise<ApiResponse<Servicio>> {
    try {
      const response = await api.post('/real/servicios', data)
      return response.data
    } catch (error) {
      console.error('Error creating servicio:', error)
      throw error
    }
  }

  /**
   * Actualizar servicio existente
   */
  async update(id: number, data: UpdateServicioData): Promise<ApiResponse<Servicio>> {
    try {
      const response = await api.put(`/real/servicios/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating servicio:', error)
      throw error
    }
  }

  /**
   * Eliminar servicio (soft delete)
   */
  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/real/servicios/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting servicio:', error)
      throw error
    }
  }

  /**
   * Obtener estadísticas de servicios
   */
  async getStats(): Promise<ApiResponse<ServicioStats>> {
    try {
      const response = await api.get('/real/servicios/stats/general')
      return response.data
    } catch (error) {
      console.error('Error fetching servicios stats:', error)
      throw error
    }
  }

  /**
   * Iniciar servicio (cambiar estado a en_proceso)
   */
  async iniciar(id: number, tecnico_id: number): Promise<ApiResponse<Servicio>> {
    try {
      const response = await api.put(`/real/servicios/${id}/iniciar`, { tecnico_id })
      return response.data
    } catch (error) {
      console.error('Error iniciando servicio:', error)
      throw error
    }
  }

  /**
   * Completar servicio
   */
  async completar(id: number, data: {
    solucion_aplicada: string
    duracion?: number
    costo?: number
    materiales_utilizados?: string
    observaciones?: string
  }): Promise<ApiResponse<Servicio>> {
    try {
      const response = await api.put(`/real/servicios/${id}/completar`, data)
      return response.data
    } catch (error) {
      console.error('Error completando servicio:', error)
      throw error
    }
  }

  /**
   * Cancelar servicio
   */
  async cancelar(id: number, razon: string): Promise<ApiResponse<Servicio>> {
    try {
      const response = await api.put(`/real/servicios/${id}/cancelar`, { razon })
      return response.data
    } catch (error) {
      console.error('Error cancelando servicio:', error)
      throw error
    }
  }

  /**
   * Asignar técnico a servicio
   */
  async asignarTecnico(id: number, tecnico_id: number, fecha_programada?: string): Promise<ApiResponse<Servicio>> {
    try {
      const response = await api.put(`/real/servicios/${id}/asignar-tecnico`, { 
        tecnico_id, 
        fecha_programada 
      })
      return response.data
    } catch (error) {
      console.error('Error asignando técnico:', error)
      throw error
    }
  }

  /**
   * Obtener técnicos disponibles para un tipo de servicio
   */
  async getTecnicosDisponibles(tipo_servicio: string): Promise<ApiResponse<TecnicoDisponible[]>> {
    try {
      const response = await api.get(`/real/servicios/tecnicos-disponibles?tipo=${tipo_servicio}`)
      return response.data
    } catch (error) {
      console.error('Error fetching técnicos disponibles:', error)
      throw error
    }
  }

  /**
   * Obtener servicios por tipo específico
   */
  async getByTipo(tipo: 'preventivo' | 'correctivo' | 'instalacion' | 'calibracion', params: ServicioQueryParams = {}): Promise<ApiResponse<ServiciosResponse>> {
    return this.getAll({ ...params, tipo_servicio: tipo })
  }

  /**
   * Obtener servicios por estado específico
   */
  async getByEstado(estado: 'pendiente' | 'programado' | 'en_proceso' | 'completado' | 'cancelado', params: ServicioQueryParams = {}): Promise<ApiResponse<ServiciosResponse>> {
    return this.getAll({ ...params, estado })
  }

  /**
   * Obtener servicios pendientes con prioridad
   */
  async getPendientesPrioritarios(): Promise<ApiResponse<Servicio[]>> {
    try {
      const response = await api.get('/real/servicios/pendientes-prioritarios')
      return response.data
    } catch (error) {
      console.error('Error fetching servicios pendientes prioritarios:', error)
      throw error
    }
  }

  /**
   * Obtener historial de un equipo
   */
  async getHistorialEquipo(equipo_id: number): Promise<ApiResponse<Servicio[]>> {
    try {
      const response = await api.get(`/real/servicios/historial/equipo/${equipo_id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching historial equipo:', error)
      throw error
    }
  }

  /**
   * Obtener servicios de un técnico
   */
  async getServiciosTecnico(tecnico_id: number, params: ServicioQueryParams = {}): Promise<ApiResponse<ServiciosResponse>> {
    return this.getAll({ ...params, tecnico_id })
  }
}

export const servicioApi = new ServicioAPI()

// Constantes útiles
export const TIPOS_SERVICIO = [
  { value: 'preventivo', label: 'Mantenimiento Preventivo' },
  { value: 'correctivo', label: 'Mantenimiento Correctivo' },
  { value: 'instalacion', label: 'Instalación' },
  { value: 'calibracion', label: 'Calibración' }
] as const

export const ESTADOS_SERVICIO = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'programado', label: 'Programado' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' }
] as const

export const URGENCIAS_SERVICIO = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' }
] as const