"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { RequestForm } from "@/components/request-form"

const requestFields = [
  {
    name: "cliente",
    label: "Cliente",
    type: "select" as const,
    options: ["IPS Salud Sura", "AY DX Salud Sura", "Ayudas Diagnósticas"],
    required: true,
  },
  {
    name: "sede",
    label: "Sede",
    type: "select" as const,
    options: ["Centro", "Chipichape", "Norte", "Sur"],
    required: true,
  },
  {
    name: "equipo",
    label: "Equipo",
    type: "select" as const,
    options: ["Glucómetro", "Pulsoxímetro", "Monitor de signos vitales", "Unidad portátil"],
    required: true,
  },
  { name: "idEquipo", label: "ID Equipo", type: "text" as const, required: true },
  { name: "serie", label: "Serie", type: "text" as const, required: true },
  {
    name: "tipoServicio",
    label: "Tipo de Servicio",
    type: "select" as const,
    options: ["Correctivo", "Preventivo", "Instalación", "Informe"],
    required: true,
  },
  {
    name: "prioridad",
    label: "Prioridad",
    type: "select" as const,
    options: ["Alta", "Media", "Baja"],
    required: true,
  },
  { name: "fechaSolicitud", label: "Fecha de Solicitud", type: "date" as const, required: true },
  { name: "descripcion", label: "Descripción del Problema", type: "textarea" as const, required: true },
  { name: "observaciones", label: "Observaciones", type: "textarea" as const },
]

export default function NewRequestPage() {
  return (
    <DashboardLayout>
      <RequestForm
        title="Nueva Solicitud de Servicio"
        fields={requestFields}
        onSubmit={(data) => console.log("Form submitted:", data)}
        onCancel={() => window.history.back()}
      />
    </DashboardLayout>
  )
}
