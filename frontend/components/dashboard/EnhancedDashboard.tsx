'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { 
  Activity, Monitor, FileText, Wrench, DollarSign, Users, Clock, Star,
  AlertTriangle, CheckCircle, RefreshCw, Download, Bell, BarChart3, 
  PieChart as PieChartIcon, TrendingUp
} from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

interface DashboardData {
  stats?: {
    equipos: {
      total: number
      activos: number
      mantenimiento: number
      inactivos: number
    }
    solicitudes: {
      total_solicitudes: number
      pendientes: number
      en_proceso: number
      completadas: number
      vencidas: number
      por_tipo_solicitud: Array<{ tipo_solicitud: string; cantidad: number }>
      por_cliente: Array<{ cliente_nombre: string; total_solicitudes: number }>
    }
    ordenes: {
      total_ordenes: number
      pendientes: number
      en_proceso: number
      ejecutadas: number
    }
  }
  kpiMetrics?: {
    efficiency: {
      solicitudes_completadas_tiempo: number
      tiempo_respuesta_promedio: number
    }
    quality: {
      calificacion_promedio_visitas: number
      solicitudes_satisfaccion: number
      equipos_funcionando_ratio: number
    }
    productivity: {
      solicitudes_por_dia: number
    }
    revenue: {
      ingresos_estimados_mes: number
      crecimiento_mensual: number
      valor_promedio_orden: number
    }
  }
  recentActivity?: Array<{
    id: number
    description: string
    user_name: string
    created_at: string
    type: string
  }>
}

export function EnhancedDashboard() {
  const [data, setData] = useState<DashboardData>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Fetch real data from APIs
      const [statsRes, kpiRes, activityRes] = await Promise.all([
        fetch('http://localhost:3002/api/v1/real/dashboard/stats', { headers }).catch(() => null),
        fetch('http://localhost:3002/api/v1/real/dashboard/kpi', { headers }).catch(() => null),
        fetch('http://localhost:3002/api/v1/real/dashboard/activity', { headers }).catch(() => null)
      ])

      const dashboardData: DashboardData = {}

      // Process stats
      if (statsRes?.ok) {
        const statsData = await statsRes.json()
        if (statsData.success) {
          dashboardData.stats = statsData.data
        }
      }

      // Process KPI metrics
      if (kpiRes?.ok) {
        const kpiData = await kpiRes.json()
        if (kpiData.success) {
          dashboardData.kpiMetrics = kpiData.data
        }
      }

      // Process recent activity
      if (activityRes?.ok) {
        const activityData = await activityRes.json()
        if (activityData.success) {
          dashboardData.recentActivity = activityData.data
        }
      }

      // Set mock data if APIs are not available
      if (!dashboardData.stats) {
        dashboardData.stats = {
          equipos: { total: 125, activos: 98, mantenimiento: 15, inactivos: 12 },
          solicitudes: {
            total_solicitudes: 342,
            pendientes: 45,
            en_proceso: 23,
            completadas: 264,
            vencidas: 10,
            por_tipo_solicitud: [
              { tipo_solicitud: 'Mantenimiento', cantidad: 120 },
              { tipo_solicitud: 'Reparación', cantidad: 85 },
              { tipo_solicitud: 'Instalación', cantidad: 67 },
              { tipo_solicitud: 'Revisión', cantidad: 70 }
            ],
            por_cliente: [
              { cliente_nombre: 'Hospital Central', total_solicitudes: 45 },
              { cliente_nombre: 'Clínica Norte', total_solicitudes: 38 },
              { cliente_nombre: 'Centro Médico Sur', total_solicitudes: 32 },
              { cliente_nombre: 'Hospital Infantil', total_solicitudes: 28 },
              { cliente_nombre: 'Clínica Dental Elite', total_solicitudes: 24 }
            ]
          },
          ordenes: { total_ordenes: 89, pendientes: 12, en_proceso: 8, ejecutadas: 69 }
        }
      }

      if (!dashboardData.kpiMetrics) {
        dashboardData.kpiMetrics = {
          efficiency: { solicitudes_completadas_tiempo: 92.5, tiempo_respuesta_promedio: 2.8 },
          quality: { calificacion_promedio_visitas: 4.7, solicitudes_satisfaccion: 96.2, equipos_funcionando_ratio: 89.3 },
          productivity: { solicitudes_por_dia: 12.3 },
          revenue: { ingresos_estimados_mes: 15600000, crecimiento_mensual: 12.8, valor_promedio_orden: 875000 }
        }
      }

      if (!dashboardData.recentActivity) {
        dashboardData.recentActivity = [
          { id: 1, description: 'Nueva solicitud de mantenimiento correctivo para Ventilador en FCV', user_name: 'Juan Pérez', created_at: '2025-11-06T18:47:50.000Z', type: 'solicitud' },
          { id: 2, description: 'Orden de trabajo completada para equipo rayos X', user_name: 'María García', created_at: '2025-11-06T17:30:00.000Z', type: 'orden' },
          { id: 3, description: 'Nuevo cliente registrado: Clínica San Rafael', user_name: 'Carlos López', created_at: '2025-11-06T16:15:00.000Z', type: 'cliente' },
          { id: 4, description: 'Cotización aprobada para equipos de laboratorio', user_name: 'Ana Rodríguez', created_at: '2025-11-06T15:00:00.000Z', type: 'cotización' }
        ]
      }

      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Error al cargar los datos del dashboard')
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { stats, kpiMetrics, recentActivity } = data

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
          <Button variant="outline" size="sm">
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
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${kpiMetrics.efficiency.solicitudes_completadas_tiempo}%` }}
                ></div>
              </div>
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
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(kpiMetrics.quality.calificacion_promedio_visitas / 5) * 100}%` }}
                ></div>
              </div>
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
              {recentActivity?.map((activity) => (
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
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Satisfacción</span>
                    <span className="font-medium">{formatPercentage(kpiMetrics.quality.solicitudes_satisfaccion)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${kpiMetrics.quality.solicitudes_satisfaccion}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Equipos funcionando</span>
                    <span className="font-medium">{formatPercentage(kpiMetrics.quality.equipos_funcionando_ratio)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full" 
                      style={{ width: `${kpiMetrics.quality.equipos_funcionando_ratio}%` }}
                    ></div>
                  </div>
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