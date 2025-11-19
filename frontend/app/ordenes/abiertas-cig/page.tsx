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
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  User,
  Building,
  Settings,
  Activity,
  TrendingUp,
  ArrowRight,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { ordenesService, Orden } from '@/lib/services/ordenes.service';

export default function OrdenesAbiertasCIG() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipoCIG, setFiltroTipoCIG] = useState<string | ''>('');
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(25);
  const [totalRegistros, setTotalRegistros] = useState(0);

  // Estadísticas específicas CIG
  const [stats, setStats] = useState({
    total: 0,
    calibracion: 0,
    inspeccion: 0,
    garantia: 0,
    en_proceso: 0,
    vencidas: 0,
    eficiencia: 0
  });

  useEffect(() => {
    cargarDatos();
  }, [paginaActual, registrosPorPagina]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroTipoCIG]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando órdenes CIG abiertas...');
      
      const ordenesData = await ordenesService.obtenerOrdenesAbiertasCIG({ 
        limit: registrosPorPagina,
        page: paginaActual,
        numero_orden: busqueda || undefined,
        tipo_mantenimiento: filtroTipoCIG ? [filtroTipoCIG] : undefined
      });

      if (ordenesData.success) {
        setOrdenes(ordenesData.data.ordenes);
        setTotalRegistros(ordenesData.data.total);
        
        // Calcular estadísticas específicas CIG
        const total = ordenesData.data.total;
        const calibracion = ordenesData.data.ordenes.filter(o => o.tipo_mantenimiento === 'calibracion').length;
        const inspeccion = ordenesData.data.ordenes.filter(o => o.tipo_mantenimiento === 'inspeccion').length;
        const garantia = ordenesData.data.ordenes.filter(o => o.tipo_mantenimiento === 'garantia').length;
        const enProceso = ordenesData.data.ordenes.filter(o => o.id_estado === 2).length;
        
        setStats({
          total,
          calibracion,
          inspeccion,
          garantia,
          en_proceso: enProceso,
          vencidas: ordenesData.data.ordenes.filter(o => {
            if (!o.fecha_programada) return false;
            return new Date(o.fecha_programada) < new Date();
          }).length,
          eficiencia: 87.5 // Mock - se calcularía del backend
        });
        
        console.log('✅ Órdenes CIG cargadas:', ordenesData.data.ordenes.length);
      } else {
        setError('Error cargando órdenes CIG');
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

  // Funciones de paginación
  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
  const paginaAnterior = () => setPaginaActual(prev => Math.max(prev - 1, 1));
  const paginaSiguiente = () => setPaginaActual(prev => Math.min(prev + 1, totalPaginas));
  const irAPagina = (pagina: number) => setPaginaActual(pagina);

  const getTipoCIGBadge = (tipo: string) => {
    const tipoColors = {
      'calibracion': 'bg-purple-50 text-purple-700 border-purple-200',
      'inspeccion': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'garantia': 'bg-green-50 text-green-700 border-green-200'
    };

    const tipoIcons = {
      'calibracion': <Settings className="w-3 h-3" />,
      'inspeccion': <CheckCircle2 className="w-3 h-3" />,
      'garantia': <Zap className="w-3 h-3" />
    };

    return (
      <Badge variant="outline" className={tipoColors[tipo as keyof typeof tipoColors] || 'bg-gray-50 text-gray-700 border-gray-200'}>
        {tipoIcons[tipo as keyof typeof tipoIcons]}
        <span className="ml-1">{tipo?.charAt(0).toUpperCase() + tipo?.slice(1) || 'N/A'}</span>
      </Badge>
    );
  };

  const getEstadoBadge = (estadoId: number, estadoTexto: string) => {
    switch (estadoId) {
      case 1:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          {estadoTexto || 'Abierta'}
        </Badge>;
      case 2:
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Activity className="w-3 h-3 mr-1" />
          {estadoTexto || 'En Proceso'}
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

  const getDiasVencimiento = (fechaProgramada: string) => {
    const hoy = new Date();
    const fechaProg = new Date(fechaProgramada);
    const diffTime = fechaProg.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-red-600 font-medium">{Math.abs(diffDays)} días vencida</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-600 font-medium">Hoy</span>;
    } else if (diffDays <= 7) {
      return <span className="text-yellow-600 font-medium">En {diffDays} días</span>;
    } else {
      return <span className="text-gray-600">En {diffDays} días</span>;
    }
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
            <Link href="/ordenes" className="text-blue-600 hover:text-blue-800">
              <ArrowRight className="w-4 h-4 rotate-180" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Órdenes Abiertas CIG</h1>
          </div>
          <p className="text-sm text-gray-600">
            Calibración, Inspección y Garantía - Órdenes especializadas abiertas
          </p>
        </div>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
          <Calendar className="w-4 h-4 mr-2" />
          Programar CIG
        </Button>
      </div>

      {/* Estadísticas Específicas CIG */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Total CIG</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.total.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Calibración</p>
                <p className="text-xl font-bold text-purple-600">
                  {stats.calibracion.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Inspección</p>
                <p className="text-xl font-bold text-yellow-600">
                  {stats.inspeccion.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Garantía</p>
                <p className="text-xl font-bold text-green-600">
                  {stats.garantia.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">En Proceso</p>
                <p className="text-xl font-bold text-orange-600">
                  {stats.en_proceso.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Vencidas</p>
                <p className="text-xl font-bold text-red-600">
                  {stats.vencidas.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Eficiencia</p>
                <p className="text-xl font-bold text-blue-600">
                  {stats.eficiencia}%
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
                  placeholder="Buscar por número de orden..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 h-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filtroTipoCIG}
                onChange={(e) => setFiltroTipoCIG(e.target.value)}
                className="px-3 py-2 h-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Todos los tipos CIG</option>
                <option value="calibracion">Calibración</option>
                <option value="inspeccion">Inspección</option>
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

      {/* Tabla de Órdenes CIG con Scroll Embebido */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Órdenes CIG Abiertas ({totalRegistros.toLocaleString()} total)
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando órdenes CIG...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tabla con altura fija y scroll interno */}
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow>
                        <TableHead className="w-20">ID</TableHead>
                        <TableHead className="w-32">Número Orden</TableHead>
                        <TableHead className="w-28">Tipo CIG</TableHead>
                        <TableHead className="w-32">Fecha Programada</TableHead>
                        <TableHead className="w-28">Vencimiento</TableHead>
                        <TableHead className="w-24">Estado</TableHead>
                        <TableHead className="w-32">Equipo</TableHead>
                        <TableHead className="w-32">Cliente</TableHead>
                        <TableHead className="w-24">Técnico</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordenes.length > 0 ? (
                        ordenes.map((orden) => (
                          <TableRow key={orden.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium text-sm">{orden.id}</TableCell>
                            <TableCell className="text-sm font-medium text-blue-600">
                              {orden.numero_orden || `ORD-${orden.id}`}
                            </TableCell>
                            <TableCell>
                              {getTipoCIGBadge(orden.tipo_mantenimiento)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {orden.fecha_programada ? formatearFecha(orden.fecha_programada) : '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {orden.fecha_programada ? getDiasVencimiento(orden.fecha_programada) : '-'}
                            </TableCell>
                            <TableCell>
                              {getEstadoBadge(orden.id_estado, orden.estado || '')}
                            </TableCell>
                            <TableCell className="text-sm">
                              {orden.equipo_nombre || orden.id_equipo || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {orden.cliente_nombre || '-'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {orden.tecnico_nombre ? (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {orden.tecnico_nombre}
                                </div>
                              ) : (
                                <span className="text-orange-600 text-xs">Sin asignar</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                            No se encontraron órdenes CIG con los filtros aplicados
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Controles de Paginación */}
              {totalPaginas > 1 && (
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