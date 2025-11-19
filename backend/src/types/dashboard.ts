// Dashboard Statistics Types
export interface DashboardStats {
  equipos: {
    total: number
    activos: number
    mantenimiento: number
    inactivos: number
  }
  solicitudes: {
    total_solicitudes: number
    pendientes: number
    en_proceso: number
    completadas: number
    vencidas: number
    por_tipo_solicitud: Array<{
      tipo_solicitud: string
      cantidad: number
    }>
    por_cliente: Array<{
      cliente_nombre: string
      total_solicitudes: number
    }>
  }
  ordenes: {
    total_ordenes: number
    pendientes: number
    en_proceso: number
    ejecutadas: number
  }
  visitas: {
    total_visitas: number
    programadas: number
    en_curso: number
    completadas: number
  }
  cotizaciones: {
    total_cotizaciones: number
    borradores: number
    enviadas: number
    aprobadas: number
    rechazadas: number
  }
}

// KPI Metrics Types
export interface KPIMetrics {
  efficiency: {
    solicitudes_completadas_tiempo: number
    tiempo_respuesta_promedio: number
  }
  quality: {
    calificacion_promedio_visitas: number
    solicitudes_satisfaccion: number
    equipos_funcionando_ratio: number
  }
  productivity: {
    solicitudes_por_dia: number
    tecnicos_activos: number
  }
  revenue: {
    ingresos_estimados_mes: number
    valor_promedio_orden: number
    crecimiento_mensual: number
  }
}

// Activity Log Type
export interface ActivityLog {
  id: number
  type: 'solicitud' | 'orden' | 'visita' | 'cotizacion'
  description: string
  user_name: string
  created_at: string
}