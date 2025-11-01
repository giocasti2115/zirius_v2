import { useUserClients } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"

export default function ConfigUserClientsPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const userClients = useUserClients(token)

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "user_id", label: "Usuario", sortable: true },
    { key: "client_id", label: "Cliente", sortable: true },
  ]

  return (
    <DataTable
      title="Usuarios vs Clientes"
      columns={columns}
      data={userClients}
      totalRecords={userClients.length}
    />
  )
}
