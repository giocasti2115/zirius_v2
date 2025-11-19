export interface Solicitud {
  id: number;
  aviso: string;
  creacion: string;
  id_estado: number;
  estado: string;
  id_equipo?: number;
  id_servicio?: number;
  id_creador?: number;
  creador_nombre?: string;
  observacion?: string;
  observacion_estado?: string;
  cambio_estado?: string;
  id_cambiador?: number;
  cambiador_nombre?: string;
}

export interface SolicitudesResponse {
  success: boolean;
  message: string;
  data: {
    solicitudes: Solicitud[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EstadisticasResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
    porcentaje_aprobacion: number;
  };
}

export interface FiltrosSolicitudes {
  page?: number;
  limit?: number;
  estado?: number | number[];
  fecha_desde?: string;
  fecha_hasta?: string;
  aviso?: string;
  id_servicio?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class SolicitudesService {
  private baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://api.zirius.com/api/v1' 
    : 'http://localhost:3002/api/v1';

  // Headers básicos para desarrollo
  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  async obtenerSolicitudes(filtros: FiltrosSolicitudes = {}): Promise<SolicitudesResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const url = `${this.baseURL}/solicitudes/public${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('🔍 Fetching solicitudes from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('❌ Error response:', response.status, response.statusText);
        // Si el endpoint real no existe, usar datos mock
        return this.obtenerDatosMock(filtros);
      }

      const data = await response.json();
      console.log('✅ Solicitudes obtenidas:', data.data?.solicitudes?.length || 0);
      
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo solicitudes:', error);
      // Fallback a datos mock en caso de error
      return this.obtenerDatosMock(filtros);
    }
  }

  async obtenerEstadisticas(): Promise<EstadisticasResponse> {
    try {
      const url = `${this.baseURL}/solicitudes/stats`;
      console.log('🔍 Fetching estadísticas from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('❌ Error response estadísticas:', response.status);
        return this.obtenerEstadisticasMock();
      }

      const data = await response.json();
      console.log('✅ Estadísticas obtenidas');
      
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return this.obtenerEstadisticasMock();
    }
  }

  async obtenerSolicitudPorId(id: number): Promise<{ success: boolean; data?: Solicitud; message: string }> {
    try {
      const url = `${this.baseURL}/real/solicitudes/${id}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('❌ Error obteniendo solicitud:', response.status);
        return { success: false, message: 'Solicitud no encontrada' };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo solicitud por ID:', error);
      return { success: false, message: 'Error del servidor' };
    }
  }

  async crearSolicitud(solicitud: {
    id_servicio: number;
    aviso: string;
    id_equipo?: number;
    observacion: string;
  }): Promise<{ success: boolean; data?: Solicitud; message: string }> {
    try {
      const url = `${this.baseURL}/real/solicitudes`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(solicitud),
      });

      if (!response.ok) {
        console.error('❌ Error creando solicitud:', response.status);
        return { success: false, message: 'Error creando solicitud' };
      }

      const data = await response.json();
      console.log('✅ Solicitud creada:', data.data?.id);
      return data;
    } catch (error) {
      console.error('❌ Error creando solicitud:', error);
      return { success: false, message: 'Error del servidor' };
    }
  }

  async cambiarEstado(id: number, estado: number, observacion: string): Promise<{ success: boolean; data?: Solicitud; message: string }> {
    try {
      const url = `${this.baseURL}/real/solicitudes/${id}/estado`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          id_estado: estado,
          observacion_estado: observacion,
        }),
      });

      if (!response.ok) {
        console.error('❌ Error cambiando estado:', response.status);
        return { success: false, message: 'Error cambiando estado' };
      }

      const data = await response.json();
      console.log('✅ Estado cambiado:', id, '→', estado);
      return data;
    } catch (error) {
      console.error('❌ Error cambiando estado:', error);
      return { success: false, message: 'Error del servidor' };
    }
  }

  // Métodos de fallback con datos mock basados en estructura real
  private obtenerDatosMock(filtros: FiltrosSolicitudes = {}): SolicitudesResponse {
    console.log('⚠️ Usando datos mock para solicitudes');
    
    const solicitudesMock: Solicitud[] = [
      {
        id: 346864,
        aviso: '10561703',
        creacion: '2025-10-31 20:59:12',
        id_estado: 2,
        estado: 'Aprobada',
        id_equipo: 71209,
        id_servicio: 1,
        observacion: 'Solicitud de mantenimiento preventivo para equipo médico',
        observacion_estado: 'Aprobada por supervisor técnico'
      },
      {
        id: 346863,
        aviso: '10561494',
        creacion: '2025-10-31 17:53:07',
        id_estado: 2,
        estado: 'Aprobada',
        id_equipo: 44014,
        id_servicio: 2,
        observacion: 'Calibración de equipo de medición',
        observacion_estado: 'Programada para siguiente semana'
      },
      {
        id: 346862,
        aviso: '10561500',
        creacion: '2025-10-31 17:13:12',
        id_estado: 1,
        estado: 'Pendiente',
        id_equipo: 63211,
        id_servicio: 3,
        observacion: 'Revisión de garantía para equipo',
        observacion_estado: ''
      },
      {
        id: 346861,
        aviso: '10561647',
        creacion: '2025-10-31 17:08:30',
        id_estado: 3,
        estado: 'Rechazada',
        id_equipo: 67080,
        id_servicio: 1,
        observacion: 'Solicitud de reparación urgente',
        observacion_estado: 'No cumple con los criterios de urgencia'
      },
      {
        id: 346860,
        aviso: '10561600',
        creacion: '2025-10-31 16:49:49',
        id_estado: 1,
        estado: 'Pendiente',
        id_equipo: 57391,
        id_servicio: 2,
        observacion: 'Mantenimiento correctivo solicitado',
        observacion_estado: ''
      }
    ];

    // Aplicar filtros básicos
    let solicitudesFiltradas = solicitudesMock;
    
    if (filtros.estado) {
      const estados = Array.isArray(filtros.estado) ? filtros.estado : [filtros.estado];
      solicitudesFiltradas = solicitudesFiltradas.filter(s => estados.includes(s.id_estado));
    }

    if (filtros.aviso) {
      solicitudesFiltradas = solicitudesFiltradas.filter(s => 
        s.aviso.toLowerCase().includes(filtros.aviso!.toLowerCase())
      );
    }

    const page = filtros.page || 1;
    const limit = filtros.limit || 10;
    const total = solicitudesFiltradas.length;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Datos mock obtenidos',
      data: {
        solicitudes: solicitudesFiltradas,
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  private obtenerEstadisticasMock(): EstadisticasResponse {
    console.log('⚠️ Usando datos mock para estadísticas');
    
    return {
      success: true,
      message: 'Estadísticas mock obtenidas',
      data: {
        total: 316776,
        pendientes: 85432,
        aprobadas: 198123,
        rechazadas: 33221,
        porcentaje_aprobacion: 62.54
      }
    };
  }
}

export const solicitudesService = new SolicitudesService();