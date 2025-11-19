import { api, ApiResponse } from './client';

// Cliente types
export interface Cliente {
  id: number;
  nombre: string;
  nit?: string;
  documento?: string; // Alias for nit
  correo?: string;
  email?: string; // Alias for correo
  telefonos?: string;
  telefono?: string; // Alias for telefonos
  direccion?: string;
  activo: number;
  created_at?: string;
  updated_at?: string;
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
    const url = queryString ? `/real/clientes?${queryString}` : '/real/clientes';
    
    const response = await api.get(url) as any;
    
    // Transform response format from real API to expected format
    if (response.success && response.data) {
      // Map real API fields to expected fields
      const clientes = (response.data as any[]).map((cliente: any) => ({
        ...cliente,
        documento: cliente.nit || cliente.documento,
        email: cliente.correo || cliente.email,
        telefono: cliente.telefonos || cliente.telefono,
        created_at: cliente.created_at || new Date().toISOString(),
        updated_at: cliente.updated_at || new Date().toISOString(),
      }));
      
      return {
        success: true,
        data: {
          clientes,
          pagination: response.pagination || { page: 1, limit: 10, total: clientes.length, totalPages: 1 }
        }
      };
    }
    
    return {
      success: false,
      data: {
        clientes: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      },
      error: response.error
    };
  },

  // Get cliente by ID
  getById: async (id: number): Promise<ApiResponse<Cliente>> => {
    return api.get(`/real/clientes/${id}`);
  },

  // Create new cliente
  create: async (data: CreateClienteData): Promise<ApiResponse<Cliente>> => {
    return api.post('/real/clientes', data);
  },

  // Update cliente
  update: async (id: number, data: UpdateClienteData): Promise<ApiResponse<Cliente>> => {
    return api.put(`/real/clientes/${id}`, data);
  },

  // Delete cliente (soft delete)
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/real/clientes/${id}`);
  },

  // Get sedes for a cliente
  getSedes: async (id: number): Promise<ApiResponse<any[]>> => {
    return api.get(`/real/clientes/${id}/sedes`);
  }
};