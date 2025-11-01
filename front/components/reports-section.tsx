import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Plus, ArrowRight } from "lucide-react"
import axios from "axios"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RequestForm } from "./request-form"

// Tipado para informes
interface Report {
  id: number;
  titulo: string;
  fecha: string;
  descripcion: string;
  estado: string;
}

export default function ReportsSection() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ titulo: "", fecha: "", descripcion: "", estado: "" })

  useEffect(() => {
    if (!token) router.push("/login")
    // Cargar informes
    axios.get("http://localhost:8000/api/reports", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setReports(res.data.data || []))
  }, [token])

  // Crear informe
  const handleCreate = async (data: any) => {
    setLoading(true)
    setError("")
    try {
      await axios.post("http://localhost:8000/api/reports", data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err) {
      setError("Error al crear el informe")
    }
    setLoading(false)
  }

  // Editar informe
  const handleEdit = (id: number, report: Report) => {
    setEditId(id)
    setEditForm({
      titulo: report.titulo || "",
      fecha: report.fecha || "",
      descripcion: report.descripcion || "",
      estado: report.estado || ""
    })
  }
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    setLoading(true)
    setError("")
    try {
      await axios.put(`http://localhost:8000/api/reports/${editId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err) {
      setError("Error al editar el informe")
    }
    setLoading(false)
  }

  // Eliminar informe
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este informe?")) return
    try {
      await axios.delete(`http://localhost:8000/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err) {
      alert("Error al eliminar el informe")
    }
  }

  return (
    <section id="reports">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Informes</h2>
          <p className="text-sm text-muted-foreground mt-1">Administra informes y reportes técnicos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Informe
        </Button>
      </div>

      {/* Formulario de creación */}
      <RequestForm
        title="Crear Informe"
        fields={[
          { name: "titulo", label: "Título", type: "text", required: true },
          { name: "fecha", label: "Fecha", type: "date", required: true },
          { name: "descripcion", label: "Descripción", type: "textarea", required: true },
          { name: "estado", label: "Estado", type: "text", required: true },
        ]}
        onSubmit={handleCreate}
      />
      {error && <div className="text-red-500 mt-2">{error}</div>}

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Mis Informes</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <h4 className="font-medium text-md">{report.titulo}</h4>
                <p className="text-sm text-muted-foreground">{new Date(report.fecha).toLocaleDateString("es-ES")}</p>
                <p className="text-base mt-2">{report.descripcion}</p>
                <p className="text-base mt-2">Estado: {report.estado}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handleEdit(report.id, report)} className="flex-1">Editar</Button>
                  <Button onClick={() => handleDelete(report.id)} variant="destructive" className="flex-1">Eliminar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Formulario de edición */}
      {editId && (
        <form onSubmit={handleEditSubmit} className="space-y-2 p-4 border rounded mb-4">
          <input name="titulo" value={editForm.titulo} onChange={e => setEditForm({ ...editForm, titulo: e.target.value })} placeholder="Título" />
          <input name="fecha" type="date" value={editForm.fecha} onChange={e => setEditForm({ ...editForm, fecha: e.target.value })} placeholder="Fecha" />
          <textarea name="descripcion" value={editForm.descripcion} onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })} placeholder="Descripción" />
          <input name="estado" value={editForm.estado} onChange={e => setEditForm({ ...editForm, estado: e.target.value })} placeholder="Estado" />
          <button type="submit" disabled={loading}>Guardar Cambios</button>
          <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      )}
    </section>
  )
}
