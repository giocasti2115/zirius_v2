import { api, ApiResponse } from './client';

// Equipo types
export interface Equipo {
  id: number;
  sede_id: number;
  modelo_id: number;
  nombre: string;
  serie?: string;
  codigo_interno?: string;
  fecha_instalacion?: string;
  fecha_garantia?: string;
  estado: 'activo' | 'inactivo' | 'mantenimiento' | 'dado_baja';
  ubicacion?: string;
  observaciones?: string;
  activo: number;
  created_at: string;
  updated_at: string;
  sede_nombre?: string;
  cliente_nombre?: string;
  modelo_nombre?: string;
  marca_nombre?: string;
  tipo_nombre?: string;
}

export interface CreateEquipoData {
  sede_id: number;
  modelo_id: number;
  nombre: string;
  serie?: string;
  codigo_interno?: string;
  fecha_instalacion?: string;
  fecha_garantia?: string;
  estado: 'activo' | 'inactivo' | 'mantenimiento' | 'dado_baja';
  ubicacion?: string;
  observaciones?: string;
}

export interface UpdateEquipoData {
  sede_id?: number;
  modelo_id?: number;
  nombre?: string;
  serie?: string;
  codigo_interno?: string;
  fecha_instalacion?: string;
  fecha_garantia?: string;
  estado?: 'activo' | 'inactivo' | 'mantenimiento' | 'dado_baja';
  ubicacion?: string;
  observaciones?: string;
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
  equipos: Equipo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface EquipoQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sede_id?: number;
  estado?: string;
  modelo_id?: number;
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
      if (params?.estado) queryParams.append('estado', params.estado);
      if (params?.modelo_id) queryParams.append('modelo_id', params.modelo_id.toString());

      const response = await api.get(`/equipos?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching equipos:', error);
      throw error;
    }
  },

  // Get equipo by ID
  getById: async (id: number): Promise<ApiResponse<Equipo>> => {
    try {
      const response = await api.get(`/equipos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching equipo:', error);
      throw error;
    }
  },

  // Create new equipo
  create: async (data: CreateEquipoData): Promise<ApiResponse<Equipo>> => {
    try {
      const response = await api.post('/equipos', data);
      return response.data;
    } catch (error) {
      console.error('Error creating equipo:', error);
      throw error;
    }
  },

  // Update equipo
  update: async (id: number, data: UpdateEquipoData): Promise<ApiResponse<Equipo>> => {
    try {
      const response = await api.put(`/equipos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating equipo:', error);
      throw error;
    }
  },

  // Delete equipo
  delete: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete(`/equipos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting equipo:', error);
      throw error;
    }
  }
};

// Equipment catalog APIs
export const equipmentCatalogApi = {
  // Get equipment types
  getTipos: async (): Promise<ApiResponse<TipoEquipo[]>> => {
    try {
      const response = await api.get('/catalog/tipos-equipos');
      return response.data;
    } catch (error) {
      console.error('Error fetching tipos equipos:', error);
      throw error;
    }
  },

  // Get equipment brands
  getMarcas: async (): Promise<ApiResponse<MarcaEquipo[]>> => {
    try {
      const response = await api.get('/catalog/marcas-equipos');
      return response.data;
    } catch (error) {
      console.error('Error fetching marcas equipos:', error);
      throw error;
    }
  },

  // Get equipment models
  getModelos: async (marcaId?: number, tipoId?: number): Promise<ApiResponse<ModeloEquipo[]>> => {
    try {
      const queryParams = new URLSearchParams();
      if (marcaId) queryParams.append('marca_id', marcaId.toString());
      if (tipoId) queryParams.append('tipo_id', tipoId.toString());

      const response = await api.get(`/catalog/modelos-equipos?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching modelos equipos:', error);
      throw error;
    }
  }
};