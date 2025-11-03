import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Clock, CheckCircle2, Send, XCircle, FileText, Plus, ArrowRight } from "lucide-react"

const warehouseModules = [
  {
    name: "Solicitudes Bodega",
    icon: Package,
    count: null,
    status: "default",
    href: "#",
  },
  {
    name: "Pendientes",
    icon: Clock,
    count: 197,
    status: "warning",
    href: "#",
  },
  {
    name: "Aprobadas",
    icon: CheckCircle2,
    count: 45,
    status: "info",
    href: "#",
  },
  {
    name: "Despachadas",
    icon: Send,
    count: 7,
    status: "success",
    href: "#",
  },
  {
    name: "Terminadas",
    icon: CheckCircle2,
    count: null,
    status: "success",
    href: "#",
  },
  {
    name: "Rechazadas",
    icon: XCircle,
    count: null,
    status: "destructive",
    href: "#",
  },
  {
    name: "Repuesto de Solicitudes",
    icon: FileText,
    count: null,
    status: "default",
    href: "#",
  },
  {
    name: "Items Adicionales",
    icon: Plus,
    count: null,
    status: "default",
    href: "#",
  },
]

export function WarehouseRequestsSection() {
  return (
    <section id="warehouse">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Solicitudes de Bodega</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestiona las solicitudes de materiales y equipos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {warehouseModules.map((module) => (
          <Card key={module.name} className="group hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      module.status === "warning"
                        ? "bg-warning/10 text-warning"
                        : module.status === "success"
                          ? "bg-success/10 text-success"
                          : module.status === "info"
                            ? "bg-info/10 text-info"
                            : module.status === "destructive"
                              ? "bg-destructive/10 text-destructive"
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
  )
}
