import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, CheckCircle2, XCircle, Plus, ArrowRight } from "lucide-react"
import axios from "axios"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RequestForm } from "./request-form"

// Tipado para visitas
interface Visit {
  id: number;
  cliente: string;
  fecha: string;
  motivo: string;
  estado: string;
}

export default function VisitsSection() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const router = useRouter()
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ cliente: "", fecha: "", motivo: "", estado: "" })

  useEffect(() => {
    if (!token) router.push("/login")
    // Cargar visitas
    axios.get("http://localhost:8000/api/visits", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setVisits(res.data.data || []))
  }, [token])

  // Crear visita
  const handleCreate = async (data: any) => {
    setLoading(true)
    setError("")
    try {
      await axios.post("http://localhost:8000/api/visits", data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err) {
      setError("Error al crear la visita")
    }
    setLoading(false)
  }

  // Editar visita
  const handleEdit = (id: number, visit: Visit) => {
    setEditId(id)
    setEditForm({
      cliente: visit.cliente || "",
      fecha: visit.fecha || "",
      motivo: visit.motivo || "",
      estado: visit.estado || ""
    })
  }
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    setLoading(true)
    setError("")
    try {
      await axios.put(`http://localhost:8000/api/visits/${editId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err) {
      setError("Error al editar la visita")
    }
    setLoading(false)
  }

  // Eliminar visita
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta visita?")) return
    try {
      await axios.delete(`http://localhost:8000/api/visits/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err) {
      alert("Error al eliminar la visita")
    }
  }

  return (
    <section id="visits">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Visitas</h2>
          <p className="text-sm text-muted-foreground mt-1">Administra visitas técnicas y comerciales</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Visita
        </Button>
      </div>

      {/* Formulario de creación */}
      <RequestForm
        title="Crear Visita"
        fields={[
          { name: "cliente", label: "Cliente", type: "text", required: true },
          { name: "fecha", label: "Fecha", type: "date", required: true },
          { name: "motivo", label: "Motivo", type: "text", required: true },
          { name: "estado", label: "Estado", type: "text", required: true },
        ]}
        onSubmit={handleCreate}
      />
      {error && <div className="text-red-500 mt-2">{error}</div>}

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Mis Visitas</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visits.map((visit) => (
            <Card key={visit.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h4 className="font-medium text-md">{visit.cliente}</h4>
                <p className="text-sm text-muted-foreground">{new Date(visit.fecha).toLocaleDateString("es-ES")}</p>
                <p className="text-base mt-2">Motivo: {visit.motivo}</p>
                <p className="text-base mt-2">Estado: {visit.estado}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleEdit(visit.id, visit)} className="flex-1">Editar</Button>
                  <Button onClick={() => handleDelete(visit.id)} variant="destructive" className="flex-1">Eliminar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Formulario de edición */}
      {editId && (
        <form onSubmit={handleEditSubmit} className="space-y-2 p-4 border rounded mb-4">
          <input name="cliente" value={editForm.cliente} onChange={e => setEditForm({ ...editForm, cliente: e.target.value })} placeholder="Cliente" />
          <input name="fecha" type="date" value={editForm.fecha} onChange={e => setEditForm({ ...editForm, fecha: e.target.value })} placeholder="Fecha" />
          <input name="motivo" value={editForm.motivo} onChange={e => setEditForm({ ...editForm, motivo: e.target.value })} placeholder="Motivo" />
          <input name="estado" value={editForm.estado} onChange={e => setEditForm({ ...editForm, estado: e.target.value })} placeholder="Estado" />
          <button type="submit" disabled={loading}>Guardar Cambios</button>
          <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      )}
    </section>
  )
}
