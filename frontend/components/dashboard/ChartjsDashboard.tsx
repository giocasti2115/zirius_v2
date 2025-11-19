'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, PieChart, LineChart } from './ModernCharts';
import { dashboardService } from '@/lib/services/dashboard.service';
import type { EstadisticasDashboard } from '@/lib/services/dashboard.service';

export default function ChartjsDashboard() {
  const [data, setData] = useState<EstadisticasDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarDatos = async () => {
    try {
      setRefreshing(true);
      const estadisticas = await dashboardService.obtenerEstadisticas();
      setData(estadisticas);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-10 bg-gray-300 rounded w-32"></div>
              <div className="h-10 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
          
          {/* KPIs skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
          
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Error al cargar datos
          </h2>
          <p className="text-gray-500 mb-4">
            No se pudieron obtener las estadísticas del dashboard
          </p>
          <Button onClick={cargarDatos}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Preparar datos para gráficos con colores mejorados
  const datosSolicitudes = [
    { name: 'Pendientes', value: data.solicitudesPendientes, color: '#f59e0b' },
    { name: 'En Proceso', value: data.solicitudesEnProceso, color: '#3b82f6' },
    { name: 'Completadas', value: data.solicitudesCompletadas, color: '#10b981' },
    { name: 'Canceladas', value: data.solicitudesCanceladas, color: '#ef4444' }
  ];

  const datosVisitas = [
    { name: 'Programadas', value: data.visitasProgramadas, color: '#8b5cf6' },
    { name: 'Completadas', value: data.visitasCompletadas, color: '#10b981' },
    { name: 'Canceladas', value: data.visitasCanceladas, color: '#ef4444' }
  ];

  const datosTendencia = [
    { name: 'Ene', value: Math.floor(Math.random() * 100) + 50, color: '#3b82f6' },
    { name: 'Feb', value: Math.floor(Math.random() * 100) + 60, color: '#3b82f6' },
    { name: 'Mar', value: Math.floor(Math.random() * 100) + 70, color: '#3b82f6' },
    { name: 'Abr', value: Math.floor(Math.random() * 100) + 65, color: '#3b82f6' },
    { name: 'May', value: Math.floor(Math.random() * 100) + 80, color: '#3b82f6' },
    { name: 'Jun', value: data.totalSolicitudes, color: '#3b82f6' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header mejorado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Ejecutivo
          </h1>
          <p className="text-gray-600 mt-1">
            Resumen general del sistema • Actualizado hace {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="hidden sm:flex"
          >
            📊 Exportar Reporte
          </Button>
          <Button 
            onClick={cargarDatos}
            disabled={refreshing}
            className="relative"
          >
            {refreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <span className="mr-2">🔄</span>
            )}
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPIs mejorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              📋 Total Solicitudes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {data.totalSolicitudes.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {data.solicitudesPendientes} pendientes
              </Badge>
              <span className="text-xs text-gray-500">
                {((data.solicitudesCompletadas / data.totalSolicitudes) * 100).toFixed(1)}% completadas
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              📅 Visitas Técnicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {data.totalVisitas.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {data.visitasCompletadas} completadas
              </Badge>
              <span className="text-xs text-gray-500">
                {data.visitasProgramadas} programadas
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              💰 Cotizaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {data.totalCotizaciones.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Activas
              </Badge>
              <span className="text-xs text-gray-500">
                En proceso
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              ⚙️ Órdenes de Servicio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {data.totalOrdenes.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                En proceso
              </Badge>
              <span className="text-xs text-gray-500">
                Activas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos mejorados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <BarChart 
          data={datosSolicitudes}
          title="Estado de Solicitudes"
        />
        
        <PieChart
          data={datosVisitas}
          title="Distribución de Visitas"
        />

        <LineChart
          data={datosTendencia}
          title="Tendencia Mensual (Solicitudes)"
        />
      </div>

      {/* Panel de acciones mejorado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              🚀 Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <span className="text-2xl">📋</span>
                <span className="text-sm">Nueva Solicitud</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-300"
              >
                <span className="text-2xl">📅</span>
                <span className="text-sm">Programar Visita</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-yellow-50 hover:border-yellow-300"
              >
                <span className="text-2xl">💰</span>
                <span className="text-sm">Nueva Cotización</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-300"
              >
                <span className="text-2xl">⚙️</span>
                <span className="text-sm">Orden de Servicio</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              📊 Resumen Ejecutivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Eficiencia de Visitas</span>
                <span className="text-lg font-bold text-green-600">
                  {data.totalVisitas > 0 ? ((data.visitasCompletadas / data.totalVisitas) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Tasa de Completado</span>
                <span className="text-lg font-bold text-blue-600">
                  {data.totalSolicitudes > 0 ? ((data.solicitudesCompletadas / data.totalSolicitudes) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Órdenes Activas</span>
                <span className="text-lg font-bold text-purple-600">
                  {data.totalOrdenes}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}