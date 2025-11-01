import { useCoordinators } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"

export default function ConfigCoordinatorsPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const coordinators = useCoordinators(token)

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "created_at", label: "Creado", sortable: true },
  ]

  return (
    <DataTable
      title="Coordinadores"
      columns={columns}
      data={coordinators}
      totalRecords={coordinators.length}
    />
  )
}
