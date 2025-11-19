// Modelos TypeScript para BD Real - ZIRIUZ
// Basado en análisis de 62 tablas del backup

// ========================================
// CORE ENTITIES - Entidades Principales
// ========================================

export interface Cliente {
  id: number;
  nombre: string;
  documento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Sede {
  id: number;
  id_cliente: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  contacto?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  // Relaciones
  cliente?: Cliente;
}

export interface Equipo {
  id: number;
  id_sede: number;
  id_marca: number;
  id_modelo: number;
  id_tipo: number;
  id_clase: number;
  id_area: number;
  serie?: string;
  codigo?: string;
  fecha_instalacion?: Date;
  estado: 'activo' | 'mantenimiento' | 'inactivo';
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  // Relaciones
  sede?: Sede;
  marca?: Marca;
  modelo?: Modelo;
  tipo?: Tipo;
  clase?: Clase;
  area?: Area;
}

export interface Solicitud {
  id: number;
  id_cliente: number;
  id_sede: number;
  id_equipo?: number;
  id_usuario: number;
  tipo_solicitud: string;
  descripcion: string;
  fecha_solicitud: Date;
  fecha_requerida?: Date;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  estado: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  // Relaciones
  cliente?: Cliente;
  sede?: Sede;
  equipo?: Equipo;
  usuario?: Usuario;
  estado_info?: SolicitudEstado;
}

export interface Orden {
  id: number;
  id_solicitud: number;
  numero_orden: string;
  id_tecnico?: number;
  fecha_creacion: Date;
  fecha_programada?: Date;
  fecha_ejecucion?: Date;
  tipo_orden: string;
  descripcion?: string;
  observaciones?: string;
  tiempo_estimado?: number;
  estado: string;
  sub_estado?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  // Relaciones
  solicitud?: Solicitud;
  tecnico?: Usuario;
  estado_info?: OrdenEstado;
  sub_estado_info?: OrdenSubEstado;
  adjuntos?: OrdenAdjunto[];
  cambios?: OrdenCambio[];
}

export interface Visita {
  id: number;
  id_orden: number;
  id_tecnico: number;
  fecha_programada: Date;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  observaciones?: string;
  calificacion?: number;
  estado: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  // Relaciones
  orden?: Orden;
  tecnico?: Usuario;
  estado_info?: VisitaEstado;
  actividades?: Actividad[];
}

export interface Cotizacion {
  id: number;
  id_solicitud: number;
  numero_cotizacion: string;
  fecha_cotizacion: Date;
  fecha_vencimiento?: Date;
  valor_total: number;
  descripcion?: string;
  observaciones?: string;
  estado: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
  // Relaciones
  solicitud?: Solicitud;
  estado_info?: CotizacionEstado;
  repuestos?: CotizacionRepuesto[];
  items_adicionales?: CotizacionItemAdicional[];
}

// ========================================
// SUPPORT ENTITIES - Entidades de Soporte
// ========================================

export interface Marca {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Modelo {
  id: number;
  id_marca: number;
  nombre: string;
  activo: boolean;
  marca?: Marca;
}

export interface Tipo {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Clase {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Area {
  id: number;
  nombre: string;
  activo: boolean;
}

// ========================================
// STATE ENTITIES - Entidades de Estado
// ========================================

export interface SolicitudEstado {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  activo: boolean;
}

export interface OrdenEstado {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  activo: boolean;
}

export interface OrdenSubEstado {
  id: number;
  id_estado: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  estado?: OrdenEstado;
}

export interface VisitaEstado {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  activo: boolean;
}

export interface CotizacionEstado {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  activo: boolean;
}

// ========================================
// RELATED ENTITIES - Entidades Relacionadas
// ========================================

export interface OrdenAdjunto {
  id: number;
  id_orden: number;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo_archivo: string;
  tamaño: number;
  created_at: Date;
}

export interface OrdenCambio {
  id: number;
  id_orden: number;
  id_usuario: number;
  campo_modificado: string;
  valor_anterior?: string;
  valor_nuevo?: string;
  comentario?: string;
  created_at: Date;
}

export interface Actividad {
  id: number;
  id_visita: number;
  id_protocolo?: number;
  descripcion: string;
  fecha: Date;
  activo: boolean;
}

export interface CotizacionRepuesto {
  id: number;
  id_cotizacion: number;
  id_repuesto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface CotizacionItemAdicional {
  id: number;
  id_cotizacion: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// ========================================
// USER SYSTEM - Sistema de Usuarios
// ========================================

export interface Usuario {
  id: number;
  username: string;
  email?: string;
  password: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  role: 'admin' | 'tecnico' | 'analista' | 'coordinador' | 'comercial';
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

// Tipos especializados por rol
export interface Tecnico extends Usuario {
  role: 'tecnico';
  especialidades?: string[];
}

export interface Analista extends Usuario {
  role: 'analista';
  area_responsabilidad?: string;
}

export interface Coordinador extends Usuario {
  role: 'coordinador';
  zona_cobertura?: string;
}

export interface Comercial extends Usuario {
  role: 'comercial';
  meta_mensual?: number;
}

export interface Administrador extends Usuario {
  role: 'admin';
  permisos_especiales?: string[];
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    code?: string;
  };
  message?: string;
}

// ========================================
// DASHBOARD & STATS TYPES
// ========================================

export interface DashboardStats {
  equipos: {
    total: number;
    activos: number;
    mantenimiento: number;
    inactivos: number;
  };
  solicitudes: {
    total_solicitudes: number;
    pendientes: number;
    en_proceso: number;
    completadas: number;
    vencidas: number;
    por_tipo_solicitud: Array<{
      tipo_solicitud: string;
      cantidad: number;
    }>;
    por_cliente: Array<{
      cliente_nombre: string;
      total_solicitudes: number;
    }>;
  };
  ordenes: {
    total_ordenes: number;
    pendientes: number;
    en_proceso: number;
    ejecutadas: number;
  };
  visitas: {
    total_visitas: number;
    programadas: number;
    en_curso: number;
    completadas: number;
  };
  cotizaciones: {
    total_cotizaciones: number;
    borradores: number;
    enviadas: number;
    aprobadas: number;
    rechazadas: number;
  };
}