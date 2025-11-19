'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieChart, BarChart } from '@/components/dashboard/ModernCharts';
import { equiposStatsService, EstadisticasEquipos } from '@/lib/services/equipos-stats.service';
import { 
  Monitor, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Shield,
  TrendingUp,
  Activity
} from 'lucide-react';

interface EquiposStatsProps {
  onRefresh?: () => void;
}

export function EquiposStats({ onRefresh }: EquiposStatsProps) {
  const [stats, setStats] = useState<EstadisticasEquipos | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarEstadisticas = async () => {
    try {
      setRefreshing(true);
      const estadisticas = await equiposStatsService.obtenerEstadisticas();
      setStats(estadisticas);
    } catch (error) {
      console.error('Error al cargar estadísticas de equipos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se pudieron cargar las estadísticas</p>
            <Button onClick={cargarEstadisticas} className="mt-4">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular porcentajes
  const porcentajeActivos = ((stats.equiposActivos / stats.totalEquipos) * 100).toFixed(1);
  const porcentajeMantenimiento = ((stats.equiposMantenimiento / stats.totalEquipos) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Estadísticas de Equipos</h2>
          <p className="text-gray-600">Resumen del estado y distribución de equipos médicos</p>
        </div>
        <Button 
          onClick={() => {
            cargarEstadisticas();
            onRefresh?.();
          }}
          disabled={refreshing}
          className="relative"
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Activity className="h-4 w-4 mr-2" />
          )}
          Actualizar
        </Button>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Monitor className="h-4 w-4 mr-2" />
              Total Equipos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {stats.totalEquipos.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Inventario total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Equipos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {stats.equiposActivos.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {porcentajeActivos}% del total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              En Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {stats.equiposMantenimiento.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {porcentajeMantenimiento}% del total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Mtto. Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {stats.mantenimientosPendientes.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Programados
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <PieChart 
          data={equiposStatsService.obtenerDatosGraficoEstados(stats)}
          title="Estado de Equipos"
        />
        
        <BarChart
          data={equiposStatsService.obtenerDatosGraficoTipos(stats)}
          title="Equipos por Tipo"
        />

        <BarChart
          data={equiposStatsService.obtenerDatosGraficoSedes(stats)}
          title="Distribución por Sede"
        />
      </div>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Estado de Garantías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Equipos con Garantía</span>
              <span className="text-lg font-bold text-green-600">
                {stats.equiposConGarantia}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mt-4">
              <span className="text-sm font-medium">Sin Garantía</span>
              <span className="text-lg font-bold text-red-600">
                {stats.totalEquipos - stats.equiposConGarantia}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Indicadores de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Disponibilidad</span>
                <span className="text-lg font-bold text-green-600">
                  {porcentajeActivos}%
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Tasa de Mantenimiento</span>
                <span className="text-lg font-bold text-yellow-600">
                  {porcentajeMantenimiento}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}