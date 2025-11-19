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
import { Progress } from "@/components/ui/progress";
import { 
  Search, Plus, Edit, Database, Calendar, Clock, Download, 
  Upload, Server, HardDrive, CheckCircle2, AlertCircle, 
  RotateCcw, Trash2, Play, Pause 
} from 'lucide-react';

interface Respaldo {
  id: number;
  nombre: string;
  tipo: 'automatico' | 'manual';
  estado: 'completado' | 'en_progreso' | 'error' | 'cancelado';
  tamaño: number; // en MB
  fecha_creacion: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  duracion?: number; // en segundos
  archivo_path: string;
  descripcion?: string;
  tablas_incluidas: string[];
  compresion: boolean;
  creado_por?: string;
  error_mensaje?: string;
}

interface ConfiguracionRespaldo {
  id: number;
  nombre: string;
  descripcion?: string;
  frecuencia: 'diario' | 'semanal' | 'mensual';
  hora_ejecucion: string;
  dias_semana?: number[]; // 0=domingo, 1=lunes, etc.
  dia_mes?: number; // para respaldos mensuales
  retener_dias: number;
  compresion: boolean;
  tablas_incluir: 'todas' | 'seleccionadas';
  tablas_seleccionadas: string[];
  activo: boolean;
  ultimo_respaldo?: string;
  proximo_respaldo?: string;
}

export default function RespaldosPage() {
  const [respaldos, setRespaldos] = useState<Respaldo[]>([]);
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionRespaldo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [respaldoEnProgreso, setRespaldoEnProgreso] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const [newRespaldo, setNewRespaldo] = useState({
    nombre: '',
    descripcion: '',
    tablas_incluir: 'todas' as 'todas' | 'seleccionadas',
    tablas_seleccionadas: [] as string[],
    compresion: true
  });

  const [newConfiguracion, setNewConfiguracion] = useState({
    nombre: '',
    descripcion: '',
    frecuencia: 'diario' as ConfiguracionRespaldo['frecuencia'],
    hora_ejecucion: '02:00',
    dias_semana: [1, 2, 3, 4, 5], // Lunes a viernes
    dia_mes: 1,
    retener_dias: 30,
    compresion: true,
    tablas_incluir: 'todas' as 'todas' | 'seleccionadas',
    tablas_seleccionadas: [] as string[]
  });

  // Datos de fallback
  const respaldosFallback: Respaldo[] = [
    {
      id: 1, nombre: 'Respaldo Automático Diario', tipo: 'automatico', estado: 'completado',
      tamaño: 245.8, fecha_creacion: '2024-12-20T02:00:00Z', fecha_inicio: '2024-12-20T02:00:00Z',
      fecha_fin: '2024-12-20T02:15:30Z', duracion: 930, archivo_path: '/backups/backup_20241220_020000.sql.gz',
      descripcion: 'Respaldo automático programado', tablas_incluidas: ['todas'], compresion: true,
      creado_por: 'Sistema'
    },
    {
      id: 2, nombre: 'Respaldo Pre-Actualización', tipo: 'manual', estado: 'completado',
      tamaño: 243.2, fecha_creacion: '2024-12-19T16:30:00Z', fecha_inicio: '2024-12-19T16:30:00Z',
      fecha_fin: '2024-12-19T16:42:15Z', duracion: 735, archivo_path: '/backups/backup_pre_update_20241219.sql.gz',
      descripcion: 'Respaldo antes de actualización del sistema', tablas_incluidas: ['todas'], compresion: true,
      creado_por: 'Admin'
    },
    {
      id: 3, nombre: 'Respaldo Semanal', tipo: 'automatico', estado: 'en_progreso',
      tamaño: 0, fecha_creacion: '2024-12-20T12:00:00Z', fecha_inicio: '2024-12-20T12:00:00Z',
      archivo_path: '/backups/backup_semanal_20241220.sql.gz',
      descripcion: 'Respaldo semanal completo', tablas_incluidas: ['todas'], compresion: true,
      creado_por: 'Sistema'
    },
    {
      id: 4, nombre: 'Respaldo Mensual Noviembre', tipo: 'automatico', estado: 'error',
      tamaño: 0, fecha_creacion: '2024-11-30T23:00:00Z', fecha_inicio: '2024-11-30T23:00:00Z',
      archivo_path: '/backups/backup_mensual_202411.sql.gz',
      descripcion: 'Respaldo mensual de noviembre', tablas_incluidas: ['todas'], compresion: true,
      creado_por: 'Sistema', error_mensaje: 'Espacio insuficiente en disco'
    }
  ];

  const configuracionesFallback: ConfiguracionRespaldo[] = [
    {
      id: 1, nombre: 'Respaldo Diario', descripcion: 'Respaldo automático todos los días a las 2 AM',
      frecuencia: 'diario', hora_ejecucion: '02:00', retener_dias: 7, compresion: true,
      tablas_incluir: 'todas', tablas_seleccionadas: [], activo: true,
      ultimo_respaldo: '2024-12-20T02:00:00Z', proximo_respaldo: '2024-12-21T02:00:00Z'
    },
    {
      id: 2, nombre: 'Respaldo Semanal', descripcion: 'Respaldo semanal los domingos',
      frecuencia: 'semanal', hora_ejecucion: '01:00', dias_semana: [0], retener_dias: 30,
      compresion: true, tablas_incluir: 'todas', tablas_seleccionadas: [], activo: true,
      ultimo_respaldo: '2024-12-15T01:00:00Z', proximo_respaldo: '2024-12-22T01:00:00Z'
    },
    {
      id: 3, nombre: 'Respaldo Mensual', descripcion: 'Respaldo mensual el primer día del mes',
      frecuencia: 'mensual', hora_ejecucion: '00:00', dia_mes: 1, retener_dias: 365,
      compresion: true, tablas_incluir: 'todas', tablas_seleccionadas: [], activo: true,
      ultimo_respaldo: '2024-12-01T00:00:00Z', proximo_respaldo: '2025-01-01T00:00:00Z'
    }
  ];

  const tablasDisponibles = [
    'usuarios', 'clientes', 'equipos', 'solicitudes', 'ordenes', 'visitas',
    'cotizaciones', 'repuestos', 'tipos_equipos', 'marcas', 'estados', 'prioridades'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRespaldos(respaldosFallback);
      setConfiguraciones(configuracionesFallback);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRespaldos = respaldos.filter(respaldo => {
    const matchesSearch = respaldo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         respaldo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !selectedTipo || respaldo.tipo === selectedTipo;
    const matchesEstado = !selectedEstado || respaldo.estado === selectedEstado;
    return matchesSearch && matchesTipo && matchesEstado;
  });

  const handleCreateRespaldo = async () => {
    console.log('Crear respaldo manual:', newRespaldo);
    setRespaldoEnProgreso(true);
    setProgreso(0);
    
    // Simular progreso del respaldo
    const interval = setInterval(() => {
      setProgreso(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRespaldoEnProgreso(false);
          setIsCreateDialogOpen(false);
          // Aquí se agregaría el nuevo respaldo a la lista
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const getEstadoColor = (estado: Respaldo['estado']) => {
    switch (estado) {
      case 'completado': return 'bg-green-100 text-green-800';
      case 'en_progreso': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: Respaldo['estado']) => {
    switch (estado) {
      case 'completado': return <CheckCircle2 className="w-4 h-4" />;
      case 'en_progreso': return <RotateCcw className="w-4 h-4 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'cancelado': return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB === 0) return 'N/A';
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)} MB`;
    return `${(sizeInMB / 1024).toFixed(2)} GB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const totalRespaldos = respaldos.length;
  const respaldosCompletados = respaldos.filter(r => r.estado === 'completado').length;
  const espacioUsado = respaldos.reduce((sum, r) => sum + r.tamaño, 0);
  const configuracionesActivas = configuraciones.filter(c => c.activo).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Respaldos</h1>
          <p className="text-gray-600 mt-1">Gestione los respaldos automáticos y manuales de la base de datos</p>
        </div>
        
        <div className="flex space-x-3">
          <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Configurar Automático
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Configurar Respaldo Automático</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="config-nombre">Nombre *</Label>
                    <Input
                      id="config-nombre"
                      value={newConfiguracion.nombre}
                      onChange={(e) => setNewConfiguracion({...newConfiguracion, nombre: e.target.value})}
                      placeholder="Respaldo Diario"
                    />
                  </div>
                  <div>
                    <Label htmlFor="config-frecuencia">Frecuencia *</Label>
                    <Select
                      value={newConfiguracion.frecuencia}
                      onValueChange={(value: any) => setNewConfiguracion({...newConfiguracion, frecuencia: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diario</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensual">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="config-descripcion">Descripción</Label>
                  <Textarea
                    id="config-descripcion"
                    value={newConfiguracion.descripcion}
                    onChange={(e) => setNewConfiguracion({...newConfiguracion, descripcion: e.target.value})}
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="config-hora">Hora de Ejecución</Label>
                    <Input
                      id="config-hora"
                      type="time"
                      value={newConfiguracion.hora_ejecucion}
                      onChange={(e) => setNewConfiguracion({...newConfiguracion, hora_ejecucion: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="config-retener">Retener por (días)</Label>
                    <Input
                      id="config-retener"
                      type="number"
                      min="1"
                      value={newConfiguracion.retener_dias}
                      onChange={(e) => setNewConfiguracion({...newConfiguracion, retener_dias: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="config-compresion"
                    checked={newConfiguracion.compresion}
                    onCheckedChange={(checked) => setNewConfiguracion({...newConfiguracion, compresion: checked})}
                  />
                  <Label htmlFor="config-compresion">Comprimir respaldos</Label>
                </div>
                
                <Button onClick={() => {
                  console.log('Crear configuración:', newConfiguracion);
                  setIsConfigDialogOpen(false);
                }} className="w-full">
                  Guardar Configuración
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Respaldo Manual
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Respaldo Manual</DialogTitle>
              </DialogHeader>
              
              {respaldoEnProgreso ? (
                <div className="space-y-4 py-6">
                  <div className="text-center">
                    <RotateCcw className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold">Creando Respaldo...</h3>
                    <p className="text-gray-600">Por favor espere mientras se completa el proceso</p>
                  </div>
                  <Progress value={progreso} className="w-full" />
                  <p className="text-center text-sm text-gray-600">{Math.round(progreso)}% completado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre del Respaldo *</Label>
                    <Input
                      id="nombre"
                      value={newRespaldo.nombre}
                      onChange={(e) => setNewRespaldo({...newRespaldo, nombre: e.target.value})}
                      placeholder="Respaldo Manual YYYY-MM-DD"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={newRespaldo.descripcion}
                      onChange={(e) => setNewRespaldo({...newRespaldo, descripcion: e.target.value})}
                      placeholder="Motivo o descripción del respaldo..."
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label>Tablas a Incluir</Label>
                    <Select
                      value={newRespaldo.tablas_incluir}
                      onValueChange={(value: any) => setNewRespaldo({...newRespaldo, tablas_incluir: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas las tablas</SelectItem>
                        <SelectItem value="seleccionadas">Tablas seleccionadas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newRespaldo.tablas_incluir === 'seleccionadas' && (
                    <div>
                      <Label>Seleccionar Tablas</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                        {tablasDisponibles.map(tabla => (
                          <label key={tabla} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={newRespaldo.tablas_seleccionadas.includes(tabla)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewRespaldo({
                                    ...newRespaldo,
                                    tablas_seleccionadas: [...newRespaldo.tablas_seleccionadas, tabla]
                                  });
                                } else {
                                  setNewRespaldo({
                                    ...newRespaldo,
                                    tablas_seleccionadas: newRespaldo.tablas_seleccionadas.filter(t => t !== tabla)
                                  });
                                }
                              }}
                            />
                            <span>{tabla}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="compresion"
                      checked={newRespaldo.compresion}
                      onCheckedChange={(checked) => setNewRespaldo({...newRespaldo, compresion: checked})}
                    />
                    <Label htmlFor="compresion">Comprimir archivo</Label>
                  </div>
                  
                  <Button onClick={handleCreateRespaldo} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Respaldo
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalRespaldos}</p>
                <p className="text-sm text-gray-600">Total Respaldos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{respaldosCompletados}</p>
                <p className="text-sm text-gray-600">Completados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(espacioUsado)}</p>
                <p className="text-sm text-gray-600">Espacio Usado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{configuracionesActivas}</p>
                <p className="text-sm text-gray-600">Programados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar respaldos..."
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
                <SelectItem value="automatico">Automático</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="en_progreso">En Progreso</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de respaldos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Respaldos</CardTitle>
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
                    <TableHead>Respaldo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRespaldos.map((respaldo) => (
                    <TableRow key={respaldo.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{respaldo.nombre}</div>
                          {respaldo.descripcion && (
                            <div className="text-sm text-gray-500">{respaldo.descripcion}</div>
                          )}
                          {respaldo.error_mensaje && (
                            <div className="text-sm text-red-600 mt-1">
                              Error: {respaldo.error_mensaje}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {respaldo.tipo === 'automatico' ? 'Automático' : 'Manual'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEstadoColor(respaldo.estado)}>
                          <div className="flex items-center space-x-1">
                            {getEstadoIcon(respaldo.estado)}
                            <span>
                              {respaldo.estado === 'completado' ? 'Completado' :
                               respaldo.estado === 'en_progreso' ? 'En Progreso' :
                               respaldo.estado === 'error' ? 'Error' : 'Cancelado'}
                            </span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(respaldo.tamaño)}</TableCell>
                      <TableCell>{formatDuration(respaldo.duracion)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(respaldo.fecha_creacion).toLocaleDateString('es-ES')}</div>
                          <div className="text-gray-500">
                            {new Date(respaldo.fecha_creacion).toLocaleTimeString('es-ES')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {respaldo.estado === 'completado' && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
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

      {/* Configuraciones de respaldo automático */}
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones de Respaldo Automático</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configuraciones.map((config) => (
              <div key={config.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">{config.nombre}</h3>
                      <Badge className={config.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {config.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Badge variant="outline">
                        {config.frecuencia.charAt(0).toUpperCase() + config.frecuencia.slice(1)}
                      </Badge>
                    </div>
                    
                    {config.descripcion && (
                      <p className="text-sm text-gray-600 mt-1">{config.descripcion}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Hora:</span> {config.hora_ejecucion}
                      </div>
                      <div>
                        <span className="text-gray-500">Retener:</span> {config.retener_dias} días
                      </div>
                      <div>
                        <span className="text-gray-500">Último:</span> {' '}
                        {config.ultimo_respaldo 
                          ? new Date(config.ultimo_respaldo).toLocaleDateString('es-ES')
                          : 'Nunca'
                        }
                      </div>
                      <div>
                        <span className="text-gray-500">Próximo:</span> {' '}
                        {config.proximo_respaldo 
                          ? new Date(config.proximo_respaldo).toLocaleDateString('es-ES')
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={config.activo ? 'text-red-600' : 'text-green-600'}
                    >
                      {config.activo ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}