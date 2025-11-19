import { api, ApiResponse } from './client';

// Dashboard stats interfaces
export interface DashboardStats {
  equipos: {
    total: number;
    activos: number;
    mantenimiento: number;
    inactivos: number;
    dados_baja: number;
  };
  solicitudes: {
    total_solicitudes: number;
    pendientes: number;
    asignadas: number;
    en_proceso: number;
    completadas: number;
    canceladas: number;
    alta_prioridad: number;
    vencidas: number;
    por_tipo_solicitud: Array<{
      tipo_solicitud: string;
      cantidad: number;
      completadas: number;
    }>;
    por_cliente: Array<{
      cliente_id: number;
      cliente_nombre: string;
      total_solicitudes: number;
      pendientes: number;
    }>;
  };
  ordenes: {
    total_ordenes: number;
    pendientes: number;
    en_proceso: number;
    ejecutadas: number;
    canceladas: number;
    alta_prioridad: number;
    vencidas: number;
    tiempo_promedio_estimado: number;
    por_tipo_orden: Array<{
      tipo_orden: string;
      cantidad: number;
      ejecutadas: number;
    }>;
    por_tecnico: Array<{
      id: number;
      nombre: string;
      apellido: string;
      ordenes_asignadas: number;
      ordenes_completadas: number;
    }>;
  };
  visitas: {
    total_visitas: number;
    programadas: number;
    en_curso: number;
    completadas: number;
    canceladas: number;
    calificacion_promedio: number;
    atrasadas: number;
    duracion_promedio_estimada: number;
    por_tipo_visita: Array<{
      tipo_visita: string;
      cantidad: number;
      completadas: number;
      calificacion_promedio: number;
    }>;
    por_tecnico: Array<{
      id: number;
      nombre: string;
      apellido: string;
      visitas_asignadas: number;
      visitas_completadas: number;
      calificacion_promedio: number;
    }>;
  };
  cotizaciones: {
    total_cotizaciones: number;
    borradores: number;
    enviadas: number;
    aprobadas: number;
    rechazadas: number;
    vencidas: number;
    valor_aprobado: number;
    valor_promedio_aprobado: number;
    por_vencer: number;
    por_cliente: Array<{
      id: number;
      nombre: string;
      total_cotizaciones: number;
      aprobadas: number;
      valor_total: number;
    }>;
  };
}

export interface ActivityLog {
  id: number;
  type: 'solicitud' | 'orden' | 'visita' | 'cotizacion' | 'equipo';
  action: string;
  description: string;
  user_name?: string;
  created_at: string;
  related_id?: number;
}

export interface KPIMetrics {
  efficiency: {
    solicitudes_completadas_tiempo: number;
    ordenes_ejecutadas_tiempo: number;
    visitas_completadas_tiempo: number;
    tiempo_respuesta_promedio: number;
  };
  quality: {
    calificacion_promedio_visitas: number;
    cotizaciones_aprobadas_ratio: number;
    equipos_funcionando_ratio: number;
    solicitudes_satisfaccion: number;
  };
  productivity: {
    solicitudes_por_dia: number;
    ordenes_por_tecnico: number;
    visitas_por_dia: number;
    cotizaciones_por_mes: number;
  };
  revenue: {
    valor_cotizaciones_aprobadas: number;
    valor_promedio_orden: number;
    ingresos_estimados_mes: number;
    crecimiento_mensual: number;
  };
}

export const dashboardApi = {
  // Get comprehensive dashboard statistics
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      // Use the real dashboard stats endpoint
      const dashboardRes = await api.get<any>('/real/dashboard/stats');
      
      if (dashboardRes.success && dashboardRes.data) {
        // Transform real API response to expected format
        const realData = dashboardRes.data;
        
        const transformedData: DashboardStats = {
          equipos: {
            total: 0,
            activos: 0,
            mantenimiento: 0,
            inactivos: 0,
            dados_baja: 0
          },
          solicitudes: {
            total_solicitudes: realData.solicitudes?.total_solicitudes || 0,
            pendientes: realData.solicitudes?.pendientes || 0,
            asignadas: 0,
            en_proceso: realData.solicitudes?.en_proceso || 0,
            completadas: realData.solicitudes?.completadas || 0,
            canceladas: 0,
            alta_prioridad: 0,
            vencidas: 0,
            por_tipo_solicitud: [],
            por_cliente: []
          },
          ordenes: {
            total_ordenes: realData.ordenes?.total_ordenes || 0,
            pendientes: realData.ordenes?.pendientes || 0,
            en_proceso: realData.ordenes?.en_proceso || 0,
            ejecutadas: realData.ordenes?.ejecutadas || 0,
            canceladas: 0,
            alta_prioridad: 0,
            vencidas: 0,
            tiempo_promedio_estimado: 0,
            por_tipo_orden: [],
            por_tecnico: []
          },
          visitas: {
            total_visitas: 0,
            programadas: 0,
            en_curso: 0,
            completadas: 0,
            canceladas: 0,
            calificacion_promedio: 0,
            atrasadas: 0,
            duracion_promedio_estimada: 0,
            por_tipo_visita: [],
            por_tecnico: []
          },
          cotizaciones: {
            total_cotizaciones: 0,
            borradores: 0,
            enviadas: 0,
            aprobadas: 0,
            rechazadas: 0,
            vencidas: 0,
            valor_aprobado: 0,
            valor_promedio_aprobado: 0,
            por_vencer: 0,
            por_cliente: []
          }
        };
        
        return {
          success: true,
          data: transformedData,
          message: 'Dashboard stats loaded successfully'
        };
      } else {
        throw new Error('Dashboard API returned no data');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        message: 'Error al obtener estadísticas del dashboard',
        error: {
          message: (error as Error).message,
          statusCode: 500
        }
      };
    }
  },

  // Get recent activity log
  getRecentActivity: async (limit = 10): Promise<ApiResponse<ActivityLog[]>> => {
    try {
      // For now, return mock data - this would be replaced with a real activity log API
      const mockActivity: ActivityLog[] = [
        {
          id: 1,
          type: 'solicitud',
          action: 'created',
          description: 'Nueva solicitud de mantenimiento correctivo para Ventilador en FCV',
          user_name: 'Juan Pérez',
          created_at: new Date().toISOString(),
          related_id: 1
        },
        {
          id: 2,
          type: 'orden',
          action: 'assigned',
          description: 'Orden de calibración asignada a técnico Carlos López',
          user_name: 'María García',
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          related_id: 2
        },
        {
          id: 3,
          type: 'visita',
          action: 'completed',
          description: 'Visita técnica completada en HUSI - Equipo funcionando correctamente',
          user_name: 'Carlos López',
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          related_id: 3
        }
      ];

      return {
        success: true,
        data: mockActivity,
        message: 'Recent activity loaded successfully'
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },

  // Get KPI metrics
  getKPIMetrics: async (): Promise<ApiResponse<KPIMetrics>> => {
    try {
      // For now, return calculated metrics based on mock data
      const kpiMetrics: KPIMetrics = {
        efficiency: {
          solicitudes_completadas_tiempo: 92.5,
          ordenes_ejecutadas_tiempo: 88.3,
          visitas_completadas_tiempo: 95.1,
          tiempo_respuesta_promedio: 2.4
        },
        quality: {
          calificacion_promedio_visitas: 4.7,
          cotizaciones_aprobadas_ratio: 73.2,
          equipos_funcionando_ratio: 96.8,
          solicitudes_satisfaccion: 91.5
        },
        productivity: {
          solicitudes_por_dia: 12.3,
          ordenes_por_tecnico: 8.5,
          visitas_por_dia: 15.7,
          cotizaciones_por_mes: 45
        },
        revenue: {
          valor_cotizaciones_aprobadas: 2450000,
          valor_promedio_orden: 180000,
          ingresos_estimados_mes: 15600000,
          crecimiento_mensual: 12.8
        }
      };

      return {
        success: true,
        data: kpiMetrics,
        message: 'KPI metrics loaded successfully'
      };
    } catch (error) {
      console.error('Error fetching KPI metrics:', error);
      throw error;
    }
  }
};