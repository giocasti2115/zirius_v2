'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Database, Bell, Shield, FileText, Users, MapPin, Layers, Tag, AlertTriangle, Key, Activity } from 'lucide-react'
import Link from 'next/link'

export default function GeneralesPage() {
  const modules = [
    {
      title: 'Estados',
      description: 'Gestión de estados del sistema',
      icon: Shield,
      status: 'En Desarrollo',
      href: '/generales/estados',
      count: '12 Estados'
    },
    {
      title: 'Prioridades',
      description: 'Niveles de prioridad',
      icon: AlertTriangle,
      status: 'En Desarrollo',
      href: '/generales/prioridades',
      count: '5 Prioridades'
    },
    {
      title: 'Tipos de Equipos',
      description: 'Categorías de equipos médicos',
      icon: Settings,
      status: 'En Desarrollo',
      href: '/generales/tipos-equipos',
      count: '25 Tipos'
    },
    {
      title: 'Marcas',
      description: 'Marcas de equipos',
      icon: Tag,
      status: 'En Desarrollo',
      href: '/generales/marcas',
      count: '45 Marcas'
    },
    {
      title: 'Modelos',
      description: 'Modelos de equipos',
      icon: Database,
      status: 'En Desarrollo',
      href: '/generales/modelos',
      count: '180 Modelos'
    },
    {
      title: 'Ciudades',
      description: 'Gestión de ciudades',
      icon: MapPin,
      status: 'En Desarrollo',
      href: '/generales/ciudades',
      count: '1,122 Ciudades'
    },
    {
      title: 'Departamentos',
      description: 'Departamentos y regiones',
      icon: MapPin,
      status: 'En Desarrollo',
      href: '/generales/departamentos',
      count: '32 Departamentos'
    },
    {
      title: 'Usuarios',
      description: 'Gestión de usuarios del sistema',
      icon: Users,
      status: 'En Desarrollo',
      href: '/generales/usuarios',
      count: '87 Usuarios'
    },
    {
      title: 'Permisos',
      description: 'Control de permisos y roles',
      icon: Key,
      status: 'En Desarrollo',
      href: '/generales/permisos',
      count: '15 Roles'
    },
    {
      title: 'Variables Sistema',
      description: 'Variables de configuración',
      icon: Database,
      status: 'En Desarrollo',
      href: '/generales/variables',
      count: '34 Variables'
    },
    {
      title: 'Parámetros',
      description: 'Parámetros del sistema',
      icon: Settings,
      status: 'En Desarrollo',
      href: '/generales/parametros',
      count: '28 Parámetros'
    },
    {
      title: 'Clasificaciones',
      description: 'Clasificaciones de equipos',
      icon: Layers,
      status: 'En Desarrollo',
      href: '/generales/clasificaciones',
      count: '8 Clasificaciones'
    },
    {
      title: 'Categorías',
      description: 'Categorías del sistema',
      icon: Tag,
      status: 'En Desarrollo',
      href: '/generales/categorias',
      count: '16 Categorías'
    },
    {
      title: 'Notificaciones',
      description: 'Configurar notificaciones',
      icon: Bell,
      status: 'En Desarrollo',
      href: '/generales/notificaciones',
      count: '7 Tipos'
    },
    {
      title: 'Respaldos',
      description: 'Gestión de respaldos',
      icon: Shield,
      status: 'En Desarrollo',
      href: '/generales/respaldos',
      count: '12 Respaldos'
    },
    {
      title: 'Logs del Sistema',
      description: 'Registros del sistema',
      icon: Activity,
      status: 'En Desarrollo',
      href: '/generales/logs',
      count: '2,456 Entradas'
    },
    {
      title: 'Configuración General',
      description: 'Configuraciones generales del sistema',
      icon: Settings,
      status: 'Disponible',
      href: '/generales/configuracion',
      count: 'Sistema'
    }
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuraciones Generales</h2>
          <p className="text-muted-foreground">
            Administración completa de parámetros y configuraciones del sistema
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {modules.length} Módulos
        </Badge>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map((module, index) => {
          const Icon = module.icon
          return (
            <Link key={index} href={module.href}>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {module.title}
                  </CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {module.count}
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mb-3">
                    {module.description}
                  </CardDescription>
                  <Badge 
                    variant={module.status === 'Disponible' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {module.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Versión:</span> ZIRIUZ v2.0
              </div>
              <div>
                <span className="font-medium">Base de Datos:</span> MySQL 8.0
              </div>
              <div>
                <span className="font-medium">Estado:</span> 
                <Badge variant="default" className="ml-2">Activo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}