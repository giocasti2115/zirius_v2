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
import { DataSourceIndicator } from '@/components/visitas/data-source-indicator';
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin,
  User,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Star,
  Settings,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { visitasService, Visita, EstadisticasVisitas } from '@/lib/services/visitas.service';

export default function VisitasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasVisitas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(25);
  const [totalRegistros, setTotalRegistros] = useState(0);
  
  // Estado para indicar si se están usando datos mock
  const [usandoDatosMock, setUsandoDatosMock] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [paginaActual, registrosPorPagina]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando visitas...');
      
      const [visitasData, estadisticasData] = await Promise.all([
        visitasService.obtenerVisitas({ 
          limit: registrosPorPagina,
          page: paginaActual,
          numero_visita: busqueda || undefined,
          estado: filtroEstado ? parseInt(filtroEstado) : undefined
        }),
        visitasService.obtenerEstadisticas()
      ]);

      if (visitasData.success) {
        setVisitas(visitasData.data.visitas);
        setTotalRegistros(visitasData.data.total);
        
        // Detectar si se están usando datos mock (IDs altos = datos reales, IDs bajos = mock)
        const primerVisita = visitasData.data.visitas[0];
        setUsandoDatosMock(primerVisita && primerVisita.id > 300000 ? false : true);
        
        console.log('✅ Visitas cargadas:', visitasData.data.visitas.length);
      } else {
        setError('Error cargando visitas');
      }

      if (estadisticasData.success) {
        setEstadisticas(estadisticasData.data);
      }

    } catch (err) {
      console.error('❌ Error cargando datos visitas:', err);
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

  const getEstadoBadge = (estado: string) => {
    const estadoColors = {
      'pendiente': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'programada': 'bg-blue-50 text-blue-700 border-blue-200',
      'en_curso': 'bg-green-50 text-green-700 border-green-200',
      'completada': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'cancelada': 'bg-red-50 text-red-700 border-red-200'
    };

    return (
      <Badge variant="outline" className={estadoColors[estado as keyof typeof estadoColors] || 'bg-gray-50 text-gray-700 border-gray-200'}>
        {estado?.charAt(0).toUpperCase() + estado?.slice(1) || 'Pendiente'}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const config = {
      instalacion: { icon: Settings, color: 'bg-blue-50 text-blue-700 border-blue-200' },
      mantenimiento: { icon: Settings, color: 'bg-green-50 text-green-700 border-green-200' },
      reparacion: { icon: AlertTriangle, color: 'bg-orange-50 text-orange-700 border-orange-200' },
      inspeccion: { icon: CheckCircle2, color: 'bg-purple-50 text-purple-700 border-purple-200' },
      calibracion: { icon: TrendingUp, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      garantia: { icon: Star, color: 'bg-red-50 text-red-700 border-red-200' }
    };
    
    const { icon: Icon, color } = config[tipo as keyof typeof config] || 
      { icon: Settings, color: 'bg-gray-50 text-gray-700 border-gray-200' };
    
    return (
      <Badge variant="outline" className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {tipo?.charAt(0).toUpperCase() + tipo?.slice(1) || 'Mantenimiento'}
      </Badge>
    );
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    <div className="p-6 space-y-4">
      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Visitas</h1>
          <p className="text-sm text-gray-600">
            Programación y seguimiento de visitas técnicas a clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/visitas/calendario">
            <Button size="sm" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Calendario
            </Button>
          </Link>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Visita
          </Button>
        </div>
      </div>

      {/* Indicador de Fuente de Datos */}
      <DataSourceIndicator 
        isUsingMockData={usandoDatosMock}
        totalRecords={totalRegistros}
        apiStatus={error ? 'error' : loading ? 'loading' : 'connected'}
      />

      {/* Estadísticas Específicas - Mejoradas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Visitas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticas?.total.toLocaleString() || 0}
                </p>
                <p className="text-xs text-blue-600 font-medium">+{Math.floor((estadisticas?.total || 0) * 0.08)} este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {estadisticas?.pendientes.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500">Por programar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Programadas Hoy</p>
                <p className="text-2xl font-bold text-green-600">
                  {estadisticas?.hoy.toLocaleString() || 0}
                </p>
                <p className="text-xs text-green-600 font-medium">En proceso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Completadas</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {estadisticas?.completadas.toLocaleString() || 0}
                </p>
                <p className="text-xs text-emerald-600 font-medium">Finalizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Cumplimiento</p>
                <p className="text-2xl font-bold text-orange-600">
                  {estadisticas?.porcentaje_cumplimiento.toFixed(1) || 0}%
                </p>
                <p className="text-xs text-gray-500">Meta: 90%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Calificación</p>
                <p className="text-2xl font-bold text-pink-600">
                  {estadisticas?.calificacion_promedio.toFixed(1) || 0}/5
                </p>
                <p className="text-xs text-pink-600 font-medium">
                  {Array.from({ length: Math.floor(estadisticas?.calificacion_promedio || 0) }, (_, i) => '★').join('')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de Filtro Compactos */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por número de visita..."
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
                <option value="1">Pendiente</option>
                <option value="2">Programada</option>
                <option value="3">En Curso</option>
                <option value="4">Completada</option>
                <option value="5">Cancelada</option>
              </select>
              <Button onClick={handleBuscar} variant="outline" size="sm" className="h-9">
                <Search className="w-4 h-4 mr-1" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: '/visitas/pendientes', title: 'Pendientes', count: estadisticas?.pendientes || 0, color: 'yellow' },
          { href: '/visitas/abiertas', title: 'Abiertas', count: (estadisticas?.programadas || 0) + (estadisticas?.en_curso || 0), color: 'blue' },
          { href: '/visitas/cerradas', title: 'Cerradas', count: estadisticas?.completadas || 0, color: 'green' },
          { href: '/visitas/actividades', title: 'Actividades', count: estadisticas?.este_mes || 0, color: 'purple' }
        ].map((item, i) => (
          <Link key={i} href={item.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className={`text-2xl font-bold text-${item.color}-600 mt-1`}>
                  {item.count.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">visitas</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Tabla de Visitas Recientes con Scroll Embebido */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Visitas Recientes ({totalRegistros.toLocaleString()} total)
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Mostrar:</span>
              <select
                value={registrosPorPagina}
                onChange={(e) => setRegistrosPorPagina(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>por página</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando visitas...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tabla con altura fija y scroll interno */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow>
                        <TableHead className="w-24">ID</TableHead>
                        <TableHead className="w-32">Número</TableHead>
                        <TableHead className="w-32">Fecha Programa</TableHead>
                        <TableHead className="w-28">Estado</TableHead>
                        <TableHead className="w-28">Tipo</TableHead>
                        <TableHead className="w-40">Cliente</TableHead>
                        <TableHead className="w-32">Técnico</TableHead>
                        <TableHead className="w-32">Sede</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitas.length > 0 ? (
                        visitas.map((visita) => (
                          <TableRow key={visita.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-sm">{visita.id}</TableCell>
                            <TableCell className="text-sm font-medium text-blue-600">
                              {visita.numero_visita}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatearFecha(visita.fecha_programada)}
                            </TableCell>
                            <TableCell>
                              {getEstadoBadge(visita.estado)}
                            </TableCell>
                            <TableCell>
                              {getTipoBadge(visita.tipo_visita)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {visita.cliente_nombre || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {visita.tecnico_nombre ? (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {visita.tecnico_nombre}
                                </div>
                              ) : (
                                <span className="text-orange-600 text-xs">Sin asignar</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {visita.sede_nombre || '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                            No se encontraron visitas con los filtros aplicados
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Información de Registros y Paginación */}
              {totalRegistros > 0 && (
                <div className="flex items-center justify-between px-2 py-3 border-t bg-gray-50 rounded-b-lg">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      Mostrando {((paginaActual - 1) * registrosPorPagina) + 1} a{' '}
                      {Math.min(paginaActual * registrosPorPagina, totalRegistros)} de{' '}
                      {totalRegistros.toLocaleString()} registros
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Filas por página:</span>
                      <select 
                        value={registrosPorPagina}
                        onChange={(e) => {
                          setRegistrosPorPagina(Number(e.target.value));
                          setPaginaActual(1);
                        }}
                        className="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  
                  {totalPaginas > 1 && (
                    <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={paginaAnterior}
                      disabled={paginaActual === 1}
                      className="px-3 py-1 text-sm"
                    >
                      Anterior
                    </Button>
                    
                    {/* Números de página */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                        const pagina = i + 1;
                        return (
                          <Button
                            key={pagina}
                            variant={paginaActual === pagina ? "default" : "outline"}
                            size="sm"
                            onClick={() => irAPagina(pagina)}
                            className="px-3 py-1 text-sm w-8"
                          >
                            {pagina}
                          </Button>
                        );
                      })}
                      {totalPaginas > 5 && (
                        <>
                          <span className="px-2 py-1 text-sm text-gray-500">...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => irAPagina(totalPaginas)}
                            className="px-3 py-1 text-sm"
                          >
                            {totalPaginas}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={paginaSiguiente}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-1 text-sm"
                    >
                      Siguiente
                    </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}