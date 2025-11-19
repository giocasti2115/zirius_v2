'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAuth } from '@/contexts/AuthContext'
import { 
  BarChart3, Monitor, FileText, Wrench, Calendar, 
  DollarSign, Users, Settings, Menu, LogOut, Home,
  Building, Cog, ChevronDown, ChevronRight,
  MapPin, Truck, Package, UserCheck, CreditCard,
  BarChart, Database, Shield, Bell, AlertTriangle
} from 'lucide-react'

// Complete navigation structure based on PHP platform inventory
const navigation = [
  {
    name: 'Inicio',
    href: '/dashboard',
    icon: Home,
    description: 'Dashboard y estadísticas generales',
    children: [
      { name: 'Dashboard General', href: '/dashboard', description: 'Vista general del sistema' },
      { name: 'Estadísticas', href: '/dashboard/stats', description: 'Métricas y reportes' },
      { name: 'Actividad Reciente', href: '/dashboard/activity', description: 'Log de actividades' }
    ]
  },
  {
    name: 'Clientes',
    href: '/clientes',
    icon: Users,
    description: 'Gestión de clientes y sedes',
    children: [
      { name: 'Lista de Clientes', href: '/clientes', description: 'Gestión de clientes' },
      { name: 'Sedes', href: '/sedes', description: 'Gestión de sedes' },
      { name: 'Contactos', href: '/clientes/contactos', description: 'Contactos por cliente' },
      { name: 'Configuración Clientes', href: '/config-clients', description: 'Configuraciones específicas' }
    ]
  },
  {
    name: 'Equipos',
    href: '/equipos',
    icon: Monitor,
    description: 'Gestión completa de equipos médicos',
    children: [
      { name: 'Lista de Equipos', href: '/equipos', description: 'Inventario de equipos' },
      { name: 'Mantenimientos', href: '/equipos/mantenimientos', description: 'Programación de mantenimientos' },
      { name: 'Calibraciones', href: '/equipos/calibraciones', description: 'Control de calibraciones' },
      { name: 'Baja de Equipos', href: '/equipos/baja', description: 'Proceso de baja de equipos' },
      { name: 'Repuestos', href: '/equipos/repuestos', description: 'Gestión de repuestos' },
      { name: 'Modelos y Marcas', href: '/equipos/modelos', description: 'Catálogo de modelos' }
    ]
  },
  {
    name: 'Solicitudes',
    href: '/solicitudes',
    icon: FileText,
    description: 'Solicitudes de servicio técnico',
    children: [
      { name: 'Todas las Solicitudes', href: '/solicitudes', description: 'Lista completa de solicitudes' },
      { name: 'Nueva Solicitud', href: '/new-request', description: 'Crear nueva solicitud' },
      { name: 'Solicitudes Bodega', href: '/warehouse-requests', description: 'Solicitudes de bodega' },
      { name: 'Solicitudes Urgentes', href: '/solicitudes/urgentes', description: 'Solicitudes prioritarias' },
      { name: 'Seguimiento', href: '/solicitudes/seguimiento', description: 'Seguimiento de solicitudes' }
    ]
  },
  {
    name: 'Órdenes de Trabajo',
    href: '/ordenes',
    icon: Wrench,
    description: 'Gestión de órdenes técnicas',
    children: [
      { name: 'Todas las Órdenes', href: '/ordenes', description: 'Lista de órdenes de trabajo' },
      { name: 'Asignación Técnicos', href: '/ordenes/asignacion', description: 'Asignar técnicos' },
      { name: 'Programación', href: '/ordenes/programacion', description: 'Programar trabajos' },
      { name: 'Materiales', href: '/ordenes/materiales', description: 'Gestión de materiales' },
      { name: 'Reportes', href: '/ordenes/reportes', description: 'Reportes de órdenes' }
    ]
  },
  {
    name: 'Visitas',
    href: '/visitas',
    icon: Calendar,
    description: 'Programación y seguimiento de visitas',
    children: [
      { name: 'Calendario Visitas', href: '/visitas', description: 'Programación de visitas' },
      { name: 'Visitas Técnicas', href: '/visitas/tecnicas', description: 'Visitas técnicas' },
      { name: 'Visitas Comerciales', href: '/visitas/comerciales', description: 'Visitas comerciales' },
      { name: 'Rutas Técnicos', href: '/visitas/rutas', description: 'Rutas de técnicos' },
      { name: 'Reportes Visitas', href: '/visitas/reportes', description: 'Reportes de visitas' }
    ]
  },
  {
    name: 'Usuarios',
    href: '/usuarios',
    icon: UserCheck,
    description: 'Gestión de usuarios y permisos',
    children: [
      { name: 'Lista de Usuarios', href: '/usuarios', description: 'Gestión de usuarios' },
      { name: 'Roles y Permisos', href: '/usuarios/roles', description: 'Configuración de roles' },
      { name: 'Técnicos', href: '/usuarios/tecnicos', description: 'Gestión de técnicos' },
      { name: 'Sesiones Activas', href: '/usuarios/sesiones', description: 'Monitoreo de sesiones' },
      { name: 'Configuración Perfil', href: '/usuarios/perfil', description: 'Configuración personal' }
    ]
  },
  {
    name: 'Comercial',
    href: '/comercial',
    icon: DollarSign,
    description: 'Gestión comercial y cotizaciones',
    children: [
      { name: 'Cotizaciones', href: '/cotizaciones', description: 'Gestión de cotizaciones' },
      { name: 'Contratos', href: '/comercial/contratos', description: 'Gestión de contratos' },
      { name: 'Facturación', href: '/comercial/facturacion', description: 'Proceso de facturación' },
      { name: 'Precios y Tarifas', href: '/comercial/precios', description: 'Gestión de precios' },
      { name: 'Informes Comerciales', href: '/comercial/informes', description: 'Reportes comerciales' }
    ]
  },
  {
    name: 'Generales',
    href: '/generales',
    icon: Settings,
    description: 'Configuraciones generales del sistema',
    children: [
      { name: 'Configuración General', href: '/generales', description: 'Configuraciones generales del sistema' },
      { name: 'Estados', href: '/generales/estados', description: 'Gestión de estados del sistema' },
      { name: 'Prioridades', href: '/generales/prioridades', description: 'Niveles de prioridad' },
      { name: 'Tipos de Equipos', href: '/generales/tipos-equipos', description: 'Categorías de equipos médicos' },
      { name: 'Marcas', href: '/generales/marcas', description: 'Marcas de equipos' },
      { name: 'Modelos', href: '/generales/modelos', description: 'Modelos de equipos' },
      { name: 'Ciudades', href: '/generales/ciudades', description: 'Gestión de ciudades' },
      { name: 'Departamentos', href: '/generales/departamentos', description: 'Departamentos y regiones' },
      { name: 'Usuarios', href: '/generales/usuarios', description: 'Gestión de usuarios del sistema' },
      { name: 'Permisos', href: '/generales/permisos', description: 'Control de permisos y roles' },
      { name: 'Variables Sistema', href: '/generales/variables', description: 'Variables de configuración' },
      { name: 'Parámetros', href: '/generales/parametros', description: 'Parámetros del sistema' },
      { name: 'Clasificaciones', href: '/generales/clasificaciones', description: 'Clasificaciones de equipos' },
      { name: 'Categorías', href: '/generales/categorias', description: 'Categorías del sistema' },
      { name: 'Notificaciones', href: '/generales/notificaciones', description: 'Configurar notificaciones' },
      { name: 'Respaldos', href: '/generales/respaldos', description: 'Gestión de respaldos' },
      { name: 'Logs del Sistema', href: '/generales/logs', description: 'Registros del sistema' }
    ]
  }
]

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({})
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Error during logout:', error)
      window.location.href = '/'
    }
  }

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }))
  }

  const NavigationContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center px-6 border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          <span className="font-semibold text-lg">ZIRIUZ</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const isExpanded = expandedMenus[item.name]
            const Icon = item.icon

            if (item.children && item.children.length > 0) {
              return (
                <Collapsible key={item.name} open={isExpanded} onOpenChange={() => toggleMenu(item.name)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start h-auto py-3 px-3',
                        isActive && 'bg-gray-100 text-gray-900',
                        'hover:bg-gray-50'
                      )}
                    >
                      <Icon className={cn('mr-3 h-5 w-5 flex-shrink-0', isActive && 'text-blue-600')} />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href
                      return (
                        <Link key={child.href} href={child.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              'w-full justify-start py-2 px-3 ml-6 h-auto',
                              isChildActive && 'bg-blue-50 text-blue-700 border-l-2 border-blue-600',
                              'hover:bg-gray-50'
                            )}
                          >
                            <div className="text-left">
                              <div className="text-sm font-medium">{child.name}</div>
                              <div className="text-xs text-muted-foreground">{child.description}</div>
                            </div>
                          </Button>
                        </Link>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )
            }

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start h-auto py-3 px-3',
                    isActive && 'bg-gray-100 text-gray-900',
                    'hover:bg-gray-50'
                  )}
                >
                  <Icon className={cn('mr-3 h-5 w-5 flex-shrink-0', isActive && 'text-blue-600')} />
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">{user?.nombre?.charAt(0) || 'U'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{user?.nombre || 'Usuario'}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email || user?.correo || 'Sin email'}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} title="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <NavigationContent />
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden fixed top-4 left-4 z-40">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <NavigationContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}