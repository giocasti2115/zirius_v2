'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleBarChart, SimplePieChart } from './SimpleCharts';
import { dashboardService } from '@/lib/services/dashboard.service';
import type { EstadisticasDashboard } from '@/lib/services/dashboard.service';

export default function FallbackDashboard() {
  const [data, setData] = useState<EstadisticasDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const estadisticas = await dashboardService.obtenerEstadisticas();
        setData(estadisticas);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
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
          <p className="text-gray-500">No se pudieron cargar las estadísticas</p>
        </div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const datosSolicitudes = [
    { name: 'Pendientes', value: data.solicitudesPendientes, color: '#f59e0b' },
    { name: 'En Proceso', value: data.solicitudesEnProceso, color: '#3b82f6' },
    { name: 'Completadas', value: data.solicitudesCompletadas, color: '#10b981' },
    { name: 'Canceladas', value: data.solicitudesCanceladas, color: '#ef4444' }
  ];

  const datosVisitas = [
    { name: 'Programadas', value: data.visitasProgramadas, color: '#3b82f6' },
    { name: 'Completadas', value: data.visitasCompletadas, color: '#10b981' },
    { name: 'Canceladas', value: data.visitasCanceladas, color: '#ef4444' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen general del sistema</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            Exportar Reporte
          </Button>
          <Button>
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Solicitudes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSolicitudes}</div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {data.solicitudesPendientes} pendientes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Visitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalVisitas}</div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {data.visitasCompletadas} completadas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Cotizaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCotizaciones}</div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Activas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Órdenes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrdenes}</div>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                En proceso
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart 
          data={datosSolicitudes}
          title="Estado de Solicitudes"
        />
        
        <SimplePieChart
          data={datosVisitas}
          title="Distribución de Visitas"
        />
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <span className="text-2xl">📋</span>
              <span>Nueva Solicitud</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <span className="text-2xl">📅</span>
              <span>Programar Visita</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <span className="text-2xl">💰</span>
              <span>Nueva Cotización</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
              <span className="text-2xl">📊</span>
              <span>Ver Reportes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}