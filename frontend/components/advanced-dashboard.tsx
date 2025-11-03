'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdvancedFilters, FilterOption, ActiveFilter } from '@/components/ui/advanced-filters'
import { ExportDialog, useExport } from '@/components/ui/export-dialog'
import { ActivityLog, UserActivity } from '@/components/ui/activity-log'
import { NotificationCenter, Notification, NotificationRule } from '@/components/ui/notification-center'
import { 
  Users, 
  Building2, 
  Wrench, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Bell,
  Activity,
  FileText,
  Download,
  Filter,
  Eye,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import { clienteApi } from '@/lib/api/clientes'
import { sedeApi } from '@/lib/api/sedes'
import { equipoApi } from '@/lib/api/equipos'

interface DashboardData {
  clients: any[]
  sedes: any[]
  equipos: any[]
  ordenes: any[]
}

interface DashboardMetrics {
  totalClients: number
  totalSedes: number
  totalEquipos: number
  equipmentHealth: number
  pendingOrders: number
  urgentAlerts: number
  monthlyGrowth: number
  activeUsers: number
}

export function AdvancedDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalClients: 0,
    totalSedes: 0,
    totalEquipos: 0,
    equipmentHealth: 0,
    pendingOrders: 0,
    urgentAlerts: 0,
    monthlyGrowth: 0,
    activeUsers: 0
  })
  const [data, setData] = useState<DashboardData>({
    clients: [],
    sedes: [],
    equipos: [],
    ordenes: []
  })
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  
  // Mock data for advanced features
  const [activities, setActivities] = useState<UserActivity[]>([
    {
      id: '1',
      userId: '1',
      userName: 'Juan Pérez',
      userEmail: 'juan@ejemplo.com',
      action: 'Crear Cliente',
      category: 'data',
      level: 'success',
      description: 'Se creó un nuevo cliente: Clínica Dental ABC',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
      duration: 2500,
      affectedResource: {
        type: 'cliente',
        id: 'cli_123',
        name: 'Clínica Dental ABC'
      }
    },
    {
      id: '2',
      userId: '2',
      userName: 'María García',
      userEmail: 'maria@ejemplo.com',
      action: 'Actualizar Equipo',
      category: 'data',
      level: 'info',
      description: 'Se actualizó el estado del equipo a mantenimiento',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hora atrás
      duration: 1800,
      affectedResource: {
        type: 'equipo',
        id: 'eq_456',
        name: 'Compresor Dental XYZ'
      }
    }
  ])

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Mantenimiento Programado',
      message: 'El equipo compresor de la Sede Central requiere mantenimiento preventivo',
      type: 'warning',
      priority: 'high',
      channels: ['in-app', 'email'],
      recipients: ['admin@ejemplo.com'],
      read: false,
      archived: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
      actions: [
        { label: 'Programar', action: 'schedule_maintenance', style: 'primary' },
        { label: 'Posponer', action: 'postpone', style: 'secondary' }
      ]
    },
    {
      id: '2',
      title: 'Nuevo Cliente Registrado',
      message: 'Se ha registrado un nuevo cliente: Clínica Dental Norte',
      type: 'success',
      priority: 'medium',
      channels: ['in-app'],
      recipients: ['sales@ejemplo.com'],
      read: true,
      archived: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    }
  ])

  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'Alertas de Mantenimiento',
      description: 'Notifica cuando un equipo requiere mantenimiento',
      enabled: true,
      trigger: {
        event: 'equipment_maintenance_due',
        conditions: { days_until_maintenance: 7 }
      },
      template: {
        title: 'Mantenimiento Programado',
        message: 'El equipo {{equipment_name}} requiere mantenimiento',
        type: 'warning',
        priority: 'high',
        channels: ['in-app', 'email']
      },
      recipients: {
        type: 'role',
        values: ['technician', 'manager']
      }
    }
  ])

  const { exportData } = useExport()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch real data
      const [clientsResponse, sedesResponse, equiposResponse] = await Promise.all([
        clienteApi.getAll(),
        sedeApi.getAll(),
        equipoApi.getAll()
      ])

      const clients = Array.isArray(clientsResponse.data) ? clientsResponse.data : []
      const sedes = Array.isArray(sedesResponse.data) ? sedesResponse.data : []
      const equipos = Array.isArray(equiposResponse.data) ? equiposResponse.data : []

      // Calculate metrics
      const equiposActivos = equipos.filter((e: any) => e.estado === 'activo').length
      const equiposMantenimiento = equipos.filter((e: any) => e.estado === 'mantenimiento').length
      const equipmentHealthPercentage = equipos.length > 0 
        ? Math.round((equiposActivos / equipos.length) * 100) 
        : 100

      setData({ clients, sedes, equipos, ordenes: [] })
      setMetrics({
        totalClients: clients.length,
        totalSedes: sedes.length,
        totalEquipos: equipos.length,
        equipmentHealth: equipmentHealthPercentage,
        pendingOrders: 5, // Mock data
        urgentAlerts: 2, // Mock data
        monthlyGrowth: 12.5, // Mock data
        activeUsers: 8 // Mock data
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter options for different data types
  const clientFilters: FilterOption[] = [
    { key: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Buscar por nombre' },
    { key: 'estado', label: 'Estado', type: 'select', options: [
      { value: 'activo', label: 'Activo' },
      { value: 'inactivo', label: 'Inactivo' }
    ]},
    { key: 'fechaCreacion', label: 'Fecha de Creación', type: 'dateRange' }
  ]

  const equipmentFields = [
    { key: 'id', label: 'ID', type: 'text' as const, required: true },
    { key: 'nombre', label: 'Nombre', type: 'text' as const, required: true },
    { key: 'marca', label: 'Marca', type: 'text' as const, required: false },
    { key: 'modelo', label: 'Modelo', type: 'text' as const, required: false },
    { key: 'estado', label: 'Estado', type: 'text' as const, required: true },
    { key: 'fechaInstalacion', label: 'Fecha de Instalación', type: 'date' as const, required: false },
    { key: 'proximoMantenimiento', label: 'Próximo Mantenimiento', type: 'date' as const, required: false }
  ]

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true, readAt: new Date() } : n
    ))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })))
  }

  const handleArchiveNotification = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, archived: true } : n
    ))
  }

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleExportEquipment = async () => {
    try {
      await exportData({
        dataType: 'equipos',
        format: 'excel',
        fields: equipmentFields.map(f => f.key),
        filename: `equipos_${new Date().toISOString().split('T')[0]}`
      })
    } catch (error) {
      console.error('Error exporting equipment data:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Avanzado</h1>
          <p className="text-muted-foreground">
            Centro de control con análisis, notificaciones y gestión avanzada
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchDashboardData} disabled={loading}>
            <Activity className="h-4 w-4 mr-2" />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <LineChart className="h-4 w-4" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Actividad
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
            {notifications.filter(n => !n.read && !n.archived).length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {notifications.filter(n => !n.read && !n.archived).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="exports" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+{metrics.monthlyGrowth}%</span> vs mes anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sedes Activas</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalSedes}</div>
                <p className="text-xs text-muted-foreground">
                  Distribuidas en múltiples ubicaciones
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipos Monitoreados</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalEquipos}</div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span>Salud del sistema</span>
                    <span>{metrics.equipmentHealth}%</span>
                  </div>
                  <Progress value={metrics.equipmentHealth} className="mt-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Urgentes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{metrics.urgentAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención inmediata
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resumen de estado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Equipos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Activos</span>
                  </div>
                  <Badge variant="secondary">
                    {data.equipos.filter((e: any) => e.estado === 'activo').length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span>En Mantenimiento</span>
                  </div>
                  <Badge variant="secondary">
                    {data.equipos.filter((e: any) => e.estado === 'mantenimiento').length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span>Fuera de Servicio</span>
                  </div>
                  <Badge variant="secondary">
                    {data.equipos.filter((e: any) => e.estado === 'inactivo').length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Nuevo Cliente
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  Registrar Sede
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Wrench className="h-4 w-4 mr-2" />
                  Agregar Equipo
                </Button>
                
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Programar Mantenimiento
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Advanced Filters */}
          <AdvancedFilters
            filters={clientFilters}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            onSearch={(term) => console.log('Searching:', term)}
            searchPlaceholder="Buscar en datos..."
          />

          {/* Analytics Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Crecimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Gráfico de tendencias</p>
                    <p className="text-sm text-muted-foreground">Próximamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Gráfico circular</p>
                    <p className="text-sm text-muted-foreground">Próximamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLog
            activities={activities}
            loading={loading}
            onRefresh={fetchDashboardData}
            onExport={() => console.log('Export activity log')}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter
            notifications={notifications}
            rules={notificationRules}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onArchive={handleArchiveNotification}
            onDelete={handleDeleteNotification}
            onCreateRule={(rule) => console.log('Create rule:', rule)}
            onUpdateRule={(id, updates) => console.log('Update rule:', id, updates)}
            onDeleteRule={(id) => console.log('Delete rule:', id)}
            onSendNotification={(notification) => console.log('Send notification:', notification)}
          />
        </TabsContent>

        <TabsContent value="exports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Centro de Exportación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Equipos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Exportar información completa de equipos con filtros aplicados
                    </p>
                    <ExportDialog
                      dataType="equipos"
                      availableFields={equipmentFields}
                      onExport={exportData}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Clientes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Exportar base de datos de clientes
                    </p>
                    <ExportDialog
                      dataType="clientes"
                      availableFields={[
                        { key: 'id', label: 'ID', type: 'text' as const, required: true },
                        { key: 'nombre', label: 'Nombre', type: 'text' as const, required: true },
                        { key: 'email', label: 'Email', type: 'text' as const, required: true },
                        { key: 'telefono', label: 'Teléfono', type: 'text' as const },
                        { key: 'direccion', label: 'Dirección', type: 'text' as const },
                        { key: 'estado', label: 'Estado', type: 'text' as const, required: true }
                      ]}
                      onExport={exportData}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sedes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Exportar información de todas las sedes
                    </p>
                    <ExportDialog
                      dataType="sedes"
                      availableFields={[
                        { key: 'id', label: 'ID', type: 'text' as const, required: true },
                        { key: 'nombre', label: 'Nombre', type: 'text' as const, required: true },
                        { key: 'direccion', label: 'Dirección', type: 'text' as const, required: true },
                        { key: 'ciudad', label: 'Ciudad', type: 'text' as const },
                        { key: 'telefono', label: 'Teléfono', type: 'text' as const },
                        { key: 'estado', label: 'Estado', type: 'text' as const, required: true }
                      ]}
                      onExport={exportData}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Exportaciones Programadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">Próximamente</h3>
                    <p className="text-muted-foreground">
                      Configura exportaciones automáticas y programadas
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}