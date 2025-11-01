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
import { useServiceOrders } from "@/lib/api-hooks"
import axios from "axios"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"

// Tipado para órdenes de servicio
interface ServiceOrder {
  id: number;
  descripcion: string;
  fecha: string;
  estado: string;
}

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

export default function ServiceRequestsSection() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push("/login")
    }
  }, [token, router])

  const orders: ServiceOrder[] = useServiceOrders(token) as ServiceOrder[]
  const [form, setForm] = useState({ descripcion: "", fecha: "", estado: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await axios.post("http://localhost:8000/api/service-orders", form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      window.location.reload()
    } catch (err) {
      setError("Error al crear la orden de servicio")
    }
    setLoading(false)
  }

  // Editar orden
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ descripcion: "", fecha: "", estado: "" });
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEdit = (id: number, order: ServiceOrder) => {
    setEditId(id);
    setEditForm({
      descripcion: order.descripcion || "",
      fecha: order.fecha || "",
      estado: order.estado || ""
    });
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    setError("");
    try {
      await axios.put(`http://localhost:8000/api/service-orders/${editId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload();
    } catch (err) {
      setError("Error al editar la orden");
    }
    setLoading(false);
  };

  // Eliminar orden
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta orden?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/service-orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload();
    } catch (err) {
      alert("Error al eliminar la orden");
    }
  };

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

      <section id="service-orders">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Crear Orden de Servicio</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Completa el siguiente formulario para crear una nueva orden de servicio
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-w-lg mx-auto mt-8 bg-white p-6 rounded shadow"
        >
          <input
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            className="w-full p-3 border rounded"
          />
          <input
            name="fecha"
            type="date"
            value={form.fecha}
            onChange={handleChange}
            placeholder="Fecha"
            className="w-full p-3 border rounded"
          />
          <input
            name="estado"
            value={form.estado}
            onChange={handleChange}
            placeholder="Estado"
            className="w-full p-3 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-primary text-white rounded hover:bg-primary/90 transition-all"
          >
            {loading ? "Guardando..." : "Guardar Orden"}
          </button>
          {error && <div className="text-red-500">{error}</div>}
        </form>

        <h2 className="text-2xl font-semibold mb-4">Órdenes de Servicio</h2>
        <ul>
          {orders.map((order) => (
            <li key={order.id} className="mb-2 p-2 border rounded">
              <div>
                <strong>{order.descripcion}</strong> - {order.fecha} - {order.estado}
              </div>
              <button onClick={() => handleEdit(order.id, order)} className="mr-2">Editar</button>
              <button onClick={() => handleDelete(order.id)} className="text-red-500">Eliminar</button>
            </li>
          ))}
        </ul>
        {editId && (
          <form onSubmit={handleEditSubmit} className="space-y-2 p-4 border rounded mb-4">
            <input name="descripcion" value={editForm.descripcion} onChange={handleEditChange} placeholder="Descripción" />
            <input name="fecha" type="date" value={editForm.fecha} onChange={handleEditChange} placeholder="Fecha" />
            <input name="estado" value={editForm.estado} onChange={handleEditChange} placeholder="Estado" />
            <button type="submit" disabled={loading}>Guardar Cambios</button>
            <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
            {error && <div className="text-red-500">{error}</div>}
          </form>
        )}
      </section>
    </div>
  )
}
