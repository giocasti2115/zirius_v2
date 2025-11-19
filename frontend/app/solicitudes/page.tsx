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
  Filter, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User,
  Settings,
  AlertTriangle,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { solicitudesService, Solicitud, EstadisticasResponse } from '@/lib/services/solicitudes.service';

export default function SolicitudesPageReal() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<number | ''>('');
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(25);
  const [totalRegistros, setTotalRegistros] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, [paginaActual, registrosPorPagina]);

  useEffect(() => {
    // Resetear a página 1 cuando cambian los filtros
    setPaginaActual(1);
  }, [busqueda, filtroEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando solicitudes y estadísticas...');
      
      const [solicitudesData, statsData] = await Promise.all([
        solicitudesService.obtenerSolicitudes({ 
          limit: registrosPorPagina,
          page: paginaActual,
          aviso: busqueda || undefined,
          estado: filtroEstado || undefined 
        }),
        solicitudesService.obtenerEstadisticas()
      ]);

      if (solicitudesData.success) {
        setSolicitudes(solicitudesData.data.solicitudes);
        setTotalRegistros(solicitudesData.data.total || solicitudesData.data.solicitudes.length);
        console.log('✅ Solicitudes cargadas:', solicitudesData.data.solicitudes.length);
      } else {
        setError('Error cargando solicitudes');
      }

      if (statsData.success) {
        setEstadisticas(statsData.data);
        console.log('✅ Estadísticas cargadas:', statsData.data);
      }

    } catch (err) {
      console.error('❌ Error cargando datos:', err);
      setError('Error conectando con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    cargarDatos();
  };

  const handleFiltroEstado = (estado: number | '') => {
    setFiltroEstado(estado);
  };

  // Funciones de paginación
  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
  const paginaAnterior = () => setPaginaActual(prev => Math.max(prev - 1, 1));
  const paginaSiguiente = () => setPaginaActual(prev => Math.min(prev + 1, totalPaginas));
  const irAPagina = (pagina: number) => setPaginaActual(pagina);

  const getEstadoBadge = (estadoId: number, estadoTexto: string) => {
    switch (estadoId) {
      case 1:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          {estadoTexto || 'Pendiente'}
        </Badge>;
      case 2:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          {estadoTexto || 'Aprobada'}
        </Badge>;
      case 3:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          {estadoTexto || 'Rechazada'}
        </Badge>;
      default:
        return <Badge variant="secondary">{estadoTexto || 'Desconocido'}</Badge>;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Servicio</h1>
          <p className="text-sm text-gray-600">
            Gestión integral de solicitudes de mantenimiento y servicios técnicos
          </p>
        </div>
        <Link href="/solicitudes/nueva">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Solicitud
          </Button>
        </Link>
      </div>

      {/* Estadísticas Compactas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    {estadisticas.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Pendientes</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {estadisticas.pendientes.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Aprobadas</p>
                  <p className="text-xl font-bold text-green-600">
                    {estadisticas.aprobadas.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {estadisticas.porcentaje_aprobacion.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Rechazadas</p>
                  <p className="text-xl font-bold text-red-600">
                    {estadisticas.rechazadas.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/solicitudes/pendientes-preventivo">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-400">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Preventivo</h3>
                  <p className="text-xs text-gray-600">Programados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/solicitudes/pendientes-cig">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-400">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">CIG</h3>
                  <p className="text-xs text-gray-600">Cal. Insp. Gar.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/solicitudes/aprobadas">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-400">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Aprobadas</h3>
                  <p className="text-xs text-gray-600">Listas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/solicitudes/rechazadas">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-red-400">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Rechazadas</h3>
                  <p className="text-xs text-gray-600">Requieren atención</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Controles de Filtro Compactos */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por número de aviso..."
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
                onChange={(e) => handleFiltroEstado(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="px-3 py-2 h-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Todos los estados</option>
                <option value="1">Pendientes</option>
                <option value="2">Aprobadas</option>
                <option value="3">Rechazadas</option>
              </select>
              <Button onClick={handleBuscar} variant="outline" size="sm" className="h-9">
                <Search className="w-4 h-4 mr-1" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Solicitudes con Scroll Embebido */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Listado de Solicitudes ({totalRegistros.toLocaleString()} total)
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
              <p className="text-gray-600 mt-2">Cargando solicitudes...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tabla con altura fija y scroll interno */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow>
                        <TableHead className="w-16">ID</TableHead>
                        <TableHead className="w-24">Aviso</TableHead>
                        <TableHead className="w-20">Servicio</TableHead>
                        <TableHead className="w-32">Creación</TableHead>
                        <TableHead className="w-24">Equipo</TableHead>
                        <TableHead className="w-20">ID Equipo</TableHead>
                        <TableHead className="w-28">Estado</TableHead>
                        <TableHead className="w-24">Sede</TableHead>
                        <TableHead className="w-24">Serie</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solicitudes.length > 0 ? (
                        solicitudes.map((solicitud) => (
                          <TableRow key={solicitud.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-sm">{solicitud.id}</TableCell>
                            <TableCell className="text-sm">{solicitud.aviso || '-'}</TableCell>
                            <TableCell className="text-sm">{solicitud.id_servicio || '-'}</TableCell>
                            <TableCell className="text-sm">{formatearFecha(solicitud.creacion)}</TableCell>
                            <TableCell className="text-sm">
                              {solicitud.id_equipo ? (
                                <span className="text-blue-600 font-medium">
                                  {solicitud.id_equipo}
                                </span>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{solicitud.id_equipo || '-'}</TableCell>
                            <TableCell>
                              {getEstadoBadge(solicitud.id_estado, solicitud.estado || '')}
                            </TableCell>
                            <TableCell className="text-sm">-</TableCell>
                            <TableCell className="text-sm">-</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                            No se encontraron solicitudes con los filtros aplicados
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Controles de Paginación */}
              {totalRegistros > 0 && (
                <div className="flex items-center justify-between px-2 py-3 border-t bg-gray-50 rounded-b-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Mostrando {((paginaActual - 1) * registrosPorPagina) + 1} a{' '}
                      {Math.min(paginaActual * registrosPorPagina, totalRegistros)} de{' '}
                      {totalRegistros.toLocaleString()} registros
                    </span>
                  </div>
                  
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
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}