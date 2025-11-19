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

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando solicitudes y estadísticas...');
      
      const [solicitudesData, statsData] = await Promise.all([
        solicitudesService.obtenerSolicitudes({ 
          limit: 50,
          aviso: busqueda || undefined,
          estado: filtroEstado || undefined 
        }),
        solicitudesService.obtenerEstadisticas()
      ]);

      if (solicitudesData.success) {
        setSolicitudes(solicitudesData.data.solicitudes);
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
    // Auto-aplicar filtro
    setTimeout(() => cargarDatos(), 100);
  };

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
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Servicio</h1>
          <p className="text-gray-600 mt-1">
            Gestión integral de solicitudes de mantenimiento y servicios técnicos
          </p>
        </div>
        <Link href="/solicitudes/nueva">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Solicitud
          </Button>
        </Link>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {estadisticas.total.toLocaleString()}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {estadisticas.pendientes.toLocaleString()}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                    <p className="text-3xl font-bold text-green-600">
                      {estadisticas.aprobadas.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {estadisticas.porcentaje_aprobacion.toFixed(1)}% del total
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rechazadas</p>
                    <p className="text-3xl font-bold text-red-600">
                      {estadisticas.rechazadas.toLocaleString()}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vistas Especializadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/solicitudes/pendientes-preventivo">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-400">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Settings className="w-8 h-8 text-orange-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Preventivo</h3>
                    <p className="text-sm text-gray-600">Mantenimientos programados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/solicitudes/pendientes-cig">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-400">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-purple-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">CIG</h3>
                    <p className="text-sm text-gray-600">Calibración, Inspección, Garantía</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/solicitudes/aprobadas">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-400">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Aprobadas</h3>
                    <p className="text-sm text-gray-600">Listas para ejecución</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/solicitudes/rechazadas">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-red-400">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <XCircle className="w-8 h-8 text-red-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Rechazadas</h3>
                    <p className="text-sm text-gray-600">Requieren atención</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Controles de Filtro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por número de aviso..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filtroEstado}
                  onChange={(e) => handleFiltroEstado(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="1">Pendientes</option>
                  <option value="2">Aprobadas</option>
                  <option value="3">Rechazadas</option>
                </select>
                <Button onClick={handleBuscar} variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle>Listado de Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Cargando solicitudes...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Aviso</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Creación</TableHead>
                      <TableHead>Equipo</TableHead>
                      <TableHead>ID Equipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Sede</TableHead>
                      <TableHead>Serie</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitudes.length > 0 ? (
                      solicitudes.map((solicitud) => (
                        <TableRow key={solicitud.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{solicitud.id}</TableCell>
                          <TableCell>{solicitud.aviso || '-'}</TableCell>
                          <TableCell>{solicitud.id_servicio || '-'}</TableCell>
                          <TableCell>{formatearFecha(solicitud.creacion)}</TableCell>
                          <TableCell>
                            {solicitud.id_equipo ? (
                              <span className="text-blue-600 font-medium">
                                Equipo {solicitud.id_equipo}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>{solicitud.id_equipo || '-'}</TableCell>
                          <TableCell>
                            {getEstadoBadge(solicitud.id_estado, solicitud.estado || '')}
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No se encontraron solicitudes con los filtros aplicados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}