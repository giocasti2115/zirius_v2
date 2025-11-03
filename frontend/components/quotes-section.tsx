import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle2, XCircle, Plus, ArrowRight } from "lucide-react"

const quotesModules = [
  {
    name: "Cotizaciones",
    icon: FileText,
    count: null,
    status: "default",
  },
  {
    name: "Pendientes",
    icon: Clock,
    count: 268,
    status: "warning",
  },
  {
    name: "Aprobadas",
    icon: CheckCircle2,
    count: null,
    status: "success",
  },
  {
    name: "Rechazadas",
    icon: XCircle,
    count: null,
    status: "destructive",
  },
]

export function QuotesSection() {
  return (
    <section id="quotes">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Cotizaciones</h2>
          <p className="text-sm text-muted-foreground mt-1">Administra cotizaciones y presupuestos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cotización
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quotesModules.map((module) => (
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
