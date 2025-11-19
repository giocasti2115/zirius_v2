import { api, ApiResponse } from './client';

export interface WarehouseRequest {
  id: number;
  aviso: number;
  cliente: string;
  ordenRelacionada: number;
  estado: string;
  creador: string;
  servicio?: string;
  creacion?: string;
  equipo?: string;
  idEquipo?: number;
  sede?: string;
  serie?: string;
  cotizaciones?: string[];
  repuestos?: Array<{
    descripcion: string;
    cantidad: number;
    valorUnitario: number;
    sumaCliente: string;
  }>;
  itemsAdicionales?: Array<{
    descripcion: string;
    cantidad: number;
    valorUnitario: number;
    sumaCliente: string;
  }>;
  cambios?: Array<{
    fecha: string;
    accion: string;
    usuario: string;
  }>;
}

export interface WarehouseRequestFilters {
  estado?: string;
  cliente?: string;
  creador?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export const warehouseApi = {
  // Get all warehouse requests
  getAllRequests: (): Promise<ApiResponse<WarehouseRequest[]>> =>
    api.get('/warehouse-requests'),

  // Get warehouse requests with filters
  getRequestsWithFilters: (filters: WarehouseRequestFilters): Promise<ApiResponse<WarehouseRequest[]>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return api.get(`/warehouse-requests?${params.toString()}`);
  },

  // Get single warehouse request
  getRequest: (id: number): Promise<ApiResponse<WarehouseRequest>> =>
    api.get(`/warehouse-requests/${id}`),

  // Create new warehouse request
  createRequest: (request: Partial<WarehouseRequest>): Promise<ApiResponse<WarehouseRequest>> =>
    api.post('/warehouse-requests', request),

  // Update warehouse request
  updateRequest: (id: number, request: Partial<WarehouseRequest>): Promise<ApiResponse<WarehouseRequest>> =>
    api.put(`/warehouse-requests/${id}`, request),

  // Approve warehouse request
  approveRequest: (id: number, data?: any): Promise<ApiResponse<WarehouseRequest>> =>
    api.post(`/warehouse-requests/${id}/approve`, data),

  // Reject warehouse request
  rejectRequest: (id: number, reason?: string): Promise<ApiResponse<WarehouseRequest>> =>
    api.post(`/warehouse-requests/${id}/reject`, { reason }),

  // Delete warehouse request
  deleteRequest: (id: number): Promise<ApiResponse<void>> =>
    api.delete(`/warehouse-requests/${id}`),

  // Test API connection
  testConnection: (): Promise<ApiResponse<{ message: string; timestamp: string }>> =>
    api.get('/health')
};