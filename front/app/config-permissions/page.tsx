import { usePermissions } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"

export default function ConfigPermissionsPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const permissions = usePermissions(token)

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Permiso", sortable: true },
    { key: "description", label: "Descripción", sortable: true },
  ]

  return (
    <DataTable
      title="Permisos Especiales"
      columns={columns}
      data={permissions}
      totalRecords={permissions.length}
    />
  )
}
