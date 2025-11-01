
import { useEquipment } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"
import { RequestForm } from "@/components/request-form"
import axios from "axios"
import { useState } from "react"

interface Equipment {
  id: number;
  nombre: string;
  marca: string;
  modelo: string;
  serie: string;
  estado: string;
}

export default function ConfigEquipmentPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const equipment: Equipment[] = useEquipment(token)
  const [showForm, setShowForm] = useState(false)
  const [editEquipment, setEditEquipment] = useState<Equipment | null>(null)
  const [error, setError] = useState<string>("")

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "nombre", label: "Nombre", sortable: true },
    { key: "marca", label: "Marca", sortable: true },
    { key: "modelo", label: "Modelo", sortable: true },
    { key: "serie", label: "Serie", sortable: true },
    { key: "estado", label: "Estado", sortable: true },
  ]

  const fields: {
    name: keyof Equipment;
    label: string;
    type: "text";
    required?: boolean;
  }[] = [
    { name: "nombre", label: "Nombre", type: "text", required: true },
    { name: "marca", label: "Marca", type: "text" },
    { name: "modelo", label: "Modelo", type: "text" },
    { name: "serie", label: "Serie", type: "text" },
    { name: "estado", label: "Estado", type: "text" },
  ]

  const handleCreate = () => {
    setEditEquipment(null)
    setShowForm(true)
  }

  const handleEdit = (row: Equipment) => {
    setEditEquipment(row)
    setShowForm(true)
  }

  const handleDelete = async (row: Equipment) => {
    if (!window.confirm("¿Seguro que deseas eliminar este equipo?")) return
    try {
      await axios.delete(`http://localhost:8000/api/equipment/${row.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err) {
      setError("Error al eliminar el equipo")
    }
  }

  const handleSubmit = async (data: Partial<Equipment>) => {
    setError("")
    try {
      if (editEquipment) {
        await axios.put(`http://localhost:8000/api/equipment/${editEquipment.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post(`http://localhost:8000/api/equipment`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowForm(false)
      window.location.reload()
    } catch (err) {
      setError("Error al guardar el equipo")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Equipos</h2>
        <button className="btn btn-primary" onClick={handleCreate}>Nuevo Equipo</button>
      </div>
      <DataTable
        title="Listado de Equipos"
        columns={columns}
        data={equipment}
        totalRecords={equipment.length}
        onEdit={handleEdit}
        onView={handleEdit}
        onRowClick={handleEdit}
      />
      {showForm && (
        <RequestForm
          title={editEquipment ? "Editar Equipo" : "Nuevo Equipo"}
          fields={fields}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  )
}
