import { useUsers } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"
import { useState } from "react"
import axios from "axios"
import { RequestForm } from "@/components/request-form"

export default function ConfigUsersPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const users = useUsers(token)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<any | null>(null)
  const [error, setError] = useState("")

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "role", label: "Rol", sortable: true },
    { key: "created_at", label: "Creado", sortable: true },
    { key: "updated_at", label: "Actualizado", sortable: true },
  ]

  const fields: {
    name: string;
    label: string;
    type: "text" | "textarea" | "select" | "date" | "number";
    options?: string[];
    required?: boolean;
  }[] = [
    { name: "name", label: "Nombre", type: "text", required: true },
    { name: "email", label: "Email", type: "text", required: true },
    { name: "role", label: "Rol", type: "text", required: true },
    { name: "password", label: "Contraseña", type: "text" },
  ];

  const handleCreate = () => {
    setEditUser(null)
    setShowForm(true)
  }

  const handleEdit = (row: any) => {
    setEditUser(row)
    setShowForm(true)
  }

  const handleDelete = async (row: any) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return
    try {
      await axios.delete(`http://localhost:8000/api/users/${row.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err) {
      setError("Error al eliminar el usuario")
    }
  }

  const handleSubmit = async (data: { [key: string]: any }) => {
    setError("")
    try {
      if (editUser) {
        await axios.put(`http://localhost:8000/api/users/${editUser.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post(`http://localhost:8000/api/users`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowForm(false)
      window.location.reload()
    } catch (err) {
      setError("Error al guardar el usuario")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Usuarios</h2>
        <button className="btn btn-primary" onClick={handleCreate}>Nuevo Usuario</button>
      </div>
      <DataTable
        title="Listado de Usuarios"
        columns={columns}
        data={users}
        totalRecords={users.length}
        onEdit={handleEdit}
        onView={handleEdit}
        onRowClick={handleEdit}
      />
      {showForm && (
        <RequestForm
          title={editUser ? "Editar Usuario" : "Nuevo Usuario"}
          fields={fields}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  )
}
