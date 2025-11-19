"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  LayoutDashboard,
  Package,
  FileText,
  Wrench,
  Settings,
  Search,
  Bell,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  PhoneOff,
  ClipboardList,
  MapPin,
  FileBarChart,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    route: "dashboard",
    current: true,
  },
  {
    name: "Solicitudes de Bodega",
    icon: Package,
    badge: 249,
    submodules: [
      { name: "Todas las Solicitudes", route: "warehouse-all" },
      { name: "Pendientes", route: "warehouse-pending", badge: 197 },
      { name: "Aprobadas", route: "warehouse-approved", badge: 45 },
      { name: "Despachadas", route: "warehouse-dispatched", badge: 7 },
      { name: "Terminadas", route: "warehouse-finished" },
      { name: "Rechazadas", route: "warehouse-rejected" },
      { name: "Repuesto de Solicitudes", route: "warehouse-spare-parts" },
      { name: "Items Adicionales", route: "warehouse-additional" },
    ],
  },
  {
    name: "Dar de Baja",
    icon: PhoneOff,
    submodules: [
      { name: "Solicitudes Dado de Baja", route: "decommission-all" },
      { name: "Solicitudes Baja Pendientes", route: "decommission-pending", badge: 718 },
      { name: "Aprobadas", route: "decommission-approved" },
      { name: "Rechazadas", route: "decommission-rejected" },
    ],
  },
  {
    name: "Cotizaciones",
    icon: FileText,
    badge: 268,
    submodules: [
      { name: "Todas las Cotizaciones", route: "quotes-all" },
      { name: "Pendientes", route: "quotes-pending", badge: 268 },
      { name: "Aprobadas", route: "quotes-approved" },
      { name: "Rechazadas", route: "quotes-rejected" },
    ],
  },
  {
    name: "Solicitudes de Servicio",
    icon: Wrench,
    submodules: [
      { name: "Nueva Solicitud", route: "service-new" },
      { name: "Todas las Solicitudes", route: "service-all" },
      { name: "Pendientes Preventivo", route: "service-pending-preventive" },
      { name: "Pendientes CIG", route: "service-pending-cig" },
      { name: "Aprobadas", route: "service-approved" },
      { name: "Rechazadas", route: "service-rejected" },
    ],
  },
  {
    name: "Órdenes de Servicio",
    icon: ClipboardList,
    badge: 2772,
    submodules: [
      { name: "Todas las Órdenes", route: "orders-all" },
      { name: "Órdenes Abiertas Preventivo", route: "orders-open-preventive", badge: 1858 },
      { name: "Órdenes Abiertas CIG", route: "orders-open-cig", badge: 914 },
      { name: "Órdenes Cerradas", route: "orders-closed" },
      { name: "Cambios Órdenes", route: "orders-changes" },
    ],
  },
  {
    name: "Visitas",
    icon: MapPin,
    badge: 104,
    submodules: [
      { name: "Todas las Visitas", route: "visits-all" },
      { name: "Visitas Pendientes", route: "visits-pending" },
      { name: "Visitas Abiertas", route: "visits-open", badge: 104 },
      { name: "Visitas Cerradas", route: "visits-closed" },
      { name: "Calendario de Visitas", route: "visits-calendar" },
      { name: "Actividades", route: "visits-activities" },
    ],
  },
  {
    name: "Informes",
    icon: FileBarChart,
    submodules: [
      { name: "Resumen Correctivos por Equipo", route: "reports-summary" },
      { name: "Repuestos Instalados", route: "reports-installed-parts" },
      { name: "Repuestos", route: "reports-parts" },
      { name: "Fallos", route: "reports-failures" },
      { name: "Duración Repuestos", route: "reports-duration" },
      { name: "Indicadores", route: "reports-indicators" },
      { name: "Correctivos Resultado", route: "reports-corrective" },
    ],
  },
  {
    name: "Configuración General",
    icon: Settings,
    submodules: [
      { name: "Clientes", route: "config-clients" },
      { name: "Sedes", route: "config-locations" },
      { name: "Equipos", route: "config-equipment" },
      { name: "Usuarios", route: "config-users" },
      { name: "Analistas", route: "config-analysts" },
      { name: "Técnicos", route: "config-technicians" },
      { name: "Coordinadores", route: "config-coordinators" },
      { name: "Comerciales", route: "config-sales" },
      { name: "Administradores", route: "config-admins" },
      { name: "Permisos Especiales", route: "config-permissions" },
      { name: "Usuarios vs Clientes", route: "config-user-clients" },
      { name: "Usuarios vs Sedes", route: "config-user-locations" },
      { name: "Repuestos", route: "config-spare-parts" },
      { name: "Clases de Equipos", route: "config-equipment-classes" },
      { name: "Marcas de Equipos", route: "config-equipment-brands" },
      { name: "Modelos de Equipos", route: "config-equipment-models" },
      { name: "Áreas de Equipos", route: "config-equipment-areas" },
      { name: "Tipos de Equipos", route: "config-equipment-types" },
      { name: "Subestados de Orden", route: "config-order-substates" },
      { name: "Sistemas de Falla", route: "config-failure-systems" },
      { name: "Modos de Falla", route: "config-failure-modes" },
      { name: "Causas de Falla", route: "config-failure-causes" },
      { name: "Acciones de Falla", route: "config-failure-actions" },
      { name: "Sesiones", route: "config-sessions" },
      { name: "Campos", route: "config-fields" },
      { name: "Preventivos", route: "config-preventive" },
      { name: "Software Anterior", route: "config-legacy" },
    ],
  },
]

interface DashboardLayoutProps {
  children?: React.ReactNode
  activeRoute?: string
  onNavigate?: (route: string) => void
}

export function DashboardLayout({ children, activeRoute = "dashboard", onNavigate }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(["Dashboard"])

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionName) ? prev.filter((name) => name !== sectionName) : [...prev, sectionName],
    )
  }

  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route)
    }
    setSidebarOpen(false) // Close mobile sidebar on navigation
  }

  const renderNavItem = (item: (typeof navigation)[0], isMobile = false) => {
    const hasSubmodules = item.submodules && item.submodules.length > 0
    const isExpanded = expandedSections.includes(item.name)
    const isActive = item.route === activeRoute

    if (!hasSubmodules) {
      return (
        <button
          key={item.name}
          onClick={() => item.route && handleNavigate(item.route)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {(!sidebarCollapsed || isMobile) && <span className="truncate">{item.name}</span>}
          </div>
          {(!sidebarCollapsed || isMobile) && item.badge && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground flex-shrink-0">
              {item.badge}
            </span>
          )}
        </button>
      )
    }

    return (
      <div key={item.name}>
        <button
          onClick={() => toggleSection(item.name)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {(!sidebarCollapsed || isMobile) && <span className="truncate">{item.name}</span>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {(!sidebarCollapsed || isMobile) && item.badge && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
                {item.badge}
              </span>
            )}
            {(!sidebarCollapsed || isMobile) &&
              (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </div>
        </button>
        {(!sidebarCollapsed || isMobile) && isExpanded && (
          <div className="ml-8 mt-1 space-y-1">
            {item.submodules?.map((submodule) => {
              const isSubActive = submodule.route === activeRoute
              return (
                <button
                  key={submodule.name}
                  onClick={() => handleNavigate(submodule.route)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    isSubActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <span className="truncate">{submodule.name}</span>
                  {submodule.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/80 px-1.5 text-xs font-semibold text-primary-foreground flex-shrink-0">
                      {submodule.badge}
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
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border">
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <span className="text-xl font-semibold text-sidebar-foreground">Ziriuz</span>
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
        <div className="flex flex-col flex-1 border-r border-sidebar-border bg-sidebar">
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            {!sidebarCollapsed && <span className="text-xl font-semibold text-sidebar-foreground">Ziriuz</span>}
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
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" placeholder="Buscar..." className="pl-9 bg-background" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
