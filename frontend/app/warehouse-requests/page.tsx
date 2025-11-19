"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DataTable } from "@/components/data-table"

export default function WarehouseRequestsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Bodega</h1>
          <p className="text-gray-600 mt-2">
            Gestión completa de solicitudes de bodega y repuestos
          </p>
        </div>
        
        <DataTable
          title="Solicitudes de Bodega"
          type="warehouse"
          totalRecords={15678}
          onView={(row) => console.log("View warehouse request:", row)}
          onEdit={(row) => console.log("Edit warehouse request:", row)}
        />
      </div>
    </DashboardLayout>
  )
}
