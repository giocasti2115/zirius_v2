import { Card, CardContent } from "@/components/ui/card"
import {
  Wrench,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  Calendar,
  MapPin,
  FileBarChart,
} from "lucide-react"

const serviceModules = [
  {
    name: "Nueva Solicitud",
    icon: Plus,
    count: null,
    status: "primary",
    description: "Crear solicitud",
  },
  {
    name: "Solicitudes",
    icon: Wrench,
    count: null,
    status: "default",
    description: "Ver todas",
  },
  {
    name: "Pendientes Preventivo",
    icon: Clock,
    count: 0,
    status: "warning",
    description: "Requieren atención",
  },
  {
    name: "Pendientes CIG",
    icon: Clock,
    count: 0,
    status: "warning",
    description: "Requieren atención",
  },
  {
    name: "Aprobadas",
    icon: CheckCircle2,
    count: null,
    status: "success",
    description: "Listas para procesar",
  },
  {
    name: "Rechazadas",
    icon: XCircle,
    count: null,
    status: "destructive",
    description: "No aprobadas",
  },
]

const ordersModules = [
  {
    name: "Órdenes de Servicio",
    icon: FileBarChart,
    count: null,
    status: "default",
  },
  {
    name: "Abiertas Preventivo",
    icon: Clock,
    count: 1858,
    status: "info",
  },
  {
    name: "Abiertas CIG",
    icon: Clock,
    count: 914,
    status: "info",
  },
  {
    name: "Cerradas",
    icon: CheckCircle2,
    count: null,
    status: "success",
  },
]

const visitsModules = [
  {
    name: "Visitas",
    icon: MapPin,
    count: null,
    status: "default",
  },
  {
    name: "Pendientes",
    icon: Clock,
    count: 0,
    status: "warning",
  },
  {
    name: "Abiertas",
    icon: Eye,
    count: 104,
    status: "info",
  },
  {
    name: "Cerradas",
    icon: CheckCircle2,
    count: null,
    status: "success",
  },
  {
    name: "Calendario",
    icon: Calendar,
    count: null,
    status: "default",
  },
]

export function ServiceRequestsSection() {
  return (
    <div className="space-y-8">
      <section id="service">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Solicitudes de Servicio</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Gestiona solicitudes de mantenimiento y servicio técnico
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceModules.map((module) => (
            <Card key={module.name} className="group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        module.status === "primary"
                          ? "bg-primary/10 text-primary"
                          : module.status === "warning"
                            ? "bg-warning/10 text-warning"
                            : module.status === "success"
                              ? "bg-success/10 text-success"
                              : module.status === "destructive"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <module.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm leading-tight">{module.name}</h3>
                      {module.count !== null ? (
                        <p className="text-2xl font-bold mt-1">{module.count}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="orders">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Órdenes de Servicio</h2>
            <p className="text-sm text-muted-foreground mt-1">Seguimiento de órdenes de trabajo</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ordersModules.map((module) => (
            <Card key={module.name} className="group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        module.status === "info"
                          ? "bg-info/10 text-info"
                          : module.status === "success"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <module.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm leading-tight">{module.name}</h3>
                      {module.count !== null && <p className="text-2xl font-bold mt-1">{module.count}</p>}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="visits">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Visitas</h2>
            <p className="text-sm text-muted-foreground mt-1">Programa y gestiona visitas técnicas</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {visitsModules.map((module) => (
            <Card key={module.name} className="group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        module.status === "warning"
                          ? "bg-warning/10 text-warning"
                          : module.status === "info"
                            ? "bg-info/10 text-info"
                            : module.status === "success"
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <module.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm leading-tight">{module.name}</h3>
                      {module.count !== null && <p className="text-2xl font-bold mt-1">{module.count}</p>}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
