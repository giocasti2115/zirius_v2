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
  Calendar, 
  Clock, 
  Play,
  User,
  AlertTriangle,
  ArrowLeft,
  Settings,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { visitasService, Visita } from '@/lib/services/visitas.service';

export default function VisitasAbiertasPage() {
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(25);
  const [totalRegistros, setTotalRegistros] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, [paginaActual, registrosPorPagina]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroTipo]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando visitas abiertas...');
      
      const visitasData = await visitasService.obtenerVisitas({ 
        limit: registrosPorPagina,
        page: paginaActual,
        numero_visita: busqueda || undefined,
        // Estados abiertos: programada (2) y en_curso (3)
        tipo_visita: filtroTipo ? [filtroTipo] : undefined
      });

      if (visitasData.success) {
        // Filtrar solo visitas abiertas (programadas o en curso)
        const visitasAbiertas = visitasData.data.visitas.filter(v => 
          v.estado === 'programada' || v.estado === 'en_curso'
        );
        setVisitas(visitasAbiertas);
        setTotalRegistros(visitasAbiertas.length);
        console.log('✅ Visitas abiertas cargadas:', visitasAbiertas.length);
      } else {
        setError('Error cargando visitas abiertas');
      }

    } catch (err) {
      console.error('❌ Error cargando visitas abiertas:', err);
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
      'programada': 'bg-blue-50 text-blue-700 border-blue-200',
      'en_curso': 'bg-green-50 text-green-700 border-green-200'
    };

    return (
      <Badge variant="outline" className={estadoColors[estado as keyof typeof estadoColors] || 'bg-gray-50 text-gray-700 border-gray-200'}>
        {estado === 'programada' ? 'Programada' : 'En Curso'}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const config = {
      instalacion: { icon: Settings, color: 'bg-blue-50 text-blue-700 border-blue-200' },
      mantenimiento: { icon: Settings, color: 'bg-green-50 text-green-700 border-green-200' },
      reparacion: { icon: AlertTriangle, color: 'bg-orange-50 text-orange-700 border-orange-200' },
      inspeccion: { icon: Settings, color: 'bg-purple-50 text-purple-700 border-purple-200' },
      calibracion: { icon: Settings, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
      garantia: { icon: Settings, color: 'bg-red-50 text-red-700 border-red-200' }
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
          <div className="flex items-center gap-2">
            <Link href="/visitas">
              <Button variant="ghost" size="sm" className="p-1">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Visitas Abiertas</h1>
          </div>
          <p className="text-sm text-gray-600">
            Visitas programadas y en ejecución por los técnicos
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

      {/* Estadísticas Específicas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Total Abiertas</p>
                <p className="text-xl font-bold text-blue-600">
                  {totalRegistros.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Play className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">En Curso</p>
                <p className="text-xl font-bold text-green-600">
                  {visitas.filter(v => v.estado === 'en_curso').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Programadas</p>
                <p className="text-xl font-bold text-indigo-600">
                  {visitas.filter(v => v.estado === 'programada').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Críticas</p>
                <p className="text-xl font-bold text-purple-600">
                  {visitas.filter(v => v.prioridad === 'alta').length}
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
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-2 h-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Todos los tipos</option>
                <option value="instalacion">Instalación</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="reparacion">Reparación</option>
                <option value="inspeccion">Inspección</option>
                <option value="calibracion">Calibración</option>
                <option value="garantia">Garantía</option>
              </select>
              <Button onClick={handleBuscar} variant="outline" size="sm" className="h-9">
                <Search className="w-4 h-4 mr-1" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Visitas Abiertas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Visitas Abiertas ({totalRegistros.toLocaleString()} total)
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
              <p className="text-gray-600 mt-2">Cargando visitas abiertas...</p>
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
                        <TableHead className="w-24">Acciones</TableHead>
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
                            <TableCell>
                              <Button size="sm" variant="outline" className="h-7 px-2">
                                {visita.estado === 'programada' ? (
                                  <>
                                    <Play className="w-3 h-3 mr-1" />
                                    Iniciar
                                  </>
                                ) : (
                                  <>
                                    <Settings className="w-3 h-3 mr-1" />
                                    Gestionar
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                            No hay visitas abiertas con los filtros aplicados
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