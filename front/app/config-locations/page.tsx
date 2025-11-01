
import { useLocations } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"
import { RequestForm } from "@/components/request-form"
import axios from "axios"
import { useState } from "react"

interface Location {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
}

export default function ConfigLocationsPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const locations: Location[] = useLocations(token)
  const [showForm, setShowForm] = useState(false)
  const [editLocation, setEditLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string>("")

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "nombre", label: "Nombre", sortable: true },
    { key: "direccion", label: "Dirección", sortable: true },
    { key: "ciudad", label: "Ciudad", sortable: true },
    { key: "telefono", label: "Teléfono", sortable: true },
    { key: "email", label: "Email", sortable: true },
  ]

  const fields: {
    name: keyof Location;
    label: string;
    type: "text";
    required?: boolean;
  }[] = [
    { name: "nombre", label: "Nombre", type: "text", required: true },
    { name: "direccion", label: "Dirección", type: "text" },
    { name: "ciudad", label: "Ciudad", type: "text" },
    { name: "telefono", label: "Teléfono", type: "text" },
    { name: "email", label: "Email", type: "text" },
  ]

  const handleCreate = () => {
    setEditLocation(null)
    setShowForm(true)
  }

  const handleEdit = (row: Location) => {
    setEditLocation(row)
    setShowForm(true)
  }

  const handleDelete = async (row: Location) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta sede?")) return
    try {
      await axios.delete(`http://localhost:8000/api/locations/${row.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err) {
      setError("Error al eliminar la sede")
    }
  }

  const handleSubmit = async (data: Partial<Location>) => {
    setError("")
    try {
      if (editLocation) {
        await axios.put(`http://localhost:8000/api/locations/${editLocation.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post(`http://localhost:8000/api/locations`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowForm(false)
      window.location.reload()
    } catch (err) {
      setError("Error al guardar la sede")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sedes</h2>
        <button className="btn btn-primary" onClick={handleCreate}>Nueva Sede</button>
      </div>
      <DataTable
        title="Listado de Sedes"
        columns={columns}
        data={locations}
        totalRecords={locations.length}
        onEdit={handleEdit}
        onView={handleEdit}
        onRowClick={handleEdit}
      />
      {showForm && (
        <RequestForm
          title={editLocation ? "Editar Sede" : "Nueva Sede"}
          fields={fields}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  )
}
