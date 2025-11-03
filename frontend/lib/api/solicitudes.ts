import { api, ApiResponse } from './client';

// Solicitud types based on backend controller
export interface Solicitud {
  id: number;
  cliente_id: number;
  sede_id: number;
  equipo_id?: number;
  tipo_solicitud: 'mantenimiento_preventivo' | 'mantenimiento_correctivo' | 'calibracion' | 'instalacion' | 'capacitacion' | 'consulta_tecnica';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  estado: 'pendiente' | 'asignada' | 'en_proceso' | 'completada' | 'cancelada';
  descripcion: string;
  fecha_solicitud: string;
  fecha_requerida?: string;
  contacto_nombre?: string;
  contacto_telefono?: string;
  contacto_email?: string;
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  
  // Joined data from backend
  cliente_nombre?: string;
  cliente_tipo?: string;
  cliente_nit?: string;
  sede_nombre?: string;
  sede_direccion?: string;
  sede_telefono?: string;
  equipo_numero_serie?: string;
  equipo_referencia?: string;
  equipo_ubicacion?: string;
  usuario_asignado_nombre?: string;
  usuario_asignado_apellido?: string;
}

export interface CreateSolicitudData {
  cliente_id: number;
  sede_id: number;
  equipo_id?: number;
  tipo_solicitud: 'mantenimiento_preventivo' | 'mantenimiento_correctivo' | 'calibracion' | 'instalacion' | 'capacitacion' | 'consulta_tecnica';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  descripcion: string;
  fecha_requerida?: string;
  contacto_nombre?: string;
  contacto_telefono?: string;
  contacto_email?: string;
  observaciones?: string;
}

export interface UpdateSolicitudData {
  tipo_solicitud?: 'mantenimiento_preventivo' | 'mantenimiento_correctivo' | 'calibracion' | 'instalacion' | 'capacitacion' | 'consulta_tecnica';
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente';
  estado?: 'pendiente' | 'asignada' | 'en_proceso' | 'completada' | 'cancelada';
  descripcion?: string;
  fecha_requerida?: string;
  contacto_nombre?: string;
  contacto_telefono?: string;
  contacto_email?: string;
  observaciones?: string;
  usuario_asignado_id?: number;
}

export interface SolicitudesResponse {
  data: Solicitud[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}

export interface SolicitudQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  cliente_id?: number;
  sede_id?: number;
  equipo_id?: number;
  tipo_solicitud?: string;
  estado?: string;
  prioridad?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  usuario_asignado_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SolicitudStats {
  general: {
    total_solicitudes: number;
    pendientes: number;
    asignadas: number;
    en_proceso: number;
    completadas: number;
    canceladas: number;
    alta_prioridad: number;
    vencidas: number;
  };
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
}

export const solicitudApi = {
  // Get all solicitudes
  getAll: async (params?: SolicitudQueryParams): Promise<ApiResponse<SolicitudesResponse>> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.cliente_id) queryParams.append('cliente_id', params.cliente_id.toString());
      if (params?.sede_id) queryParams.append('sede_id', params.sede_id.toString());
      if (params?.equipo_id) queryParams.append('equipo_id', params.equipo_id.toString());
      if (params?.tipo_solicitud) queryParams.append('tipo_solicitud', params.tipo_solicitud);
      if (params?.estado) queryParams.append('estado', params.estado);
      if (params?.prioridad) queryParams.append('prioridad', params.prioridad);
      if (params?.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde);
      if (params?.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta);
      if (params?.usuario_asignado_id) queryParams.append('usuario_asignado_id', params.usuario_asignado_id.toString());
      if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

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

  // Get solicitudes statistics
  getStats: async (): Promise<ApiResponse<SolicitudStats>> => {
    try {
      const response = await api.get('/solicitudes/stats');
      return response.data as ApiResponse<SolicitudStats>;
    } catch (error) {
      console.error('Error fetching solicitudes stats:', error);
      throw error;
    }
  }
};