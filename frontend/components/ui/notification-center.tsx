'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Bell, 
  BellRing, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Mail,
  MessageSquare,
  Smartphone,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Send,
  Users,
  Filter
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'maintenance'
export type NotificationChannel = 'in-app' | 'email' | 'sms' | 'push'
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  channels: NotificationChannel[]
  recipients: string[] // User IDs or email addresses
  read: boolean
  archived: boolean
  createdAt: Date
  readAt?: Date
  scheduledFor?: Date
  expiresAt?: Date
  metadata?: Record<string, any>
  actions?: Array<{
    label: string
    action: string
    style?: 'primary' | 'secondary' | 'destructive'
  }>
}

export interface NotificationRule {
  id: string
  name: string
  description: string
  enabled: boolean
  trigger: {
    event: string
    conditions: Record<string, any>
  }
  template: {
    title: string
    message: string
    type: NotificationType
    priority: NotificationPriority
    channels: NotificationChannel[]
  }
  recipients: {
    type: 'all' | 'role' | 'specific'
    values: string[]
  }
  schedule?: {
    enabled: boolean
    frequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
    time?: string
    days?: number[]
  }
}

interface NotificationCenterProps {
  notifications: Notification[]
  rules: NotificationRule[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onCreateRule: (rule: Omit<NotificationRule, 'id'>) => void
  onUpdateRule: (id: string, rule: Partial<NotificationRule>) => void
  onDeleteRule: (id: string) => void
  onSendNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'archived'>) => void
}

const typeIcons: Record<NotificationType, any> = {
  info: Info,
  warning: AlertTriangle,
  error: X,
  success: CheckCircle,
  maintenance: Settings
}

const typeColors: Record<NotificationType, string> = {
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  maintenance: 'bg-purple-100 text-purple-800 border-purple-200'
}

const priorityColors: Record<NotificationPriority, string> = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
}

const channelIcons: Record<NotificationChannel, any> = {
  'in-app': Bell,
  email: Mail,
  sms: MessageSquare,
  push: Smartphone
}

export function NotificationCenter({
  notifications,
  rules,
  onMarkAsRead,
  onMarkAllAsRead,
  onArchive,
  onDelete,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onSendNotification
}: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState('notifications')
  const [filter, setFilter] = useState({
    type: 'all',
    priority: 'all',
    read: 'all',
    channel: 'all'
  })
  const [showCreateRule, setShowCreateRule] = useState(false)
  const [showSendNotification, setShowSendNotification] = useState(false)
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null)

  const filteredNotifications = notifications.filter(notification => {
    if (filter.type !== 'all' && notification.type !== filter.type) return false
    if (filter.priority !== 'all' && notification.priority !== filter.priority) return false
    if (filter.read !== 'all') {
      if (filter.read === 'read' && !notification.read) return false
      if (filter.read === 'unread' && notification.read) return false
    }
    if (filter.channel !== 'all' && !notification.channels.includes(filter.channel as NotificationChannel)) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length

  const getTypeIcon = (type: NotificationType) => {
    const Icon = typeIcons[type]
    return <Icon className="h-4 w-4" />
  }

  const getChannelIcon = (channel: NotificationChannel) => {
    const Icon = channelIcons[channel]
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BellRing className="h-8 w-8" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Centro de Notificaciones</h2>
            <p className="text-muted-foreground">
              Gestiona notificaciones, alertas y reglas de automatización
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} sin leer
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onMarkAllAsRead} disabled={unreadCount === 0}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
          
          <Dialog open={showSendNotification} onOpenChange={setShowSendNotification}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Enviar Notificación
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Settings className="h-4 w-4" />
            Reglas Automáticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={filter.type} onValueChange={(value) => setFilter(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="info">Información</SelectItem>
                      <SelectItem value="warning">Advertencia</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="success">Éxito</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Prioridad</Label>
                  <Select value={filter.priority} onValueChange={(value) => setFilter(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Estado</Label>
                  <Select value={filter.read} onValueChange={(value) => setFilter(prev => ({ ...prev, read: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="unread">Sin leer</SelectItem>
                      <SelectItem value="read">Leídas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Canal</Label>
                  <Select value={filter.channel} onValueChange={(value) => setFilter(prev => ({ ...prev, channel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="in-app">App</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de notificaciones */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No hay notificaciones</h3>
                    <p className="text-muted-foreground">No se encontraron notificaciones con los filtros aplicados</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${typeColors[notification.type]}`}>
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${!notification.read ? 'text-primary' : ''}`}>
                              {notification.title}
                            </h4>
                            <Badge variant="outline" className={priorityColors[notification.priority]}>
                              {notification.priority}
                            </Badge>
                            {!notification.read && (
                              <Badge variant="secondary">Nueva</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: es })}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {notification.channels.map((channel) => (
                                <span key={channel} className="flex items-center gap-1">
                                  {getChannelIcon(channel)}
                                  {channel}
                                </span>
                              ))}
                            </div>
                          </div>

                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex gap-2">
                              {notification.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant={action.style === 'destructive' ? 'destructive' : 
                                          action.style === 'primary' ? 'default' : 'outline'}
                                  onClick={() => console.log('Action:', action.action)}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onArchive(notification.id)}
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          {/* Header de reglas */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Reglas de Notificación Automática</h3>
              <p className="text-muted-foreground">Configura reglas para enviar notificaciones automáticas</p>
            </div>
            
            <Dialog open={showCreateRule} onOpenChange={setShowCreateRule}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Regla
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          {/* Tabla de reglas */}
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Canales</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-muted-foreground">{rule.description}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">{rule.trigger.event}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className={`gap-1 ${typeColors[rule.template.type]}`}>
                          {getTypeIcon(rule.template.type)}
                          {rule.template.type}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          {rule.template.channels.map((channel) => (
                            <Badge key={channel} variant="secondary" className="gap-1">
                              {getChannelIcon(channel)}
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(enabled) => onUpdateRule(rule.id, { enabled })}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingRule(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}