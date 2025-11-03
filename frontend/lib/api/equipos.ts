import { api, ApiResponse } from './client';

// Equipo types - Updated to match backend response
export interface Equipo {
  id: number;
  sede_id: number;
  numero_serie?: string;
  referencia?: string;
  ubicacion?: string;
  estado: 'activo' | 'inactivo' | 'mantenimiento' | 'dado_baja';
  fecha_instalacion?: string;
  fecha_ultimo_mantenimiento?: string;
  fecha_proximo_mantenimiento?: string;
  observaciones?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  // Joined data from backend
  sede_nombre?: string;
  sede_direccion?: string;
  sede_telefono?: string;
  cliente_id?: number;
  cliente_nombre?: string;
  cliente_tipo?: string;
  marca_id?: number;
  marca_nombre?: string;
  clase_id?: number;
  clase_nombre?: string;
  // Legacy fields for compatibility
  modelo_id?: number;
  nombre?: string;
  serie?: string;
  codigo_interno?: string;
  fecha_garantia?: string;
  activo?: number;
  created_at?: string;
  updated_at?: string;
  modelo_nombre?: string;
  tipo_nombre?: string;
}

export interface CreateEquipoData {
  sede_id: number;
  numero_serie?: string;
  referencia?: string;
  ubicacion?: string;
  estado?: 'activo' | 'inactivo' | 'mantenimiento' | 'dado_baja';
  fecha_instalacion?: string;
  fecha_ultimo_mantenimiento?: string;
  fecha_proximo_mantenimiento?: string;
  observaciones?: string;
  marca_id?: number;
  clase_id?: number;
}

export interface UpdateEquipoData {
  sede_id?: number;
  numero_serie?: string;
  referencia?: string;
  ubicacion?: string;
  estado?: 'activo' | 'inactivo' | 'mantenimiento' | 'dado_baja';
  fecha_instalacion?: string;
  fecha_ultimo_mantenimiento?: string;
  fecha_proximo_mantenimiento?: string;
  observaciones?: string;
  marca_id?: number;
  clase_id?: number;
}

// Equipment model/brand/type interfaces
export interface TipoEquipo {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: number;
}

export interface MarcaEquipo {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: number;
}

export interface ModeloEquipo {
  id: number;
  marca_id: number;
  tipo_id: number;
  nombre: string;
  descripcion?: string;
  especificaciones?: any;
  activo: number;
  marca_nombre?: string;
  tipo_nombre?: string;
}

export interface EquiposResponse {
  data: Equipo[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
}

export interface EquipoQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sede_id?: number;
  cliente_id?: number;
  estado?: string;
  marca_id?: number;
  clase_id?: number;
}

export const equipoApi = {
  // Get all equipos
  getAll: async (params?: EquipoQueryParams): Promise<ApiResponse<EquiposResponse>> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sede_id) queryParams.append('sede_id', params.sede_id.toString());
      if (params?.cliente_id) queryParams.append('cliente_id', params.cliente_id.toString());
      if (params?.estado) queryParams.append('estado', params.estado);
      if (params?.marca_id) queryParams.append('marca_id', params.marca_id.toString());
      if (params?.clase_id) queryParams.append('clase_id', params.clase_id.toString());

      const response = await api.get(`/equipos?${queryParams}`);
      return response.data as ApiResponse<EquiposResponse>;
    } catch (error) {
      console.error('Error fetching equipos:', error);
      throw error;
    }
  },

  // Get equipo by ID
  getById: async (id: number): Promise<ApiResponse<Equipo>> => {
    try {
      const response = await api.get(`/equipos/${id}`);
      return response.data as ApiResponse<Equipo>;
    } catch (error) {
      console.error('Error fetching equipo:', error);
      throw error;
    }
  },

  // Create new equipo
  create: async (data: CreateEquipoData): Promise<ApiResponse<Equipo>> => {
    try {
      const response = await api.post('/equipos', data);
      return response.data as ApiResponse<Equipo>;
    } catch (error) {
      console.error('Error creating equipo:', error);
      throw error;
    }
  },

  // Update equipo
  update: async (id: number, data: UpdateEquipoData): Promise<ApiResponse<Equipo>> => {
    try {
      const response = await api.put(`/equipos/${id}`, data);
      return response.data as ApiResponse<Equipo>;
    } catch (error) {
      console.error('Error updating equipo:', error);
      throw error;
    }
  },

  // Delete equipo
  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete(`/equipos/${id}`);
      return response.data as ApiResponse<void>;
    } catch (error) {
      console.error('Error deleting equipo:', error);
      throw error;
    }
  }
};

// Equipment catalog APIs
export const equipmentCatalogApi = {
  // Get equipment classes (tipos)
  getClases: async (): Promise<ApiResponse<TipoEquipo[]>> => {
    try {
      const response = await api.get('/database/tables/clases/sample?limit=100');
      return response.data as ApiResponse<TipoEquipo[]>;
    } catch (error) {
      console.error('Error fetching clases equipos:', error);
      throw error;
    }
  },

  // Get equipment brands (marcas)
  getMarcas: async (): Promise<ApiResponse<MarcaEquipo[]>> => {
    try {
      const response = await api.get('/database/tables/marcas/sample?limit=100');
      return response.data as ApiResponse<MarcaEquipo[]>;
    } catch (error) {
      console.error('Error fetching marcas equipos:', error);
      throw error;
    }
  },

  // Legacy compatibility methods
  getTipos: async (): Promise<ApiResponse<TipoEquipo[]>> => {
    return equipmentCatalogApi.getClases();
  },

  getModelos: async (marcaId?: number, tipoId?: number): Promise<ApiResponse<ModeloEquipo[]>> => {
    try {
      // For now, return empty array since we don't have modelos table
      // This can be updated when modelos endpoints are implemented
      return {
        success: true,
        data: [],
        message: 'Modelos not implemented yet'
      } as ApiResponse<ModeloEquipo[]>;
    } catch (error) {
      console.error('Error fetching modelos equipos:', error);
      throw error;
    }
  }
};