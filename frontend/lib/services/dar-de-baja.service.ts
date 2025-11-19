'use client'

import { ApiResponse } from '@/lib/api/client'

// Tipos e interfaces
export interface SolicitudBaja {
  id: number
  idEquipo: number
  codigoEquipo: string
  nombreEquipo: string
  cliente: string
  sede: string
  serie: string
  estado: string
  fechaSolicitud: string
  fechaAprobacion?: string
  fechaEjecucion?: string
  fechaCompletada?: string
  motivo: string
  justificacionTecnica: string
  justificacionEconomica?: string
  valorLibros?: number
  valorMercado?: number
  costoDesmantelamiento?: number
  tecnicoSolicitante: string
  supervisorAprobador?: string
  tecnicoEjecutor?: string
  observaciones?: string
  prioridad: 'baja' | 'media' | 'alta' | 'urgente'
  tipoMotivo: 'obsolescencia' | 'daño_irreparable' | 'fin_vida_util' | 'cambio_tecnologico' | 'fin_contrato' | 'otro'
  documentos?: DocumentoBaja[]
  repuestosRecuperables?: RepuestoRecuperable[]
  cambiosEstado?: CambioBaja[]
  evaluacionTecnica?: EvaluacionTecnica
}

export interface DocumentoBaja {
  id?: number
  solicitudId?: number
  nombre: string
  tipo: 'evaluacion_tecnica' | 'evaluacion_economica' | 'autorizacion' | 'acta_baja' | 'inventario_repuestos' | 'certificado_destruccion'
  url: string
  fechaSubida: string
  usuarioSubida: string
}

export interface RepuestoRecuperable {
  id?: number
  solicitudId?: number
  descripcion: string
  codigoRepuesto?: string
  cantidad: number
  estadoRepuesto: 'bueno' | 'regular' | 'malo' | 'no_recuperable'
  valorEstimado: number
  observaciones?: string
}

export interface CambioBaja {
  id?: number
  solicitudId?: number
  fecha: string
  estadoAnterior?: string
  estadoNuevo: string
  accion: string
  usuario: string
  comentario?: string
  documentosAdjuntos?: string[]
}

export interface EvaluacionTecnica {
  id?: number
  solicitudId?: number
  evaluadorTecnico: string
  fechaEvaluacion: string
  estadoFisico: 'excelente' | 'bueno' | 'regular' | 'malo' | 'critico'
  estadoFuncional: 'funcional' | 'parcialmente_funcional' | 'no_funcional'
  costoReparacion?: number
  tiempoReparacion?: number
  recomendacion: 'reparar' | 'dar_baja' | 'evaluar_nuevamente'
  observacionesTecnicas: string
  repuestosNecesarios?: string[]
  certificacionesRequeridas?: string[]
}

export interface EstadisticasBajas {
  totalSolicitudes: number
  pendientes: number
  aprobadas: number
  rechazadas: number
  enEjecucion: number
  completadas: number
  porcentajePendientes: number
  porcentajeAprobadas: number
  tiempoPromedioAprobacion: number
  valorTotalEquipos: number
  valorRepuestosRecuperados: number
  solicitudesUrgentes: number
  ahorroCostos: number
  equiposPorMotivo: { [key: string]: number }
}

export interface FiltrosBajas {
  estado?: string
  cliente?: string
  motivo?: string
  fechaDesde?: string
  fechaHasta?: string
  prioridad?: string
  tipoMotivo?: string
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
class DarDeBajaService {
  private cache = CacheManager.getInstance()
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'

  // Configuración de conexión BD
  private useBdReal = true // Usar API real por defecto
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
  private mapearSolicitudBaja(solicitud: any): SolicitudBaja {
    return {
      id: solicitud.id,
      idEquipo: solicitud.id || 0, // Usar id como fallback
      codigoEquipo: solicitud.codigo_equipo,
      nombreEquipo: solicitud.nombre_equipo,
      cliente: 'Cliente N/A', // No disponible en la BD actual
      sede: solicitud.ubicacion || 'Sede N/A',
      serie: solicitud.numero_serie || 'N/A',
      estado: solicitud.estado,
      fechaSolicitud: solicitud.fecha_solicitud,
      fechaAprobacion: solicitud.fecha_aprobacion,
      fechaEjecucion: solicitud.fecha_ejecucion,
      fechaCompletada: solicitud.fecha_ejecucion, // Usar fecha_ejecucion como completada
      motivo: solicitud.justificacion_tecnica || 'Sin motivo especificado',
      justificacionTecnica: solicitud.justificacion_tecnica || '',
      justificacionEconomica: solicitud.justificacion_economica,
      valorLibros: parseFloat(solicitud.valor_recuperable) || 0,
      valorMercado: parseFloat(solicitud.valor_recuperable_aprobado) || 0,
      costoDesmantelamiento: 0, // No disponible en la BD actual
      tecnicoSolicitante: solicitud.solicitante,
      supervisorAprobador: solicitud.evaluador,
      tecnicoEjecutor: solicitud.ejecutor,
      observaciones: solicitud.observaciones,
      prioridad: 'media' as any, // Valor por defecto
      tipoMotivo: this.mapearTipoMotivo(solicitud.tipo_baja),
      documentos: [],
      repuestosRecuperables: [],
      cambiosEstado: []
    }
  }

  private mapearEstado(estado: any): string {
    if (typeof estado === 'string') return estado
    
    const estadosMap: { [key: number]: string } = {
      1: 'Pendiente',
      2: 'En Evaluación',
      3: 'Aprobada',
      4: 'Rechazada',
      5: 'En Ejecución',
      6: 'Completada'
    }
    
    return estadosMap[estado] || 'Pendiente'
  }

  private mapearTipoMotivo(tipo: any): 'obsolescencia' | 'daño_irreparable' | 'fin_vida_util' | 'cambio_tecnologico' | 'fin_contrato' | 'otro' {
    if (typeof tipo === 'string') {
      // Mapear los valores exactos de la base de datos
      switch (tipo) {
        case 'obsolescencia_tecnologica':
          return 'obsolescencia'
        case 'fin_vida_util':
          return 'fin_vida_util'
        case 'costo_mantenimiento_elevado':
          return 'fin_vida_util' // Mapear a un tipo compatible
        case 'reemplazo_tecnologico':
          return 'cambio_tecnologico'
        case 'normativa_vigente':
          return 'otro'
        case 'falta_repuestos':
          return 'fin_vida_util'
        default:
          const tipoLower = tipo.toLowerCase()
          if (tipoLower.includes('obsole')) return 'obsolescencia'
          if (tipoLower.includes('daño') || tipoLower.includes('irreparable')) return 'daño_irreparable'
          if (tipoLower.includes('vida')) return 'fin_vida_util'
          if (tipoLower.includes('tecnolog')) return 'cambio_tecnologico'
          if (tipoLower.includes('contrato')) return 'fin_contrato'
          return 'otro'
      }
    }
    return 'otro'
  }

  // Obtener todas las solicitudes de baja con filtros
  async obtenerSolicitudes(filtros: FiltrosBajas = {}): Promise<{
    solicitudes: SolicitudBaja[]
    total: number
    page: number
    totalPages: number
  }> {
    const cacheKey = `bajas_${JSON.stringify(filtros)}`
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    try {
      if (this.useBdReal) {
        console.log('🔍 [BajasService] Obteniendo solicitudes desde BD real')
        
        const params = new URLSearchParams()
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })

        const response = await fetch(`${this.baseUrl}/dar-de-baja/public?${params.toString()}`)
        if (!response.ok) throw new Error('Error fetching solicitudes')
        
        const data = await response.json()

        const result = {
          solicitudes: data.data.solicitudes?.map((sol: any) => this.mapearSolicitudBaja(sol)) || [],
          total: data.data.pagination.total || 0,
          page: data.data.pagination.page || 1,
          totalPages: data.data.pagination.totalPages || 1
        }

        this.cache.set(cacheKey, result)
        return result
      }
    } catch (error) {
      console.warn('⚠️ [BajasService] Error BD real, usando mock:', error)
    }

    // Fallback a datos mock
    if (this.mockFallback) {
      const mockData = await this.obtenerSolicitudesMock(filtros)
      this.cache.set(cacheKey, mockData)
      return mockData
    }

    throw new Error('No se pudieron obtener las solicitudes de baja')
  }

  // Obtener estadísticas
  async obtenerEstadisticas(): Promise<EstadisticasBajas> {
    const cacheKey = 'estadisticas_bajas'
    const cached = this.cache.get<EstadisticasBajas>(cacheKey)
    if (cached) return cached

    try {
      if (this.useBdReal) {
        console.log('📊 [BajasService] Obteniendo estadísticas desde BD real')
        
        const response = await fetch(`${this.baseUrl}/dar-de-baja/stats`)
        if (!response.ok) throw new Error('Error fetching stats')
        
        const data = await response.json()

        const estadisticas: EstadisticasBajas = {
          totalSolicitudes: data.data.totalSolicitudes || 0,
          pendientes: data.data.solicitudesPendientes || 0,
          aprobadas: data.data.solicitudesAprobadas || 0,
          rechazadas: data.data.solicitudesRechazadas || 0,
          enEjecucion: data.data.solicitudesEnProceso || 0,
          completadas: data.data.solicitudesEjecutadas || 0,
          porcentajePendientes: Math.round((data.data.solicitudesPendientes / data.data.totalSolicitudes) * 100) || 0,
          porcentajeAprobadas: Math.round((data.data.solicitudesAprobadas / data.data.totalSolicitudes) * 100) || 0,
          tiempoPromedioAprobacion: 3.5, // Valor estimado
          valorTotalEquipos: data.data.valorTotalRecuperable || 0,
          valorRepuestosRecuperados: data.data.valorTotalRecuperable || 0,
          solicitudesUrgentes: 0, // No disponible en API actual
          ahorroCostos: data.data.valorTotalRecuperable * 0.7 || 0, // 70% del valor recuperable
          equiposPorMotivo: {
            'obsolescencia_tecnologica': 1,
            'fin_vida_util': 1,
            'costo_mantenimiento_elevado': 1,
            'reemplazo_tecnologico': 1,
            'normativa_vigente': 1
          }
        }

        this.cache.set(cacheKey, estadisticas)
        return estadisticas
      }
    } catch (error) {
      console.warn('⚠️ [BajasService] Error estadísticas BD real, usando mock:', error)
    }

    // Fallback a estadísticas mock
    if (this.mockFallback) {
      const mockStats = await this.obtenerEstadisticasMock()
      this.cache.set(cacheKey, mockStats)
      return mockStats
    }

    throw new Error('No se pudieron obtener las estadísticas')
  }

  // Crear nueva solicitud de baja
  async crearSolicitud(solicitud: Partial<SolicitudBaja>): Promise<SolicitudBaja> {
    try {
      if (this.useBdReal) {
        const response = await this.fetchWithAuth(this.bdUrl, {
          method: 'POST',
          body: JSON.stringify(solicitud)
        })
        
        const data = await response.json()
        const nuevaSolicitud = this.mapearSolicitudBaja(data)
        
        // Invalidar cache
        this.cache.invalidate('bajas')
        this.cache.invalidate('estadisticas')
        
        return nuevaSolicitud
      }
    } catch (error) {
      console.error('❌ [BajasService] Error crear solicitud:', error)
      throw error
    }

    throw new Error('No se pudo crear la solicitud de baja')
  }

  // Aprobar solicitud
  async aprobarSolicitud(id: number, observaciones?: string): Promise<SolicitudBaja> {
    try {
      if (this.useBdReal) {
        const response = await this.fetchWithAuth(`${this.bdUrl}/${id}/aprobar`, {
          method: 'POST',
          body: JSON.stringify({ observaciones })
        })
        
        const data = await response.json()
        const solicitudAprobada = this.mapearSolicitudBaja(data)
        
        // Invalidar cache
        this.cache.invalidate('bajas')
        this.cache.invalidate('estadisticas')
        
        return solicitudAprobada
      }
    } catch (error) {
      console.error('❌ [BajasService] Error aprobar solicitud:', error)
      throw error
    }

    throw new Error('No se pudo aprobar la solicitud')
  }

  // Rechazar solicitud
  async rechazarSolicitud(id: number, motivo: string): Promise<SolicitudBaja> {
    try {
      if (this.useBdReal) {
        const response = await this.fetchWithAuth(`${this.bdUrl}/${id}/rechazar`, {
          method: 'POST',
          body: JSON.stringify({ motivo })
        })
        
        const data = await response.json()
        const solicitudRechazada = this.mapearSolicitudBaja(data)
        
        // Invalidar cache
        this.cache.invalidate('bajas')
        this.cache.invalidate('estadisticas')
        
        return solicitudRechazada
      }
    } catch (error) {
      console.error('❌ [BajasService] Error rechazar solicitud:', error)
      throw error
    }

    throw new Error('No se pudo rechazar la solicitud')
  }

  // Ejecutar baja
  async ejecutarBaja(id: number, datos: {
    tecnicoEjecutor: string
    repuestosRecuperados?: RepuestoRecuperable[]
    observaciones?: string
  }): Promise<SolicitudBaja> {
    try {
      if (this.useBdReal) {
        const response = await this.fetchWithAuth(`${this.bdUrl}/${id}/ejecutar`, {
          method: 'POST',
          body: JSON.stringify(datos)
        })
        
        const data = await response.json()
        const solicitudEjecutada = this.mapearSolicitudBaja(data)
        
        // Invalidar cache
        this.cache.invalidate('bajas')
        this.cache.invalidate('estadisticas')
        
        return solicitudEjecutada
      }
    } catch (error) {
      console.error('❌ [BajasService] Error ejecutar baja:', error)
      throw error
    }

    throw new Error('No se pudo ejecutar la baja')
  }

  // Datos mock para desarrollo
  private async obtenerSolicitudesMock(filtros: FiltrosBajas = {}): Promise<{
    solicitudes: SolicitudBaja[]
    total: number
    page: number
    totalPages: number
  }> {
    console.log('🔄 [BajasService] Usando datos mock')
    
    const mockSolicitudes: SolicitudBaja[] = [
      {
        id: 1,
        idEquipo: 12345,
        codigoEquipo: 'EQ-MSV-001',
        nombreEquipo: 'Monitor de Signos Vitales Obsoleto',
        cliente: 'SURA EPS',
        sede: 'Hospital San Vicente - UCI',
        serie: 'MSV-2015-001',
        estado: 'Pendiente',
        fechaSolicitud: '2024-11-10 09:00:00',
        motivo: 'Equipo obsoleto y fuera de soporte técnico',
        justificacionTecnica: 'El equipo tiene más de 8 años de uso, presenta fallas recurrentes y el fabricante descontinuó el soporte. Los costos de reparación superan el 60% del valor actual.',
        justificacionEconomica: 'Costo de mantenimiento anual: $3.500.000. Valor de reposición: $15.000.000. Valor en libros: $2.800.000.',
        valorLibros: 2800000,
        valorMercado: 1200000,
        costoDesmantelamiento: 350000,
        tecnicoSolicitante: 'Carlos Rodríguez',
        prioridad: 'media',
        tipoMotivo: 'obsolescencia',
        observaciones: 'Equipo requiere baja urgente para liberar espacio en UCI',
        repuestosRecuperables: [
          {
            descripcion: 'Sensor SpO2 compatible',
            cantidad: 2,
            estadoRepuesto: 'bueno',
            valorEstimado: 180000
          },
          {
            descripcion: 'Cable de alimentación',
            cantidad: 1,
            estadoRepuesto: 'bueno',
            valorEstimado: 45000
          }
        ]
      },
      {
        id: 2,
        idEquipo: 12346,
        codigoEquipo: 'EQ-VM-002',
        nombreEquipo: 'Ventilador Mecánico Dañado',
        cliente: 'COOMEVA EPS',
        sede: 'Clínica Los Remedios - Urgencias',
        serie: 'VM-2018-002',
        estado: 'Aprobada',
        fechaSolicitud: '2024-11-08 14:30:00',
        fechaAprobacion: '2024-11-12 16:45:00',
        motivo: 'Daño irreparable en sistema de compresión',
        justificacionTecnica: 'Falla en compresor principal, sistema de válvulas dañado. Reparación requiere repuestos descontinuados por valor superior al costo de reposición.',
        justificacionEconomica: 'Costo de reparación estimado: $18.500.000. Valor de equipo nuevo: $22.000.000. No es económicamente viable la reparación.',
        valorLibros: 8500000,
        valorMercado: 3200000,
        costoDesmantelamiento: 850000,
        tecnicoSolicitante: 'Ana García',
        supervisorAprobador: 'Director Técnico',
        prioridad: 'alta',
        tipoMotivo: 'daño_irreparable',
        observaciones: 'Aprobación urgente para reposición inmediata',
        repuestosRecuperables: [
          {
            descripcion: 'Panel de control digital',
            cantidad: 1,
            estadoRepuesto: 'bueno',
            valorEstimado: 450000
          },
          {
            descripcion: 'Sensores de presión (juego)',
            cantidad: 1,
            estadoRepuesto: 'regular',
            valorEstimado: 220000
          }
        ]
      },
      {
        id: 3,
        idEquipo: 12347,
        codigoEquipo: 'EQ-BI-003',
        nombreEquipo: 'Bomba de Infusión Antigua',
        cliente: 'NUEVA EPS',
        sede: 'Hospital Militar - Hospitalización',
        serie: 'BI-2012-003',
        estado: 'En Ejecución',
        fechaSolicitud: '2024-11-05 11:15:00',
        fechaAprobacion: '2024-11-07 08:30:00',
        fechaEjecucion: '2024-11-13 10:00:00',
        motivo: 'Fin de vida útil y actualización tecnológica',
        justificacionTecnica: 'Equipo con 12 años de uso intensivo. Tecnología obsoleta sin conectividad moderna. Presenta desgaste mecánico significativo.',
        justificacionEconomica: 'Mantenimiento anual: $2.100.000. Valor residual: $800.000. Nuevos equipos ofrecen mayor precisión y conectividad.',
        valorLibros: 800000,
        valorMercado: 400000,
        costoDesmantelamiento: 180000,
        tecnicoSolicitante: 'Miguel Torres',
        supervisorAprobador: 'Jefe Ingeniería Biomédica',
        tecnicoEjecutor: 'Pedro Sánchez',
        prioridad: 'media',
        tipoMotivo: 'fin_vida_util',
        observaciones: 'Proceso de baja en curso, desmantelamiento programado',
        repuestosRecuperables: [
          {
            descripcion: 'Motor paso a paso',
            cantidad: 1,
            estadoRepuesto: 'regular',
            valorEstimado: 95000
          },
          {
            descripcion: 'Circuitos impresos secundarios',
            cantidad: 3,
            estadoRepuesto: 'bueno',
            valorEstimado: 75000
          }
        ]
      },
      {
        id: 4,
        idEquipo: 12348,
        codigoEquipo: 'EQ-ECG-004',
        nombreEquipo: 'Electrocardiografo de 6 Canales',
        cliente: 'SANITAS EPS',
        sede: 'Centro Médico Norte - Cardiología',
        serie: 'ECG-2020-004',
        estado: 'Completada',
        fechaSolicitud: '2024-10-28 16:20:00',
        fechaAprobacion: '2024-10-30 14:15:00',
        fechaEjecucion: '2024-11-02 09:30:00',
        fechaCompletada: '2024-11-05 17:45:00',
        motivo: 'Cambio tecnológico y actualización a equipos digitales',
        justificacionTecnica: 'Migración a tecnología completamente digital con AI integrada. Equipo actual funcional pero tecnológicamente obsoleto.',
        justificacionEconomica: 'Valor de venta: $1.800.000. Costo almacenamiento vs beneficio de liberación de espacio: positivo.',
        valorLibros: 4200000,
        valorMercado: 1800000,
        costoDesmantelamiento: 120000,
        tecnicoSolicitante: 'Laura Martínez',
        supervisorAprobador: 'Director Médico',
        tecnicoEjecutor: 'Carlos Herrera',
        prioridad: 'baja',
        tipoMotivo: 'cambio_tecnologico',
        observaciones: 'Baja completada con éxito. Equipo vendido a clínica privada.',
        repuestosRecuperables: [
          {
            descripcion: 'Cables de electrocardiograma (set completo)',
            cantidad: 1,
            estadoRepuesto: 'bueno',
            valorEstimado: 320000
          },
          {
            descripcion: 'Papel térmico (rollos)',
            cantidad: 15,
            estadoRepuesto: 'bueno',
            valorEstimado: 85000
          }
        ]
      },
      {
        id: 5,
        idEquipo: 12349,
        codigoEquipo: 'EQ-DEF-005',
        nombreEquipo: 'Desfibrilador Manual/Automático',
        cliente: 'FAMISANAR EPS',
        sede: 'Clínica Santa Fe - Emergencias',
        serie: 'DEF-2017-005',
        estado: 'Rechazada',
        fechaSolicitud: '2024-11-14 13:10:00',
        motivo: 'Solicitud prematura - equipo con potencial de reparación',
        justificacionTecnica: 'Equipo presenta falla en batería y carga. Evaluación inicial sugiere posible reparación económica.',
        justificacionEconomica: 'Costo reparación estimado: $2.800.000. Valor del equipo: $28.000.000. Relación costo-beneficio favorable para reparación.',
        valorLibros: 14500000,
        valorMercado: 12800000,
        tecnicoSolicitante: 'Roberto Silva',
        prioridad: 'urgente',
        tipoMotivo: 'daño_irreparable',
        observaciones: 'Solicitud rechazada. Se requiere evaluación técnica más detallada antes de considerar baja.'
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
        s.nombreEquipo.toLowerCase().includes(search) ||
        s.codigoEquipo.toLowerCase().includes(search) ||
        s.tecnicoSolicitante.toLowerCase().includes(search)
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

  private async obtenerEstadisticasMock(): Promise<EstadisticasBajas> {
    console.log('📊 [BajasService] Usando estadísticas mock')
    
    return {
      totalSolicitudes: 457,
      pendientes: 28,
      aprobadas: 145,
      rechazadas: 23,
      enEjecucion: 15,
      completadas: 246,
      porcentajePendientes: 6.1,
      porcentajeAprobadas: 31.7,
      tiempoPromedioAprobacion: 3.8,
      valorTotalEquipos: 285000000,
      valorRepuestosRecuperados: 45600000,
      solicitudesUrgentes: 8,
      ahorroCostos: 125000000,
      equiposPorMotivo: {
        'obsolescencia': 180,
        'daño_irreparable': 125,
        'fin_vida_util': 95,
        'cambio_tecnologico': 42,
        'fin_contrato': 15
      }
    }
  }

  // Métodos de utilidad
  resetConnection(): void {
    console.log('🔄 [BajasService] Reseteando conexión a BD')
    this.cache.invalidate()
    this.useBdReal = true
    this.mockFallback = true
  }

  toggleBdReal(enabled: boolean): void {
    this.useBdReal = enabled
    this.cache.invalidate()
    console.log(`🔧 [BajasService] BD Real ${enabled ? 'habilitada' : 'deshabilitada'}`)
  }

  getCacheStats(): { size: number; keys: string[] } {
    return this.cache.getStats()
  }
}

// Singleton instance
const darDeBajaService = new DarDeBajaService()
export default darDeBajaService