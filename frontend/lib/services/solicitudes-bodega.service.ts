'use client'

import { ApiResponse } from '@/lib/api/client'

// Tipos e interfaces
export interface SolicitudBodega {
  id: number
  aviso: number
  cliente: string
  ordenRelacionada: number
  estado: string
  creador: string
  servicio?: string
  creacion?: string
  equipo?: string
  idEquipo?: number
  sede?: string
  serie?: string
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente'
  tipo?: 'repuestos' | 'materiales' | 'herramientas' | 'equipos'
  fechaAprobacion?: string
  fechaRechazo?: string
  fechaDespacho?: string
  fechaCompletada?: string
  valorTotal?: number
  observaciones?: string
  cotizaciones?: string[]
  repuestos?: RepuestoSolicitud[]
  itemsAdicionales?: ItemAdicional[]
  cambios?: CambioEstado[]
}

export interface RepuestoSolicitud {
  id?: number
  solicitudId?: number
  descripcion: string
  cantidad: number
  valorUnitario: number
  valorTotal?: number
  sumaCliente: string
  disponible?: boolean
  stock?: number
}

export interface ItemAdicional {
  id?: number
  solicitudId?: number
  descripcion: string
  cantidad: number
  valorUnitario: number
  valorTotal?: number
  sumaCliente: string
  tipo?: string
}

export interface CambioEstado {
  id?: number
  solicitudId?: number
  fecha: string
  estadoAnterior?: string
  estadoNuevo: string
  accion: string
  usuario: string
  comentario?: string
}

export interface EstadisticasSolicitudes {
  totalSolicitudes: number
  pendientes: number
  aprobadas: number
  rechazadas: number
  despachadas: number
  completadas: number
  porcentajePendientes: number
  porcentajeAprobadas: number
  tiempoPromedioAprobacion: number
  valorTotalPendiente: number
  valorTotalAprobado: number
  solicitudesUrgentes: number
}

export interface FiltrosSolicitudes {
  estado?: string
  cliente?: string
  creador?: string
  fechaDesde?: string
  fechaHasta?: string
  prioridad?: string
  tipo?: string
  page?: number
  limit?: number
  search?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

// Sistema de cache
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheManager {
  private static instance: CacheManager
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutos

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

// Servicio principal
class SolicitudesBodegaService {
  private cache = CacheManager.getInstance()
  private baseUrl = '/api/solicitudes-bodega'
  private bdUrl = '/api/real/solicitudes-bodega'

  // Configuración de conexión BD
  private useBdReal = true
  private mockFallback = true

  // Método de fetch con autenticación
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('authToken')
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  }

  // Mapear datos de BD real a formato del frontend
  private mapearSolicitud(solicitud: any): SolicitudBodega {
    return {
      id: solicitud.id,
      aviso: solicitud.aviso || solicitud.numero_aviso,
      cliente: solicitud.cliente || solicitud.nombre_cliente,
      ordenRelacionada: solicitud.orden_relacionada || solicitud.orden_id,
      estado: this.mapearEstado(solicitud.estado || solicitud.id_estado),
      creador: solicitud.creador || solicitud.usuario_crea,
      servicio: solicitud.servicio || solicitud.tipo_servicio,
      creacion: solicitud.creacion || solicitud.fecha_creacion,
      equipo: solicitud.equipo || solicitud.nombre_equipo,
      idEquipo: solicitud.id_equipo || solicitud.equipo_id,
      sede: solicitud.sede || solicitud.nombre_sede,
      serie: solicitud.serie || solicitud.numero_serie,
      prioridad: solicitud.prioridad || 'media',
      tipo: solicitud.tipo || 'repuestos',
      fechaAprobacion: solicitud.fecha_aprobacion,
      fechaRechazo: solicitud.fecha_rechazo,
      fechaDespacho: solicitud.fecha_despacho,
      fechaCompletada: solicitud.fecha_completada,
      valorTotal: solicitud.valor_total || 0,
      observaciones: solicitud.observaciones,
      cotizaciones: solicitud.cotizaciones || [],
      repuestos: solicitud.repuestos || [],
      itemsAdicionales: solicitud.items_adicionales || [],
      cambios: solicitud.cambios || []
    }
  }

  private mapearEstado(estado: any): string {
    if (typeof estado === 'string') return estado
    
    const estadosMap: { [key: number]: string } = {
      1: 'Pendiente',
      2: 'Aprobada',
      3: 'Rechazada',
      4: 'Despachada',
      5: 'Completada',
      6: 'En Proceso'
    }
    
    return estadosMap[estado] || 'Pendiente'
  }

  // Obtener todas las solicitudes con filtros
  async obtenerSolicitudes(filtros: FiltrosSolicitudes = {}): Promise<{
    solicitudes: SolicitudBodega[]
    total: number
    page: number
    totalPages: number
  }> {
    const cacheKey = `solicitudes_${JSON.stringify(filtros)}`
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    try {
      if (this.useBdReal) {
        console.log('🔍 [SolicitudesService] Obteniendo solicitudes desde BD real')
        
        const params = new URLSearchParams()
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })

        const response = await this.fetchWithAuth(`${this.bdUrl}?${params.toString()}`)
        const data = await response.json()

        const result = {
          solicitudes: data.solicitudes?.map((sol: any) => this.mapearSolicitud(sol)) || [],
          total: data.total || 0,
          page: data.page || 1,
          totalPages: data.totalPages || 1
        }

        this.cache.set(cacheKey, result)
        return result
      }
    } catch (error) {
      console.warn('⚠️ [SolicitudesService] Error BD real, usando mock:', error)
    }

    // Fallback a datos mock
    if (this.mockFallback) {
      const mockData = await this.obtenerSolicitudesMock(filtros)
      this.cache.set(cacheKey, mockData)
      return mockData
    }

    throw new Error('No se pudieron obtener las solicitudes')
  }

  // Obtener estadísticas
  async obtenerEstadisticas(): Promise<EstadisticasSolicitudes> {
    const cacheKey = 'estadisticas_solicitudes'
    const cached = this.cache.get<EstadisticasSolicitudes>(cacheKey)
    if (cached) return cached

    try {
      if (this.useBdReal) {
        console.log('📊 [SolicitudesService] Obteniendo estadísticas desde BD real')
        
        const response = await this.fetchWithAuth(`${this.bdUrl}/estadisticas`)
        const data = await response.json()

        const estadisticas: EstadisticasSolicitudes = {
          totalSolicitudes: data.total_solicitudes || 0,
          pendientes: data.pendientes || 0,
          aprobadas: data.aprobadas || 0,
          rechazadas: data.rechazadas || 0,
          despachadas: data.despachadas || 0,
          completadas: data.completadas || 0,
          porcentajePendientes: data.porcentaje_pendientes || 0,
          porcentajeAprobadas: data.porcentaje_aprobadas || 0,
          tiempoPromedioAprobacion: data.tiempo_promedio_aprobacion || 0,
          valorTotalPendiente: data.valor_total_pendiente || 0,
          valorTotalAprobado: data.valor_total_aprobado || 0,
          solicitudesUrgentes: data.solicitudes_urgentes || 0
        }

        this.cache.set(cacheKey, estadisticas)
        return estadisticas
      }
    } catch (error) {
      console.warn('⚠️ [SolicitudesService] Error estadísticas BD real, usando mock:', error)
    }

    // Fallback a estadísticas mock
    if (this.mockFallback) {
      const mockStats = await this.obtenerEstadisticasMock()
      this.cache.set(cacheKey, mockStats)
      return mockStats
    }

    throw new Error('No se pudieron obtener las estadísticas')
  }

  // Obtener solicitud por ID
  async obtenerSolicitudPorId(id: number): Promise<SolicitudBodega | null> {
    const cacheKey = `solicitud_${id}`
    const cached = this.cache.get<SolicitudBodega>(cacheKey)
    if (cached) return cached

    try {
      if (this.useBdReal) {
        const response = await this.fetchWithAuth(`${this.bdUrl}/${id}`)
        const data = await response.json()
        
        const solicitud = this.mapearSolicitud(data)
        this.cache.set(cacheKey, solicitud)
        return solicitud
      }
    } catch (error) {
      console.warn('⚠️ [SolicitudesService] Error obtener solicitud BD real:', error)
    }

    return null
  }

  // Crear nueva solicitud
  async crearSolicitud(solicitud: Partial<SolicitudBodega>): Promise<SolicitudBodega> {
    try {
      if (this.useBdReal) {
        const response = await this.fetchWithAuth(this.bdUrl, {
          method: 'POST',
          body: JSON.stringify(solicitud)
        })
        
        const data = await response.json()
        const nuevaSolicitud = this.mapearSolicitud(data)
        
        // Invalidar cache
        this.cache.invalidate('solicitudes')
        this.cache.invalidate('estadisticas')
        
        return nuevaSolicitud
      }
    } catch (error) {
      console.error('❌ [SolicitudesService] Error crear solicitud:', error)
      throw error
    }

    throw new Error('No se pudo crear la solicitud')
  }

  // Actualizar solicitud
  async actualizarSolicitud(id: number, solicitud: Partial<SolicitudBodega>): Promise<SolicitudBodega> {
    try {
      if (this.useBdReal) {
        const response = await this.fetchWithAuth(`${this.bdUrl}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(solicitud)
        })
        
        const data = await response.json()
        const solicitudActualizada = this.mapearSolicitud(data)
        
        // Invalidar cache
        this.cache.invalidate('solicitudes')
        this.cache.invalidate(`solicitud_${id}`)
        this.cache.invalidate('estadisticas')
        
        return solicitudActualizada
      }
    } catch (error) {
      console.error('❌ [SolicitudesService] Error actualizar solicitud:', error)
      throw error
    }

    throw new Error('No se pudo actualizar la solicitud')
  }

  // Aprobar solicitud
  async aprobarSolicitud(id: number, observaciones?: string): Promise<SolicitudBodega> {
    try {
      if (this.useBdReal) {
        const response = await this.fetchWithAuth(`${this.bdUrl}/${id}/aprobar`, {
          method: 'POST',
          body: JSON.stringify({ observaciones })
        })
        
        const data = await response.json()
        const solicitudAprobada = this.mapearSolicitud(data)
        
        // Invalidar cache
        this.cache.invalidate('solicitudes')
        this.cache.invalidate(`solicitud_${id}`)
        this.cache.invalidate('estadisticas')
        
        return solicitudAprobada
      }
    } catch (error) {
      console.error('❌ [SolicitudesService] Error aprobar solicitud:', error)
      throw error
    }

    throw new Error('No se pudo aprobar la solicitud')
  }

  // Rechazar solicitud
  async rechazarSolicitud(id: number, motivo: string): Promise<SolicitudBodega> {
    try {
      if (this.useBdReal) {
        const response = await this.fetchWithAuth(`${this.bdUrl}/${id}/rechazar`, {
          method: 'POST',
          body: JSON.stringify({ motivo })
        })
        
        const data = await response.json()
        const solicitudRechazada = this.mapearSolicitud(data)
        
        // Invalidar cache
        this.cache.invalidate('solicitudes')
        this.cache.invalidate(`solicitud_${id}`)
        this.cache.invalidate('estadisticas')
        
        return solicitudRechazada
      }
    } catch (error) {
      console.error('❌ [SolicitudesService] Error rechazar solicitud:', error)
      throw error
    }

    throw new Error('No se pudo rechazar la solicitud')
  }

  // Despachar solicitud
  async despacharSolicitud(id: number, observaciones?: string): Promise<SolicitudBodega> {
    try {
      if (this.useBdReal) {
        const response = await this.fetchWithAuth(`${this.bdUrl}/${id}/despachar`, {
          method: 'POST',
          body: JSON.stringify({ observaciones })
        })
        
        const data = await response.json()
        const solicitudDespachada = this.mapearSolicitud(data)
        
        // Invalidar cache
        this.cache.invalidate('solicitudes')
        this.cache.invalidate(`solicitud_${id}`)
        this.cache.invalidate('estadisticas')
        
        return solicitudDespachada
      }
    } catch (error) {
      console.error('❌ [SolicitudesService] Error despachar solicitud:', error)
      throw error
    }

    throw new Error('No se pudo despachar la solicitud')
  }

  // Datos mock para desarrollo
  private async obtenerSolicitudesMock(filtros: FiltrosSolicitudes = {}): Promise<{
    solicitudes: SolicitudBodega[]
    total: number
    page: number
    totalPages: number
  }> {
    console.log('🔄 [SolicitudesService] Usando datos mock')
    
    const mockSolicitudes: SolicitudBodega[] = [
      {
        id: 1,
        aviso: 10556789,
        cliente: "SURA EPS",
        ordenRelacionada: 45678,
        estado: "Pendiente",
        creador: "Juan Pérez",
        servicio: "Correctivo",
        creacion: "2024-11-15 08:30:00",
        equipo: "Monitor de Signos Vitales",
        idEquipo: 12345,
        sede: "Hospital San Vicente",
        serie: "MSV-2024-001",
        prioridad: "alta",
        tipo: "repuestos",
        valorTotal: 250000,
        observaciones: "Requiere repuesto urgente para sensor de oxígeno",
        repuestos: [
          {
            descripcion: "Sensor de oxígeno SpO2",
            cantidad: 2,
            valorUnitario: 85000,
            valorTotal: 170000,
            sumaCliente: "170000"
          },
          {
            descripcion: "Cable de conexión principal",
            cantidad: 1,
            valorUnitario: 80000,
            valorTotal: 80000,
            sumaCliente: "80000"
          }
        ],
        itemsAdicionales: [],
        cambios: [
          {
            fecha: "2024-11-15 08:30:00",
            estadoNuevo: "Pendiente",
            accion: "Solicitud creada",
            usuario: "Juan Pérez"
          }
        ]
      },
      {
        id: 2,
        aviso: 10556790,
        cliente: "COOMEVA EPS",
        ordenRelacionada: 45679,
        estado: "Aprobada",
        creador: "María García",
        servicio: "Preventivo",
        creacion: "2024-11-14 14:20:00",
        equipo: "Ventilador Mecánico",
        idEquipo: 12346,
        sede: "Clínica Los Remedios",
        serie: "VM-2024-002",
        prioridad: "media",
        tipo: "materiales",
        valorTotal: 180000,
        fechaAprobacion: "2024-11-15 09:15:00",
        observaciones: "Mantenimiento programado aprobado",
        repuestos: [],
        itemsAdicionales: [
          {
            descripcion: "Kit de mantenimiento completo",
            cantidad: 1,
            valorUnitario: 180000,
            valorTotal: 180000,
            sumaCliente: "180000"
          }
        ],
        cambios: [
          {
            fecha: "2024-11-14 14:20:00",
            estadoNuevo: "Pendiente",
            accion: "Solicitud creada",
            usuario: "María García"
          },
          {
            fecha: "2024-11-15 09:15:00",
            estadoAnterior: "Pendiente",
            estadoNuevo: "Aprobada",
            accion: "Solicitud aprobada",
            usuario: "Carlos Supervisor"
          }
        ]
      },
      {
        id: 3,
        aviso: 10556791,
        cliente: "NUEVA EPS",
        ordenRelacionada: 45680,
        estado: "Rechazada",
        creador: "Luis Rodríguez",
        servicio: "Correctivo",
        creacion: "2024-11-13 16:45:00",
        equipo: "Bomba de Infusión",
        idEquipo: 12347,
        sede: "Hospital Militar",
        serie: "BI-2024-003",
        prioridad: "baja",
        tipo: "repuestos",
        valorTotal: 320000,
        fechaRechazo: "2024-11-14 10:30:00",
        observaciones: "Solicitud rechazada por presupuesto insuficiente",
        repuestos: [
          {
            descripcion: "Mecanismo de bomba completo",
            cantidad: 1,
            valorUnitario: 320000,
            valorTotal: 320000,
            sumaCliente: "320000"
          }
        ],
        itemsAdicionales: [],
        cambios: [
          {
            fecha: "2024-11-13 16:45:00",
            estadoNuevo: "Pendiente",
            accion: "Solicitud creada",
            usuario: "Luis Rodríguez"
          },
          {
            fecha: "2024-11-14 10:30:00",
            estadoAnterior: "Pendiente",
            estadoNuevo: "Rechazada",
            accion: "Solicitud rechazada",
            usuario: "Ana Directora",
            comentario: "Presupuesto insuficiente para este período"
          }
        ]
      },
      {
        id: 4,
        aviso: 10556792,
        cliente: "SANITAS EPS",
        ordenRelacionada: 45681,
        estado: "Despachada",
        creador: "Ana López",
        servicio: "Instalación",
        creacion: "2024-11-12 11:15:00",
        equipo: "Electrocardiografo",
        idEquipo: 12348,
        sede: "Centro Médico Norte",
        serie: "ECG-2024-004",
        prioridad: "media",
        tipo: "equipos",
        valorTotal: 150000,
        fechaAprobacion: "2024-11-13 08:00:00",
        fechaDespacho: "2024-11-14 15:30:00",
        observaciones: "Equipo despachado, en tránsito a sede",
        repuestos: [],
        itemsAdicionales: [
          {
            descripcion: "Cables de electrocardiograma (set completo)",
            cantidad: 1,
            valorUnitario: 150000,
            valorTotal: 150000,
            sumaCliente: "150000"
          }
        ],
        cambios: [
          {
            fecha: "2024-11-12 11:15:00",
            estadoNuevo: "Pendiente",
            accion: "Solicitud creada",
            usuario: "Ana López"
          },
          {
            fecha: "2024-11-13 08:00:00",
            estadoAnterior: "Pendiente",
            estadoNuevo: "Aprobada",
            accion: "Solicitud aprobada",
            usuario: "Carlos Supervisor"
          },
          {
            fecha: "2024-11-14 15:30:00",
            estadoAnterior: "Aprobada",
            estadoNuevo: "Despachada",
            accion: "Solicitud despachada",
            usuario: "Pedro Bodeguero"
          }
        ]
      },
      {
        id: 5,
        aviso: 10556793,
        cliente: "FAMISANAR EPS",
        ordenRelacionada: 45682,
        estado: "Completada",
        creador: "Roberto Silva",
        servicio: "Correctivo",
        creacion: "2024-11-10 09:30:00",
        equipo: "Desfibrilador",
        idEquipo: 12349,
        sede: "Clínica Santa Fe",
        serie: "DEF-2024-005",
        prioridad: "urgente",
        tipo: "repuestos",
        valorTotal: 450000,
        fechaAprobacion: "2024-11-11 07:45:00",
        fechaDespacho: "2024-11-12 14:20:00",
        fechaCompletada: "2024-11-13 16:00:00",
        observaciones: "Solicitud completada exitosamente, equipo funcionando",
        repuestos: [
          {
            descripcion: "Batería recargable principal",
            cantidad: 1,
            valorUnitario: 280000,
            valorTotal: 280000,
            sumaCliente: "280000"
          },
          {
            descripcion: "Electrodos desechables (pack 10)",
            cantidad: 2,
            valorUnitario: 85000,
            valorTotal: 170000,
            sumaCliente: "170000"
          }
        ],
        itemsAdicionales: [],
        cambios: [
          {
            fecha: "2024-11-10 09:30:00",
            estadoNuevo: "Pendiente",
            accion: "Solicitud creada",
            usuario: "Roberto Silva"
          },
          {
            fecha: "2024-11-11 07:45:00",
            estadoAnterior: "Pendiente",
            estadoNuevo: "Aprobada",
            accion: "Solicitud aprobada urgente",
            usuario: "Carlos Supervisor"
          },
          {
            fecha: "2024-11-12 14:20:00",
            estadoAnterior: "Aprobada",
            estadoNuevo: "Despachada",
            accion: "Solicitud despachada",
            usuario: "Pedro Bodeguero"
          },
          {
            fecha: "2024-11-13 16:00:00",
            estadoAnterior: "Despachada",
            estadoNuevo: "Completada",
            accion: "Solicitud completada",
            usuario: "Roberto Silva",
            comentario: "Equipo instalado y funcionando correctamente"
          }
        ]
      }
    ]

    // Aplicar filtros básicos
    let solicitudesFiltradas = mockSolicitudes

    if (filtros.estado) {
      solicitudesFiltradas = solicitudesFiltradas.filter(s => 
        s.estado.toLowerCase().includes(filtros.estado!.toLowerCase())
      )
    }

    if (filtros.cliente) {
      solicitudesFiltradas = solicitudesFiltradas.filter(s => 
        s.cliente.toLowerCase().includes(filtros.cliente!.toLowerCase())
      )
    }

    if (filtros.search) {
      const search = filtros.search.toLowerCase()
      solicitudesFiltradas = solicitudesFiltradas.filter(s => 
        s.cliente.toLowerCase().includes(search) ||
        s.equipo?.toLowerCase().includes(search) ||
        s.creador.toLowerCase().includes(search) ||
        s.aviso.toString().includes(search)
      )
    }

    // Paginación
    const page = filtros.page || 1
    const limit = filtros.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return {
      solicitudes: solicitudesFiltradas.slice(startIndex, endIndex),
      total: solicitudesFiltradas.length,
      page,
      totalPages: Math.ceil(solicitudesFiltradas.length / limit)
    }
  }

  private async obtenerEstadisticasMock(): Promise<EstadisticasSolicitudes> {
    console.log('📊 [SolicitudesService] Usando estadísticas mock')
    
    return {
      totalSolicitudes: 15678,
      pendientes: 3245,
      aprobadas: 8756,
      rechazadas: 1234,
      despachadas: 1876,
      completadas: 567,
      porcentajePendientes: 20.7,
      porcentajeAprobadas: 55.8,
      tiempoPromedioAprobacion: 2.3,
      valorTotalPendiente: 12500000,
      valorTotalAprobado: 45800000,
      solicitudesUrgentes: 45
    }
  }

  // Métodos de utilidad
  resetConnection(): void {
    console.log('🔄 [SolicitudesService] Reseteando conexión a BD')
    this.cache.invalidate()
    this.useBdReal = true
    this.mockFallback = true
  }

  toggleBdReal(enabled: boolean): void {
    this.useBdReal = enabled
    this.cache.invalidate()
    console.log(`🔧 [SolicitudesService] BD Real ${enabled ? 'habilitada' : 'deshabilitada'}`)
  }

  getCacheStats(): { size: number; keys: string[] } {
    return this.cache.getStats()
  }
}

// Singleton instance
const solicitudesBodegaService = new SolicitudesBodegaService()
export default solicitudesBodegaService