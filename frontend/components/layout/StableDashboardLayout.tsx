'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  LayoutDashboard, Package, FileText, Wrench, Settings,
  Search, Bell, User, Menu, X, ChevronDown, ChevronRight,
  PhoneOff, ClipboardList, MapPin, FileBarChart
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    current: true,
  },
  {
    name: "Solicitudes de Servicio",
    icon: Wrench,
    current: false,
    submodules: [
      { name: "Nueva Solicitud", href: "/solicitudes/nueva" },
      { name: "Todas las Solicitudes", href: "/solicitudes" },
      { name: "Pendientes Preventivo", href: "/solicitudes?status=pending-preventive" },
      { name: "Pendientes CIG", href: "/solicitudes?status=pending-cig" },
      { name: "Aprobadas", href: "/solicitudes?status=approved" },
      { name: "Rechazadas", href: "/solicitudes?status=rejected" },
    ],
  },
  {
    name: "Cotizaciones",
    icon: FileText,
    current: false,
    submodules: [
      { name: "Todas las Cotizaciones", href: "/cotizaciones" },
      { name: "Pendientes", href: "/cotizaciones?status=pending" },
      { name: "Aprobadas", href: "/cotizaciones?status=approved" },
      { name: "Rechazadas", href: "/cotizaciones?status=rejected" },
    ],
  },
  {
    name: "Órdenes de Servicio",
    icon: ClipboardList,
    current: false,
    submodules: [
      { name: "Todas las Órdenes", href: "/ordenes" },
      { name: "Órdenes Abiertas Preventivo", href: "/ordenes?status=open-preventive" },
      { name: "Órdenes Abiertas CIG", href: "/ordenes?status=open-cig" },
      { name: "Órdenes Cerradas", href: "/ordenes?status=closed" },
      { name: "Cambios Órdenes", href: "/ordenes?status=changes" },
    ],
  },
  {
    name: "Visitas",
    icon: MapPin,
    current: false,
    submodules: [
      { name: "Todas las Visitas", href: "/visitas" },
      { name: "Visitas Pendientes", href: "/visitas?status=pending" },
      { name: "Visitas Abiertas", href: "/visitas?status=open" },
      { name: "Visitas Cerradas", href: "/visitas?status=closed" },
      { name: "Calendario de Visitas", href: "/visitas/calendario" },
      { name: "Actividades", href: "/visitas/actividades" },
    ],
  },
  {
    name: "Configuración General",
    icon: Settings,
    current: false,
    submodules: [
      { name: "Clientes", href: "/clientes" },
      { name: "Sedes", href: "/sedes" },
      { name: "Equipos", href: "/equipos" },
      { name: "Usuarios", href: "/usuarios" },
      { name: "Analistas", href: "/usuarios?role=analyst" },
      { name: "Técnicos", href: "/usuarios?role=technician" },
      { name: "Coordinadores", href: "/usuarios?role=coordinator" },
      { name: "Comerciales", href: "/comercial" },
      { name: "Administradores", href: "/usuarios?role=admin" },
    ],
  },
]

interface StableDashboardLayoutProps {
  children: React.ReactNode
  activeRoute?: string
}

export function StableDashboardLayout({ children, activeRoute }: StableDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(["Dashboard"])
  const [user, setUser] = React.useState<any>(null)
  const [currentPath, setCurrentPath] = useState('')

  React.useEffect(() => {
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
      return [sectionName]
    })
  }

  const handleNavigate = (href: string) => {
    // Simple navigation without complex routing
    window.location.href = href
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
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
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          )}
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {(!sidebarCollapsed || isMobile) && <span className="truncate">{item.name}</span>}
        </button>
      )
    }

    return (
      <div key={item.name}>
        <button
          onClick={() => toggleSection(item.name)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          )}
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
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    isSubActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <span className="truncate">{submodule.name}</span>
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
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 shadow-xl">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">ZIRIUZ</h1>
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
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col transition-all duration-300",
          sidebarCollapsed ? "lg:w-20" : "lg:w-72",
        )}
      >
        <div className="flex flex-col flex-1 border-r border-gray-200 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            {!sidebarCollapsed && <h1 className="text-xl font-bold text-blue-600">ZIRIUZ</h1>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={cn("flex-shrink-0", sidebarCollapsed && "mx-auto")}
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
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-20" : "lg:pl-72")}>
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
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.nombre || user?.usuario || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500">Administrador</p>
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