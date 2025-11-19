"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Pencil,
  X,
  Download,
  Columns3,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Column {
  key: string
  label: string
  sortable?: boolean
}

interface DataTableProps {
  title: string
  type?: string
  columns?: Column[]
  data?: any[]
  totalRecords?: number
  onRowClick?: (row: any) => void
  onEdit?: (row: any) => void
  onView?: (row: any) => void
}

// Helper function to generate columns based on type
const getColumnsForType = (type: string): Column[] => {
  const commonColumns = [
    { key: "id", label: "Id", sortable: true },
    { key: "aviso", label: "Aviso", sortable: true },
  ]

  switch (type) {
    case "warehouse":
    case "decommission":
      return [
        ...commonColumns,
        { key: "servicio", label: "Servicio", sortable: true },
        { key: "creacion", label: "Creación", sortable: true },
        { key: "equipo", label: "Equipo", sortable: true },
        { key: "idEquipo", label: "Id Equipo", sortable: true },
        { key: "estado", label: "Estado", sortable: true },
        { key: "sede", label: "Sede", sortable: true },
        { key: "serie", label: "Serie", sortable: true },
      ]
    case "quotes":
      return [
        ...commonColumns,
        { key: "cliente", label: "Cliente", sortable: true },
        { key: "fecha", label: "Fecha", sortable: true },
        { key: "monto", label: "Monto", sortable: true },
        { key: "estado", label: "Estado", sortable: true },
        { key: "validez", label: "Validez", sortable: true },
      ]
    case "service":
      return [
        ...commonColumns,
        { key: "tipo", label: "Tipo", sortable: true },
        { key: "fecha", label: "Fecha", sortable: true },
        { key: "equipo", label: "Equipo", sortable: true },
        { key: "sede", label: "Sede", sortable: true },
        { key: "estado", label: "Estado", sortable: true },
        { key: "tecnico", label: "Técnico", sortable: true },
      ]
    case "orders":
      return [
        ...commonColumns,
        { key: "orden", label: "Orden", sortable: true },
        { key: "fecha", label: "Fecha", sortable: true },
        { key: "equipo", label: "Equipo", sortable: true },
        { key: "estado", label: "Estado", sortable: true },
        { key: "tecnico", label: "Técnico", sortable: true },
        { key: "prioridad", label: "Prioridad", sortable: true },
      ]
    case "visits":
      return [
        ...commonColumns,
        { key: "fecha", label: "Fecha", sortable: true },
        { key: "sede", label: "Sede", sortable: true },
        { key: "tecnico", label: "Técnico", sortable: true },
        { key: "estado", label: "Estado", sortable: true },
        { key: "duracion", label: "Duración", sortable: true },
      ]
    case "reports":
      return [
        { key: "equipo", label: "Equipo", sortable: true },
        { key: "modelo", label: "Modelo", sortable: true },
        { key: "sede", label: "Sede", sortable: true },
        { key: "correctivos", label: "Correctivos", sortable: true },
        { key: "promedio", label: "Promedio", sortable: true },
        { key: "total", label: "Total", sortable: true },
      ]
    default:
      return commonColumns
  }
}

// Helper function to generate mock data based on type
const getMockDataForType = (type: string, count = 15): any[] => {
  const estados = ["Aprobada", "Pendiente", "Rechazada"]
  const servicios = ["Correctivo", "Preventivo", "Instalación", "Informe"]
  const equipos = [
    "Unidad portátil",
    "Pulsoxímetro",
    "Glucómetro",
    "Monitor de signos vitales",
    "Bascula",
    "DISPENSADOR",
  ]
  const sedes = [
    "IPS ODONTOLOGIA DOMICILIARIA CENTRO",
    "AY DX SALUD SURA CHIPICHAPE IMAGENES",
    "AYUDAS DIAGNOSTICAS SURA VIVIR NORTE",
    "IPS Salud Sura Chipichape",
    "IPS Altos del Prado",
    "LAS AMÉRICAS",
  ]

  return Array.from({ length: count }, (_, i) => {
    const baseData = {
      id: 342629 - i,
      aviso: 10556679 - i * 16,
    }

    switch (type) {
      case "warehouse":
      case "decommission":
        return {
          ...baseData,
          servicio: servicios[Math.floor(Math.random() * servicios.length)],
          creacion: `2025-10-03 ${String(16 - Math.floor(i / 4)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
          equipo: equipos[Math.floor(Math.random() * equipos.length)],
          idEquipo: 68640 + i * 100,
          estado: estados[Math.floor(Math.random() * estados.length)],
          sede: sedes[Math.floor(Math.random() * sedes.length)],
          serie: `ZYC00362-${i}`,
        }
      case "quotes":
        return {
          ...baseData,
          cliente: sedes[Math.floor(Math.random() * sedes.length)],
          fecha: `2025-10-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
          monto: `$${(Math.random() * 10000000).toFixed(2)}`,
          estado: estados[Math.floor(Math.random() * estados.length)],
          validez: "30 días",
        }
      case "service":
        return {
          ...baseData,
          tipo: servicios[Math.floor(Math.random() * servicios.length)],
          fecha: `2025-10-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
          equipo: equipos[Math.floor(Math.random() * equipos.length)],
          sede: sedes[Math.floor(Math.random() * sedes.length)],
          estado: estados[Math.floor(Math.random() * estados.length)],
          tecnico: `Técnico ${i + 1}`,
        }
      case "orders":
        return {
          ...baseData,
          orden: `ORD-${baseData.id}`,
          fecha: `2025-10-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
          equipo: equipos[Math.floor(Math.random() * equipos.length)],
          estado: estados[Math.floor(Math.random() * estados.length)],
          tecnico: `Técnico ${i + 1}`,
          prioridad: ["Alta", "Media", "Baja"][Math.floor(Math.random() * 3)],
        }
      case "visits":
        return {
          ...baseData,
          fecha: `2025-10-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
          sede: sedes[Math.floor(Math.random() * sedes.length)],
          tecnico: `Técnico ${i + 1}`,
          estado: estados[Math.floor(Math.random() * estados.length)],
          duracion: `${Math.floor(Math.random() * 4) + 1}h`,
        }
      case "reports":
        return {
          equipo: equipos[Math.floor(Math.random() * equipos.length)],
          modelo: `Modelo ${i + 1}`,
          sede: sedes[Math.floor(Math.random() * sedes.length)],
          correctivos: Math.floor(Math.random() * 50),
          promedio: `${(Math.random() * 10).toFixed(1)}h`,
          total: `$${(Math.random() * 1000000).toFixed(2)}`,
        }
      default:
        return baseData
    }
  })
}

export function DataTable({
  title,
  type = "warehouse",
  columns: providedColumns,
  data: providedData,
  totalRecords: providedTotalRecords,
  onRowClick,
  onEdit,
  onView,
}: DataTableProps) {
  const columns = providedColumns || getColumnsForType(type)
  const mockData = providedData || getMockDataForType(type, 15)
  const totalRecords = providedTotalRecords || 312541

  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const totalPages = Math.ceil(totalRecords / rowsPerPage)

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilter = (key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(key)
      setSortDirection("asc")
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            XLS
          </Button>
          <Button variant="outline" size="sm">
            <Columns3 className="h-4 w-4 mr-2" />
            Columnas
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Pagination Controls */}
        <div className="flex items-center justify-between gap-4 p-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Página</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="h-8 w-16 text-center"
                min={1}
                max={totalPages}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground">Filas</span>
            <Input
              type="number"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="h-8 w-16 text-center"
              min={5}
              max={100}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {/* Safe check for totalRecords before calling toLocaleString */}
            Página {currentPage} de {totalPages} | {totalRecords?.toLocaleString() || 0} registros
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-12 p-2"></th>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "p-2 text-left text-sm font-semibold text-foreground",
                      column.sortable && "cursor-pointer hover:bg-muted/70",
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {sortColumn === column.key && (
                        <span className="text-xs">{sortDirection === "asc" ? "▲" : "▼"}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
              {/* Filter Row */}
              <tr className="border-b border-border bg-muted/30">
                <td className="p-2"></td>
                {columns.map((column) => (
                  <td key={`filter-${column.key}`} className="p-2">
                    <div className="relative">
                      <Input
                        placeholder="Filtrar..."
                        value={filters[column.key] || ""}
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                        className="h-8 pr-8 text-sm"
                      />
                      {filters[column.key] && (
                        <button
                          onClick={() => clearFilter(column.key)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={cn(
                    "border-b border-border hover:bg-muted/50 transition-colors cursor-pointer",
                    index % 2 === 0 ? "bg-background" : "bg-muted/20",
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            onView(row)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(row)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                  {columns.map((column) => (
                    <td key={`${row.id}-${column.key}`} className="p-2 text-sm">
                      {column.key === "estado" ? (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            row[column.key] === "Aprobada" && "bg-success/10 text-success",
                            row[column.key] === "Pendiente" && "bg-warning/10 text-warning",
                            row[column.key] === "Rechazada" && "bg-destructive/10 text-destructive",
                          )}
                        >
                          {row[column.key]}
                        </span>
                      ) : (
                        row[column.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
