import { api, ApiResponse } from './client';

// Cliente types
export interface Cliente {
  id: number;
  nombre: string;
  documento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo: number;
  created_at: string;
  updated_at: string;
}

export interface CreateClienteData {
  nombre: string;
  documento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface UpdateClienteData {
  nombre?: string;
  documento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export interface ClientesResponse {
  clientes: Cliente[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ClienteQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Cliente API functions
export const clienteApi = {
  // Get all clientes with pagination and search
  getAll: async (params: ClienteQueryParams = {}): Promise<ApiResponse<ClientesResponse>> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const url = queryString ? `/clientes?${queryString}` : '/clientes';
    
    return api.get(url);
  },

  // Get cliente by ID
  getById: async (id: number): Promise<ApiResponse<Cliente>> => {
    return api.get(`/clientes/${id}`);
  },

  // Create new cliente
  create: async (data: CreateClienteData): Promise<ApiResponse<Cliente>> => {
    return api.post('/clientes', data);
  },

  // Update cliente
  update: async (id: number, data: UpdateClienteData): Promise<ApiResponse<Cliente>> => {
    return api.put(`/clientes/${id}`, data);
  },

  // Delete cliente (soft delete)
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/clientes/${id}`);
  },

  // Get sedes for a cliente
  getSedes: async (id: number): Promise<ApiResponse<any[]>> => {
    return api.get(`/clientes/${id}/sedes`);
  }
};