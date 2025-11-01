"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Save, X } from "lucide-react"

interface RequestFormProps {
  title: string
  fields: {
    name: string
    label: string
    type: "text" | "textarea" | "select" | "date" | "number"
    options?: string[]
    required?: boolean
  }[]
  onSubmit?: (data: Record<string, any>) => void
  onCancel?: () => void
}

export function RequestForm({ title, fields = [], onSubmit, onCancel }: RequestFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">Complete el formulario con la información requerida</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.type === "text" && (
                <Input
                  id={field.name}
                  type="text"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  className="mt-1.5"
                />
              )}
              {field.type === "number" && (
                <Input
                  id={field.name}
                  type="number"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  className="mt-1.5"
                />
              )}
              {field.type === "date" && (
                <Input
                  id={field.name}
                  type="date"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  className="mt-1.5"
                />
              )}
              {field.type === "textarea" && (
                <Textarea
                  id={field.name}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  rows={4}
                  className="mt-1.5"
                />
              )}
              {field.type === "select" && (
                <Select value={formData[field.name]} onValueChange={(value) => handleChange(field.name, value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder={`Seleccionar ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button type="submit" className="min-w-32">
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
