import { api, ApiResponse } from './client';

// Sede types
export interface Sede {
  id: number;
  cliente_id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto_principal?: string;
  ciudad?: string;
  departamento?: string;
  codigo_postal?: string;
  activo: number;
  created_at: string;
  updated_at: string;
  cliente_nombre?: string;
}

export interface CreateSedeData {
  cliente_id: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto_principal?: string;
  ciudad?: string;
  departamento?: string;
  codigo_postal?: string;
}

export interface UpdateSedeData {
  cliente_id?: number;
  nombre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto_principal?: string;
  ciudad?: string;
  departamento?: string;
  codigo_postal?: string;
}

export interface SedesResponse {
  sedes: Sede[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SedeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  id_cliente?: number;
}

// Sede API functions
export const sedeApi = {
  // Get all sedes with pagination and search
  getAll: async (params: SedeQueryParams = {}): Promise<ApiResponse<SedesResponse>> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.id_cliente) searchParams.append('id_cliente', params.id_cliente.toString());

    const queryString = searchParams.toString();
    const url = queryString ? `/sedes?${queryString}` : '/sedes';
    
    return api.get(url);
  },

  // Get sede by ID
  getById: async (id: number): Promise<ApiResponse<Sede>> => {
    return api.get(`/sedes/${id}`);
  },

  // Create new sede
  create: async (data: CreateSedeData): Promise<ApiResponse<Sede>> => {
    return api.post('/sedes', data);
  },

  // Update sede
  update: async (id: number, data: UpdateSedeData): Promise<ApiResponse<Sede>> => {
    return api.put(`/sedes/${id}`, data);
  },

  // Delete sede (soft delete)
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/sedes/${id}`);
  },

  // Get equipos for a sede
  getEquipos: async (id: number): Promise<ApiResponse<any[]>> => {
    return api.get(`/sedes/${id}/equipos`);
  }
};