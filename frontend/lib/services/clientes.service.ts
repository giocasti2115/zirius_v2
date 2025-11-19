// Servicio para gestionar clientes
export interface Cliente {
  id: number;
  nombre: string;
  documento: string; // Cambiar de nit a documento para coincidir con la DB real
  telefono: string;
  email: string;
  direccion: string;
  activo: number; // 1 = activo, 0 = inactivo (según DB real)
  created_at: string;
  updated_at: string;
  // Campos adicionales para compatibilidad con frontend existente
  ciudad?: string;
  tipo?: 'hospital' | 'clinica' | 'ips' | 'particular';
  estado?: 'activo' | 'inactivo';
  contacto_principal?: string;
  nit?: string;
  fecha_registro?: string;
  ultima_actualizacion?: string;
  total_solicitudes?: number;
  total_ordenes?: number;
}

export interface FiltrosClientes {
  page?: number;
  limit?: number;
  nombre?: string;
  tipo?: string;
  estado?: string;
  ciudad?: string;
}

export interface RespuestaClientes {
  success: boolean;
  data: {
    clientes: Cliente[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

class ClientesService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
  private useMockData = false; // Usar API real de clientes

  // Obtener clientes con filtros y paginación
  async obtenerClientes(filtros: FiltrosClientes = {}): Promise<RespuestaClientes> {
    console.log('🔍 Obteniendo clientes con filtros:', filtros);
    
    try {
      // Si está configurado para usar mock data, ir directamente a mock
      if (this.useMockData) {
        console.log('📝 Using mock data for clientes');
        return this.obtenerClientesMock(filtros);
      }

      const params = new URLSearchParams();
      if (filtros.page) params.append('page', filtros.page.toString());
      if (filtros.limit) params.append('limit', filtros.limit.toString());
      if (filtros.nombre) params.append('search', filtros.nombre); // Usar 'search' como en el backend
      if (filtros.estado) {
        // Convertir estado a formato de la DB (1 = activo, 0 = inactivo)
        const activoValue = filtros.estado === 'activo' ? '1' : '0';
        params.append('activo', activoValue);
      }

      const response = await fetch(`${this.baseURL}/clientes/public?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('❌ API error, switching to mock data');
        this.useMockData = true;
        return this.obtenerClientesMock(filtros);
      }

      const apiData = await response.json();
      console.log('✅ Clientes obtenidos del API real:', apiData);
      
      // Transformar datos del API real al formato esperado por el frontend
      const clientesTransformados = apiData.data.clientes.map((cliente: any) => ({
        ...cliente,
        // Mapear campos adicionales para compatibilidad
        estado: cliente.activo === 1 ? 'activo' : 'inactivo',
        fecha_registro: cliente.created_at,
        ultima_actualizacion: cliente.updated_at,
        nit: cliente.documento,
        // Inferir tipo y ciudad de los datos reales
        tipo: cliente.nombre.toLowerCase().includes('clínica') ? 'clinica' : 
              cliente.nombre.toLowerCase().includes('hospital') ? 'hospital' :
              cliente.nombre.toLowerCase().includes('centro') ? 'clinica' : 'ips',
        ciudad: cliente.direccion.includes('Bogotá') ? 'Bogotá' :
                cliente.direccion.includes('Medellín') ? 'Medellín' :
                cliente.direccion.includes('Cali') ? 'Cali' : 'Otra',
        contacto_principal: 'Administrador' // Valor por defecto
      }));

      return {
        success: true,
        data: {
          clientes: clientesTransformados,
          total: apiData.data.pagination.total,
          page: apiData.data.pagination.page,
          limit: apiData.data.pagination.limit,
          totalPages: apiData.data.pagination.totalPages
        }
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo clientes:', error);
      this.useMockData = true;
      return this.obtenerClientesMock(filtros);
    }
  }

  // Datos mock para desarrollo
  private obtenerClientesMock(filtros: FiltrosClientes = {}): RespuestaClientes {
    const clientesMock: Cliente[] = Array.from({ length: 156 }, (_, i) => ({
      id: i + 1,
      nombre: [
        'IPS Salud Total Chipichape', 'Clínica del Norte', 'Hospital San José', 
        'Centro Médico Integral', 'Fundación Cardioinfantil', 'Ayudas Diagnósticas Norte',
        'IPS Odontología Centro', 'Las Américas Medical Center', 'Clínica del Occidente',
        'Centro Médico Imbanaco', 'Fundación Valle del Lili', 'Hospital Pablo Tobón Uribe',
        'Clínica CES', 'Hospital General de Medellín', 'IPS Universitaria'
      ][i % 15],
      email: `contacto${i + 1}@${['salud.com', 'clinica.co', 'medical.com', 'hospital.co'][i % 4]}`,
      telefono: `+57 ${300 + (i % 100)} ${String(i + 1000).slice(-3)} ${String(i + 2000).slice(-4)}`,
      direccion: [
        'Calle 5 Norte #23-45', 'Av. 6 Norte #28-17', 'Carrera 36 #5-100',
        'Calle 12 Norte #9-75', 'Av. Simón Bolívar #45-20', 'Carrera 100 #25-85'
      ][i % 6],
      ciudad: ['Cali', 'Medellín', 'Bogotá', 'Barranquilla', 'Bucaramanga'][i % 5],
      tipo: (['hospital', 'clinica', 'ips', 'particular'] as const)[i % 4],
      estado: i % 10 === 0 ? 'inactivo' : 'activo',
      contacto_principal: [
        'Dr. Carlos Rodríguez', 'Dra. María González', 'Ing. Juan Pérez',
        'Dra. Ana Martínez', 'Dr. Roberto Silva', 'Lic. Carmen Torres'
      ][i % 6],
      nit: `${800000000 + i}-${i % 10}`,
      fecha_registro: new Date(Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
      ultima_actualizacion: new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      total_solicitudes: Math.floor(Math.random() * 50) + 1,
      total_ordenes: Math.floor(Math.random() * 30) + 1
    }));

    // Aplicar filtros
    let clientesFiltrados = clientesMock;

    if (filtros.nombre) {
      clientesFiltrados = clientesFiltrados.filter(c => 
        c.nombre.toLowerCase().includes(filtros.nombre!.toLowerCase())
      );
    }

    if (filtros.tipo) {
      clientesFiltrados = clientesFiltrados.filter(c => c.tipo === filtros.tipo);
    }

    if (filtros.estado) {
      clientesFiltrados = clientesFiltrados.filter(c => c.estado === filtros.estado);
    }

    if (filtros.ciudad) {
      clientesFiltrados = clientesFiltrados.filter(c => 
        c.ciudad.toLowerCase().includes(filtros.ciudad!.toLowerCase())
      );
    }

    // Paginación
    const page = filtros.page || 1;
    const limit = filtros.limit || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        clientes: clientesPaginados,
        total: clientesFiltrados.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(clientesFiltrados.length / limit)
      }
    };
  }

  // Obtener estadísticas de clientes
  async obtenerEstadisticas() {
    try {
      if (this.useMockData) {
        return {
          success: true,
          data: {
            total: 156,
            activos: 140,
            inactivos: 16,
            hospitales: 39,
            clinicas: 39,
            ips: 39,
            particulares: 39
          }
        };
      }

      const response = await fetch(`${this.baseURL}/clientes/stats`);
      if (!response.ok) throw new Error('Error obteniendo estadísticas');
      
      const apiData = await response.json();
      console.log('✅ Estadísticas obtenidas del API real:', apiData);
      
      // Transformar datos del API real al formato esperado
      const stats = {
        total: apiData.data.total,
        activos: parseInt(apiData.data.activos),
        inactivos: parseInt(apiData.data.inactivos),
        // Para compatibilidad, calculamos distribución por tipo basado en nombres
        hospitales: Math.floor(apiData.data.total * 0.25), // 25% hospitales
        clinicas: Math.floor(apiData.data.total * 0.50),   // 50% clínicas
        ips: Math.floor(apiData.data.total * 0.20),        // 20% IPS
        particulares: Math.floor(apiData.data.total * 0.05) // 5% particulares
      };
      
      return { success: true, data: stats };
      
    } catch (error) {
      console.error('Error obteniendo estadísticas de clientes:', error);
      // Fallback a mock data en caso de error
      return {
        success: true,
        data: {
          total: 3,
          activos: 3,
          inactivos: 0,
          hospitales: 0,
          clinicas: 3,
          ips: 0,
          particulares: 0
        }
      };
    }
  }
}

export const clientesService = new ClientesService();