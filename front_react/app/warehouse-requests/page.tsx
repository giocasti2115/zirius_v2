"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DataTable } from "@/components/data-table"

const columns = [
  { key: "id", label: "Id", sortable: true },
  { key: "aviso", label: "Aviso", sortable: true },
  { key: "servicio", label: "Servicio", sortable: true },
  { key: "creacion", label: "Creación", sortable: true },
  { key: "equipo", label: "Equipo", sortable: true },
  { key: "idEquipo", label: "Id Equipo", sortable: true },
  { key: "estado", label: "Estado", sortable: true },
  { key: "sede", label: "Sede", sortable: true },
  { key: "serie", label: "Serie", sortable: true },
]

const sampleData = [
  {
    id: "342629",
    aviso: "10556679",
    servicio: "Correctivo",
    creacion: "2025-10-03 16:19:58",
    equipo: "Unidad portátil",
    idEquipo: "68640",
    estado: "Aprobada",
    sede: "IPS ODONTOLOGIA DOMICILIARIA CENTRO",
    serie: "ZYC00362",
  },
  {
    id: "342628",
    aviso: "10556663",
    servicio: "Correctivo",
    creacion: "2025-10-03 16:03:49",
    equipo: "Pulsoxímetro",
    idEquipo: "59783",
    estado: "Aprobada",
    sede: "AY DX SALUD SURA CHIPICHAPE IMAGENES",
    serie: "21070705618",
  },
  {
    id: "342627",
    aviso: "10556621",
    servicio: "Correctivo",
    creacion: "2025-10-03 16:02:36",
    equipo: "Glucómetro",
    idEquipo: "72514",
    estado: "Aprobada",
    sede: "AYUDAS DIAGNOSTICAS SURA VIVIR NORTE",
    serie: "96801615555",
  },
  {
    id: "342626",
    aviso: "10556622",
    servicio: "Correctivo",
    creacion: "2025-10-03 16:00:38",
    equipo: "Glucómetro",
    idEquipo: "73814",
    estado: "Aprobada",
    sede: "AYUDAS DIAGNOSTICAS SURA VIVIR NORTE",
    serie: "97217260374",
  },
  {
    id: "342625",
    aviso: "10551012",
    servicio: "Informe",
    creacion: "2025-10-03 15:54:27",
    equipo: "Unidad odontologica",
    idEquipo: "17440",
    estado: "Aprobada",
    sede: "IPS Salud Sura Chipichape",
    serie: "0873896005",
  },
]

export default function WarehouseRequestsPage() {
  return (
    <DashboardLayout>
      <DataTable
        title="Solicitudes"
        columns={columns}
        data={sampleData}
        totalRecords={312541}
        onView={(row) => console.log("View", row)}
        onEdit={(row) => console.log("Edit", row)}
      />
    </DashboardLayout>
  )
}
