import { useAdmins } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"

export default function ConfigAdminsPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const admins = useAdmins(token)

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "created_at", label: "Creado", sortable: true },
  ]

  return (
    <DataTable
      title="Administradores"
      columns={columns}
      data={admins}
      totalRecords={admins.length}
    />
  )
}
