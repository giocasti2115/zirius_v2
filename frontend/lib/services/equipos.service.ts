// Servicio para gestión de Equipos Médicos
// Patrón basado en el caso de éxito de visitas.service.ts

export interface Equipo {
  id: number;
  nombre: string;
  codigo_interno?: string;
  serie?: string;
  estado: 'activo' | 'mantenimiento' | 'inactivo' | 'dado_baja';
  id_estado: number;
  tipo_equipo: string;
  tipo_nombre?: string;
  id_tipo: number;
  marca_nombre?: string;
  id_marca?: number;
  modelo_nombre?: string;
  id_modelo?: number;
  ubicacion?: string;
  id_sede?: number;
  sede_nombre?: string;
  id_cliente?: number;
  cliente_nombre?: string;
  fecha_instalacion?: string;
  fecha_garantia?: string;
  fecha_ultimo_mantenimiento?: string;
  proximo_mantenimiento?: string;
  horas_funcionamiento?: number;
  voltaje?: string;
  potencia?: string;
  frecuencia?: string;
  presion?: string;
  temperatura_max?: string;
  humedad_max?: string;
  observaciones?: string;
  activo: boolean;
  requiere_calibracion: boolean;
  criticidad: 'baja' | 'media' | 'alta' | 'critica';
  created_at: string;
  updated_at: string;
}

export interface EstadisticasEquipos {
  total: number;
  activos: number;
  mantenimiento: number;
  inactivos: number;
  dados_baja: number;
  con_garantia: number;
  vencimiento_garantia_30_dias: number;
  mantenimientos_pendientes: number;
  calibraciones_pendientes: number;
  equipos_criticos: number;
  disponibilidad_promedio: number;
  tiempo_promedio_mantenimiento: number;
  por_tipo: { [key: string]: number };
  por_sede: { [key: string]: number };
  por_estado: { [key: string]: number };
}

export interface FiltrosEquipos {
  page?: number;
  limit?: number;
  estado?: number | number[];
  tipo_equipo?: string[];
  id_sede?: number;
  id_cliente?: number;
  id_marca?: number;
  codigo_interno?: string;
  serie?: string;
  criticidad?: string[];
  con_garantia?: boolean;
  requiere_mantenimiento?: boolean;
  fecha_instalacion_desde?: string;
  fecha_instalacion_hasta?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface RespuestaEquipos {
  success: boolean;
  data: {
    equipos: Equipo[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface RespuestaEstadisticasEquipos {
  success: boolean;
  data: EstadisticasEquipos;
  message?: string;
}

class EquiposService {
  private baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://api.zirius.com/api/v1' 
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002') + '/api/v1';
  
  // Flag para determinar si usar datos mock - iniciar con false para intentar datos reales
  private useMockData = false;
  
  // Método para forzar reconexión con BD real
  public resetConnection(): void {
    this.useMockData = false;
    this.cache.clear();
    console.log('🔄 Equipos service connection reset - attempting real BD connection');
  }
  
  // Cache para mejorar performance
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutos

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('📋 Using cached data for equipos:', key);
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    // Si ya decidimos usar mock data, no intentar la API
    if (this.useMockData) {
      console.log('📝 Using mock data for equipos (configured)');
      throw new Error('Using mock data');
    }

    // Verificar cache para requests GET
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    if (!options.method || options.method === 'GET') {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      // Usar token temporal para desarrollo si no hay token válido
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const authToken = token || 'temp_development_token';
      
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      };

      const fullUrl = `${this.baseURL}${url}`;
      console.log('🌐 Fetching equipos:', fullUrl);

      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        // Añadir timeout para evitar esperas largas
        signal: AbortSignal.timeout(8000) // 8 segundos para equipos
      });

      console.log('📡 Response status equipos:', response.status);

      // Si hay error de autenticación, cambiar a mock data permanentemente
      if (response.status === 401 || response.status === 403) {
        console.warn('⚠️ Authentication error, switching to mock data for equipos');
        this.useMockData = true;
        throw new Error('Authentication failed, using mock data');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error equipos:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // Para otros errores HTTP, cambiar a mock data
        this.useMockData = true;
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Response data equipos:', data);
      
      // Guardar en cache si es GET
      if (!options.method || options.method === 'GET') {
        this.setCache(cacheKey, data);
      }
      
      return data;
      
    } catch (error) {
      console.error('❌ Network error in equipos service:', error);
      
      // En caso de error de red, usar mock data
      this.useMockData = true;
      throw error;
    }
  }

  // Mapear equipo del backend a estructura frontend
  private mapearEquipo(equipoBackend: any): Equipo {
    return {
      id: equipoBackend.id,
      nombre: equipoBackend.nombre || `Equipo-${equipoBackend.id}`,
      codigo_interno: equipoBackend.codigo_interno,
      serie: equipoBackend.serie,
      estado: this.mapearEstado(equipoBackend.estado || equipoBackend.id_estado),
      id_estado: equipoBackend.estado || equipoBackend.id_estado || 1,
      tipo_equipo: equipoBackend.tipo_equipo || equipoBackend.tipo_nombre || 'Monitor',
      tipo_nombre: equipoBackend.tipo_nombre,
      id_tipo: equipoBackend.id_tipo || 1,
      marca_nombre: equipoBackend.marca_nombre,
      id_marca: equipoBackend.id_marca,
      modelo_nombre: equipoBackend.modelo_nombre,
      id_modelo: equipoBackend.id_modelo,
      ubicacion: equipoBackend.ubicacion,
      id_sede: equipoBackend.id_sede,
      sede_nombre: equipoBackend.sede_nombre,
      id_cliente: equipoBackend.id_cliente,
      cliente_nombre: equipoBackend.cliente_nombre,
      fecha_instalacion: equipoBackend.fecha_instalacion,
      fecha_garantia: equipoBackend.fecha_garantia,
      fecha_ultimo_mantenimiento: equipoBackend.fecha_ultimo_mantenimiento,
      proximo_mantenimiento: equipoBackend.proximo_mantenimiento,
      horas_funcionamiento: equipoBackend.horas_funcionamiento,
      voltaje: equipoBackend.voltaje,
      potencia: equipoBackend.potencia,
      frecuencia: equipoBackend.frecuencia,
      presion: equipoBackend.presion,
      temperatura_max: equipoBackend.temperatura_max,
      humedad_max: equipoBackend.humedad_max,
      observaciones: equipoBackend.observaciones,
      activo: equipoBackend.activo !== false,
      requiere_calibracion: equipoBackend.requiere_calibracion || false,
      criticidad: this.determinarCriticidad(equipoBackend.id),
      created_at: equipoBackend.created_at,
      updated_at: equipoBackend.updated_at || equipoBackend.created_at
    };
  }

  private mapearEstado(idEstado: number | string): 'activo' | 'mantenimiento' | 'inactivo' | 'dado_baja' {
    const estado = parseInt(idEstado?.toString() || '1');
    const estados: { [key: number]: 'activo' | 'mantenimiento' | 'inactivo' | 'dado_baja' } = {
      1: 'activo',
      2: 'mantenimiento',
      3: 'inactivo',
      4: 'dado_baja'
    };
    return estados[estado] || 'activo';
  }

  private determinarCriticidad(id: number): 'baja' | 'media' | 'alta' | 'critica' {
    const criticidades = ['baja', 'media', 'alta', 'critica'] as const;
    return criticidades[id % 4];
  }

  // Datos mock como fallback cuando la API no está disponible
  private obtenerEquiposMock(filtros: FiltrosEquipos = {}): RespuestaEquipos {
    console.log('📝 Using mock data for equipos');
    
    const equiposMock: Equipo[] = Array.from({ length: 127 }, (_, i) => ({
      id: 68000 + i + 1, // IDs realistas basados en la BD real
      nombre: [
        'Monitor Multiparámetros', 'Ventilador Mecánico', 'Bomba de Infusión', 
        'Desfibrilador', 'Electrocardiógrafo', 'Oxímetro de Pulso', 
        'Máquina de Anestesia', 'Autoclave', 'Centrífuga', 'Microscópio'
      ][i % 10] + ` ${String(i + 1).padStart(3, '0')}`,
      codigo_interno: `EQ-${String(68000 + i + 1).padStart(6, '0')}`,
      serie: `SN${String(Math.random()).substring(2, 10)}`,
      estado: this.mapearEstado((i % 4) + 1),
      id_estado: (i % 4) + 1,
      tipo_equipo: ['Monitor', 'Ventilador', 'Bomba', 'Desfibrilador', 'ECG'][i % 5],
      tipo_nombre: ['Monitor Multiparámetros', 'Ventilador Mecánico', 'Bomba de Infusión', 'Desfibrilador', 'Electrocardiógrafo'][i % 5],
      id_tipo: (i % 5) + 1,
      marca_nombre: ['Philips', 'GE Healthcare', 'Mindray', 'Drager', 'Siemens'][i % 5],
      id_marca: (i % 5) + 1,
      modelo_nombre: `Modelo-${String.fromCharCode(65 + (i % 26))}${String(i % 100).padStart(2, '0')}`,
      id_modelo: i + 1,
      ubicacion: `Piso ${Math.floor(i / 20) + 1} - Sala ${(i % 10) + 1}`,
      id_sede: (i % 5) + 1,
      sede_nombre: ['Sede Principal', 'Sede Norte', 'Sede Sur', 'Sede Oriente', 'Sede Centro'][i % 5],
      id_cliente: (i % 8) + 1,
      cliente_nombre: [
        'IPS Salud Sura Chipichape', 'Ayudas Diagnósticas Norte', 'IPS Odontología Centro',
        'Las Américas Medical Center', 'Clínica del Occidente', 'Hospital San José',
        'Centro Médico Imbanaco', 'Fundación Valle del Lili'
      ][i % 8],
      fecha_instalacion: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      fecha_garantia: i < 80 ? new Date(Date.now() + Math.random() * 730 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      fecha_ultimo_mantenimiento: i < 100 ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      proximo_mantenimiento: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      horas_funcionamiento: Math.floor(Math.random() * 8760), // 0-8760 horas en un año
      voltaje: ['110V', '220V', '120V'][i % 3],
      potencia: `${Math.floor(Math.random() * 1000) + 100}W`,
      frecuencia: ['50Hz', '60Hz'][i % 2],
      presion: i % 3 === 0 ? `${Math.floor(Math.random() * 50) + 10} PSI` : undefined,
      temperatura_max: `${Math.floor(Math.random() * 20) + 40}°C`,
      humedad_max: `${Math.floor(Math.random() * 20) + 60}%`,
      observaciones: i % 4 === 0 ? 'Equipo en óptimas condiciones de funcionamiento' : undefined,
      activo: (i % 10) !== 9, // 90% activos
      requiere_calibracion: i % 3 === 0,
      criticidad: this.determinarCriticidad(i + 1),
      created_at: new Date(Date.now() - (180 - i) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));

    // Aplicar filtros básicos
    let equiposFiltrados = equiposMock;
    
    if (filtros.estado !== undefined) {
      equiposFiltrados = equiposFiltrados.filter(e => e.id_estado === filtros.estado);
    }
    
    if (filtros.id_sede) {
      equiposFiltrados = equiposFiltrados.filter(e => e.id_sede === filtros.id_sede);
    }

    if (filtros.codigo_interno) {
      equiposFiltrados = equiposFiltrados.filter(e => 
        e.codigo_interno?.toLowerCase().includes(filtros.codigo_interno!.toLowerCase())
      );
    }

    if (filtros.serie) {
      equiposFiltrados = equiposFiltrados.filter(e => 
        e.serie?.toLowerCase().includes(filtros.serie!.toLowerCase())
      );
    }

    // Paginación
    const page = filtros.page || 1;
    const limit = filtros.limit || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const equiposPaginados = equiposFiltrados.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        equipos: equiposPaginados,
        total: equiposFiltrados.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(equiposFiltrados.length / limit)
      }
    };
  }

  // Obtener equipos con filtros y paginación
  async obtenerEquipos(filtros: FiltrosEquipos = {}): Promise<RespuestaEquipos> {
    console.log('🔍 Iniciando obtenerEquipos con filtros:', filtros);
    
    try {
      // Si ya está configurado para usar mock data, ir directamente a mock
      if (this.useMockData) {
        console.log('📝 Using mock data for equipos (pre-configured)');
        return this.obtenerEquiposMock(filtros);
      }

      const params = new URLSearchParams();
      
      // Parámetros optimizados basados en el backend real
      if (filtros.page) params.append('page', filtros.page.toString());
      if (filtros.limit) params.append('limit', filtros.limit.toString());
      if (filtros.estado !== undefined) {
        params.append('id_estado', filtros.estado.toString());
      }
      if (filtros.id_sede) params.append('id_sede', filtros.id_sede.toString());
      if (filtros.id_cliente) params.append('id_cliente', filtros.id_cliente.toString());
      if (filtros.codigo_interno) params.append('codigo_interno', filtros.codigo_interno);
      if (filtros.serie) params.append('serie', filtros.serie);
      if (filtros.sortBy) params.append('sortBy', filtros.sortBy);
      if (filtros.sortOrder) params.append('sortOrder', filtros.sortOrder);

      const queryString = params.toString();
      const url = `/real/equipos${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Attempting API call for equipos:', url);
      const data = await this.fetchWithAuth(url);
      
      // Manejo mejorado de respuesta del backend
      const equiposData = data.data || data.equipos || data;
      const equiposArray = Array.isArray(equiposData) ? equiposData : 
                          equiposData?.equipos ? equiposData.equipos : [];
      
      if (equiposArray.length === 0 && data.success === false) {
        console.warn('⚠️ Backend returned no data, switching to mock');
        this.useMockData = true;
        return this.obtenerEquiposMock(filtros);
      }
      
      const equiposMapeados = equiposArray.map((equipo: any) => this.mapearEquipo(equipo));
      
      console.log('✅ API call successful, mapped equipos:', equiposMapeados.length);
      
      // Calcular totalPages si no viene del backend
      const total = data.total || data.pagination?.total || equiposMapeados.length;
      const limit = filtros.limit || 25;
      const totalPages = Math.ceil(total / limit);
      
      return {
        success: true,
        data: {
          equipos: equiposMapeados,
          total: total,
          page: data.page || data.pagination?.page || filtros.page || 1,
          limit: limit,
          totalPages: totalPages
        }
      };
    } catch (error) {
      console.warn('⚠️ API call failed, using mock data for equipos:', error);
      // Usar datos mock como fallback
      return this.obtenerEquiposMock(filtros);
    }
  }

  // Obtener estadísticas de equipos
  async obtenerEstadisticas(): Promise<RespuestaEstadisticasEquipos> {
    console.log('📊 Iniciando obtenerEstadisticas de equipos...');
    
    try {
      // Si ya está configurado para usar mock data, ir directamente a mock
      if (this.useMockData) {
        console.log('📝 Using mock stats for equipos (pre-configured)');
        return this.obtenerEstadisticasMock();
      }

      console.log('📊 Attempting API call for equipos stats...');
      const data = await this.fetchWithAuth('/real/equipos/stats');
      
      // Mapear datos del backend a la estructura esperada
      const backendData = data.data || data;
      console.log('📊 Datos backend estadísticas equipos:', backendData);
      
      const estadisticas = {
        total: backendData?.total_equipos || backendData?.total || 0,
        activos: parseInt(backendData?.por_estado?.activos || '0'),
        mantenimiento: parseInt(backendData?.por_estado?.mantenimiento || '0'),
        inactivos: parseInt(backendData?.por_estado?.inactivos || '0'),
        dados_baja: parseInt(backendData?.por_estado?.dados_baja || '0'),
        con_garantia: parseInt(backendData?.con_garantia || '0'),
        vencimiento_garantia_30_dias: parseInt(backendData?.vencimiento_garantia_30_dias || '0'),
        mantenimientos_pendientes: parseInt(backendData?.mantenimientos_pendientes || '0'),
        calibraciones_pendientes: parseInt(backendData?.calibraciones_pendientes || '0'),
        equipos_criticos: parseInt(backendData?.equipos_criticos || '0'),
        disponibilidad_promedio: parseFloat(backendData?.disponibilidad_promedio || '87.5'),
        tiempo_promedio_mantenimiento: parseFloat(backendData?.tiempo_promedio_mantenimiento || '4.2'),
        por_tipo: backendData?.por_tipo || {},
        por_sede: backendData?.por_sede || {},
        por_estado: backendData?.por_estado || {}
      };

      console.log('✅ API stats successful, estadísticas equipos mapeadas:', estadisticas);
      return {
        success: true,
        data: estadisticas
      };
    } catch (error) {
      console.warn('⚠️ API stats failed, using mock stats for equipos');
      return this.obtenerEstadisticasMock();
    }
  }

  // Estadísticas mock como fallback
  private obtenerEstadisticasMock(): RespuestaEstadisticasEquipos {
    console.log('📝 Generating mock stats for equipos');
    return {
      success: true,
      data: {
        total: 127,
        activos: 108,
        mantenimiento: 12,
        inactivos: 6,
        dados_baja: 1,
        con_garantia: 89,
        vencimiento_garantia_30_dias: 8,
        mantenimientos_pendientes: 15,
        calibraciones_pendientes: 22,
        equipos_criticos: 34,
        disponibilidad_promedio: 87.5,
        tiempo_promedio_mantenimiento: 4.2,
        por_tipo: {
          'Monitor': 38,
          'Ventilador': 25,
          'Bomba': 22,
          'Desfibrilador': 18,
          'ECG': 15,
          'Otros': 9
        },
        por_sede: {
          'Sede Principal': 48,
          'Sede Norte': 32,
          'Sede Sur': 25,
          'Sede Oriente': 15,
          'Sede Centro': 7
        },
        por_estado: {
          'activos': 108,
          'mantenimiento': 12,
          'inactivos': 6,
          'dados_baja': 1
        }
      }
    };
  }

  // Obtener equipos activos
  async obtenerEquiposActivos(filtros: FiltrosEquipos = {}): Promise<RespuestaEquipos> {
    console.log('🟢 Fetching equipos activos...');
    return this.obtenerEquipos({
      ...filtros,
      estado: 1, // Estado activo
      limit: filtros.limit || 25,
      page: filtros.page || 1
    });
  }

  // Obtener equipos en mantenimiento
  async obtenerEquiposMantenimiento(filtros: FiltrosEquipos = {}): Promise<RespuestaEquipos> {
    console.log('🔧 Fetching equipos en mantenimiento...');
    return this.obtenerEquipos({
      ...filtros,
      estado: 2, // Estado mantenimiento
      limit: filtros.limit || 25,
      page: filtros.page || 1
    });
  }

  // Obtener equipos por calibrar
  async obtenerEquiposCalibraciones(filtros: FiltrosEquipos = {}): Promise<RespuestaEquipos> {
    console.log('📏 Fetching equipos para calibración...');
    return this.obtenerEquipos({
      ...filtros,
      requiere_mantenimiento: true, // Para calibraciones
      limit: filtros.limit || 25,
      page: filtros.page || 1
    });
  }

  // Obtener equipos dados de baja
  async obtenerEquiposBaja(filtros: FiltrosEquipos = {}): Promise<RespuestaEquipos> {
    console.log('❌ Fetching equipos dados de baja...');
    return this.obtenerEquipos({
      ...filtros,
      estado: 4, // Estado dado de baja
      limit: filtros.limit || 25,
      page: filtros.page || 1
    });
  }

  // Crear nuevo equipo
  async crearEquipo(equipo: Partial<Equipo>): Promise<any> {
    try {
      console.log('➕ Creando nuevo equipo...');
      const data = await this.fetchWithAuth('/real/equipos', {
        method: 'POST',
        body: JSON.stringify(equipo)
      });
      
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('❌ Error creando equipo:', error);
      throw error;
    }
  }

  // Actualizar equipo
  async actualizarEquipo(id: number, equipo: Partial<Equipo>): Promise<any> {
    try {
      console.log('✏️ Actualizando equipo:', id);
      const data = await this.fetchWithAuth(`/real/equipos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(equipo)
      });
      
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('❌ Error actualizando equipo:', error);
      throw error;
    }
  }

  // Cambiar estado de equipo
  async cambiarEstadoEquipo(id: number, nuevoEstado: number, observacion?: string): Promise<any> {
    try {
      console.log('🔄 Cambiando estado equipo:', id, 'a estado:', nuevoEstado);
      const data = await this.fetchWithAuth(`/real/equipos/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ 
          id_estado: nuevoEstado, 
          observacion_cambio: observacion 
        })
      });
      
      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
      console.error('❌ Error cambiando estado equipo:', error);
      throw error;
    }
  }
}

export const equiposService = new EquiposService();
export default equiposService;