// Servicio para obtener estadísticas de equipos
export interface EstadisticasEquipos {
  totalEquipos: number;
  equiposActivos: number;
  equiposMantenimiento: number;
  equiposInactivos: number;
  equiposDadoBaja: number;
  equiposPorTipo: Array<{
    tipo: string;
    cantidad: number;
  }>;
  equiposPorSede: Array<{
    sede: string;
    cantidad: number;
  }>;
  mantenimientosPendientes: number;
  equiposConGarantia: number;
}

class EquiposStatsService {
  private baseUrl = 'http://localhost:3002/api/v1';

  async obtenerEstadisticas(): Promise<EstadisticasEquipos> {
    try {
      // Intentar obtener estadísticas del endpoint específico
      const response = await fetch(`${this.baseUrl}/equipos/stats`);
      
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      
      // Si no funciona, usar estadísticas simuladas
      return this.obtenerEstadisticasMock();
    } catch (error) {
      console.log('Error cargando estadísticas de equipos, usando datos mock:', error);
      return this.obtenerEstadisticasMock();
    }
  }

  private obtenerEstadisticasMock(): EstadisticasEquipos {
    return {
      totalEquipos: 48,
      equiposActivos: 42,
      equiposMantenimiento: 4,
      equiposInactivos: 2,
      equiposDadoBaja: 0,
      equiposPorTipo: [
        { tipo: 'Ventiladores', cantidad: 15 },
        { tipo: 'Monitores', cantidad: 12 },
        { tipo: 'Bombas de Infusión', cantidad: 8 },
        { tipo: 'Desfibriladores', cantidad: 7 },
        { tipo: 'Electrocardiógrafos', cantidad: 6 }
      ],
      equiposPorSede: [
        { sede: 'Sede Central', cantidad: 18 },
        { sede: 'Sede Norte', cantidad: 15 },
        { sede: 'Sede Sur', cantidad: 10 },
        { sede: 'Sede Oriente', cantidad: 5 }
      ],
      mantenimientosPendientes: 8,
      equiposConGarantia: 28
    };
  }

  // Datos para gráficos
  obtenerDatosGraficoEstados(stats: EstadisticasEquipos) {
    return [
      { name: 'Activos', value: stats.equiposActivos, color: '#10b981' },
      { name: 'Mantenimiento', value: stats.equiposMantenimiento, color: '#f59e0b' },
      { name: 'Inactivos', value: stats.equiposInactivos, color: '#ef4444' },
      { name: 'Dado de Baja', value: stats.equiposDadoBaja, color: '#6b7280' }
    ].filter(item => item.value > 0);
  }

  obtenerDatosGraficoTipos(stats: EstadisticasEquipos) {
    return stats.equiposPorTipo.map((item, index) => ({
      name: item.tipo,
      value: item.cantidad,
      color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'][index] || '#6b7280'
    }));
  }

  obtenerDatosGraficoSedes(stats: EstadisticasEquipos) {
    return stats.equiposPorSede.map((item, index) => ({
      name: item.sede,
      value: item.cantidad,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index] || '#6b7280'
    }));
  }
}

export const equiposStatsService = new EquiposStatsService();