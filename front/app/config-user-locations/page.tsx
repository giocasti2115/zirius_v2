import { useUserLocations } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"

export default function ConfigUserLocationsPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const userLocations = useUserLocations(token)

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "user_id", label: "Usuario", sortable: true },
    { key: "location_id", label: "Sede", sortable: true },
  ]

  return (
    <DataTable
      title="Usuarios vs Sedes"
      columns={columns}
      data={userLocations}
      totalRecords={userLocations.length}
    />
  )
}
