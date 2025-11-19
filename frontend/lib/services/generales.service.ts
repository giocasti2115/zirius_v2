export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
  telefono?: string;
  rol: 'admin' | 'coordinador' | 'tecnico' | 'analista' | 'comercial';
  estado: 'activo' | 'inactivo';
  fecha_creacion: string;
  ultimo_acceso?: string;
  avatar?: string;
  configuracion_notificaciones?: any;
  solicitudes_creadas?: number;
  visitas_asignadas?: number;
  total_solicitudes?: number;
  total_visitas?: number;
  total_ordenes?: number;
}

export interface TipoEquipo {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo: string;
  categoria?: string;
  activo: boolean;
  total_equipos: number;
  fecha_creacion: string;
}

export interface Marca {
  id: number;
  nombre: string;
  descripcion?: string;
  pais_origen?: string;
  activo: boolean;
  total_equipos: number;
  fecha_creacion: string;
}

export interface Estado {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  categoria: string;
  activo: boolean;
  orden: number;
}

export interface Prioridad {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  nivel: number;
  activo: boolean;
}

export interface EstadisticasGenerales {
  usuarios: {
    total_usuarios: number;
    usuarios_activos: number;
    tecnicos: number;
    administradores: number;
    usuarios_activos_semana: number;
  };
  configuracion: {
    tipos_equipos: number;
    marcas: number;
    estados: number;
    prioridades: number;
  };
  sistema: {
    total_equipos: number;
    total_clientes: number;
    total_sedes: number;
  };
}

export class GeneralesService {
  private static readonly API_BASE = process.env.NODE_ENV === 'production' 
    ? '/api/real/generales' 
    : 'http://localhost:3000/api/real/generales';

  // Cache para mejorar performance
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  private static async fetchWithCache<T>(
    endpoint: string, 
    options?: RequestInit
  ): Promise<T> {
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.success ? result.data : null;

      // Cache successful results
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      
      // Return cached data if available, even if expired
      if (cached) {
        console.warn(`Using expired cache for ${endpoint}`);
        return cached.data;
      }
      
      // Return fallback data for development
      return this.getFallbackData(endpoint);
    }
  }

  private static getFallbackData(endpoint: string): any {
    switch (endpoint) {
      case '/usuarios':
        return {
          usuarios: [
            {
              id: 1,
              nombre: 'Juan Carlos',
              apellido: 'Rodríguez',
              email: 'juan.rodriguez@empresa.com',
              documento: '12345678',
              telefono: '3001234567',
              rol: 'admin' as const,
              estado: 'activo' as const,
              fecha_creacion: '2024-01-15T10:00:00Z',
              ultimo_acceso: '2024-12-20T09:30:00Z',
              solicitudes_creadas: 45,
              visitas_asignadas: 0
            },
            {
              id: 2,
              nombre: 'María Elena',
              apellido: 'González',
              email: 'maria.gonzalez@empresa.com',
              documento: '87654321',
              telefono: '3009876543',
              rol: 'tecnico' as const,
              estado: 'activo' as const,
              fecha_creacion: '2024-02-01T14:20:00Z',
              ultimo_acceso: '2024-12-20T08:15:00Z',
              solicitudes_creadas: 12,
              visitas_asignadas: 28
            },
            {
              id: 3,
              nombre: 'Pedro',
              apellido: 'Martínez',
              email: 'pedro.martinez@empresa.com',
              documento: '11223344',
              telefono: '3005555555',
              rol: 'coordinador' as const,
              estado: 'activo' as const,
              fecha_creacion: '2024-01-20T11:45:00Z',
              ultimo_acceso: '2024-12-19T16:20:00Z',
              solicitudes_creadas: 23,
              visitas_asignadas: 15
            }
          ],
          pagination: {
            page: 1,
            limit: 50,
            total: 3,
            totalPages: 1
          }
        };

      case '/tipos-equipos':
        return [
          {
            id: 1,
            nombre: 'Monitor de Signos Vitales',
            descripcion: 'Equipos para monitoreo de signos vitales de pacientes',
            codigo: 'MSV',
            categoria: 'Monitoreo',
            activo: true,
            total_equipos: 45,
            fecha_creacion: '2024-01-10T00:00:00Z'
          },
          {
            id: 2,
            nombre: 'Ventilador Mecánico',
            descripcion: 'Equipos de ventilación mecánica para cuidados intensivos',
            codigo: 'VM',
            categoria: 'Respiratorio',
            activo: true,
            total_equipos: 23,
            fecha_creacion: '2024-01-10T00:00:00Z'
          },
          {
            id: 3,
            nombre: 'Bomba de Infusión',
            descripcion: 'Equipos para administración controlada de medicamentos',
            codigo: 'BI',
            categoria: 'Infusión',
            activo: true,
            total_equipos: 67,
            fecha_creacion: '2024-01-10T00:00:00Z'
          }
        ];

      case '/marcas':
        return [
          {
            id: 1,
            nombre: 'Philips',
            descripcion: 'Marca líder en equipos médicos y tecnología hospitalaria',
            pais_origen: 'Países Bajos',
            activo: true,
            total_equipos: 78,
            fecha_creacion: '2024-01-10T00:00:00Z'
          },
          {
            id: 2,
            nombre: 'GE Healthcare',
            descripcion: 'División médica de General Electric',
            pais_origen: 'Estados Unidos',
            activo: true,
            total_equipos: 45,
            fecha_creacion: '2024-01-10T00:00:00Z'
          },
          {
            id: 3,
            nombre: 'Siemens Healthineers',
            descripcion: 'Tecnología médica avanzada',
            pais_origen: 'Alemania',
            activo: true,
            total_equipos: 34,
            fecha_creacion: '2024-01-10T00:00:00Z'
          }
        ];

      case '/estados':
        return [
          {
            id: 1,
            nombre: 'Activo',
            descripcion: 'Equipo en funcionamiento normal',
            color: '#10B981',
            categoria: 'equipos',
            activo: true,
            orden: 1
          },
          {
            id: 2,
            nombre: 'En Mantenimiento',
            descripcion: 'Equipo bajo mantenimiento programado',
            color: '#F59E0B',
            categoria: 'equipos',
            activo: true,
            orden: 2
          },
          {
            id: 3,
            nombre: 'Fuera de Servicio',
            descripción: 'Equipo no operativo',
            color: '#EF4444',
            categoria: 'equipos',
            activo: true,
            orden: 3
          },
          {
            id: 4,
            nombre: 'Pendiente',
            descripcion: 'Solicitud pendiente de asignación',
            color: '#6B7280',
            categoria: 'solicitudes',
            activo: true,
            orden: 1
          },
          {
            id: 5,
            nombre: 'En Proceso',
            descripcion: 'Solicitud siendo procesada',
            color: '#3B82F6',
            categoria: 'solicitudes',
            activo: true,
            orden: 2
          }
        ];

      case '/prioridades':
        return [
          {
            id: 1,
            nombre: 'Crítica',
            descripcion: 'Requiere atención inmediata',
            color: '#DC2626',
            nivel: 5,
            activo: true
          },
          {
            id: 2,
            nombre: 'Alta',
            descripcion: 'Requiere atención prioritaria',
            color: '#EA580C',
            nivel: 4,
            activo: true
          },
          {
            id: 3,
            nombre: 'Media',
            descripcion: 'Atención en horario normal',
            color: '#CA8A04',
            nivel: 3,
            activo: true
          },
          {
            id: 4,
            nombre: 'Baja',
            descripcion: 'Puede programarse',
            color: '#16A34A',
            nivel: 2,
            activo: true
          }
        ];

      case '/estadisticas':
        return {
          usuarios: {
            total_usuarios: 15,
            usuarios_activos: 12,
            tecnicos: 6,
            administradores: 2,
            usuarios_activos_semana: 10
          },
          configuracion: {
            tipos_equipos: 8,
            marcas: 12,
            estados: 15,
            prioridades: 4
          },
          sistema: {
            total_equipos: 234,
            total_clientes: 45,
            total_sedes: 78
          }
        };

      default:
        return null;
    }
  }

  static clearCache(): void {
    this.cache.clear();
  }

  // ===== USUARIOS =====
  static async getUsuarios(params?: {
    page?: number;
    limit?: number;
    search?: string;
    rol?: string;
    estado?: string;
  }): Promise<{ usuarios: Usuario[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.rol) queryParams.append('rol', params.rol);
    if (params?.estado) queryParams.append('estado', params.estado);

    const queryString = queryParams.toString();
    const endpoint = `/usuarios${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchWithCache<{ usuarios: Usuario[]; pagination: any }>(endpoint);
  }

  static async getUsuario(id: number): Promise<Usuario> {
    return this.fetchWithCache<Usuario>(`/usuarios/${id}`);
  }

  static async createUsuario(usuario: Omit<Usuario, 'id' | 'fecha_creacion' | 'ultimo_acceso'>): Promise<{ id: number }> {
    this.clearCache(); // Clear cache when creating
    
    return this.fetchWithCache<{ id: number }>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(usuario),
    });
  }

  static async updateUsuario(id: number, usuario: Partial<Usuario>): Promise<void> {
    this.clearCache(); // Clear cache when updating
    
    await this.fetchWithCache<void>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(usuario),
    });
  }

  static async deleteUsuario(id: number): Promise<void> {
    this.clearCache(); // Clear cache when deleting
    
    await this.fetchWithCache<void>(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== TIPOS DE EQUIPOS =====
  static async getTiposEquipos(params?: {
    search?: string;
    activo?: boolean;
  }): Promise<TipoEquipo[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.activo !== undefined) queryParams.append('activo', params.activo.toString());

    const queryString = queryParams.toString();
    const endpoint = `/tipos-equipos${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchWithCache<TipoEquipo[]>(endpoint);
  }

  static async createTipoEquipo(tipo: Omit<TipoEquipo, 'id' | 'total_equipos' | 'fecha_creacion' | 'activo'>): Promise<{ id: number }> {
    this.clearCache();
    
    return this.fetchWithCache<{ id: number }>('/tipos-equipos', {
      method: 'POST',
      body: JSON.stringify(tipo),
    });
  }

  // ===== MARCAS =====
  static async getMarcas(params?: {
    search?: string;
    activo?: boolean;
  }): Promise<Marca[]> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.activo !== undefined) queryParams.append('activo', params.activo.toString());

    const queryString = queryParams.toString();
    const endpoint = `/marcas${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchWithCache<Marca[]>(endpoint);
  }

  static async createMarca(marca: Omit<Marca, 'id' | 'total_equipos' | 'fecha_creacion' | 'activo'>): Promise<{ id: number }> {
    this.clearCache();
    
    return this.fetchWithCache<{ id: number }>('/marcas', {
      method: 'POST',
      body: JSON.stringify(marca),
    });
  }

  // ===== ESTADOS =====
  static async getEstados(): Promise<Estado[]> {
    return this.fetchWithCache<Estado[]>('/estados');
  }

  // ===== PRIORIDADES ===== 
  static async getPrioridades(): Promise<Prioridad[]> {
    return this.fetchWithCache<Prioridad[]>('/prioridades');
  }

  // ===== ESTADÍSTICAS =====
  static async getEstadisticas(): Promise<EstadisticasGenerales> {
    return this.fetchWithCache<EstadisticasGenerales>('/estadisticas');
  }
}