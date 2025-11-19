"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DataTable } from "@/components/data-table"
import { RequestForm } from "@/components/request-form"
import { ConfigForm } from "@/components/config-form"
import { LoginPage } from "@/components/login-page"

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeRoute, setActiveRoute] = useState("dashboard")

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  const renderContent = () => {
    // Dashboard
    if (activeRoute === "dashboard") {
      return <DashboardOverview />
    }

    // Warehouse Requests - Tables
    if (activeRoute.startsWith("warehouse-")) {
      const statusMap: Record<string, string> = {
        "warehouse-all": "Todas las Solicitudes de Bodega",
        "warehouse-pending": "Solicitudes de Bodega Pendientes",
        "warehouse-approved": "Solicitudes de Bodega Aprobadas",
        "warehouse-dispatched": "Solicitudes de Bodega Despachadas",
        "warehouse-finished": "Solicitudes de Bodega Terminadas",
        "warehouse-rejected": "Solicitudes de Bodega Rechazadas",
        "warehouse-spare-parts": "Repuesto de Solicitudes",
        "warehouse-additional": "Items Adicionales de Solicitudes",
      }
      return <DataTable title={statusMap[activeRoute] || "Solicitudes de Bodega"} type="warehouse" />
    }

    // Decommission - Tables
    if (activeRoute.startsWith("decommission-")) {
      const statusMap: Record<string, string> = {
        "decommission-all": "Solicitudes Dado de Baja",
        "decommission-pending": "Solicitudes Baja Pendientes",
        "decommission-approved": "Solicitudes Baja Aprobadas",
        "decommission-rejected": "Solicitudes Baja Rechazadas",
      }
      return <DataTable title={statusMap[activeRoute] || "Dar de Baja"} type="decommission" />
    }

    // Quotes - Tables
    if (activeRoute.startsWith("quotes-")) {
      const statusMap: Record<string, string> = {
        "quotes-all": "Todas las Cotizaciones",
        "quotes-pending": "Cotizaciones Pendientes",
        "quotes-approved": "Cotizaciones Aprobadas",
        "quotes-rejected": "Cotizaciones Rechazadas",
      }
      return <DataTable title={statusMap[activeRoute] || "Cotizaciones"} type="quotes" />
    }

    // Service Requests
    if (activeRoute === "service-new") {
      return <RequestForm type="service" title="Nueva Solicitud de Servicio" />
    }
    if (activeRoute.startsWith("service-")) {
      const statusMap: Record<string, string> = {
        "service-all": "Todas las Solicitudes de Servicio",
        "service-pending-preventive": "Solicitudes Pendientes Preventivo",
        "service-pending-cig": "Solicitudes Pendientes CIG",
        "service-approved": "Solicitudes de Servicio Aprobadas",
        "service-rejected": "Solicitudes de Servicio Rechazadas",
      }
      return <DataTable title={statusMap[activeRoute] || "Solicitudes de Servicio"} type="service" />
    }

    // Service Orders - Tables
    if (activeRoute.startsWith("orders-")) {
      const statusMap: Record<string, string> = {
        "orders-all": "Todas las Órdenes de Servicio",
        "orders-open-preventive": "Órdenes Abiertas Preventivo",
        "orders-open-cig": "Órdenes Abiertas CIG",
        "orders-closed": "Órdenes Cerradas",
        "orders-changes": "Cambios de Órdenes",
      }
      return <DataTable title={statusMap[activeRoute] || "Órdenes de Servicio"} type="orders" />
    }

    // Visits - Tables
    if (activeRoute.startsWith("visits-")) {
      const statusMap: Record<string, string> = {
        "visits-all": "Todas las Visitas",
        "visits-pending": "Visitas Pendientes",
        "visits-open": "Visitas Abiertas",
        "visits-closed": "Visitas Cerradas",
        "visits-calendar": "Calendario de Visitas",
        "visits-activities": "Actividades de Visitas",
      }
      return <DataTable title={statusMap[activeRoute] || "Visitas"} type="visits" />
    }

    // Reports - Tables
    if (activeRoute.startsWith("reports-")) {
      const statusMap: Record<string, string> = {
        "reports-summary": "Resumen Correctivos por Equipo",
        "reports-installed-parts": "Repuestos Instalados",
        "reports-parts": "Repuestos",
        "reports-failures": "Fallos",
        "reports-duration": "Duración Repuestos",
        "reports-indicators": "Indicadores",
        "reports-corrective": "Correctivos Resultado",
      }
      return <DataTable title={statusMap[activeRoute] || "Informes"} type="reports" />
    }

    // Configuration - Forms
    if (activeRoute.startsWith("config-")) {
      const configMap: Record<string, string> = {
        "config-clients": "Clientes",
        "config-locations": "Sedes",
        "config-equipment": "Equipos",
        "config-users": "Usuarios",
        "config-analysts": "Analistas",
        "config-technicians": "Técnicos",
        "config-coordinators": "Coordinadores",
        "config-sales": "Comerciales",
        "config-admins": "Administradores",
        "config-permissions": "Permisos Especiales",
        "config-user-clients": "Usuarios vs Clientes",
        "config-user-locations": "Usuarios vs Sedes",
        "config-spare-parts": "Repuestos",
        "config-equipment-classes": "Clases de Equipos",
        "config-equipment-brands": "Marcas de Equipos",
        "config-equipment-models": "Modelos de Equipos",
        "config-equipment-areas": "Áreas de Equipos",
        "config-equipment-types": "Tipos de Equipos",
        "config-order-substates": "Subestados de Orden",
        "config-failure-systems": "Sistemas de Falla",
        "config-failure-modes": "Modos de Falla",
        "config-failure-causes": "Causas de Falla",
        "config-failure-actions": "Acciones de Falla",
        "config-sessions": "Sesiones",
        "config-fields": "Campos",
        "config-preventive": "Preventivos",
        "config-legacy": "Software Anterior",
      }
      return <ConfigForm type={activeRoute} title={configMap[activeRoute] || "Configuración"} />
    }

    return <DashboardOverview />
  }

  return (
    <DashboardLayout activeRoute={activeRoute} onNavigate={setActiveRoute}>
      {renderContent()}
    </DashboardLayout>
  )
}
