"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Plus, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ConfigFormProps {
  title: string
  type?: string
  description?: string
  sections?: {
    id: string
    label: string
    fields: {
      name: string
      label: string
      type: "text" | "email" | "tel" | "number" | "textarea" | "select"
      required?: boolean
      placeholder?: string
      options?: string[]
    }[]
  }[]
  onSubmit?: (data: Record<string, any>) => void
}

function getConfigSections(type: string) {
  const configSections: Record<string, any> = {
    "config-clients": [
      {
        id: "general",
        label: "Información General",
        fields: [
          {
            name: "name",
            label: "Nombre del Cliente",
            type: "text",
            required: true,
            placeholder: "Ej: Hospital Central",
          },
          { name: "nit", label: "NIT", type: "text", required: true, placeholder: "Ej: 900123456-7" },
          { name: "address", label: "Dirección", type: "text", required: true, placeholder: "Calle 123 #45-67" },
          { name: "city", label: "Ciudad", type: "text", required: true, placeholder: "Ej: Bogotá" },
          { name: "phone", label: "Teléfono", type: "tel", required: true, placeholder: "Ej: 3001234567" },
          { name: "email", label: "Email", type: "email", required: true, placeholder: "contacto@cliente.com" },
          { name: "contact", label: "Persona de Contacto", type: "text", placeholder: "Nombre del contacto" },
          { name: "status", label: "Estado", type: "select", required: true, options: ["Activo", "Inactivo"] },
        ],
      },
    ],
    "config-locations": [
      {
        id: "general",
        label: "Información de Sede",
        fields: [
          {
            name: "client",
            label: "Cliente",
            type: "select",
            required: true,
            options: ["Hospital Central", "Clínica Norte", "Centro Médico Sur"],
          },
          { name: "name", label: "Nombre de la Sede", type: "text", required: true, placeholder: "Ej: Sede Principal" },
          { name: "code", label: "Código", type: "text", required: true, placeholder: "Ej: SED-001" },
          { name: "address", label: "Dirección", type: "text", required: true, placeholder: "Calle 123 #45-67" },
          { name: "city", label: "Ciudad", type: "text", required: true, placeholder: "Ej: Medellín" },
          { name: "phone", label: "Teléfono", type: "tel", placeholder: "Ej: 3001234567" },
          { name: "responsible", label: "Responsable", type: "text", placeholder: "Nombre del responsable" },
          { name: "status", label: "Estado", type: "select", required: true, options: ["Activo", "Inactivo"] },
        ],
      },
    ],
    "config-equipment": [
      {
        id: "general",
        label: "Información del Equipo",
        fields: [
          {
            name: "name",
            label: "Nombre del Equipo",
            type: "text",
            required: true,
            placeholder: "Ej: Monitor de Signos Vitales",
          },
          {
            name: "brand",
            label: "Marca",
            type: "select",
            required: true,
            options: ["Philips", "GE Healthcare", "Siemens", "Mindray"],
          },
          { name: "model", label: "Modelo", type: "text", required: true, placeholder: "Ej: IntelliVue MX40" },
          { name: "serial", label: "Número de Serie", type: "text", required: true, placeholder: "Ej: SN123456789" },
          {
            name: "class",
            label: "Clase",
            type: "select",
            required: true,
            options: ["Clase I", "Clase IIA", "Clase IIB", "Clase III"],
          },
          {
            name: "area",
            label: "Área",
            type: "select",
            required: true,
            options: ["UCI", "Urgencias", "Quirófano", "Hospitalización"],
          },
          { name: "location", label: "Ubicación", type: "text", placeholder: "Ej: Piso 3, Sala 301" },
          {
            name: "status",
            label: "Estado",
            type: "select",
            required: true,
            options: ["Operativo", "En Mantenimiento", "Fuera de Servicio"],
          },
        ],
      },
    ],
    "config-users": [
      {
        id: "personal",
        label: "Información Personal",
        fields: [
          { name: "firstName", label: "Nombres", type: "text", required: true, placeholder: "Ej: Juan Carlos" },
          { name: "lastName", label: "Apellidos", type: "text", required: true, placeholder: "Ej: Pérez García" },
          {
            name: "idNumber",
            label: "Número de Identificación",
            type: "text",
            required: true,
            placeholder: "Ej: 1234567890",
          },
          { name: "email", label: "Email", type: "email", required: true, placeholder: "usuario@empresa.com" },
          { name: "phone", label: "Teléfono", type: "tel", placeholder: "Ej: 3001234567" },
        ],
      },
      {
        id: "access",
        label: "Información de Acceso",
        fields: [
          { name: "username", label: "Usuario", type: "text", required: true, placeholder: "Nombre de usuario" },
          {
            name: "role",
            label: "Rol",
            type: "select",
            required: true,
            options: ["Administrador", "Técnico", "Analista", "Coordinador", "Comercial"],
          },
          { name: "status", label: "Estado", type: "select", required: true, options: ["Activo", "Inactivo"] },
        ],
      },
    ],
    "config-analysts": [
      {
        id: "general",
        label: "Información del Analista",
        fields: [
          { name: "firstName", label: "Nombres", type: "text", required: true, placeholder: "Ej: María" },
          { name: "lastName", label: "Apellidos", type: "text", required: true, placeholder: "Ej: González" },
          { name: "idNumber", label: "Cédula", type: "text", required: true, placeholder: "Ej: 1234567890" },
          { name: "email", label: "Email", type: "email", required: true, placeholder: "analista@empresa.com" },
          { name: "phone", label: "Teléfono", type: "tel", placeholder: "Ej: 3001234567" },
          { name: "specialty", label: "Especialidad", type: "text", placeholder: "Ej: Equipos Biomédicos" },
          { name: "status", label: "Estado", type: "select", required: true, options: ["Activo", "Inactivo"] },
        ],
      },
    ],
    "config-technicians": [
      {
        id: "general",
        label: "Información del Técnico",
        fields: [
          { name: "firstName", label: "Nombres", type: "text", required: true, placeholder: "Ej: Carlos" },
          { name: "lastName", label: "Apellidos", type: "text", required: true, placeholder: "Ej: Rodríguez" },
          { name: "idNumber", label: "Cédula", type: "text", required: true, placeholder: "Ej: 1234567890" },
          { name: "email", label: "Email", type: "email", required: true, placeholder: "tecnico@empresa.com" },
          { name: "phone", label: "Teléfono", type: "tel", required: true, placeholder: "Ej: 3001234567" },
          { name: "specialty", label: "Especialidad", type: "text", placeholder: "Ej: Mantenimiento Preventivo" },
          { name: "zone", label: "Zona de Cobertura", type: "text", placeholder: "Ej: Zona Norte" },
          {
            name: "status",
            label: "Estado",
            type: "select",
            required: true,
            options: ["Activo", "Inactivo", "En Vacaciones"],
          },
        ],
      },
    ],
    "config-spare-parts": [
      {
        id: "general",
        label: "Información del Repuesto",
        fields: [
          {
            name: "name",
            label: "Nombre del Repuesto",
            type: "text",
            required: true,
            placeholder: "Ej: Batería Recargable",
          },
          { name: "code", label: "Código", type: "text", required: true, placeholder: "Ej: REP-001" },
          { name: "brand", label: "Marca", type: "text", placeholder: "Ej: Philips" },
          { name: "model", label: "Modelo Compatible", type: "text", placeholder: "Ej: IntelliVue MX40" },
          { name: "quantity", label: "Cantidad en Stock", type: "number", required: true, placeholder: "0" },
          { name: "minQuantity", label: "Cantidad Mínima", type: "number", placeholder: "5" },
          { name: "price", label: "Precio Unitario", type: "number", placeholder: "0.00" },
          {
            name: "status",
            label: "Estado",
            type: "select",
            required: true,
            options: ["Disponible", "Agotado", "En Pedido"],
          },
        ],
      },
    ],
    "config-equipment-classes": [
      {
        id: "general",
        label: "Clase de Equipo",
        fields: [
          { name: "name", label: "Nombre de la Clase", type: "text", required: true, placeholder: "Ej: Clase IIA" },
          { name: "code", label: "Código", type: "text", required: true, placeholder: "Ej: CL-IIA" },
          {
            name: "description",
            label: "Descripción",
            type: "textarea",
            placeholder: "Descripción de la clase de equipo",
          },
          {
            name: "riskLevel",
            label: "Nivel de Riesgo",
            type: "select",
            required: true,
            options: ["Bajo", "Moderado", "Alto", "Muy Alto"],
          },
        ],
      },
    ],
    "config-equipment-brands": [
      {
        id: "general",
        label: "Marca de Equipo",
        fields: [
          { name: "name", label: "Nombre de la Marca", type: "text", required: true, placeholder: "Ej: Philips" },
          { name: "country", label: "País de Origen", type: "text", placeholder: "Ej: Países Bajos" },
          { name: "website", label: "Sitio Web", type: "text", placeholder: "https://www.philips.com" },
          { name: "contact", label: "Contacto", type: "text", placeholder: "Nombre del representante" },
          { name: "phone", label: "Teléfono", type: "tel", placeholder: "Ej: 3001234567" },
          { name: "email", label: "Email", type: "email", placeholder: "contacto@marca.com" },
        ],
      },
    ],
  }

  return (
    configSections[type] || [
      {
        id: "general",
        label: "Configuración General",
        fields: [
          { name: "name", label: "Nombre", type: "text", required: true, placeholder: "Ingrese el nombre" },
          { name: "description", label: "Descripción", type: "textarea", placeholder: "Ingrese una descripción" },
          { name: "status", label: "Estado", type: "select", required: true, options: ["Activo", "Inactivo"] },
        ],
      },
    ]
  )
}

export function ConfigForm({ title, type, description, sections: propSections, onSubmit }: ConfigFormProps) {
  const sections = propSections || (type ? getConfigSections(type) : [])
  const [formData, setFormData] = useState<Record<string, any>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Form submitted:", formData)
    onSubmit?.(formData)
  }

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <Card className="p-6">
          <p className="text-muted-foreground">No hay configuración disponible para este módulo.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>

      {sections.length === 1 ? (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {sections[0].fields.map((field) => (
                <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="mt-1.5"
                      rows={3}
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={formData[field.name] || ""}
                      onValueChange={(value) => handleChange(field.name, value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder={field.placeholder || "Seleccione una opción"} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="mt-1.5"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
              <Button type="button" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Nuevo
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Tabs defaultValue={sections[0].id} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${sections.length}, 1fr)` }}>
            {sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id}>
                {section.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {section.fields.map((field) => (
                      <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                        <Label htmlFor={field.name} className="text-sm font-medium">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {field.type === "textarea" ? (
                          <Textarea
                            id={field.name}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            required={field.required}
                            placeholder={field.placeholder}
                            className="mt-1.5"
                            rows={3}
                          />
                        ) : field.type === "select" ? (
                          <Select
                            value={formData[field.name] || ""}
                            onValueChange={(value) => handleChange(field.name, value)}
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder={field.placeholder || "Seleccione una opción"} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={field.name}
                            type={field.type}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            required={field.required}
                            placeholder={field.placeholder}
                            className="mt-1.5"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                    <Button type="button" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                    <Button type="button" variant="outline" className="ml-auto bg-transparent">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
