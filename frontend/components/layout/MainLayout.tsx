'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { 
  BarChart3, Monitor, FileText, Wrench, Calendar, 
  DollarSign, Users, Settings, Menu, LogOut, Home,
  Building, Cog, ChevronDown, ChevronRight,
  MapPin, Truck, Package, UserCheck, CreditCard,
  BarChart, Database, Shield, Bell, AlertTriangle,
  PanelLeftClose, PanelLeft
} from 'lucide-react'

// Complete navigation structure based on real PHP platform inventory with notification counts
const navigation = [
  {
    name: 'Inicio',
    href: '/dashboard',
    icon: Home,
    description: 'Dashboard y estadísticas generales',
    badge: null,
    children: [
      { name: 'Dashboard General', href: '/dashboard', description: 'Vista general del sistema' },
      { name: 'Estadísticas', href: '/dashboard/stats', description: 'Métricas y reportes' },
      { name: 'Actividad Reciente', href: '/dashboard/activity', description: 'Log de actividades' }
    ]
  },
  {
    name: 'Solicitudes de Servicio',
    href: '/solicitudes',
    icon: FileText,
    description: 'Solicitudes de servicio técnico',
    badge: 15,
    children: [
      { name: 'Nueva Solicitud de Servicio', href: '/new-request', description: 'Crear nueva solicitud', badge: null },
      { name: 'Solicitudes', href: '/solicitudes', description: 'Todas las solicitudes', badge: 312541 },
      { name: 'Solicitudes Pendientes Preventivo', href: '/solicitudes/pendientes-preventivo', description: 'Mantenimientos preventivos pendientes', badge: 8 },
      { name: 'Solicitudes Pendientes CIG', href: '/solicitudes/pendientes-cig', description: 'Solicitudes CIG pendientes', badge: 3 },
      { name: 'Solicitudes Aprobadas', href: '/solicitudes/aprobadas', description: 'Solicitudes aprobadas', badge: 298567 },
      { name: 'Solicitudes Rechazadas', href: '/solicitudes/rechazadas', description: 'Solicitudes rechazadas', badge: 127 }
    ]
  },
  {
    name: 'Órdenes de Servicio',
    href: '/ordenes',
    icon: Wrench,
    description: 'Gestión de órdenes técnicas',
    badge: 23,
    children: [
      { name: 'Órdenes de Servicio', href: '/ordenes', description: 'Todas las órdenes de servicio', badge: 309635 },
      { name: 'Órdenes Abiertas Preventivo', href: '/ordenes/abiertas-preventivo', description: 'Órdenes preventivas abiertas', badge: 12 },
      { name: 'Órdenes Abiertas CIG', href: '/ordenes/abiertas-cig', description: 'Órdenes CIG abiertas', badge: 7 },
      { name: 'Órdenes Cerradas', href: '/ordenes/cerradas', description: 'Órdenes finalizadas', badge: 309612 },
      { name: 'Cambios Órdenes', href: '/ordenes/cambios', description: 'Modificaciones de órdenes', badge: 4 }
    ]
  },
  {
    name: 'Visitas',
    href: '/visitas',
    icon: Calendar,
    description: 'Programación y seguimiento de visitas',
    badge: 5,
    children: [
      { name: 'Visitas', href: '/visitas', description: 'Todas las visitas', badge: 89567 },
      { name: 'Visitas Pendientes', href: '/visitas/pendientes', description: 'Visitas programadas pendientes', badge: 5 },
      { name: 'Visitas Abiertas', href: '/visitas/abiertas', description: 'Visitas en curso', badge: 0 },
      { name: 'Visitas Cerradas', href: '/visitas/cerradas', description: 'Visitas completadas', badge: 89562 },
      { name: 'Calendario Visita', href: '/visitas/calendario', description: 'Calendario de visitas' },
      { name: 'Actividades', href: '/visitas/actividades', description: 'Actividades de visitas' }
    ]
  },
  {
    name: 'Informes',
    href: '/informes',
    icon: BarChart3,
    description: 'Reportes y análisis del sistema',
    badge: null,
    children: [
      { name: 'Resumen Correctivos por Equipo', href: '/informes/correctivos-equipo', description: 'Correctivos por equipo' },
      { name: 'Repuestos Instalados', href: '/informes/repuestos-instalados', description: 'Historial de repuestos' },
      { name: 'Repuestos', href: '/informes/repuestos', description: 'Reporte de repuestos' },
      { name: 'Fallos', href: '/informes/fallos', description: 'Análisis de fallos' },
      { name: 'Duración Repuestos', href: '/informes/duracion-repuestos', description: 'Vida útil de repuestos' },
      { name: 'Indicadores', href: '/informes/indicadores', description: 'Indicadores de rendimiento' },
      { name: 'Correctivos Resultados', href: '/informes/correctivos-resultados', description: 'Resultados de correctivos' }
    ]
  },
  {
    name: 'Dar de Baja',
    href: '/dar-baja',
    icon: AlertTriangle,
    description: 'Gestión de baja de equipos',
    badge: 2,
    children: [
      { name: 'Solicitudes Dado de Baja', href: '/dar-baja', description: 'Todas las solicitudes de baja', badge: 457 },
      { name: 'Solicitudes Baja Pendientes', href: '/dar-baja/pendientes', description: 'Solicitudes pendientes de aprobación', badge: 2 },
      { name: 'Solicitudes Baja Aprobadas', href: '/dar-baja/aprobadas', description: 'Solicitudes aprobadas', badge: 432 },
      { name: 'Solicitudes Baja Rechazadas', href: '/dar-baja/rechazadas', description: 'Solicitudes rechazadas', badge: 23 }
    ]
  },
  {
    name: 'Cotizaciones',
    href: '/cotizaciones',
    icon: DollarSign,
    description: 'Gestión comercial y cotizaciones',
    badge: 1,
    children: [
      { name: 'Cotizaciones', href: '/cotizaciones', description: 'Todas las cotizaciones', badge: 1245 },
      { name: 'Cotizaciones Pendientes', href: '/cotizaciones/pendientes', description: 'Cotizaciones en revisión', badge: 1 },
      { name: 'Cotizaciones Aprobadas', href: '/cotizaciones/aprobadas', description: 'Cotizaciones aprobadas', badge: 1198 },
      { name: 'Cotizaciones Rechazadas', href: '/cotizaciones/rechazadas', description: 'Cotizaciones rechazadas', badge: 46 }
    ]
  },
  {
    name: 'Solicitudes por Bodega',
    href: '/solicitudes-bodega',
    icon: Package,
    description: 'Gestión de solicitudes de bodega',
    badge: 7,
    children: [
      { name: 'Solicitudes Bodega', href: '/warehouse-requests', description: 'Todas las solicitudes de bodega', badge: 15678 },
      { name: 'Solicitudes Bodega Pendientes', href: '/solicitudes-bodega/pendientes', description: 'Solicitudes pendientes', badge: 7 },
      { name: 'Solicitudes Bodegas Aprobadas', href: '/solicitudes-bodega/aprobadas', description: 'Solicitudes aprobadas', badge: 15234 },
      { name: 'Solicitudes Bodegas Despachadas', href: '/solicitudes-bodega/despachadas', description: 'Solicitudes despachadas', badge: 15102 },
      { name: 'Solicitud Bodega Terminada', href: '/solicitudes-bodega/terminadas', description: 'Solicitudes completadas', badge: 15087 },
      { name: 'Solicitudes Bodegas Rechazadas', href: '/solicitudes-bodega/rechazadas', description: 'Solicitudes rechazadas', badge: 89 },
      { name: 'Repuesto de Solicitudes Bodega', href: '/solicitudes-bodega/repuestos', description: 'Repuestos de solicitudes' },
      { name: 'Item Adicionales de Solicitudes de Bodega', href: '/solicitudes-bodega/items-adicionales', description: 'Items adicionales' }
    ]
  },
  {
    name: 'Generales',
    href: '/generales',
    icon: Settings,
    description: 'Configuraciones generales del sistema',
    badge: null,
    children: [
      // === GESTIÓN DE ENTIDADES PRINCIPALES ===
      { name: 'Clientes', href: '/clientes', description: 'Gestión de clientes', badge: 942 },
      { name: 'Sedes', href: '/sedes', description: 'Gestión de sedes', badge: 2841 },
      { name: 'Equipos', href: '/equipos', description: 'Gestión de equipos', badge: 68640 },
      { name: 'Usuarios', href: '/usuarios', description: 'Gestión de usuarios', badge: 1250 },
      { name: 'Repuestos', href: '/generales/repuestos', description: 'Catálogo de repuestos', badge: 5672 },
      
      // === CONFIGURACIÓN DE EQUIPOS ===
      { name: 'Tipos de Equipos', href: '/generales/tipos-equipos', description: 'Clasificación y tipos de equipos médicos', badge: 67 },
      { name: 'Marcas de Equipos', href: '/generales/marcas', description: 'Marcas y fabricantes de equipos', badge: 234 },
      { name: 'Modelos de Equipos', href: '/generales/modelos', description: 'Modelos de equipos', badge: 1567 },
      { name: 'Clases de Equipos', href: '/generales/clases-equipos', description: 'Clasificación de equipos', badge: 89 },
      { name: 'Áreas de Equipos', href: '/generales/areas-equipos', description: 'Áreas de equipos', badge: 45 },
      
      // === GESTIÓN DE PERSONAL ===
      { name: 'Analistas', href: '/generales/analistas', description: 'Gestión de analistas', badge: 45 },
      { name: 'Técnicos', href: '/generales/tecnicos', description: 'Gestión de técnicos', badge: 127 },
      { name: 'Coordinadores', href: '/generales/coordinadores', description: 'Gestión de coordinadores', badge: 23 },
      { name: 'Comerciales', href: '/generales/comerciales', description: 'Gestión de comerciales', badge: 18 },
      { name: 'Administradores', href: '/generales/administradores', description: 'Gestión de administradores', badge: 12 },
      
      // === CONFIGURACIÓN DEL SISTEMA ===
      { name: 'Estados y Prioridades', href: '/generales/estados-prioridades', description: 'Estados del sistema y niveles de prioridad' },
      { name: 'Ciudades y Departamentos', href: '/generales/ciudades-departamentos', description: 'Configuración geográfica de Colombia' },
      { name: 'Sistema de Permisos', href: '/generales/permisos', description: 'Control de acceso y permisos por roles' },
      { name: 'Variables de Sistema', href: '/generales/variables-sistema', description: 'Parámetros y configuraciones del sistema' },
      
      // === OPERACIONES Y MANTENIMIENTO ===
      { name: 'Sistema de Respaldos', href: '/generales/respaldos', description: 'Respaldos automáticos y manuales de la BD' },
      { name: 'Sistema de Logs', href: '/generales/logs', description: 'Monitoreo y análisis de eventos del sistema' },
      { name: 'Notificaciones', href: '/generales/notificaciones', description: 'Plantillas y configuración de notificaciones' },
      
      // === GESTIÓN DE FALLAS ===
      { name: 'Sistemas de Falla', href: '/generales/sistemas-falla', description: 'Sistemas de falla', badge: 156 },
      { name: 'Modelos de Falla', href: '/generales/modelos-falla', description: 'Modelos de falla', badge: 345 },
      { name: 'Causas de Falla', href: '/generales/causas-falla', description: 'Causas de falla', badge: 678 },
      { name: 'Acciones de Falla', href: '/generales/acciones-falla', description: 'Acciones de falla', badge: 234 },
      
      // === CONFIGURACIÓN AVANZADA ===
      { name: 'Subestados de Orden', href: '/generales/subestados', description: 'Subestados de órdenes', badge: 23 },
      { name: 'Usuarios vs Clientes', href: '/generales/usuarios-clientes', description: 'Relación usuarios-clientes' },
      { name: 'Usuarios vs Sedes', href: '/generales/usuarios-sedes', description: 'Relación usuarios-sedes' },
      { name: 'Sesiones', href: '/generales/sesiones', description: 'Gestión de sesiones' },
      { name: 'Campos', href: '/generales/campos', description: 'Configuración de campos' },
      { name: 'Preventivos', href: '/generales/preventivos', description: 'Mantenimientos preventivos', badge: 45 },
      { name: 'Software Anterior', href: '/generales/software-anterior', description: 'Software anterior' }
    ]
  }
]

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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

  const formatBadgeNumber = (num: number | null): string => {
    if (num === null || num === 0) return ''
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const NavigationContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b bg-white">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">Z</span>
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-lg text-gray-900">ZIRIUZ</span>
          )}
        </div>
        
        {/* Collapse toggle for desktop */}
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex"
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const isExpanded = expandedMenus[item.name] && !isCollapsed
            const Icon = item.icon
            const totalBadgeCount = item.badge || 0

            if (item.children && item.children.length > 0) {
              return (
                <Collapsible key={item.name} open={isExpanded} onOpenChange={() => !isCollapsed && toggleMenu(item.name)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start h-auto py-3 px-3 transition-all duration-200',
                        isActive && 'bg-blue-50 text-blue-700 border-l-4 border-blue-600',
                        'hover:bg-gray-50 hover:shadow-sm',
                        isCollapsed && 'px-2'
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={cn(
                        'flex-shrink-0 h-5 w-5',
                        isActive ? 'text-blue-600' : 'text-gray-500',
                        isCollapsed ? 'mr-0' : 'mr-3'
                      )} />
                      
                      {!isCollapsed && (
                        <>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {totalBadgeCount > 0 && (
                              <Badge 
                                variant={totalBadgeCount > 10 ? "destructive" : "secondary"} 
                                className="text-xs h-5 px-1.5"
                              >
                                {formatBadgeNumber(totalBadgeCount)}
                              </Badge>
                            )}
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </>
                      )}
                      
                      {isCollapsed && totalBadgeCount > 0 && (
                        <div className="absolute -top-1 -right-1">
                          <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {totalBadgeCount > 9 ? '9+' : totalBadgeCount}
                            </span>
                          </div>
                        </div>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  {!isCollapsed && (
                    <CollapsibleContent className="space-y-1 mt-1">
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.href
                        return (
                          <Link key={child.href} href={child.href}>
                            <Button
                              variant="ghost"
                              className={cn(
                                'w-full justify-start py-2 px-3 ml-6 h-auto transition-all duration-200',
                                isChildActive && 'bg-blue-50 text-blue-700 border-l-2 border-blue-600 shadow-sm',
                                'hover:bg-gray-50 hover:shadow-sm'
                              )}
                            >
                              <div className="flex-1 text-left">
                                <div className="text-sm font-medium">{child.name}</div>
                                <div className="text-xs text-muted-foreground">{child.description}</div>
                              </div>
                              
                              {child.badge && (
                                <Badge 
                                  variant={child.badge > 100 ? "destructive" : child.badge > 0 ? "default" : "secondary"} 
                                  className="text-xs h-5 px-1.5 ml-2"
                                >
                                  {formatBadgeNumber(child.badge)}
                                </Badge>
                              )}
                            </Button>
                          </Link>
                        )
                      })}
                    </CollapsibleContent>
                  )}
                </Collapsible>
              )
            }

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start h-auto py-3 px-3 transition-all duration-200 relative',
                    isActive && 'bg-blue-50 text-blue-700 border-l-4 border-blue-600',
                    'hover:bg-gray-50 hover:shadow-sm',
                    isCollapsed && 'px-2'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={cn(
                    'flex-shrink-0 h-5 w-5',
                    isActive ? 'text-blue-600' : 'text-gray-500',
                    isCollapsed ? 'mr-0' : 'mr-3'
                  )} />
                  
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                      
                      {totalBadgeCount > 0 && (
                        <Badge 
                          variant={totalBadgeCount > 10 ? "destructive" : "secondary"} 
                          className="text-xs h-5 px-1.5"
                        >
                          {formatBadgeNumber(totalBadgeCount)}
                        </Badge>
                      )}
                    </>
                  )}
                  
                  {isCollapsed && totalBadgeCount > 0 && (
                    <div className="absolute -top-1 -right-1">
                      <div className="h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                          {totalBadgeCount > 9 ? '9+' : totalBadgeCount}
                        </span>
                      </div>
                    </div>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4 bg-white">
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="h-8 w-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">{user?.nombre?.charAt(0) || 'U'}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{user?.nombre || 'Usuario'}</div>
                  <div className="text-xs text-muted-foreground truncate">{user?.email || user?.correo || 'Sin email'}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Cerrar sesión">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "lg:w-20" : "lg:w-72"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white shadow-sm">
          <NavigationContent isCollapsed={sidebarCollapsed} />
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden fixed top-4 left-4 z-40 bg-white shadow-md">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <NavigationContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className={cn(
        "flex flex-col flex-1 transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
      )}>
        {/* Top bar for mobile */}
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">ZIRIUZ</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-500" />
            <div className="h-8 w-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">{user?.nombre?.charAt(0) || 'U'}</span>
            </div>
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}