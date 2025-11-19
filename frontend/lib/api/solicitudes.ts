import { api, ApiResponse } from './client';

// Solicitud types based on real database structure
export interface Solicitud {
  id: number;
  creacion: string;
  id_creador: number;
  id_servicio: number;
  id_estado: number;
  aviso: string;
  id_equipo?: number;
  cambio_estado?: string;
  id_cambiador?: number;
  observacion: string;
  observacion_estado: string;
  estado?: string;
  creador_nombre?: string;
  cambiador_nombre?: string;
}

export interface EstadisticasSolicitudes {
  total: number;
  pendientes: string;
  aprobadas: string;
  rechazadas: string;
  porcentaje_aprobacion: string;
}

export interface CreateSolicitudData {
  id_servicio: number;
  aviso: string;
  id_equipo?: number;
  observacion: string;
}

export interface UpdateSolicitudData {
  id_servicio?: number;
  aviso?: string;
  id_equipo?: number;
  observacion?: string;
  observacion_estado?: string;
}

export interface SolicitudesResponse {
  solicitudes: Solicitud[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SolicitudQueryParams {
  page?: number;
  limit?: number;
  estado?: number;
  id_creador?: number;
  id_servicio?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  aviso?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface EstadisticasResponse {
  success: boolean;
  message: string;
  data: EstadisticasSolicitudes;
}

export const ESTADOS_SOLICITUD = {
  PENDIENTE: 1,
  APROBADA: 2,
  RECHAZADA: 3
} as const;

export const NOMBRES_ESTADOS = {
  [ESTADOS_SOLICITUD.PENDIENTE]: 'Pendiente',
  [ESTADOS_SOLICITUD.APROBADA]: 'Aprobada',
  [ESTADOS_SOLICITUD.RECHAZADA]: 'Rechazada'
} as const;

export const COLORES_ESTADOS = {
  [ESTADOS_SOLICITUD.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
  [ESTADOS_SOLICITUD.APROBADA]: 'bg-green-100 text-green-800',
  [ESTADOS_SOLICITUD.RECHAZADA]: 'bg-red-100 text-red-800'
} as const;

export const solicitudApi = {
  // Get statistics
  getEstadisticas: async (): Promise<EstadisticasResponse> => {
    try {
      const response = await api.get('/solicitudes/estadisticas');
      return response.data as EstadisticasResponse;
    } catch (error) {
      console.error('Error fetching solicitudes statistics:', error);
      throw error;
    }
  },

  // Get all solicitudes
  getAll: async (params?: SolicitudQueryParams): Promise<ApiResponse<SolicitudesResponse>> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.estado) queryParams.append('estado', params.estado.toString());
      if (params?.id_creador) queryParams.append('id_creador', params.id_creador.toString());
      if (params?.id_servicio) queryParams.append('id_servicio', params.id_servicio.toString());
      if (params?.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde);
      if (params?.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta);
      if (params?.aviso) queryParams.append('aviso', params.aviso);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await api.get(`/solicitudes?${queryParams}`);
      return response.data as ApiResponse<SolicitudesResponse>;
    } catch (error) {
      console.error('Error fetching solicitudes:', error);
      throw error;
    }
  },

  // Get solicitud by ID
  getById: async (id: number): Promise<ApiResponse<Solicitud>> => {
    try {
      const response = await api.get(`/solicitudes/${id}`);
      return response.data as ApiResponse<Solicitud>;
    } catch (error) {
      console.error('Error fetching solicitud:', error);
      throw error;
    }
  },

  // Create new solicitud
  create: async (data: CreateSolicitudData): Promise<ApiResponse<Solicitud>> => {
    try {
      const response = await api.post('/solicitudes', data);
      return response.data as ApiResponse<Solicitud>;
    } catch (error) {
      console.error('Error creating solicitud:', error);
      throw error;
    }
  },

  // Update solicitud
  update: async (id: number, data: UpdateSolicitudData): Promise<ApiResponse<Solicitud>> => {
    try {
      const response = await api.put(`/solicitudes/${id}`, data);
      return response.data as ApiResponse<Solicitud>;
    } catch (error) {
      console.error('Error updating solicitud:', error);
      throw error;
    }
  },

  // Change solicitud status
  cambiarEstado: async (
    id: number, 
    estado: number, 
    observaciones?: string
  ): Promise<ApiResponse<Solicitud>> => {
    try {
      const response = await api.patch(`/solicitudes/${id}/estado`, {
        estado,
        observaciones
      });
      return response.data as ApiResponse<Solicitud>;
    } catch (error) {
      console.error('Error changing solicitud status:', error);
      throw error;
    }
  }
};