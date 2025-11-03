'use client'

import { useState, useEffect } from 'react'
import { dashboardApi, DashboardStats, ActivityLog, KPIMetrics } from '@/lib/api/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts'
import { 
  Activity, TrendingUp, TrendingDown, Monitor, FileText, 
  Wrench, Calendar, DollarSign, Users, Clock, Star,
  AlertTriangle, CheckCircle, RefreshCw, Download,
  Settings, Bell, BarChart3, PieChart as PieChartIcon
} from 'lucide-react'
import { toast } from 'sonner'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const [statsRes, kpiRes, activityRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getKPIMetrics(),
        dashboardApi.getRecentActivity(5)
      ])

      if (statsRes.success && statsRes.data) setStats(statsRes.data)
      if (kpiRes.success && kpiRes.data) setKpiMetrics(kpiRes.data)
      if (activityRes.success && activityRes.data) setRecentActivity(activityRes.data)
    } catch (error) {
      toast.error('Error al cargar el dashboard')
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleExport = () => {
    toast.info('Función de exportación en desarrollo')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completada':
      case 'ejecutada':
      case 'aprobada':
      case 'activo': return 'text-green-600'
      case 'pendiente':
      case 'programada':
      case 'borrador': return 'text-yellow-600'
      case 'en_proceso':
      case 'en_curso':
      case 'asignada': return 'text-blue-600'
      case 'cancelada':
      case 'rechazada':
      case 'inactivo': return 'text-red-600'
      case 'mantenimiento': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard General</h1>
          <p className="text-muted-foreground">
            Resumen ejecutivo y métricas en tiempo real
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {kpiMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eficiencia General</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(kpiMetrics.efficiency.solicitudes_completadas_tiempo)}</div>
              <p className="text-xs text-muted-foreground">
                Solicitudes completadas a tiempo
              </p>
              <Progress value={kpiMetrics.efficiency.solicitudes_completadas_tiempo} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calidad de Servicio</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiMetrics.quality.calificacion_promedio_visitas.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Calificación promedio de visitas
              </p>
              <Progress value={(kpiMetrics.quality.calificacion_promedio_visitas / 5) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productividad</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiMetrics.productivity.solicitudes_por_dia.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Solicitudes procesadas por día
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(kpiMetrics.revenue.ingresos_estimados_mes)}</div>
              <p className="text-xs text-muted-foreground">
                +{formatPercentage(kpiMetrics.revenue.crecimiento_mensual)} vs mes anterior
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Equipos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Equipos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.equipos.total}</div>
                  <p className="text-sm text-muted-foreground">Total de equipos</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Activos</span>
                    <Badge variant="outline" className="text-green-600">
                      {stats.equipos.activos}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mantenimiento</span>
                    <Badge variant="outline" className="text-orange-600">
                      {stats.equipos.mantenimiento}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Inactivos</span>
                    <Badge variant="outline" className="text-red-600">
                      {stats.equipos.inactivos}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solicitudes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Solicitudes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.solicitudes.total_solicitudes}</div>
                  <p className="text-sm text-muted-foreground">Total solicitudes</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Pendientes</span>
                    <Badge variant="outline" className="text-yellow-600">
                      {stats.solicitudes.pendientes}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">En proceso</span>
                    <Badge variant="outline" className="text-blue-600">
                      {stats.solicitudes.en_proceso}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completadas</span>
                    <Badge variant="outline" className="text-green-600">
                      {stats.solicitudes.completadas}
                    </Badge>
                  </div>
                  {stats.solicitudes.vencidas > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Vencidas
                      </span>
                      <Badge variant="destructive">
                        {stats.solicitudes.vencidas}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Órdenes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Órdenes de Trabajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.ordenes.total_ordenes}</div>
                  <p className="text-sm text-muted-foreground">Total órdenes</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Pendientes</span>
                    <Badge variant="outline" className="text-yellow-600">
                      {stats.ordenes.pendientes}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">En proceso</span>
                    <Badge variant="outline" className="text-blue-600">
                      {stats.ordenes.en_proceso}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Ejecutadas</span>
                    <Badge variant="outline" className="text-green-600">
                      {stats.ordenes.ejecutadas}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solicitudes por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Solicitudes por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.solicitudes.por_tipo_solicitud}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tipo_solicitud, cantidad }) => `${tipo_solicitud}: ${cantidad}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {stats.solicitudes.por_tipo_solicitud.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Clientes Más Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.solicitudes.por_cliente.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="cliente_nombre" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_solicitudes" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{activity.user_name}</span>
                      <span>•</span>
                      <span>{new Date(activity.created_at).toLocaleString('es-CO')}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Métricas Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kpiMetrics && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tiempo respuesta</span>
                    <span className="font-medium">{kpiMetrics.efficiency.tiempo_respuesta_promedio}h</span>
                  </div>
                  <Progress value={75} className="mt-1" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Satisfacción</span>
                    <span className="font-medium">{formatPercentage(kpiMetrics.quality.solicitudes_satisfaccion)}</span>
                  </div>
                  <Progress value={kpiMetrics.quality.solicitudes_satisfaccion} className="mt-1" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Equipos funcionando</span>
                    <span className="font-medium">{formatPercentage(kpiMetrics.quality.equipos_funcionando_ratio)}</span>
                  </div>
                  <Progress value={kpiMetrics.quality.equipos_funcionando_ratio} className="mt-1" />
                </div>

                <Separator />
                
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(kpiMetrics.revenue.valor_promedio_orden)}
                  </div>
                  <p className="text-xs text-muted-foreground">Valor promedio por orden</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}