'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Plus, Edit, Bell, BellRing, Mail, MessageSquare,
  Settings, Users, Calendar, Clock, Send, Eye, Trash2,
  CheckCircle2, XCircle, AlertTriangle, Info, Smartphone,
  Monitor, Volume2, Vibrate
} from 'lucide-react';

interface PlantillaNotificacion {
  id: number;
  nombre: string;
  tipo: 'email' | 'sms' | 'push' | 'sistema';
  evento: string;
  asunto?: string;
  contenido: string;
  variables_disponibles: string[];
  activa: boolean;
  creada_por: string;
  fecha_creacion: string;
  ultima_modificacion?: string;
}

interface ConfiguracionNotificacion {
  id: number;
  usuario_id?: number;
  usuario_email?: string;
  usuario_nombre?: string;
  evento: string;
  canales: ('email' | 'sms' | 'push' | 'sistema')[];
  activo: boolean;
  horario_inicio?: string;
  horario_fin?: string;
  dias_semana?: number[];
  frecuencia_maxima?: number; // minutos entre notificaciones del mismo tipo
}

interface NotificacionEnviada {
  id: number;
  plantilla_id: number;
  plantilla_nombre: string;
  destinatario: string;
  canal: 'email' | 'sms' | 'push' | 'sistema';
  estado: 'enviado' | 'pendiente' | 'error' | 'leido';
  fecha_envio: string;
  fecha_leido?: string;
  error_mensaje?: string;
  datos_contexto?: any;
}

export default function NotificacionesPage() {
  const [plantillas, setPlantillas] = useState<PlantillaNotificacion[]>([]);
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionNotificacion[]>([]);
  const [historial, setHistorial] = useState<NotificacionEnviada[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('plantillas');

  const [newPlantilla, setNewPlantilla] = useState({
    nombre: '',
    tipo: 'email' as PlantillaNotificacion['tipo'],
    evento: '',
    asunto: '',
    contenido: '',
    activa: true
  });

  // Datos de fallback
  const plantillasFallback: PlantillaNotificacion[] = [
    {
      id: 1, nombre: 'Nueva Solicitud de Servicio', tipo: 'email', evento: 'solicitud_creada',
      asunto: 'Nueva Solicitud: {{solicitud_numero}}', 
      contenido: `Estimado {{tecnico_nombre}},\n\nSe ha creado una nueva solicitud de servicio:\n\nNúmero: {{solicitud_numero}}\nCliente: {{cliente_nombre}}\nEquipo: {{equipo_descripcion}}\nPrioridad: {{prioridad}}\n\nPor favor, revise y procese la solicitud.\n\nSaludos,\nSistema ZIRIUS`,
      variables_disponibles: ['solicitud_numero', 'cliente_nombre', 'equipo_descripcion', 'prioridad', 'tecnico_nombre'],
      activa: true, creada_por: 'admin@zirius.com', fecha_creacion: '2024-12-15T10:00:00Z',
      ultima_modificacion: '2024-12-18T14:30:00Z'
    },
    {
      id: 2, nombre: 'Orden de Trabajo Asignada', tipo: 'push', evento: 'orden_asignada',
      contenido: 'Se le ha asignado una nueva orden de trabajo: {{orden_numero}} para {{cliente_nombre}}',
      variables_disponibles: ['orden_numero', 'cliente_nombre', 'tecnico_nombre', 'fecha_programada'],
      activa: true, creada_por: 'admin@zirius.com', fecha_creacion: '2024-12-16T09:15:00Z'
    },
    {
      id: 3, nombre: 'Recordatorio de Mantenimiento', tipo: 'email', evento: 'mantenimiento_programado',
      asunto: 'Recordatorio: Mantenimiento Programado - {{equipo_serie}}',
      contenido: `Estimado {{cliente_nombre}},\n\nLe recordamos que tiene programado un mantenimiento preventivo:\n\nEquipo: {{equipo_descripcion}}\nSerie: {{equipo_serie}}\nFecha: {{fecha_programada}}\nTécnico: {{tecnico_nombre}}\n\nPor favor, asegúrese de tener el equipo disponible.\n\nSaludos cordiales,\nEquipo ZIRIUS`,
      variables_disponibles: ['cliente_nombre', 'equipo_descripcion', 'equipo_serie', 'fecha_programada', 'tecnico_nombre'],
      activa: true, creada_por: 'admin@zirius.com', fecha_creacion: '2024-12-14T16:45:00Z'
    },
    {
      id: 4, nombre: 'Notificación de Estado Crítico', tipo: 'sms', evento: 'equipo_estado_critico',
      contenido: 'ALERTA: El equipo {{equipo_serie}} presenta estado crítico. Requiere atención inmediata.',
      variables_disponibles: ['equipo_serie', 'equipo_descripcion', 'cliente_nombre', 'estado_actual'],
      activa: true, creada_por: 'admin@zirius.com', fecha_creacion: '2024-12-17T11:20:00Z'
    },
    {
      id: 5, nombre: 'Respaldo Completado', tipo: 'sistema', evento: 'respaldo_completado',
      contenido: 'El respaldo automático se ha completado exitosamente. Archivo: {{archivo_respaldo}}, Tamaño: {{tamaño}}',
      variables_disponibles: ['archivo_respaldo', 'tamaño', 'duracion', 'fecha_respaldo'],
      activa: true, creada_por: 'sistema', fecha_creacion: '2024-12-12T02:00:00Z'
    }
  ];

  const configuracionesFallback: ConfiguracionNotificacion[] = [
    {
      id: 1, usuario_email: 'admin@zirius.com', usuario_nombre: 'Administrador',
      evento: 'solicitud_creada', canales: ['email', 'push'], activo: true,
      horario_inicio: '08:00', horario_fin: '18:00', dias_semana: [1, 2, 3, 4, 5], frecuencia_maxima: 15
    },
    {
      id: 2, usuario_email: 'tecnico1@zirius.com', usuario_nombre: 'Técnico Principal',
      evento: 'orden_asignada', canales: ['push', 'sms'], activo: true,
      frecuencia_maxima: 5
    },
    {
      id: 3, usuario_email: 'cliente@empresa.com', usuario_nombre: 'Cliente Empresa XYZ',
      evento: 'mantenimiento_programado', canales: ['email'], activo: true,
      horario_inicio: '09:00', horario_fin: '17:00', dias_semana: [1, 2, 3, 4, 5]
    }
  ];

  const historialFallback: NotificacionEnviada[] = [
    {
      id: 1, plantilla_id: 1, plantilla_nombre: 'Nueva Solicitud de Servicio',
      destinatario: 'tecnico1@zirius.com', canal: 'email', estado: 'leido',
      fecha_envio: '2024-12-20T10:30:00Z', fecha_leido: '2024-12-20T10:45:00Z',
      datos_contexto: { solicitud_numero: 'SOL-2024-001', cliente_nombre: 'Empresa XYZ' }
    },
    {
      id: 2, plantilla_id: 2, plantilla_nombre: 'Orden de Trabajo Asignada',
      destinatario: 'tecnico1@zirius.com', canal: 'push', estado: 'enviado',
      fecha_envio: '2024-12-20T09:15:00Z',
      datos_contexto: { orden_numero: 'ORD-2024-015', cliente_nombre: 'Hospital Central' }
    },
    {
      id: 3, plantilla_id: 4, plantilla_nombre: 'Notificación de Estado Crítico',
      destinatario: '+57300123456', canal: 'sms', estado: 'error',
      fecha_envio: '2024-12-20T08:20:00Z', error_mensaje: 'Número telefónico inválido',
      datos_contexto: { equipo_serie: 'EQ-001', cliente_nombre: 'Clínica Norte' }
    },
    {
      id: 4, plantilla_id: 3, plantilla_nombre: 'Recordatorio de Mantenimiento',
      destinatario: 'cliente@empresa.com', canal: 'email', estado: 'enviado',
      fecha_envio: '2024-12-19T16:00:00Z',
      datos_contexto: { cliente_nombre: 'Empresa ABC', fecha_programada: '2024-12-22' }
    }
  ];

  const eventosDisponibles = [
    { value: 'solicitud_creada', label: 'Solicitud Creada' },
    { value: 'orden_asignada', label: 'Orden Asignada' },
    { value: 'mantenimiento_programado', label: 'Mantenimiento Programado' },
    { value: 'equipo_estado_critico', label: 'Estado Crítico de Equipo' },
    { value: 'respaldo_completado', label: 'Respaldo Completado' },
    { value: 'usuario_login', label: 'Inicio de Sesión' },
    { value: 'cotizacion_aprobada', label: 'Cotización Aprobada' },
    { value: 'visita_completada', label: 'Visita Completada' }
  ];

  const variablesComunes = {
    'solicitud_creada': ['solicitud_numero', 'cliente_nombre', 'equipo_descripcion', 'prioridad', 'tecnico_nombre'],
    'orden_asignada': ['orden_numero', 'cliente_nombre', 'tecnico_nombre', 'fecha_programada'],
    'mantenimiento_programado': ['cliente_nombre', 'equipo_descripcion', 'equipo_serie', 'fecha_programada', 'tecnico_nombre'],
    'equipo_estado_critico': ['equipo_serie', 'equipo_descripcion', 'cliente_nombre', 'estado_actual'],
    'respaldo_completado': ['archivo_respaldo', 'tamaño', 'duracion', 'fecha_respaldo']
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPlantillas(plantillasFallback);
      setConfiguraciones(configuracionesFallback);
      setHistorial(historialFallback);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlantillas = plantillas.filter(plantilla => {
    const matchesSearch = plantilla.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plantilla.evento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !selectedTipo || plantilla.tipo === selectedTipo;
    return matchesSearch && matchesTipo;
  });

  const filteredHistorial = historial.filter(notif => {
    const matchesSearch = notif.plantilla_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.destinatario.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !selectedEstado || notif.estado === selectedEstado;
    return matchesSearch && matchesEstado;
  });

  const handleCreatePlantilla = async () => {
    console.log('Crear plantilla:', newPlantilla);
    setIsCreateDialogOpen(false);
    // Aquí se integraría con la API
  };

  const getTipoIcon = (tipo: PlantillaNotificacion['tipo']) => {
    switch (tipo) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
      case 'sistema': return <Monitor className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getEstadoColor = (estado: NotificacionEnviada['estado']) => {
    switch (estado) {
      case 'enviado': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'leido': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: NotificacionEnviada['estado']) => {
    switch (estado) {
      case 'enviado': return <Send className="w-4 h-4" />;
      case 'pendiente': return <Clock className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'leido': return <Eye className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const totalPlantillas = plantillas.length;
  const plantillasActivas = plantillas.filter(p => p.activa).length;
  const notificacionesEnviadas = historial.length;
  const notificacionesError = historial.filter(h => h.estado === 'error').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Notificaciones</h1>
          <p className="text-gray-600 mt-1">Gestione plantillas, configuraciones y historial de notificaciones</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Plantilla de Notificación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={newPlantilla.nombre}
                    onChange={(e) => setNewPlantilla({...newPlantilla, nombre: e.target.value})}
                    placeholder="Nombre de la plantilla"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={newPlantilla.tipo}
                    onValueChange={(value: any) => setNewPlantilla({...newPlantilla, tipo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="sistema">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="evento">Evento *</Label>
                <Select
                  value={newPlantilla.evento}
                  onValueChange={(value) => setNewPlantilla({...newPlantilla, evento: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventosDisponibles.map(evento => (
                      <SelectItem key={evento.value} value={evento.value}>
                        {evento.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(newPlantilla.tipo === 'email') && (
                <div>
                  <Label htmlFor="asunto">Asunto</Label>
                  <Input
                    id="asunto"
                    value={newPlantilla.asunto}
                    onChange={(e) => setNewPlantilla({...newPlantilla, asunto: e.target.value})}
                    placeholder="Asunto del email"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="contenido">Contenido *</Label>
                <Textarea
                  id="contenido"
                  value={newPlantilla.contenido}
                  onChange={(e) => setNewPlantilla({...newPlantilla, contenido: e.target.value})}
                  placeholder="Contenido de la notificación..."
                  rows={6}
                />
                <div className="mt-2 text-sm text-gray-600">
                  Variables disponibles: {variablesComunes[newPlantilla.evento as keyof typeof variablesComunes]?.map(v => `{{${v}}}`).join(', ')}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="activa"
                  checked={newPlantilla.activa}
                  onCheckedChange={(checked) => setNewPlantilla({...newPlantilla, activa: checked})}
                />
                <Label htmlFor="activa">Plantilla activa</Label>
              </div>
              
              <Button onClick={handleCreatePlantilla} className="w-full">
                Crear Plantilla
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalPlantillas}</p>
                <p className="text-sm text-gray-600">Plantillas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BellRing className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{plantillasActivas}</p>
                <p className="text-sm text-gray-600">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Send className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{notificacionesEnviadas}</p>
                <p className="text-sm text-gray-600">Enviadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{notificacionesError}</p>
                <p className="text-sm text-gray-600">Errores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal con tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          <TabsTrigger value="configuraciones">Configuraciones</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="plantillas" className="space-y-4">
          {/* Filtros para plantillas */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar plantillas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="sistema">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de plantillas */}
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Notificación</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plantilla</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Evento</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Modificada</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlantillas.map((plantilla) => (
                        <TableRow key={plantilla.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{plantilla.nombre}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {plantilla.contenido.substring(0, 100)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                              {getTipoIcon(plantilla.tipo)}
                              <span className="capitalize">{plantilla.tipo}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {eventosDisponibles.find(e => e.value === plantilla.evento)?.label || plantilla.evento}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={plantilla.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {plantilla.activa ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {plantilla.ultima_modificacion 
                                ? new Date(plantilla.ultima_modificacion).toLocaleDateString('es-ES')
                                : new Date(plantilla.fecha_creacion).toLocaleDateString('es-ES')
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuraciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuraciones de Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configuraciones.map((config) => (
                  <div key={config.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-gray-500" />
                          <span className="font-semibold">{config.usuario_nombre}</span>
                          <Badge className={config.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {config.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{config.usuario_email}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Evento:</span>
                        <Badge variant="secondary" className="ml-2">
                          {eventosDisponibles.find(e => e.value === config.evento)?.label || config.evento}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Canales:</span>
                        <div className="flex space-x-1 mt-1">
                          {config.canales.map(canal => (
                            <Badge key={canal} variant="outline" className="flex items-center space-x-1">
                              {getTipoIcon(canal)}
                              <span className="capitalize">{canal}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Horario:</span>
                        <p className="text-gray-600">
                          {config.horario_inicio && config.horario_fin 
                            ? `${config.horario_inicio} - ${config.horario_fin}`
                            : 'Cualquier hora'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="space-y-4">
          {/* Filtros para historial */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar en historial..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="leido">Leído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Historial de notificaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Notificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredHistorial.map((notif) => (
                  <div key={notif.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getEstadoColor(notif.estado)}>
                            <div className="flex items-center space-x-1">
                              {getEstadoIcon(notif.estado)}
                              <span className="capitalize">{notif.estado}</span>
                            </div>
                          </Badge>
                          <Badge variant="outline" className="flex items-center space-x-1">
                            {getTipoIcon(notif.canal)}
                            <span className="capitalize">{notif.canal}</span>
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold">{notif.plantilla_nombre}</h3>
                        <p className="text-sm text-gray-600 mb-2">Destinatario: {notif.destinatario}</p>
                        
                        {notif.error_mensaje && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded mb-2">
                            Error: {notif.error_mensaje}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(notif.fecha_envio).toLocaleString('es-ES')}</span>
                          </div>
                          {notif.fecha_leido && (
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>Leído: {new Date(notif.fecha_leido).toLocaleString('es-ES')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}