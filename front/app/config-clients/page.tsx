"use client"

import { useClients } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"
import { RequestForm } from "@/components/request-form"
import axios from "axios"
import { useState } from "react"

export default function ConfigClientsPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const clients = useClients(token)
  const [showForm, setShowForm] = useState(false)
  const [editClient, setEditClient] = useState(null)
  const [error, setError] = useState("")

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "nombre", label: "Nombre", sortable: true },
    { key: "nit", label: "NIT", sortable: true },
    { key: "direccion", label: "Dirección", sortable: true },
    { key: "telefono", label: "Teléfono", sortable: true },
    { key: "email", label: "Email", sortable: true },
  ]

  const fields = [
    { name: "nombre", label: "Nombre", type: "text", required: true },
    { name: "nit", label: "NIT", type: "text", required: true },
    { name: "direccion", label: "Dirección", type: "text" },
    { name: "telefono", label: "Teléfono", type: "text" },
    { name: "email", label: "Email", type: "text" },
  ]

  const handleCreate = () => {
    setEditClient(null)
    setShowForm(true)
  }

  const handleEdit = (row) => {
    setEditClient(row)
    setShowForm(true)
  }

  const handleDelete = async (row) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return
    try {
      await axios.delete(`http://localhost:8000/api/clients/${row.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      window.location.reload()
    } catch (err) {
      setError("Error al eliminar el cliente")
    }
  }

  const handleSubmit = async (data) => {
    setError("")
    try {
      if (editClient) {
        await axios.put(`http://localhost:8000/api/clients/${editClient.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        await axios.post(`http://localhost:8000/api/clients`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      setShowForm(false)
      window.location.reload()
    } catch (err) {
      setError("Error al guardar el cliente")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Clientes</h2>
        <button className="btn btn-primary" onClick={handleCreate}>Nuevo Cliente</button>
      </div>
      <DataTable
        title="Listado de Clientes"
        columns={columns}
        data={clients}
        totalRecords={clients.length}
        onEdit={handleEdit}
        onView={handleEdit}
        onRowClick={handleEdit}
      />
      {showForm && (
        <RequestForm
          title={editClient ? "Editar Cliente" : "Nuevo Cliente"}
          fields={fields}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  )
}
