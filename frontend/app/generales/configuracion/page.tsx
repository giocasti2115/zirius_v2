'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Search, Plus, Edit2, Trash2, Settings, Globe, Shield, Bell, Database, Mail, Server, Eye, EyeOff, RefreshCw, Save, Download, Upload } from 'lucide-react'

interface ConfiguracionItem {
  id: number
  seccion: string
  clave: string
  valor: any
  tipo: 'string' | 'number' | 'boolean' | 'json' | 'password' | 'email' | 'url' | 'file'
  nombre: string
  descripcion: string
  requerido: boolean
  solo_lectura: boolean
  sensible: boolean
  validacion?: string
  opciones?: string[]
  valor_por_defecto?: any
  ultimo_cambio: string
  cambiado_por: string
}

interface SeccionConfig {
  nombre: string
  icono: any
  descripcion: string
  color: string
}

export default function ConfiguracionPage() {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [seccionActiva, setSeccionActiva] = useState('general')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ConfiguracionItem | null>(null)
  const [mostrarSensibles, setMostrarSensibles] = useState(false)
  const [cambiosPendientes, setCambiosPendientes] = useState<Set<number>>(new Set())

  const [newConfig, setNewConfig] = useState({
    seccion: 'general',
    clave: '',
    valor: '',
    tipo: 'string' as const,
    nombre: '',
    descripcion: '',
    requerido: false,
    solo_lectura: false,
    sensible: false,
    validacion: '',
    opciones: [''],
    valor_por_defecto: ''
  })

  const secciones: Record<string, SeccionConfig> = {
    general: {
      nombre: 'General',
      icono: Settings,
      descripcion: 'Configuraciones generales del sistema',
      color: 'bg-blue-500'
    },
    seguridad: {
      nombre: 'Seguridad',
      icono: Shield,
      descripcion: 'Configuraciones de seguridad y autenticación',
      color: 'bg-red-500'
    },
    notificaciones: {
      nombre: 'Notificaciones',
      icono: Bell,
      descripcion: 'Configuración de alertas y notificaciones',
      color: 'bg-yellow-500'
    },
    base_datos: {
      nombre: 'Base de Datos',
      icono: Database,
      descripción: 'Configuraciones de conectividad y base de datos',
      color: 'bg-green-500'
    },
    correo: {
      nombre: 'Correo Electrónico',
      icono: Mail,
      descripción: 'Configuración del servidor de correo',
      color: 'bg-purple-500'
    },
    integraciones: {
      nombre: 'Integraciones',
      icono: Globe,
      descripción: 'APIs y servicios externos',
      color: 'bg-orange-500'
    },
    sistema: {
      nombre: 'Sistema',
      icono: Server,
      descripción: 'Configuraciones del servidor y rendimiento',
      color: 'bg-gray-500'
    }
  }

  const tipos = [
    { value: 'string', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'boolean', label: 'Verdadero/Falso' },
    { value: 'password', label: 'Contraseña' },
    { value: 'email', label: 'Correo Electrónico' },
    { value: 'url', label: 'URL' },
    { value: 'json', label: 'JSON' },
    { value: 'file', label: 'Archivo' }
  ]

  // Datos de ejemplo de configuraciones
  useEffect(() => {
    const configuracionesEjemplo: ConfiguracionItem[] = [
      // General
      {
        id: 1,
        seccion: 'general',
        clave: 'app_name',
        valor: 'ZIRIUS - Sistema de Gestión Hospitalaria',
        tipo: 'string',
        nombre: 'Nombre de la Aplicación',
        descripcion: 'Nombre que aparece en la interfaz del sistema',
        requerido: true,
        solo_lectura: false,
        sensible: false,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      {
        id: 2,
        seccion: 'general',
        clave: 'app_version',
        valor: '2.1.0',
        tipo: 'string',
        nombre: 'Versión del Sistema',
        descripcion: 'Versión actual del sistema',
        requerido: true,
        solo_lectura: true,
        sensible: false,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'system'
      },
      {
        id: 3,
        seccion: 'general',
        clave: 'timezone',
        valor: 'America/Bogota',
        tipo: 'string',
        nombre: 'Zona Horaria',
        descripcion: 'Zona horaria del sistema',
        requerido: true,
        solo_lectura: false,
        sensible: false,
        opciones: ['America/Bogota', 'America/New_York', 'Europe/Madrid', 'UTC'],
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      {
        id: 4,
        seccion: 'general',
        clave: 'language',
        valor: 'es',
        tipo: 'string',
        nombre: 'Idioma por Defecto',
        descripcion: 'Idioma predeterminado del sistema',
        requerido: true,
        solo_lectura: false,
        sensible: false,
        opciones: ['es', 'en', 'pt'],
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      
      // Seguridad
      {
        id: 5,
        seccion: 'seguridad',
        clave: 'session_timeout',
        valor: 3600,
        tipo: 'number',
        nombre: 'Tiempo de Sesión',
        descripcion: 'Tiempo de inactividad antes de cerrar sesión (segundos)',
        requerido: true,
        solo_lectura: false,
        sensible: false,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      {
        id: 6,
        seccion: 'seguridad',
        clave: 'jwt_secret',
        valor: 'super_secret_key_2025',
        tipo: 'password',
        nombre: 'Clave Secreta JWT',
        descripcion: 'Clave para firmar tokens JWT',
        requerido: true,
        solo_lectura: false,
        sensible: true,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      {
        id: 7,
        seccion: 'seguridad',
        clave: 'password_min_length',
        valor: 8,
        tipo: 'number',
        nombre: 'Longitud Mínima de Contraseña',
        descripcion: 'Número mínimo de caracteres para contraseñas',
        requerido: true,
        solo_lectura: false,
        sensible: false,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      {
        id: 8,
        seccion: 'seguridad',
        clave: 'two_factor_enabled',
        valor: false,
        tipo: 'boolean',
        nombre: 'Autenticación de Dos Factores',
        descripcion: 'Habilitar 2FA para todos los usuarios',
        requerido: false,
        solo_lectura: false,
        sensible: false,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      
      // Notificaciones
      {
        id: 9,
        seccion: 'notificaciones',
        clave: 'email_notifications',
        valor: true,
        tipo: 'boolean',
        nombre: 'Notificaciones por Email',
        descripcion: 'Habilitar envío de notificaciones por correo',
        requerido: false,
        solo_lectura: false,
        sensible: false,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      {
        id: 10,
        seccion: 'notificaciones',
        clave: 'sms_notifications',
        valor: false,
        tipo: 'boolean',
        nombre: 'Notificaciones por SMS',
        descripcion: 'Habilitar envío de notificaciones por SMS',
        requerido: false,
        solo_lectura: false,
        sensible: false,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      
      // Base de Datos
      {
        id: 11,
        seccion: 'base_datos',
        clave: 'db_host',
        valor: 'localhost',
        tipo: 'string',
        nombre: 'Host de Base de Datos',
        descripcion: 'Dirección del servidor de base de datos',
        requerido: true,
        solo_lectura: false,
        sensible: false,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      {
        id: 12,
        seccion: 'base_datos',
        clave: 'db_port',
        valor: 5432,
        tipo: 'number',
        nombre: 'Puerto de Base de Datos',
        descripcion: 'Puerto de conexión a la base de datos',
        requerido: true,
        solo_lectura: false,
        sensible: false,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      {
        id: 13,
        seccion: 'base_datos',
        clave: 'db_password',
        valor: 'db_password_2025',
        tipo: 'password',
        nombre: 'Contraseña de Base de Datos',
        descripcion: 'Contraseña para conexión a la base de datos',
        requerido: true,
        solo_lectura: false,
        sensible: true,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      
      // Correo
      {
        id: 14,
        seccion: 'correo',
        clave: 'smtp_host',
        valor: 'smtp.gmail.com',
        tipo: 'string',
        nombre: 'Servidor SMTP',
        descripcion: 'Dirección del servidor de correo saliente',
        requerido: true,
        solo_lectura: false,
        sensible: false,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      {
        id: 15,
        seccion: 'correo',
        clave: 'smtp_port',
        valor: 587,
        tipo: 'number',
        nombre: 'Puerto SMTP',
        descripcion: 'Puerto del servidor SMTP',
        requerido: true,
        solo_lectura: false,
        sensible: false,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      {
        id: 16,
        seccion: 'correo',
        clave: 'smtp_username',
        valor: 'sistema@hospital.com',
        tipo: 'email',
        nombre: 'Usuario SMTP',
        descripcion: 'Email para autenticación SMTP',
        requerido: true,
        solo_lectura: false,
        sensible: false,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      },
      {
        id: 17,
        seccion: 'correo',
        clave: 'smtp_password',
        valor: 'smtp_password_2025',
        tipo: 'password',
        nombre: 'Contraseña SMTP',
        descripcion: 'Contraseña para autenticación SMTP',
        requerido: true,
        solo_lectura: false,
        sensible: true,
        ultimo_cambio: '2025-01-15T10:00:00Z',
        cambiado_por: 'admin'
      }
    ]

    setConfiguraciones(configuracionesEjemplo)
    setLoading(false)
  }, [])

  const configuracionesFiltradas = configuraciones.filter(config => {
    const matchSearch = config.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       config.clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       config.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchSeccion = config.seccion === seccionActiva
    
    return matchSearch && matchSeccion
  })

  const handleUpdateConfig = (config: ConfiguracionItem, newValue: any) => {
    setConfiguraciones(prev => prev.map(c => 
      c.id === config.id 
        ? { 
            ...c, 
            valor: newValue,
            ultimo_cambio: new Date().toISOString(),
            cambiado_por: 'admin'
          }
        : c
    ))
    setCambiosPendientes(prev => new Set(prev.add(config.id)))
  }

  const handleSaveChanges = () => {
    // Aquí se enviarían los cambios al backend
    setCambiosPendientes(new Set())
    alert('Configuraciones guardadas exitosamente')
  }

  const renderConfigValue = (config: ConfiguracionItem) => {
    if (config.solo_lectura) {
      return (
        <div className="px-3 py-2 bg-gray-50 border rounded-md text-gray-600">
          {config.sensible && !mostrarSensibles ? '••••••••' : String(config.valor)}
        </div>
      )
    }

    switch (config.tipo) {
      case 'boolean':
        return (
          <Switch
            checked={config.valor}
            onCheckedChange={(checked) => handleUpdateConfig(config, checked)}
          />
        )
      
      case 'password':
        return (
          <div className="relative">
            <Input
              type={mostrarSensibles ? 'text' : 'password'}
              value={config.valor}
              onChange={(e) => handleUpdateConfig(config, e.target.value)}
            />
          </div>
        )
      
      case 'number':
        return (
          <Input
            type="number"
            value={config.valor}
            onChange={(e) => handleUpdateConfig(config, parseFloat(e.target.value) || 0)}
          />
        )
      
      case 'email':
        return (
          <Input
            type="email"
            value={config.valor}
            onChange={(e) => handleUpdateConfig(config, e.target.value)}
          />
        )
      
      case 'url':
        return (
          <Input
            type="url"
            value={config.valor}
            onChange={(e) => handleUpdateConfig(config, e.target.value)}
          />
        )
      
      case 'json':
        return (
          <Textarea
            value={JSON.stringify(config.valor, null, 2)}
            onChange={(e) => {
              try {
                handleUpdateConfig(config, JSON.parse(e.target.value))
              } catch {}
            }}
            rows={4}
            className="font-mono text-sm"
          />
        )
      
      default:
        if (config.opciones && config.opciones.length > 0) {
          return (
            <Select
              value={config.valor}
              onValueChange={(value) => handleUpdateConfig(config, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.opciones.map((opcion) => (
                  <SelectItem key={opcion} value={opcion}>
                    {opcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }
        
        return (
          <Input
            value={config.valor}
            onChange={(e) => handleUpdateConfig(config, e.target.value)}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuraciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h2>
          <p className="text-muted-foreground">
            Gestión de parámetros y configuraciones del sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setMostrarSensibles(!mostrarSensibles)}
          >
            {mostrarSensibles ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {mostrarSensibles ? 'Ocultar Sensibles' : 'Mostrar Sensibles'}
          </Button>
          
          {cambiosPendientes.size > 0 && (
            <Button onClick={handleSaveChanges}>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios ({cambiosPendientes.size})
            </Button>
          )}
          
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{configuraciones.length}</p>
                <p className="text-sm text-gray-600">Total Configuraciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{configuraciones.filter(c => c.sensible).length}</p>
                <p className="text-sm text-gray-600">Sensibles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{cambiosPendientes.size}</p>
                <p className="text-sm text-gray-600">Cambios Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Server className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(secciones).length}</p>
                <p className="text-sm text-gray-600">Secciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar configuraciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por Sección */}
      <Tabs value={seccionActiva} onValueChange={setSeccionActiva}>
        <TabsList className="grid w-full grid-cols-7">
          {Object.entries(secciones).map(([key, seccion]) => {
            const IconComponent = seccion.icono
            return (
              <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{seccion.nombre}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {Object.entries(secciones).map(([key, seccion]) => (
          <TabsContent key={key} value={key}>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded ${seccion.color} flex items-center justify-center`}>
                    <seccion.icono className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <CardTitle>{seccion.nombre}</CardTitle>
                    <p className="text-sm text-gray-600">{seccion.descripcion}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {configuracionesFiltradas.map((config) => (
                    <div key={config.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-sm">{config.nombre}</h3>
                            {config.requerido && (
                              <Badge variant="destructive" className="text-xs">
                                Requerido
                              </Badge>
                            )}
                            {config.solo_lectura && (
                              <Badge variant="secondary" className="text-xs">
                                Solo Lectura
                              </Badge>
                            )}
                            {config.sensible && (
                              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-800">
                                Sensible
                              </Badge>
                            )}
                            {cambiosPendientes.has(config.id) && (
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-800">
                                Modificado
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-2">{config.descripcion}</p>
                          
                          <div className="text-xs text-gray-500">
                            <span>Clave: </span>
                            <code className="bg-gray-100 px-1 rounded">{config.clave}</code>
                            <span className="ml-4">Tipo: {tipos.find(t => t.value === config.tipo)?.label}</span>
                          </div>
                        </div>
                        
                        <div className="w-64">
                          {renderConfigValue(config)}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-2">
                        Última modificación: {new Date(config.ultimo_cambio).toLocaleString()} por {config.cambiado_por}
                      </div>
                      
                      <Separator className="mt-4" />
                    </div>
                  ))}
                  
                  {configuracionesFiltradas.length === 0 && (
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay configuraciones en esta sección</p>
                      {searchTerm && (
                        <p className="text-sm text-gray-500">
                          Intenta ajustar el término de búsqueda
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}