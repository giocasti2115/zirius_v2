'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  Monitor, 
  Settings, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Shield,
  Calendar,
  QrCode,
  Filter,
  Download,
  Building,
  MapPin,
  Wrench,
  ArrowLeft,
  Camera,
  BarChart3,
  NavigationIcon
} from 'lucide-react';
import Link from 'next/link';
import { equiposService, Equipo, EstadisticasEquipos } from '@/lib/services/equipos.service';

// Importar los nuevos componentes de equipos
import MapaEquipos from '@/components/equipos/MapaEquipos';
import QRMantenimientoEquipos from '@/components/equipos/QRMantenimientoEquipos';
import GaleriaFotosEquipo from '@/components/equipos/GaleriaFotosEquipo';
import DashboardEquiposRealTime from '@/components/equipos/DashboardEquiposRealTime';

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasEquipos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroSede, setFiltroSede] = useState<string>('');
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(25);
  const [totalRegistros, setTotalRegistros] = useState(0);
  
  // Estado para indicar si se están usando datos mock
  const [usandoDatosMock, setUsandoDatosMock] = useState(false);

  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);

  // **NUEVO: Estados para el sistema de pestañas avanzadas**
  const [vistaActiva, setVistaActiva] = useState<'inventario' | 'tracking' | 'mantenimiento' | 'fotos' | 'dashboard'>('inventario');

  useEffect(() => {
    cargarDatos();
  }, [paginaActual, registrosPorPagina]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado, filtroSede]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando equipos...');
      
      const [equiposData, estadisticasData] = await Promise.all([
        equiposService.obtenerEquipos({ 
          limit: registrosPorPagina,
          page: paginaActual,
          codigo_interno: busqueda || undefined,
          estado: filtroEstado ? parseInt(filtroEstado) : undefined,
          id_sede: filtroSede ? parseInt(filtroSede) : undefined
        }),
        equiposService.obtenerEstadisticas()
      ]);

      if (equiposData.success) {
        setEquipos(equiposData.data.equipos);
        setTotalRegistros(equiposData.data.total);
        
        // Detectar si se están usando datos mock (IDs altos = datos reales, IDs bajos = mock)
        const primerEquipo = equiposData.data.equipos[0];
        setUsandoDatosMock(primerEquipo && primerEquipo.id > 60000 ? false : true);
        
        console.log('✅ Equipos cargados:', equiposData.data.equipos.length);
      } else {
        setError('Error cargando equipos');
      }

      if (estadisticasData.success) {
        setEstadisticas(estadisticasData.data);
      }

    } catch (err) {
      console.error('❌ Error cargando datos equipos:', err);
      setError('Error conectando con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    cargarDatos();
  };

  // Funciones de paginación
  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
  const paginaAnterior = () => setPaginaActual(prev => Math.max(prev - 1, 1));
  const paginaSiguiente = () => setPaginaActual(prev => Math.min(prev + 1, totalPaginas));
  const irAPagina = (pagina: number) => setPaginaActual(pagina);

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'activo': return 'default'
      case 'mantenimiento': return 'destructive'
      case 'inactivo': return 'secondary'
      case 'dado_baja': return 'outline'
      default: return 'secondary'
    }
  }

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'activo': return 'Activo'
      case 'mantenimiento': return 'Mantenimiento'
      case 'inactivo': return 'Inactivo'
      case 'dado_baja': return 'Dado de Baja'
      default: return estado
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Vista detallada de equipo individual
  if (selectedEquipo) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedEquipo(null)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a la lista
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedEquipo.nombre}
            </h1>
            <p className="text-muted-foreground">
              Información detallada del equipo
            </p>
          </div>
        </div>

        {/* Equipment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Equipment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Información del Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nombre del Equipo
                </label>
                <p className="font-medium">{selectedEquipo.nombre}</p>
              </div>
              
              {selectedEquipo.codigo_interno && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Código Interno
                  </label>
                  <p className="font-medium">{selectedEquipo.codigo_interno}</p>
                </div>
              )}

              {selectedEquipo.serie && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Número de Serie
                  </label>
                  <p className="font-medium">{selectedEquipo.serie}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Estado Actual
                </label>
                <div className="mt-1">
                  <Badge variant={getEstadoBadgeVariant(selectedEquipo.estado)}>
                    {getEstadoLabel(selectedEquipo.estado)}
                  </Badge>
                </div>
              </div>

              {selectedEquipo.ubicacion && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ubicación
                  </label>
                  <p className="font-medium">{selectedEquipo.ubicacion}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Especificaciones Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEquipo.modelo_nombre && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Modelo
                  </label>
                  <p className="font-medium">{selectedEquipo.modelo_nombre}</p>
                </div>
              )}

              {selectedEquipo.marca_nombre && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Marca
                  </label>
                  <p className="font-medium">{selectedEquipo.marca_nombre}</p>
                </div>
              )}

              {selectedEquipo.tipo_nombre && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tipo de Equipo
                  </label>
                  <p className="font-medium">{selectedEquipo.tipo_nombre}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error de Conexión</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={cargarDatos} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏥 Gestión de Equipos Médicos</h1>
          <p className="text-sm text-gray-600">
            Sistema completo de tracking, mantenimiento y documentación de equipos biomédicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <QrCode className="w-4 h-4 mr-2" />
            Generar QR
          </Button>
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Equipo
          </Button>
        </div>
      </div>

      {/* **NUEVO: Sistema de Pestañas Avanzadas** */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { 
                  key: 'inventario', 
                  label: 'Inventario General', 
                  icon: Monitor,
                  description: 'Listado completo de equipos'
                },
                { 
                  key: 'tracking', 
                  label: 'Tracking GPS', 
                  icon: NavigationIcon,
                  description: 'Ubicación en tiempo real'
                },
                { 
                  key: 'mantenimiento', 
                  label: 'Mantenimientos QR', 
                  icon: Settings,
                  description: 'Sistema de check-in/out'
                },
                { 
                  key: 'fotos', 
                  label: 'Galería de Fotos', 
                  icon: Camera,
                  description: 'Documentación visual'
                },
                { 
                  key: 'dashboard', 
                  label: 'Dashboard en Tiempo Real', 
                  icon: BarChart3,
                  description: 'KPIs y métricas'
                }
              ].map(({ key, label, icon: Icon, description }) => (
                <button
                  key={key}
                  onClick={() => setVistaActiva(key as any)}
                  className={`flex items-center space-x-3 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    vistaActiva === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </CardContent>
      </Card>

      {/* **CONTENIDO DINÁMICO SEGÚN PESTAÑA ACTIVA** */}
      
      {/* **PESTAÑA: INVENTARIO GENERAL** */}
      {vistaActiva === 'inventario' && (
        <div className="space-y-4">
          {/* Estadísticas Específicas - Mejoradas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Equipos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {estadisticas?.total.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">Inventario completo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Equipos Activos</p>
                    <p className="text-2xl font-bold text-green-600">
                      {estadisticas?.activos.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-600 font-medium">Operativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Mantenimiento</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {estadisticas?.mantenimiento.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-500">En servicio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Con Garantía</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {estadisticas?.con_garantia.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-500">Vigentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Disponibilidad</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {estadisticas?.disponibilidad_promedio.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-gray-500">Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Críticos</p>
                    <p className="text-2xl font-bold text-red-600">
                      {estadisticas?.equipos_criticos.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-red-600">Atención urgente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controles de Filtro */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por código interno o serie..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10 h-9"
                      onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="px-3 py-2 h-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Todos los estados</option>
                    <option value="1">Activo</option>
                    <option value="2">Mantenimiento</option>
                    <option value="3">Inactivo</option>
                    <option value="4">Dado de Baja</option>
                  </select>
                  <Button onClick={handleBuscar} variant="outline" size="sm" className="h-9">
                    <Search className="w-4 h-4 mr-1" />
                    Buscar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de Equipos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Inventario de Equipos ({totalRegistros.toLocaleString()} total)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Cargando equipos...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[500px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-gray-50 z-10">
                          <TableRow>
                            <TableHead className="w-24">ID</TableHead>
                            <TableHead className="w-40">Nombre</TableHead>
                            <TableHead className="w-32">Código</TableHead>
                            <TableHead className="w-28">Estado</TableHead>
                            <TableHead className="w-32">Tipo</TableHead>
                            <TableHead className="w-32">Marca</TableHead>
                            <TableHead className="w-40">Cliente</TableHead>
                            <TableHead className="w-32">Sede</TableHead>
                            <TableHead className="w-32">Garantía</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {equipos.length > 0 ? (
                            equipos.map((equipo) => (
                              <TableRow 
                                key={equipo.id} 
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => setSelectedEquipo(equipo)}
                              >
                                <TableCell className="font-medium text-sm">{equipo.id}</TableCell>
                                <TableCell className="text-sm font-medium text-blue-600">
                                  {equipo.nombre}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {equipo.codigo_interno || '-'}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getEstadoBadgeVariant(equipo.estado)}>
                                    {equipo.estado?.charAt(0).toUpperCase() + equipo.estado?.slice(1) || 'Activo'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {equipo.tipo_nombre || equipo.tipo_equipo || '-'}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {equipo.marca_nombre || '-'}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {equipo.cliente_nombre || '-'}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {equipo.sede_nombre ? (
                                    <div className="flex items-center gap-1">
                                      <Building className="w-3 h-3" />
                                      {equipo.sede_nombre}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">Sin asignar</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {equipo.fecha_garantia ? (
                                    <div className="flex items-center gap-1">
                                      <Shield className="w-3 h-3" />
                                      {new Date(equipo.fecha_garantia) > new Date() ? (
                                        <span className="text-green-600">Vigente</span>
                                      ) : (
                                        <span className="text-red-600">Vencida</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-orange-600 text-xs">Sin garantía</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                                No se encontraron equipos con los filtros aplicados
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* **PESTAÑA: TRACKING GPS** */}
      {vistaActiva === 'tracking' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-3 mb-2">
              <NavigationIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-blue-900">Tracking GPS de Equipos</h2>
                <p className="text-blue-700">
                  Monitoreo en tiempo real de ubicaciones, zonas autorizadas y alertas de movimiento
                </p>
              </div>
            </div>
          </div>
          
          <MapaEquipos 
            equipos={[]}
            showZonasAutorizadas={true}
            trackingMode="realtime"
          />
        </div>
      )}

      {/* **PESTAÑA: MANTENIMIENTOS QR** */}
      {vistaActiva === 'mantenimiento' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-100">
            <div className="flex items-center space-x-3 mb-2">
              <Settings className="w-8 h-8 text-orange-600" />
              <div>
                <h2 className="text-xl font-semibold text-orange-900">Sistema de Mantenimientos QR</h2>
                <p className="text-orange-700">
                  Check-in/out con QR, seguimiento de checkpoints y certificación de mantenimientos
                </p>
              </div>
            </div>
          </div>
          
          <QRMantenimientoEquipos 
            modoDemo={true}
            onMantenimientoComplete={(data: any) => {
              console.log('Mantenimiento completado:', data);
            }}
          />
        </div>
      )}

      {/* **PESTAÑA: GALERÍA DE FOTOS** */}
      {vistaActiva === 'fotos' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
            <div className="flex items-center space-x-3 mb-2">
              <Camera className="w-8 h-8 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold text-purple-900">Galería de Fotos de Equipos</h2>
                <p className="text-purple-700">
                  Documentación visual completa con anotaciones, metadata técnica y seguimiento de estados
                </p>
              </div>
            </div>
          </div>
          
          <GaleriaFotosEquipo 
            equipoId={selectedEquipo?.id || 1}
            equipoNombre={selectedEquipo?.nombre || 'Ventilador Draeger V500'}
            equipoSerie={selectedEquipo?.codigo_interno || 'VEN001'}
            modoVisualizacion="galeria"
            onFotoUpload={(foto: any) => {
              console.log('Foto subida:', foto);
            }}
          />
        </div>
      )}

      {/* **PESTAÑA: DASHBOARD TIEMPO REAL** */}
      {vistaActiva === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg border border-emerald-100">
            <div className="flex items-center space-x-3 mb-2">
              <BarChart3 className="w-8 h-8 text-emerald-600" />
              <div>
                <h2 className="text-xl font-semibold text-emerald-900">Dashboard en Tiempo Real</h2>
                <p className="text-emerald-700">
                  KPIs especializados: MTBF, disponibilidad, costos, garantías y alertas críticas
                </p>
              </div>
            </div>
          </div>
          
          <DashboardEquiposRealTime 
            equipos={[]}
            intervaloActualizacion={30000}
          />
        </div>
      )}
    </div>
  );
}