import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  MapPin,
  Monitor,
  Users,
  UserCheck,
  Wrench,
  UserCog,
  Briefcase,
  Key,
  Shield,
  Package,
  Layers,
  Tag,
  Grid3x3,
  FileText,
  AlertTriangle,
  Settings,
  ArrowRight,
} from "lucide-react"

const userManagementModules = [
  { name: "Clientes", icon: Building2, count: null },
  { name: "Sedes", icon: MapPin, count: null },
  { name: "Equipos", icon: Monitor, count: null },
  { name: "Usuarios", icon: Users, count: null },
  { name: "Analistas", icon: UserCheck, count: null },
  { name: "Técnicos", icon: Wrench, count: null },
  { name: "Coordinadores", icon: UserCog, count: null },
  { name: "Comerciales", icon: Briefcase, count: null },
  { name: "Administradores", icon: Shield, count: null },
  { name: "Permisos Especiales", icon: Key, count: null },
  { name: "Usuarios vs Clientes", icon: Users, count: null },
  { name: "Usuarios vs Sedes", icon: Users, count: null },
]

const equipmentModules = [
  { name: "Repuestos", icon: Package, count: null },
  { name: "Clases de Equipos", icon: Layers, count: null },
  { name: "Marcas de Equipos", icon: Tag, count: null },
  { name: "Modelos de Equipos", icon: Grid3x3, count: null },
  { name: "Áreas de Equipos", icon: MapPin, count: null },
  { name: "Tipos de Equipos", icon: Monitor, count: null },
]

const maintenanceModules = [
  { name: "Subestados de Orden", icon: FileText, count: null },
  { name: "Sistemas de Falla", icon: AlertTriangle, count: null },
  { name: "Modos de Falla", icon: AlertTriangle, count: null },
  { name: "Causas de Falla", icon: AlertTriangle, count: null },
  { name: "Acciones de Falla", icon: Settings, count: null },
  { name: "Sesiones", icon: Users, count: null },
  { name: "Campos", icon: FileText, count: null },
  { name: "Preventivos", icon: Shield, count: null },
]

export function GeneralConfigSection() {
  return (
    <section id="config">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Configuración General</h2>
        <p className="text-sm text-muted-foreground mt-1">Administra usuarios, equipos y configuraciones del sistema</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Usuarios y Accesos</TabsTrigger>
          <TabsTrigger value="equipment">Equipos y Repuestos</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {userManagementModules.map((module) => (
              <Card key={module.name} className="group hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <module.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm leading-tight">{module.name}</h3>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {equipmentModules.map((module) => (
              <Card key={module.name} className="group hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <module.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm leading-tight">{module.name}</h3>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {maintenanceModules.map((module) => (
              <Card key={module.name} className="group hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <module.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm leading-tight">{module.name}</h3>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
