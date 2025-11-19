'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  MapPin,
  DollarSign,
  Settings,
  Eye,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { dashboardService, DashboardStats, ChartData, TimeSeriesData } from '@/lib/services/dashboard.service';

export default function ModernDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    cargarDatos();
    cargarUsuario();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.obtenerEstadisticas();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Error al cargar estadísticas');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuario = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  };

  if (!mounted || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error || 'Error cargando datos'}</span>
          </div>
          <Button onClick={cargarDatos} className="mt-3" size="sm">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const solicitudesChartData = dashboardService.obtenerDatosGraficosSolicitudes(stats);
  const visitasChartData = dashboardService.obtenerDatosGraficosVisitas(stats);
  const cotizacionesChartData = dashboardService.obtenerDatosGraficosCotizaciones(stats);
  const tendenciasData = dashboardService.obtenerDatosTendencias();

  // Debug logs
  console.log('Dashboard stats:', stats);
  console.log('Solicitudes chart data:', solicitudesChartData);
  console.log('Visitas chart data:', visitasChartData);
  console.log('Cotizaciones chart data:', cotizacionesChartData);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header de Bienvenida */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido de vuelta, {user?.nombre || user?.usuario || 'Usuario'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          <Button size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Vista Completa
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.solicitudes.total_solicitudes}</p>
                <p className="text-xs text-gray-600">Total Solicitudes</p>
                <p className="text-xs text-blue-600 font-medium">
                  {stats.solicitudes.pendientes} pendientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.visitas.total_visitas}</p>
                <p className="text-xs text-gray-600">Total Visitas</p>
                <p className="text-xs text-green-600 font-medium">
                  {stats.visitas.completadas} completadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.cotizaciones.total_cotizaciones}</p>
                <p className="text-xs text-gray-600">Total Cotizaciones</p>
                <p className="text-xs text-purple-600 font-medium">
                  {stats.cotizaciones.aprobadas} aprobadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.ordenes.total_ordenes}</p>
                <p className="text-xs text-gray-600">Total Órdenes</p>
                <p className="text-xs text-orange-600 font-medium">
                  {stats.ordenes.ejecutadas} ejecutadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Solicitudes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Estado de Solicitudes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mounted && solicitudesChartData && solicitudesChartData.length > 0 ? (
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={solicitudesChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {solicitudesChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay datos disponibles</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Visitas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-600" />
              Estado de Visitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mounted && visitasChartData && visitasChartData.length > 0 ? (
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer>
                  <BarChart data={visitasChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay datos disponibles</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Cotizaciones */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
              Estado de Cotizaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mounted && cotizacionesChartData && cotizacionesChartData.length > 0 ? (
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={cotizacionesChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {cotizacionesChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-500">
                <div className="text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay datos disponibles</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tendencias Mensuales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-600" />
            Tendencias de los Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mounted && tendenciasData && tendenciasData.length > 0 ? (
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <LineChart data={tendenciasData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="solicitudes" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="visitas" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="cotizaciones" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="ordenes" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-72 text-gray-500">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay datos de tendencias disponibles</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/solicitudes">
              <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 flex-col gap-2">
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Nueva Solicitud</span>
              </Button>
            </Link>
            
            <Link href="/visitas">
              <Button className="w-full h-20 bg-green-600 hover:bg-green-700 flex-col gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Programar Visita</span>
              </Button>
            </Link>
            
            <Link href="/cotizaciones">
              <Button className="w-full h-20 bg-purple-600 hover:bg-purple-700 flex-col gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Nueva Cotización</span>
              </Button>
            </Link>
            
            <Link href="/clientes">
              <Button className="w-full h-20 bg-orange-600 hover:bg-orange-700 flex-col gap-2">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Gestionar Clientes</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Equipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-600" />
              Estado de Equipos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Activos</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.equipos.activos}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">En Mantenimiento</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats.equipos.mantenimiento}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium">Inactivos</span>
                </div>
                <span className="text-lg font-bold text-red-600">{stats.equipos.inactivos}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-600" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Nueva solicitud de mantenimiento
                  </p>
                  <p className="text-xs text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Visita técnica completada
                  </p>
                  <p className="text-xs text-gray-500">Hace 4 horas</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Cotización aprobada
                  </p>
                  <p className="text-xs text-gray-500">Hace 6 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}