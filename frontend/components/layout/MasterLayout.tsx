'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useModuleStats } from '@/lib/services/stats.service'
import {
  LayoutDashboard, Package, FileText, Wrench, Settings,
  Search, Bell, User, Menu, X, ChevronDown, ChevronRight,
  PhoneOff, ClipboardList, MapPin, FileBarChart, Users,
  Building, Cog
} from 'lucide-react'

const getNavigation = (stats: any) => [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    current: false,
  },
  {
    name: "Solicitudes de Bodega",
    icon: Package,
    current: false,
    submodules: [
      { name: "Solicitudes bodega", href: "/solicitudes-bodega", count: stats.solicitudesBodega },
      { name: "Pendientes", href: "/solicitudes-bodega/pendientes", count: 197 },
      { name: "Aprobadas", href: "/solicitudes-bodega/aprobadas", count: 45 },
      { name: "Despachadas", href: "/solicitudes-bodega/despachadas", count: 7 },
      { name: "Terminadas", href: "/solicitudes-bodega/terminadas" },
      { name: "Rechazadas", href: "/solicitudes-bodega/rechazadas" },
      { name: "Repuesto de Solicitudes", href: "/solicitudes-bodega/repuestos" },
      { name: "Items Adicionales", href: "/solicitudes-bodega/items" },
    ],
  },
  {
    name: "Dar de Baja",
    icon: PhoneOff,
    current: false,
    submodules: [
      { name: "Solicitudes dado de baja", href: "/dar-de-baja" },
      { name: "Solicitudes baja pendientes", href: "/dar-de-baja/pendientes" },
      { name: "Solicitudes baja aprobadas", href: "/dar-de-baja/aprobadas" },
      { name: "Solicitudes baja rechazadas", href: "/dar-de-baja/rechazadas" },
    ],
  },
  {
    name: "Cotizaciones",
    icon: FileText,
    current: false,
    count: stats.cotizaciones,
    submodules: [
      { name: "Cotizaciones", href: "/cotizaciones", count: stats.cotizaciones },
      { name: "Cotizaciones pendientes", href: "/cotizaciones/pendientes" },
      { name: "Cotizaciones aprobadas", href: "/cotizaciones/aprobadas" },
      { name: "Cotizaciones rechazadas", href: "/cotizaciones/rechazadas" },
    ],
  },
  {
    name: "Solicitudes de Servicio",
    icon: Wrench,
    current: false,
    count: stats.solicitudesServicio,
    submodules: [
      { name: "Nueva Solicitud de Servicio", href: "/solicitudes/nueva" },
      { name: "Solicitudes", href: "/solicitudes", count: stats.solicitudesServicio },
      { name: "Solicitudes Pendientes Preventivo", href: "/solicitudes/pendientes-preventivo" },
      { name: "Solicitudes Pendientes CIG", href: "/solicitudes/pendientes-cig" },
      { name: "Solicitudes Aprobadas", href: "/solicitudes/aprobadas" },
      { name: "Solicitudes Rechazadas", href: "/solicitudes/rechazadas" },
    ],
  },

  {
    name: "Órdenes de Servicio",
    icon: ClipboardList,
    current: false,
    count: stats.ordenesServicio,
    submodules: [
      { name: "Órdenes de Servicio", href: "/ordenes", count: stats.ordenesServicio },
      { name: "Órdenes Abiertas Preventivo", href: "/ordenes/abiertas-preventivo" },
      { name: "Órdenes Abiertas CIG", href: "/ordenes/abiertas-cig" },
      { name: "Órdenes Cerradas", href: "/ordenes/cerradas" },
      { name: "Cambios Órdenes", href: "/ordenes/cambios" },
    ],
  },
  {
    name: "Visitas",
    icon: MapPin,
    current: false,
    count: stats.visitas,
    submodules: [
      { name: "Visitas", href: "/visitas", count: stats.visitas },
      { name: "Visitas pendientes", href: "/visitas/pendientes" },
      { name: "Visitas Abiertas", href: "/visitas/abiertas" },
      { name: "Visitas Cerradas", href: "/visitas/cerradas" },
      { name: "Calendario Visita", href: "/visitas/calendario" },
      { name: "Actividades", href: "/visitas/actividades" },
    ],
  },
  {
    name: "Informes",
    icon: FileBarChart,
    current: false,
    submodules: [
      { name: "Resumen Correctivos por equipo", href: "/informes/correctivos-equipo" },
      { name: "Repuestos Instalados", href: "/informes/repuestos-instalados" },
      { name: "Repuestos", href: "/informes/repuestos" },
      { name: "Fallos", href: "/informes/fallos" },
      { name: "Duración Repuestos", href: "/informes/duracion-repuestos" },
      { name: "Indicadores", href: "/informes/indicadores" },
      { name: "Correctivos Resultados", href: "/informes/correctivos-resultados" },
    ],
  },
  {
    name: "Generales",
    icon: Settings,
    current: false,
    submodules: [
      { name: "Clientes", href: "/clientes", count: stats.clientes },
      { name: "Sedes", href: "/sedes" },
      { name: "Equipos", href: "/equipos" },
      { name: "Usuarios", href: "/usuarios" },
      { name: "Analistas", href: "/analistas" },
      { name: "Técnicos", href: "/tecnicos" },
      { name: "Coordinadores", href: "/coordinadores" },
      { name: "Comerciales", href: "/comercial" },
      { name: "Administradores", href: "/administradores" },
      { name: "Permisos especiales", href: "/permisos" },
      { name: "Usuarios vs Clientes", href: "/usuarios-clientes" },
      { name: "Usuarios vs Sedes", href: "/usuarios-sedes" },
      { name: "Repuestos", href: "/repuestos" },
      { name: "Clases de equipos", href: "/clases-equipos" },
      { name: "Marcas de Equipos", href: "/marcas-equipos" },
      { name: "Modelos de equipos", href: "/modelos-equipos" },
      { name: "Areas de equipos", href: "/areas-equipos" },
      { name: "Tipos de equipos", href: "/tipos-equipos" },
      { name: "Subestados de orden", href: "/subestados-orden" },
      { name: "Sistemas de falla", href: "/sistemas-falla" },
      { name: "Modelos de falla", href: "/modelos-falla" },
      { name: "Causas de falla", href: "/causas-falla" },
      { name: "Acciones de falla", href: "/acciones-falla" },
      { name: "Sesiones", href: "/sesiones" },
      { name: "Campos", href: "/campos" },
      { name: "Preventivos", href: "/preventivos" },
      { name: "Software anterior", href: "/software-anterior" },
    ],
  },
];

interface MasterLayoutProps {
  children: React.ReactNode
}

export function MasterLayout({ children }: MasterLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)
  const [currentPath, setCurrentPath] = useState('')
  
  // Usar el hook para obtener estadísticas en tiempo real
  const { stats, loading } = useModuleStats();
  
  // Obtener la navegación con estadísticas dinámicas
  const navigation = getNavigation(stats);

  useEffect(() => {
    setMounted(true)
    // Get user data
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }

    // Set current path safely after hydration
    setCurrentPath(window.location.pathname)
  }, [])

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) => {
      if (prev.includes(sectionName)) {
        return prev.filter((name) => name !== sectionName)
      }
      return [...prev, sectionName]
    })
  }

  const handleNavigate = (href: string) => {
    window.location.href = href
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const renderNavItem = (item: typeof navigation[0], isMobile = false) => {
    const hasSubmodules = item.submodules && item.submodules.length > 0
    const isExpanded = expandedSections.includes(item.name)
    const isActive = item.href === currentPath

    if (!hasSubmodules) {
      return (
        <button
          key={item.name}
          onClick={() => handleNavigate(item.href!)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {(!sidebarCollapsed || isMobile) && (
            <div className="flex items-center justify-between w-full">
              <span className="truncate">{item.name}</span>
              {item.count && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                  {loading ? "..." : item.count}
                </span>
              )}
            </div>
          )}
        </button>
      )
    }

    return (
      <div key={item.name}>
        <button
          onClick={() => toggleSection(item.name)}
          className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          <div className="flex items-center gap-3 min-w-0">
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {(!sidebarCollapsed || isMobile) && <span className="truncate">{item.name}</span>}
          </div>
          {(!sidebarCollapsed || isMobile) &&
            (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
        </button>
        {(!sidebarCollapsed || isMobile) && isExpanded && (
          <div className="ml-8 mt-1 space-y-1">
            {item.submodules?.map((submodule) => {
              const isSubActive = submodule.href === currentPath
              return (
                <button
                  key={submodule.name}
                  onClick={() => handleNavigate(submodule.href)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isSubActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="truncate">{submodule.name}</span>
                  {submodule.count && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                      {loading ? "..." : submodule.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-80 bg-white border-r border-gray-200 shadow-xl">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">Ziriuz</h1>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto h-[calc(100vh-4rem)]">
            {navigation.map((item) => renderNavItem(item, true))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300 ${
          sidebarCollapsed ? "lg:w-20" : "lg:w-80"
        }`}
      >
        <div className="flex flex-col flex-1 border-r border-gray-200 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            {!sidebarCollapsed && <h1 className="text-xl font-bold text-blue-600">Ziriuz</h1>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={sidebarCollapsed ? "mx-auto" : ""}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => renderNavItem(item))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-80"}`}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input type="search" placeholder="Buscar..." className="pl-9 bg-gray-50 border-gray-200" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.nombre || user?.usuario || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Salir
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}