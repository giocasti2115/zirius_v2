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
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Shield,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { equiposService, Equipo } from '@/lib/services/equipos.service';

export default function CalibracionesPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(25);
  const [totalRegistros, setTotalRegistros] = useState(0);
  
  // Estadísticas de calibraciones
  const [estadisticasCalibracion, setEstadisticasCalibracion] = useState({
    total_equipos: 0,
    pendientes: 0,
    vencidas: 0,
    completadas_mes: 0,
    proximas_30_dias: 0,
    cumplimiento: 0
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
      
      console.log('🔄 Cargando equipos para calibración...');
      
      const equiposData = await equiposService.obtenerEquiposCalibraciones({ 
        limit: registrosPorPagina,
        page: paginaActual,
        codigo_interno: busqueda || undefined
      });

      if (equiposData.success) {
        // Filtrar solo equipos que requieren calibración
        const equiposCalibrar = equiposData.data.equipos.filter(e => e.requiere_calibracion);
        setEquipos(equiposCalibrar);
        setTotalRegistros(equiposCalibrar.length);
        
        // Calcular estadísticas específicas de calibración
        const ahora = new Date();
        const proximos30 = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const equiposVencidos = equiposCalibrar.filter(e => {
          if (!e.proximo_mantenimiento) return false; // Usar como proxy para calibración
          return new Date(e.proximo_mantenimiento) < ahora;
        });
        
        const equiposProximos = equiposCalibrar.filter(e => {
          if (!e.proximo_mantenimiento) return false;
          const fechaProxima = new Date(e.proximo_mantenimiento);
          return fechaProxima >= ahora && fechaProxima <= proximos30;
        });
        
        setEstadisticasCalibracion({
          total_equipos: equiposCalibrar.length,
          pendientes: equiposCalibrar.filter(e => e.estado === 'activo').length,
          vencidas: equiposVencidos.length,
          completadas_mes: Math.floor(equiposCalibrar.length * 0.12), // Mock
          proximas_30_dias: equiposProximos.length,
          cumplimiento: 92.3 // Mock
        });
        
        console.log('✅ Equipos para calibración cargados:', equiposCalibrar.length);
      } else {
        setError('Error cargando equipos para calibración');
      }

    } catch (err) {
      console.error('❌ Error cargando equipos calibración:', err);
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
            <h1 className="text-2xl font-bold text-gray-900">Control de Calibraciones</h1>
          </div>
          <p className="text-sm text-gray-600">
            Gestión y seguimiento de calibraciones de equipos biomédicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Programar
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Calibración
          </Button>
        </div>
      </div>

      {/* Estadísticas Específicas de Calibraciones */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Equipos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {estadisticasCalibracion.total_equipos.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Requieren calib.</p>
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
                  {estadisticasCalibracion.pendientes.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Por calibrar</p>
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
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Vencidas</p>
                <p className="text-2xl font-bold text-red-600">
                  {estadisticasCalibracion.vencidas.toLocaleString()}
                </p>
                <p className="text-xs text-red-600">Urgente</p>
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
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {estadisticasCalibracion.completadas_mes.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Próximas 30d</p>
                <p className="text-2xl font-bold text-orange-600">
                  {estadisticasCalibracion.proximas_30_dias.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Por vencer</p>
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
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Cumplimiento</p>
                <p className="text-2xl font-bold text-purple-600">
                  {estadisticasCalibracion.cumplimiento.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Meta: 95%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resto del contenido */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar equipo por código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 h-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                />
              </div>
            </div>
            <Button onClick={handleBuscar} variant="outline" size="sm" className="h-9">
              <Search className="w-4 h-4 mr-1" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Equipos para Calibración */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Equipos para Calibración ({totalRegistros.toLocaleString()} total)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando equipos...</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-gray-50 z-10">
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Equipo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Última Calib.</TableHead>
                      <TableHead>Próxima Calib.</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {equipos.length > 0 ? (
                      equipos.map((equipo) => (
                        <TableRow key={equipo.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-blue-600">
                            {equipo.codigo_interno}
                          </TableCell>
                          <TableCell>{equipo.nombre}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{equipo.tipo_equipo}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={equipo.estado === 'activo' ? 'default' : 'secondary'}>
                              {equipo.estado}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {equipo.fecha_ultimo_mantenimiento ? 
                              new Date(equipo.fecha_ultimo_mantenimiento).toLocaleDateString('es-ES') : 
                              'Sin registro'
                            }
                          </TableCell>
                          <TableCell>
                            {equipo.proximo_mantenimiento ? 
                              new Date(equipo.proximo_mantenimiento).toLocaleDateString('es-ES') : 
                              'Por programar'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {equipo.criticidad}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No hay equipos que requieran calibración
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
            <p className="text-xs text-muted-foreground">En los próximos 30 días</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">156</div>
            <p className="text-xs text-muted-foreground">Este año</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">Bajo calibración</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información de Calibraciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="text-xs">
            En Desarrollo
          </Badge>
          <p className="text-muted-foreground mt-4">
            Próximamente: Sistema completo de gestión de calibraciones con programación automática, 
            alertas de vencimiento y seguimiento de certificados.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}