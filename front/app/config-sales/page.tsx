import { useSales } from "@/lib/api-hooks"
import { DataTable } from "@/components/data-table"

export default function ConfigSalesPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const sales = useSales(token)

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "created_at", label: "Creado", sortable: true },
  ]

  return (
    <DataTable
      title="Comerciales"
      columns={columns}
      data={sales}
      totalRecords={sales.length}
    />
  )
}
