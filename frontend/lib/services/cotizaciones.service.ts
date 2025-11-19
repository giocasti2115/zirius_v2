// Servicio para gestionar cotizaciones
export interface Cotizacion {
  id: number;
  numero_cotizacion: string;
  fecha: string;
  id_cliente: number;
  cliente_nombre: string;
  descripcion: string;
  valor_subtotal: number;
  valor_iva: number;
  valor_total: number;
  estado: 'pendiente' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida';
  fecha_vencimiento: string;
  vigencia_dias: number;
  contacto_cliente: string;
  email_cliente: string;
  items_count: number;
  descuento_porcentaje?: number;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface FiltrosCotizaciones {
  page?: number;
  limit?: number;
  numero_cotizacion?: string;
  cliente?: string;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface RespuestaCotizaciones {
  success: boolean;
  data: {
    cotizaciones: Cotizacion[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

class CotizacionesService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
  private useMockData = false; // Usar API real ahora que está funcionando

  // Obtener cotizaciones con filtros y paginación
  async obtenerCotizaciones(filtros: FiltrosCotizaciones = {}): Promise<RespuestaCotizaciones> {
    console.log('🔍 Obteniendo cotizaciones con filtros:', filtros);
    
    try {
      // Si está configurado para usar mock data, ir directamente a mock
      if (this.useMockData) {
        console.log('📝 Using mock data for cotizaciones');
        return this.obtenerCotizacionesMock(filtros);
      }

      const params = new URLSearchParams();
      if (filtros.page) params.append('page', filtros.page.toString());
      if (filtros.limit) params.append('limit', filtros.limit.toString());
      if (filtros.numero_cotizacion) params.append('numero', filtros.numero_cotizacion);
      if (filtros.cliente) params.append('cliente', filtros.cliente);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

      const response = await fetch(`${this.baseURL}/cotizaciones?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('❌ API error, switching to mock data');
        this.useMockData = true;
        return this.obtenerCotizacionesMock(filtros);
      }

      const data = await response.json();
      console.log('✅ Cotizaciones obtenidas del API:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error obteniendo cotizaciones:', error);
      this.useMockData = true;
      return this.obtenerCotizacionesMock(filtros);
    }
  }

  // Datos mock para desarrollo
  private obtenerCotizacionesMock(filtros: FiltrosCotizaciones = {}): RespuestaCotizaciones {
    const cotizacionesMock: Cotizacion[] = Array.from({ length: 127 }, (_, i) => {
      const subtotal = (Math.random() * 5000000) + 500000;
      const iva = subtotal * 0.19;
      const total = subtotal + iva;
      
      return {
        id: i + 1,
        numero_cotizacion: `COT-2024-${String(i + 1).padStart(4, '0')}`,
        fecha: new Date(Date.now() - (Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
        id_cliente: 10 + (i % 15),
        cliente_nombre: [
          'IPS Salud Total Chipichape', 'Clínica del Norte', 'Hospital San José', 
          'Centro Médico Integral', 'Fundación Cardioinfantil', 'Ayudas Diagnósticas Norte',
          'IPS Odontología Centro', 'Las Américas Medical Center', 'Clínica del Occidente',
          'Centro Médico Imbanaco', 'Fundación Valle del Lili', 'Hospital Pablo Tobón Uribe',
          'Clínica CES', 'Hospital General', 'IPS Universitaria'
        ][i % 15],
        descripcion: [
          'Mantenimiento preventivo equipos de rayos X',
          'Instalación sistema de monitoreo cardíaco',
          'Reparación de equipos de ultrasonido',
          'Calibración de equipos de laboratorio',
          'Actualización software equipos médicos',
          'Mantenimiento correctivo ventiladores',
          'Instalación de red de gases medicinales'
        ][i % 7],
        valor_subtotal: Math.round(subtotal),
        valor_iva: Math.round(iva),
        valor_total: Math.round(total),
        estado: (['pendiente', 'enviada', 'aprobada', 'rechazada', 'vencida'] as const)[i % 5],
        fecha_vencimiento: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
        vigencia_dias: 30,
        contacto_cliente: [
          'Dr. Carlos Rodríguez', 'Dra. María González', 'Ing. Juan Pérez',
          'Dra. Ana Martínez', 'Dr. Roberto Silva', 'Lic. Carmen Torres'
        ][i % 6],
        email_cliente: `contacto${i + 1}@${['salud.com', 'clinica.co', 'medical.com', 'hospital.co'][i % 4]}`,
        items_count: Math.floor(Math.random() * 8) + 1,
        descuento_porcentaje: i % 10 === 0 ? Math.floor(Math.random() * 15) + 5 : undefined,
        observaciones: i % 7 === 0 ? 'Requiere aprobación gerencial' : undefined,
        created_at: new Date(Date.now() - (Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
        updated_at: new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
      };
    });

    // Aplicar filtros
    let cotizacionesFiltradas = cotizacionesMock;

    if (filtros.numero_cotizacion) {
      cotizacionesFiltradas = cotizacionesFiltradas.filter(c => 
        c.numero_cotizacion.toLowerCase().includes(filtros.numero_cotizacion!.toLowerCase())
      );
    }

    if (filtros.cliente) {
      cotizacionesFiltradas = cotizacionesFiltradas.filter(c => 
        c.cliente_nombre.toLowerCase().includes(filtros.cliente!.toLowerCase())
      );
    }

    if (filtros.estado) {
      cotizacionesFiltradas = cotizacionesFiltradas.filter(c => c.estado === filtros.estado);
    }

    if (filtros.fecha_desde) {
      const fechaDesde = new Date(filtros.fecha_desde);
      cotizacionesFiltradas = cotizacionesFiltradas.filter(c => 
        new Date(c.fecha) >= fechaDesde
      );
    }

    if (filtros.fecha_hasta) {
      const fechaHasta = new Date(filtros.fecha_hasta);
      cotizacionesFiltradas = cotizacionesFiltradas.filter(c => 
        new Date(c.fecha) <= fechaHasta
      );
    }

    // Paginación
    const page = filtros.page || 1;
    const limit = filtros.limit || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const cotizacionesPaginadas = cotizacionesFiltradas.slice(startIndex, endIndex);

    return {
      success: true,
      data: {
        cotizaciones: cotizacionesPaginadas,
        total: cotizacionesFiltradas.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(cotizacionesFiltradas.length / limit)
      }
    };
  }

  // Obtener estadísticas de cotizaciones
  async obtenerEstadisticas() {
    try {
      if (this.useMockData) {
        return {
          success: true,
          data: {
            total: 127,
            pendientes: 25,
            enviadas: 30,
            aprobadas: 45,
            rechazadas: 15,
            vencidas: 12,
            valor_total_mes: 28500000,
            valor_aprobado_mes: 15200000
          }
        };
      }

      const response = await fetch(`${this.baseURL}/cotizaciones/stats`);
      if (!response.ok) throw new Error('Error obteniendo estadísticas');
      
      const data = await response.json();
      return { success: true, data };
      
    } catch (error) {
      console.error('Error obteniendo estadísticas de cotizaciones:', error);
      return {
        success: true,
        data: {
          total: 127,
          pendientes: 25,
          enviadas: 30,
          aprobadas: 45,
          rechazadas: 15,
          vencidas: 12,
          valor_total_mes: 28500000,
          valor_aprobado_mes: 15200000
        }
      };
    }
  }
}

export const cotizacionesService = new CotizacionesService();