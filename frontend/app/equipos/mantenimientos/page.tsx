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
  ArrowLeft, 
  Settings, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Wrench,
  TrendingUp,
  User
} from 'lucide-react';
import Link from 'next/link';
import { equiposService, Equipo } from '@/lib/services/equipos.service';

export default function MantenimientosPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(25);
  const [totalRegistros, setTotalRegistros] = useState(0);
  
  // Estadísticas de mantenimientos
  const [estadisticasMantenimiento, setEstadisticasMantenimiento] = useState({
    total_mantenimientos: 0,
    pendientes: 0,
    en_proceso: 0,
    completados_mes: 0,
    tiempo_promedio: 0,
    equipos_vencidos: 0
  });

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
      
      console.log('🔄 Cargando equipos para mantenimiento...');
      
      const equiposData = await equiposService.obtenerEquiposMantenimiento({ 
        limit: registrosPorPagina,
        page: paginaActual,
        codigo_interno: busqueda || undefined
      });

      if (equiposData.success) {
        setEquipos(equiposData.data.equipos);
        setTotalRegistros(equiposData.data.total);
        
        // Calcular estadísticas específicas de mantenimiento
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        
        const equiposVencidos = equiposData.data.equipos.filter(e => {
          if (!e.proximo_mantenimiento) return false;
          return new Date(e.proximo_mantenimiento) < ahora;
        });
        
        setEstadisticasMantenimiento({
          total_mantenimientos: equiposData.data.total,
          pendientes: equiposData.data.equipos.filter(e => e.estado === 'activo').length,
          en_proceso: equiposData.data.equipos.filter(e => e.estado === 'mantenimiento').length,
          completados_mes: Math.floor(equiposData.data.total * 0.15), // Mock
          tiempo_promedio: 4.2, // Mock
          equipos_vencidos: equiposVencidos.length
        });
        
        console.log('✅ Equipos para mantenimiento cargados:', equiposData.data.equipos.length);
      } else {
        setError('Error cargando equipos para mantenimiento');
      }

    } catch (err) {
      console.error('❌ Error cargando equipos mantenimiento:', err);
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

  const getTipoBadge = (tipo: string) => {
    const config = {
      'Monitor': { color: 'bg-blue-50 text-blue-700 border-blue-200' },
      'Ventilador': { color: 'bg-green-50 text-green-700 border-green-200' },
      'Bomba': { color: 'bg-purple-50 text-purple-700 border-purple-200' },
      'Desfibrilador': { color: 'bg-red-50 text-red-700 border-red-200' },
      'ECG': { color: 'bg-orange-50 text-orange-700 border-orange-200' }
    };
    
    const { color } = config[tipo as keyof typeof config] || 
      { color: 'bg-gray-50 text-gray-700 border-gray-200' };
    
    return (
      <Badge variant="outline" className={color}>
        {tipo}
      </Badge>
    );
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const diasParaMantenimiento = (fechaProximo: string) => {
    const ahora = new Date();
    const proximo = new Date(fechaProximo);
    const diferencia = Math.ceil((proximo.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
    return diferencia;
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
            <Link href="/equipos">
              <Button variant="ghost" size="sm" className="p-1">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Mantenimientos de Equipos</h1>
          </div>
          <p className="text-sm text-gray-600">
            Programación y seguimiento de mantenimientos preventivos y correctivos
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Programar
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Mantenimiento
          </Button>
        </div>
      </div>

      {/* Estadísticas Específicas de Mantenimientos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Equipos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {estadisticasMantenimiento.total_mantenimientos.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Requieren mtto.</p>
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
                  {estadisticasMantenimiento.pendientes.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Por programar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">En Proceso</p>
                <p className="text-2xl font-bold text-orange-600">
                  {estadisticasMantenimiento.en_proceso.toLocaleString()}
                </p>
                <p className="text-xs text-orange-600 font-medium">Ejecutándose</p>
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
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Completados</p>
                <p className="text-2xl font-bold text-green-600">
                  {estadisticasMantenimiento.completados_mes.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Tiempo Prom.</p>
                <p className="text-2xl font-bold text-purple-600">
                  {estadisticasMantenimiento.tiempo_promedio.toFixed(1)}h
                </p>
                <p className="text-xs text-gray-500">por equipo</p>
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
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">
                  {estadisticasMantenimiento.equipos_vencidos.toLocaleString()}
                </p>
                <p className="text-xs text-red-600">Urgente</p>
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
                  placeholder="Buscar equipo por código o nombre..."
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
                <option value="Monitor">Monitor</option>
                <option value="Ventilador">Ventilador</option>
                <option value="Bomba">Bomba</option>
                <option value="Desfibrilador">Desfibrilador</option>
                <option value="ECG">ECG</option>
              </select>
              <Button onClick={handleBuscar} variant="outline" size="sm" className="h-9">
                <Search className="w-4 h-4 mr-1" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Equipos para Mantenimiento */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Equipos Programados para Mantenimiento ({totalRegistros.toLocaleString()} total)
            </CardTitle>
          </div>
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
                        <TableHead className="w-32">Código</TableHead>
                        <TableHead className="w-40">Equipo</TableHead>
                        <TableHead className="w-28">Tipo</TableHead>
                        <TableHead className="w-32">Estado</TableHead>
                        <TableHead className="w-32">Último Mtto.</TableHead>
                        <TableHead className="w-32">Próximo Mtto.</TableHead>
                        <TableHead className="w-24">Días</TableHead>
                        <TableHead className="w-32">Criticidad</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipos.length > 0 ? (
                        equipos.map((equipo) => {
                          const diasRestantes = equipo.proximo_mantenimiento ? 
                            diasParaMantenimiento(equipo.proximo_mantenimiento) : null;
                          
                          return (
                            <TableRow key={equipo.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium text-sm text-blue-600">
                                {equipo.codigo_interno}
                              </TableCell>
                              <TableCell className="text-sm font-medium">
                                {equipo.nombre}
                              </TableCell>
                              <TableCell>
                                {getTipoBadge(equipo.tipo_equipo)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={equipo.estado === 'mantenimiento' ? 'destructive' : 'default'}>
                                  {equipo.estado?.charAt(0).toUpperCase() + equipo.estado?.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {equipo.fecha_ultimo_mantenimiento ? 
                                  formatearFecha(equipo.fecha_ultimo_mantenimiento) : 
                                  <span className="text-gray-400">Sin registro</span>
                                }
                              </TableCell>
                              <TableCell className="text-sm">
                                {equipo.proximo_mantenimiento ? 
                                  formatearFecha(equipo.proximo_mantenimiento) : 
                                  <span className="text-orange-600">Por programar</span>
                                }
                              </TableCell>
                              <TableCell>
                                {diasRestantes !== null ? (
                                  <Badge 
                                    variant={diasRestantes < 0 ? 'destructive' : 
                                            diasRestantes < 7 ? 'secondary' : 'outline'}
                                    className="text-xs"
                                  >
                                    {diasRestantes < 0 ? 
                                      `${Math.abs(diasRestantes)} vencido` : 
                                      `${diasRestantes} días`
                                    }
                                  </Badge>
                                ) : (
                                  <span className="text-gray-400 text-xs">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={equipo.criticidad === 'critica' ? 'destructive' : 
                                          equipo.criticidad === 'alta' ? 'secondary' : 'outline'}
                                  className="text-xs"
                                >
                                  {equipo.criticidad?.charAt(0).toUpperCase() + equipo.criticidad?.slice(1)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                            No se encontraron equipos para mantenimiento
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Paginación */}
              {totalRegistros > 0 && totalPaginas > 1 && (
                <div className="flex items-center justify-center gap-1 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={paginaAnterior}
                    disabled={paginaActual === 1}
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      const pagina = i + 1;
                      return (
                        <Button
                          key={pagina}
                          variant={paginaActual === pagina ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPaginaActual(pagina)}
                          className="w-8"
                        >
                          {pagina}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={paginaSiguiente}
                    disabled={paginaActual === totalPaginas}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}