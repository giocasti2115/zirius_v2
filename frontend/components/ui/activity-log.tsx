'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  User, 
  Clock, 
  Eye, 
  Filter, 
  Calendar,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
  Trash2,
  FileText,
  Database,
  Settings,
  Lock,
  Unlock
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export type ActivityLevel = 'info' | 'warning' | 'error' | 'success'
export type ActivityCategory = 'auth' | 'data' | 'system' | 'security' | 'export' | 'config'

export interface UserActivity {
  id: string
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  action: string
  category: ActivityCategory
  level: ActivityLevel
  description: string
  metadata?: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: Date
  duration?: number // en millisegundos
  affectedResource?: {
    type: 'cliente' | 'sede' | 'equipo' | 'orden' | 'user'
    id: string
    name: string
  }
}

interface ActivityLogProps {
  activities: UserActivity[]
  loading?: boolean
  onRefresh?: () => void
  onExport?: () => void
}

const categoryIcons: Record<ActivityCategory, any> = {
  auth: Lock,
  data: Database,
  system: Settings,
  security: AlertTriangle,
  export: Download,
  config: FileText
}

const levelColors: Record<ActivityLevel, string> = {
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  success: 'bg-green-100 text-green-800 border-green-200'
}

const levelIcons: Record<ActivityLevel, any> = {
  info: Activity,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle
}

export function ActivityLog({ activities, loading = false, onRefresh, onExport }: ActivityLogProps) {
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>(activities)
  const [selectedActivity, setSelectedActivity] = useState<UserActivity | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    level: 'all',
    user: 'all',
    timeRange: '24h'
  })

  useEffect(() => {
    let filtered = [...activities]

    // Filtro de búsqueda
    if (filters.search) {
      filtered = filtered.filter(activity => 
        activity.action.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        activity.userName.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Filtro de categoría
    if (filters.category !== 'all') {
      filtered = filtered.filter(activity => activity.category === filters.category)
    }

    // Filtro de nivel
    if (filters.level !== 'all') {
      filtered = filtered.filter(activity => activity.level === filters.level)
    }

    // Filtro de usuario
    if (filters.user !== 'all') {
      filtered = filtered.filter(activity => activity.userId === filters.user)
    }

    // Filtro de tiempo
    if (filters.timeRange !== 'all') {
      const now = new Date()
      const timeRanges: Record<string, number> = {
        '1h': 1 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }
      
      const range = timeRanges[filters.timeRange]
      if (range) {
        filtered = filtered.filter(activity => 
          now.getTime() - activity.timestamp.getTime() <= range
        )
      }
    }

    setFilteredActivities(filtered)
  }, [activities, filters])

  const uniqueUsers = Array.from(new Set(activities.map(a => a.userId)))
    .map(userId => activities.find(a => a.userId === userId)!)

  const getActivityIcon = (activity: UserActivity) => {
    const CategoryIcon = categoryIcons[activity.category]
    return <CategoryIcon className="h-4 w-4" />
  }

  const getLevelIcon = (level: ActivityLevel) => {
    const LevelIcon = levelIcons[level]
    return <LevelIcon className="h-4 w-4" />
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return null
    if (duration < 1000) return `${duration}ms`
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`
    return `${(duration / 60000).toFixed(1)}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Registro de Actividad</h2>
          <p className="text-muted-foreground">
            Monitoreo de actividades y acciones de usuarios en el sistema
          </p>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} disabled={loading}>
              <Activity className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          )}
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar actividades..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Categoría</label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="auth">Autenticación</SelectItem>
                  <SelectItem value="data">Datos</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="security">Seguridad</SelectItem>
                  <SelectItem value="export">Exportación</SelectItem>
                  <SelectItem value="config">Configuración</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Nivel</label>
              <Select value={filters.level} onValueChange={(value) => setFilters(prev => ({ ...prev, level: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="info">Información</SelectItem>
                  <SelectItem value="warning">Advertencia</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Éxito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Usuario</label>
              <Select value={filters.user} onValueChange={(value) => setFilters(prev => ({ ...prev, user: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user.userId} value={user.userId}>
                      {user.userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tiempo</label>
              <Select value={filters.timeRange} onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Última hora</SelectItem>
                  <SelectItem value="24h">Últimas 24 horas</SelectItem>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="all">Todo el tiempo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{filteredActivities.length}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errores</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredActivities.filter(a => a.level === 'error').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Advertencias</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredActivities.filter(a => a.level === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuarios únicos</p>
                <p className="text-2xl font-bold">{uniqueUsers.length}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de actividades */}
      <Card>
        <CardHeader>
          <CardTitle>Actividades Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Activity className="h-4 w-4 animate-spin" />
                        Cargando actividades...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No se encontraron actividades con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={activity.userAvatar} />
                            <AvatarFallback>
                              {activity.userName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{activity.userName}</p>
                            <p className="text-xs text-muted-foreground">{activity.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActivityIcon(activity)}
                          <span className="font-medium">{activity.action}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {getActivityIcon(activity)}
                          {activity.category}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${levelColors[activity.level]}`}>
                          {getLevelIcon(activity.level)}
                          {activity.level}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {activity.affectedResource ? (
                          <div className="text-sm">
                            <span className="font-medium">{activity.affectedResource.type}</span>
                            <br />
                            <span className="text-muted-foreground">{activity.affectedResource.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: es })}</div>
                          <div className="text-muted-foreground">
                            {format(activity.timestamp, 'dd/MM/yyyy HH:mm')}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {formatDuration(activity.duration) || '-'}
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedActivity(activity)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de detalles */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de Actividad</DialogTitle>
          </DialogHeader>
          
          {selectedActivity && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Usuario</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedActivity.userAvatar} />
                      <AvatarFallback className="text-xs">
                        {selectedActivity.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedActivity.userName}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Fecha y Hora</label>
                  <p className="mt-1">{format(selectedActivity.timestamp, 'dd/MM/yyyy HH:mm:ss')}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Acción</label>
                <p className="mt-1 font-medium">{selectedActivity.action}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <p className="mt-1">{selectedActivity.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <Badge variant="outline" className="mt-1 gap-1">
                    {getActivityIcon(selectedActivity)}
                    {selectedActivity.category}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Nivel</label>
                  <Badge variant="outline" className={`mt-1 gap-1 ${levelColors[selectedActivity.level]}`}>
                    {getLevelIcon(selectedActivity.level)}
                    {selectedActivity.level}
                  </Badge>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Duración</label>
                  <p className="mt-1">{formatDuration(selectedActivity.duration) || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Dirección IP</label>
                  <p className="mt-1 font-mono text-sm">{selectedActivity.ipAddress}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">User Agent</label>
                  <p className="mt-1 text-sm truncate" title={selectedActivity.userAgent}>
                    {selectedActivity.userAgent}
                  </p>
                </div>
              </div>

              {selectedActivity.affectedResource && (
                <div>
                  <label className="text-sm font-medium">Recurso Afectado</label>
                  <div className="mt-1 p-3 bg-muted rounded-lg">
                    <p><strong>Tipo:</strong> {selectedActivity.affectedResource.type}</p>
                    <p><strong>ID:</strong> {selectedActivity.affectedResource.id}</p>
                    <p><strong>Nombre:</strong> {selectedActivity.affectedResource.name}</p>
                  </div>
                </div>
              )}

              {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium">Metadatos</label>
                  <ScrollArea className="mt-1 h-32 w-full border rounded-lg p-3">
                    <pre className="text-xs">
                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}