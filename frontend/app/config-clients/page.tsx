'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, Settings, Users, Mail, Phone, MapPin, CheckCircle, AlertTriangle, Save } from 'lucide-react'

export default function ConfigClientsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  const handleSave = async () => {
    setSaveStatus('saving')
    // Simular guardado
    setTimeout(() => {
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }, 1000)
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuración de Clientes</h2>
          <p className="text-muted-foreground">
            Gestiona la configuración global para el módulo de clientes
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <Alert className="w-auto py-2 px-3 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 font-medium">
                Configuración guardada
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={handleSave} disabled={saveStatus === 'saving'}>
            <Save className="h-4 w-4 mr-2" />
            {saveStatus === 'saving' ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="campos" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Campos
          </TabsTrigger>
          <TabsTrigger value="validacion" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Validación
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
        </TabsList>

        {/* Configuración General */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Configuración de Registro
                </CardTitle>
                <CardDescription>
                  Configuraciones para el registro de nuevos clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aprobación automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Los nuevos clientes se aprueban automáticamente
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Validación de NIT</Label>
                    <p className="text-sm text-muted-foreground">
                      Validar formato y existencia del NIT
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Duplicados permitidos</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir clientes con mismo NIT
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Configuración de Sedes
                </CardTitle>
                <CardDescription>
                  Configuraciones para la gestión de sedes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maxSedes">Máximo de sedes por cliente</Label>
                  <Input
                    id="maxSedes"
                    type="number"
                    defaultValue="10"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sede principal obligatoria</Label>
                    <p className="text-sm text-muted-foreground">
                      Requiere definir una sede como principal
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-asignar código</Label>
                    <p className="text-sm text-muted-foreground">
                      Generar código automático para sedes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuración de Campos */}
        <TabsContent value="campos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campos Requeridos</CardTitle>
              <CardDescription>
                Configura qué campos son obligatorios en el registro de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: 'Nombre', required: true, editable: false },
                  { name: 'NIT', required: true, editable: true },
                  { name: 'Teléfono', required: true, editable: true },
                  { name: 'Email', required: false, editable: true },
                  { name: 'Dirección', required: true, editable: true },
                  { name: 'Ciudad', required: true, editable: true },
                  { name: 'Departamento', required: false, editable: true },
                  { name: 'Código Postal', required: false, editable: true },
                  { name: 'Contacto Principal', required: true, editable: true },
                ].map((field) => (
                  <div key={field.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label className="font-medium">{field.name}</Label>
                      <p className="text-xs text-muted-foreground">
                        {field.required ? 'Obligatorio' : 'Opcional'}
                      </p>
                    </div>
                    <Switch 
                      defaultChecked={field.required} 
                      disabled={!field.editable}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Validación */}
        <TabsContent value="validacion" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Reglas de Validación</CardTitle>
                <CardDescription>
                  Configura las reglas de validación para datos de clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="minNombre">Mínimo caracteres en nombre</Label>
                  <Input
                    id="minNombre"
                    type="number"
                    defaultValue="3"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="formatoNIT">Formato de NIT</Label>
                  <Select defaultValue="libre">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="libre">Formato libre</SelectItem>
                      <SelectItem value="colombiano">Formato colombiano</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="validacionEmail">Validación de email</Label>
                  <Select defaultValue="basica">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ninguna">Sin validación</SelectItem>
                      <SelectItem value="basica">Validación básica</SelectItem>
                      <SelectItem value="strict">Validación estricta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración Avanzada</CardTitle>
                <CardDescription>
                  Configuraciones adicionales de validación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Verificar dominio de email</Label>
                    <p className="text-sm text-muted-foreground">
                      Validar que el dominio del email existe
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Bloquear emails temporales</Label>
                    <p className="text-sm text-muted-foreground">
                      Rechazar emails de servicios temporales
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Normalizar teléfonos</Label>
                    <p className="text-sm text-muted-foreground">
                      Aplicar formato estándar a números
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuración de Notificaciones */}
        <TabsContent value="notificaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notificaciones Automáticas
              </CardTitle>
              <CardDescription>
                Configura las notificaciones automáticas para eventos de clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: 'Nuevo cliente registrado',
                    description: 'Notificar cuando se registra un nuevo cliente',
                    enabled: true
                  },
                  {
                    title: 'Cliente actualizado',
                    description: 'Notificar cuando se actualiza información',
                    enabled: false
                  },
                  {
                    title: 'Cliente inactivado',
                    description: 'Notificar cuando se inactiva un cliente',
                    enabled: true
                  },
                  {
                    title: 'Nueva sede agregada',
                    description: 'Notificar cuando se agrega una nueva sede',
                    enabled: true
                  },
                ].map((notification) => (
                  <div key={notification.title} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Label className="font-medium">{notification.title}</Label>
                      <p className="text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                    <Switch defaultChecked={notification.enabled} />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <Label htmlFor="emailNotificacion">Email para notificaciones</Label>
                <Input
                  id="emailNotificacion"
                  type="email"
                  placeholder="admin@empresa.com"
                  defaultValue="admin@ziriuz.com"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
