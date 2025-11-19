export interface User {
  id: number;
  usuario: string;
  clave: string;
  nombre: string;
  email?: string;
  activo: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserRole {
  id: number;
  id_usuario: number;
  role_type: 'admin' | 'tecnico' | 'analista' | 'coordinador' | 'comercial';
  activo: number;
}

export interface Session {
  id: number;
  id_usuario: number;
  token?: string;
  created_at: Date;
  expires_at?: Date;
  active: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  documento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo: number;
}

export interface Sede {
  id: number;
  id_cliente: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  contacto?: string;
  activo: number;
}

export interface Orden {
  id: number;
  id_sede: number;
  id_equipo?: number;
  id_tecnico?: number;
  titulo: string;
  descripcion?: string;
  fecha_creacion: Date;
  fecha_programada?: Date;
  fecha_cierre?: Date;
  estado: 'abierta' | 'en_proceso' | 'cerrada' | 'anulada';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  tipo: 'correctivo' | 'preventivo' | 'instalacion';
}

export interface Equipo {
  id: number;
  id_sede: number;
  nombre: string;
  marca?: string;
  modelo?: string;
  serie?: string;
  ubicacion?: string;
  activo: number;
}

export interface Visita {
  id: number;
  id_orden: number;
  id_tecnico: number;
  fecha_visita: Date;
  hora_inicio?: string;
  hora_fin?: string;
  observaciones?: string;
  firma_cliente?: string;
  estado: 'programada' | 'ejecutada' | 'cancelada';
}

export interface Cotizacion {
  id: number;
  id_orden?: number;
  id_cliente: number;
  numero_cotizacion: string;
  fecha_cotizacion: Date;
  fecha_vencimiento?: Date;
  total: number;
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada';
  observaciones?: string;
}

export interface Page {
  id: number;
  parent_id?: number;
  title: string;
  url: string;
  content: string;
  parameters?: string;
  content_only: number;
  per_todos: number;
  per_analista: number;
  per_tecnico: number;
  per_coordinador: number;
  per_comercial: number;
}