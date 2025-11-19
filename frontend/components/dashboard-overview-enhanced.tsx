'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  MapPin, 
  Monitor, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  Filter
} from 'lucide-react'
import { clienteApi } from '@/lib/api/clientes'
import { sedeApi } from '@/lib/api/sedes'
import { equipoApi } from '@/lib/api/equipos'

interface DashboardMetrics {
  totalClientes: number
  totalSedes: number
  totalEquipos: number
  equiposActivos: number
  equiposMantenimiento: number
  equiposInactivos: number
  sedesActivas: number
  clientesActivos: number
}

export function DashboardOverviewEnhanced() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalClientes: 0,
    totalSedes: 0,
    totalEquipos: 0,
    equiposActivos: 0,
    equiposMantenimiento: 0,
    equiposInactivos: 0,
    sedesActivas: 0,
    clientesActivos: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      
      // Fetch data from APIs
      const [clientesRes, sedesRes, equiposRes] = await Promise.all([
        clienteApi.getAll({ limit: 1000 }), // Get all for counting
        sedeApi.getAll({ limit: 1000 }),
        equipoApi.getAll({ limit: 1000 })
      ])

      let newMetrics: DashboardMetrics = {
        totalClientes: 0,
        totalSedes: 0,
        totalEquipos: 0,
        equiposActivos: 0,
        equiposMantenimiento: 0,
        equiposInactivos: 0,
        sedesActivas: 0,
        clientesActivos: 0
      }

      // Process clients data
      if (clientesRes.success && clientesRes.data) {
        newMetrics.totalClientes = clientesRes.data.clientes.length
        newMetrics.clientesActivos = clientesRes.data.clientes.filter(c => c.activo).length
      }

      // Process sedes data
      if (sedesRes.success && sedesRes.data) {
        newMetrics.totalSedes = sedesRes.data.sedes.length
        newMetrics.sedesActivas = sedesRes.data.sedes.filter(s => s.activo).length
      }

      // Process equipos data
      if (equiposRes.success && equiposRes.data) {
        const equipos = equiposRes.data.equipos
        newMetrics.totalEquipos = equipos.length
        newMetrics.equiposActivos = equipos.filter(e => e.estado === 'activo').length
        newMetrics.equiposMantenimiento = equipos.filter(e => e.estado === 'mantenimiento').length
        newMetrics.equiposInactivos = equipos.filter(e => e.estado === 'inactivo' || e.estado === 'dado_baja').length
      }

      setMetrics(newMetrics)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    subtitle,
    variant = 'default'
  }: {
    title: string
    value: number
    icon: any
    trend?: 'up' | 'down'
    trendValue?: string
    subtitle?: string
    variant?: 'default' | 'success' | 'warning' | 'destructive'
  }) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'success':
          return 'border-green-200 bg-green-50'
        case 'warning':
          return 'border-yellow-200 bg-yellow-50'
        case 'destructive':
          return 'border-red-200 bg-red-50'
        default:
          return 'border-gray-200'
      }
    }

    return (
      <Card className={getVariantStyles()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : value.toLocaleString()}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center text-xs mt-1 ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${
                trend === 'down' ? 'rotate-180' : ''
              }`} />
              {trendValue}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const equipmentHealthPercentage = metrics.totalEquipos > 0 
    ? Math.round((metrics.equiposActivos / metrics.totalEquipos) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Vista general del sistema ZIRIUZ
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Clientes"
          value={metrics.totalClientes}
          icon={Users}
          subtitle={`${metrics.clientesActivos} activos`}
          variant="default"
        />
        
        <MetricCard
          title="Total Sedes"
          value={metrics.totalSedes}
          icon={MapPin}
          subtitle={`${metrics.sedesActivas} activas`}
          variant="default"
        />
        
        <MetricCard
          title="Total Equipos"
          value={metrics.totalEquipos}
          icon={Monitor}
          subtitle={`${equipmentHealthPercentage}% saludables`}
          variant={equipmentHealthPercentage >= 80 ? 'success' : equipmentHealthPercentage >= 60 ? 'warning' : 'destructive'}
        />
        
        <MetricCard
          title="Salud General"
          value={equipmentHealthPercentage}
          icon={equipmentHealthPercentage >= 80 ? CheckCircle : AlertTriangle}
          subtitle={`${metrics.equiposActivos} equipos activos`}
          variant={equipmentHealthPercentage >= 80 ? 'success' : equipmentHealthPercentage >= 60 ? 'warning' : 'destructive'}
        />
      </div>

      {/* Equipment Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Equipos Activos"
          value={metrics.equiposActivos}
          icon={CheckCircle}
          subtitle="Funcionando correctamente"
          variant="success"
        />
        
        <MetricCard
          title="En Mantenimiento"
          value={metrics.equiposMantenimiento}
          icon={Clock}
          subtitle="Requieren atención"
          variant="warning"
        />
        
        <MetricCard
          title="Fuera de Servicio"
          value={metrics.equiposInactivos}
          icon={AlertTriangle}
          subtitle="Inactivos o dados de baja"
          variant="destructive"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resumen Mensual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Clientes Nuevos</span>
                <Badge>+5 este mes</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Sedes Agregadas</span>
                <Badge>+8 este mes</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Equipos Instalados</span>
                <Badge>+12 este mes</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas y Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Equipos requieren mantenimiento</p>
                  <p className="text-xs text-muted-foreground">
                    {metrics.equiposMantenimiento} equipos necesitan atención
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Sistema funcionando bien</p>
                  <p className="text-xs text-muted-foreground">
                    Todos los servicios operativos
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Próximos vencimientos</p>
                  <p className="text-xs text-muted-foreground">
                    3 garantías vencen próximamente
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Agregar Cliente</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <MapPin className="h-6 w-6" />
              <span>Nueva Sede</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Monitor className="h-6 w-6" />
              <span>Registrar Equipo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}