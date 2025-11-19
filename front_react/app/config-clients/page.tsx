"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ConfigForm } from "@/components/config-form"

const configSections = [
  {
    id: "general",
    label: "Información General",
    fields: [
      { name: "nombre", label: "Nombre del Cliente", type: "text" as const, required: true },
      { name: "nit", label: "NIT", type: "text" as const, required: true },
      { name: "telefono", label: "Teléfono", type: "tel" as const, required: true },
      { name: "email", label: "Email", type: "email" as const, required: true },
      { name: "direccion", label: "Dirección", type: "text" as const, required: true },
      { name: "ciudad", label: "Ciudad", type: "text" as const, required: true },
    ],
  },
  {
    id: "contacto",
    label: "Contacto Principal",
    fields: [
      { name: "nombreContacto", label: "Nombre Completo", type: "text" as const, required: true },
      { name: "cargoContacto", label: "Cargo", type: "text" as const, required: true },
      { name: "telefonoContacto", label: "Teléfono", type: "tel" as const, required: true },
      { name: "emailContacto", label: "Email", type: "email" as const, required: true },
    ],
  },
]

export default function ConfigClientsPage() {
  return (
    <DashboardLayout>
      <ConfigForm
        title="Configuración de Clientes"
        description="Gestione la información de los clientes del sistema"
        sections={configSections}
        onSubmit={(data) => console.log("Config saved:", data)}
      />
    </DashboardLayout>
  )
}
