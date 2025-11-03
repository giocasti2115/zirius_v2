"use client"

import { Card } from "@/components/ui/card"
import { Package, FileText, Wrench, MapPin, TrendingUp, TrendingDown, Clock, CheckCircle2 } from "lucide-react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"

const statsData = [
  {
    title: "Solicitudes Pendientes",
    value: "197",
    change: "+12%",
    trend: "up",
    icon: Package,
    color: "text-warning",
  },
  {
    title: "Órdenes Abiertas",
    value: "2,772",
    change: "+8%",
    trend: "up",
    icon: Wrench,
    color: "text-info",
  },
  {
    title: "Cotizaciones Pendientes",
    value: "268",
    change: "-5%",
    trend: "down",
    icon: FileText,
    color: "text-primary",
  },
  {
    title: "Visitas Programadas",
    value: "104",
    change: "+15%",
    trend: "up",
    icon: MapPin,
    color: "text-success",
  },
]

const requestsData = [
  { month: "Ene", bodega: 45, servicio: 78, cotizaciones: 32 },
  { month: "Feb", bodega: 52, servicio: 85, cotizaciones: 41 },
  { month: "Mar", bodega: 61, servicio: 92, cotizaciones: 38 },
  { month: "Abr", bodega: 58, servicio: 88, cotizaciones: 45 },
  { month: "May", bodega: 67, servicio: 95, cotizaciones: 52 },
  { month: "Jun", bodega: 73, servicio: 102, cotizaciones: 48 },
]

const ordersData = [
  { day: "Lun", abiertas: 420, cerradas: 180 },
  { day: "Mar", abiertas: 385, cerradas: 210 },
  { day: "Mié", abiertas: 445, cerradas: 195 },
  { day: "Jue", abiertas: 410, cerradas: 225 },
  { day: "Vie", abiertas: 395, cerradas: 240 },
  { day: "Sáb", abiertas: 280, cerradas: 150 },
  { day: "Dom", abiertas: 220, cerradas: 120 },
]

const recentActivity = [
  {
    id: 1,
    type: "Solicitud Aprobada",
    description: "Solicitud #342629 - Unidad portátil",
    time: "Hace 5 min",
    status: "success",
  },
  { id: 2, type: "Nueva Orden", description: "Orden #10556663 - Pulsoxímetro", time: "Hace 12 min", status: "info" },
  {
    id: 3,
    type: "Visita Completada",
    description: "Visita #72514 - Glucómetro",
    time: "Hace 25 min",
    status: "success",
  },
  {
    id: 4,
    type: "Cotización Pendiente",
    description: "Cotización #268 - Monitor signos vitales",
    time: "Hace 1 hora",
    status: "warning",
  },
]

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">Panel de Control</h1>
        <p className="text-muted-foreground mt-2">Resumen general de operaciones y estadísticas del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg bg-muted p-2 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-success" : "text-destructive"}`}
              >
                {stat.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {stat.change}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Requests Chart */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Solicitudes por Mes</h3>
            <p className="text-sm text-muted-foreground">Comparativa de solicitudes de los últimos 6 meses</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={requestsData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Legend />
              <Line type="monotone" dataKey="bodega" stroke="hsl(var(--warning))" strokeWidth={2} name="Bodega" />
              <Line type="monotone" dataKey="servicio" stroke="hsl(var(--info))" strokeWidth={2} name="Servicio" />
              <Line
                type="monotone"
                dataKey="cotizaciones"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Cotizaciones"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Orders Chart */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Órdenes de Servicio</h3>
            <p className="text-sm text-muted-foreground">Órdenes abiertas vs cerradas por día</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Legend />
              <Bar dataKey="abiertas" fill="hsl(var(--info))" name="Abiertas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cerradas" fill="hsl(var(--success))" name="Cerradas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Actividad Reciente</h3>
          <p className="text-sm text-muted-foreground">Últimas actualizaciones del sistema</p>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
            >
              <div
                className={`rounded-full p-2 ${
                  activity.status === "success"
                    ? "bg-success/10 text-success"
                    : activity.status === "info"
                      ? "bg-info/10 text-info"
                      : "bg-warning/10 text-warning"
                }`}
              >
                {activity.status === "success" ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.type}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
