"use client"

import { useState, useMemo } from "react"
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
import { WarehouseRequestModal, type SolicitudBodega } from "@/components/modals/WarehouseRequestModal"
import { DecommissionModal, type SolicitudDesbaja } from "@/components/modals/DecommissionModal"

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
      return [
        ...commonColumns,
        { key: "cliente", label: "Cliente", sortable: true },
        { key: "ordenRelacionada", label: "Orden Relacionada", sortable: true },
        { key: "estado", label: "Estado", sortable: true },
        { key: "creador", label: "Creador", sortable: true },
        { key: "servicio", label: "Servicio", sortable: true },
        { key: "creacion", label: "Creación", sortable: true },
        { key: "equipo", label: "Equipo", sortable: true },
        { key: "idEquipo", label: "Id Equipo", sortable: true },
        { key: "sede", label: "Sede", sortable: true },
        { key: "serie", label: "Serie", sortable: true },
      ]
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
        { key: "motivo", label: "Motivo", sortable: true },
        { key: "tecnico", label: "Técnico", sortable: true },
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
      ]
    case "orders":
      return [
        ...commonColumns,
        { key: "tipo", label: "Tipo", sortable: true },
        { key: "fecha", label: "Fecha", sortable: true },
        { key: "equipo", label: "Equipo", sortable: true },
        { key: "sede", label: "Sede", sortable: true },
        { key: "tecnico", label: "Técnico", sortable: true },
        { key: "estado", label: "Estado", sortable: true },
      ]
    case "visits":
      return [
        ...commonColumns,
        { key: "fecha", label: "Fecha", sortable: true },
        { key: "tipo", label: "Tipo", sortable: true },
        { key: "sede", label: "Sede", sortable: true },
        { key: "tecnico", label: "Técnico", sortable: true },
        { key: "estado", label: "Estado", sortable: true },
      ]
    case "reports":
      return [
        ...commonColumns,
        { key: "equipo", label: "Equipo", sortable: true },
        { key: "fecha", label: "Fecha", sortable: true },
        { key: "tipo", label: "Tipo", sortable: true },
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

// Helper function to generate mock data based on type and filter
const getMockDataForType = (type: string, count = 15, filterStatus?: string): any[] => {
  const estados = ["Aprobada", "Pendiente", "Rechazada", "Despachada", "Terminada"]
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

  // Generate full dataset first
  const fullData = Array.from({ length: count * 3 }, (_, i) => {
    const baseData = {
      id: 342629 - i,
      aviso: 10556679 - i * 16,
    }

    switch (type) {
      case "warehouse":
        const estado = estados[Math.floor(Math.random() * estados.length)]
        return {
          ...baseData,
          cliente: sedes[Math.floor(Math.random() * sedes.length)],
          ordenRelacionada: 338315 + i * 7,
          estado: estado,
          creador: `Daniel Felipe Duque Marin`,
          servicio: servicios[Math.floor(Math.random() * servicios.length)],
          creacion: `2025-10-03 ${String(16 - Math.floor(i / 4)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
          equipo: equipos[Math.floor(Math.random() * equipos.length)],
          idEquipo: 68640 + i * 100,
          sede: sedes[Math.floor(Math.random() * sedes.length)],
          serie: `ZYC00362-${i}`,
          cotizaciones: [`COT-${baseData.id + 1000}`, `COT-${baseData.id + 2000}`],
          repuestos: [
            {
              descripcion: "Cargador báscula TRUMAX BAXIC 01",
              cantidad: 1,
              valorUnitario: 0,
              sumaCliente: "NO"
            }
          ],
          itemsAdicionales: [
            {
              descripcion: "Cargador báscula TRUMAX BAXIC 01",
              cantidad: 1,
              valorUnitario: 0,
              sumaCliente: "NO"
            }
          ],
          cambios: [
            {
              fecha: "2025-10-31 14:41:14",
              accion: "Solicitud Creada",
              usuario: "Daniel Felipe Duque Marin"
            }
          ]
        }
      
      case "decommission":
        const estadoDesbaja = estados[Math.floor(Math.random() * estados.length)]
        const motivos = ["Obsolescencia", "Daño irreparable", "Cambio tecnológico", "Fin de vida útil"]
        const tecnicos = ["Carlos Rodríguez", "Ana García", "Miguel Torres", "Laura Martínez"]
        return {
          ...baseData,
          servicio: servicios[Math.floor(Math.random() * servicios.length)],
          creacion: `2025-10-03 ${String(16 - Math.floor(i / 4)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
          equipo: equipos[Math.floor(Math.random() * equipos.length)],
          idEquipo: 68640 + i * 100,
          estado: estadoDesbaja,
          sede: sedes[Math.floor(Math.random() * sedes.length)],
          serie: `ZYC00362-${i}`,
          motivo: motivos[Math.floor(Math.random() * motivos.length)],
          tecnico: tecnicos[Math.floor(Math.random() * tecnicos.length)],
          cliente: sedes[Math.floor(Math.random() * sedes.length)],
          justificacion: "El equipo presenta fallas recurrentes que superan el costo de mantenimiento",
          observaciones: "Se requiere coordinar con el cliente para la recolección del equipo",
          fechaSolicitud: `2025-10-03 ${String(16 - Math.floor(i / 4)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
          fechaAprobacion: estadoDesbaja === "Aprobada" ? `2025-10-04 ${String(16 - Math.floor(i / 4)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}` : undefined,
          documentos: [
            {
              nombre: "Informe técnico de evaluación",
              tipo: "PDF",
              url: "#"
            },
            {
              nombre: "Fotografías del equipo",
              tipo: "ZIP",
              url: "#"
            }
          ],
          cambios: [
            {
              fecha: "2025-10-03 14:41:14",
              accion: "Solicitud Creada",
              usuario: "Daniel Felipe Duque Marin",
              comentario: "Solicitud de desbaja por obsolescencia técnica"
            }
          ]
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
        }
      
      case "orders":
        return {
          ...baseData,
          tipo: servicios[Math.floor(Math.random() * servicios.length)],
          fecha: `2025-10-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
          equipo: equipos[Math.floor(Math.random() * equipos.length)],
          sede: sedes[Math.floor(Math.random() * sedes.length)],
          estado: estados[Math.floor(Math.random() * estados.length)],
          tecnico: "Carlos Rodríguez",
        }
      
      case "visits":
        return {
          ...baseData,
          fecha: `2025-10-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
          tipo: servicios[Math.floor(Math.random() * servicios.length)],
          sede: sedes[Math.floor(Math.random() * sedes.length)],
          tecnico: "Carlos Rodríguez",
          estado: estados[Math.floor(Math.random() * estados.length)],
        }
      
      case "reports":
        return {
          ...baseData,
          equipo: equipos[Math.floor(Math.random() * equipos.length)],
          fecha: `2025-10-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
          tipo: servicios[Math.floor(Math.random() * servicios.length)],
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

  // Filter data based on route/status
  let filteredData = fullData
  
  if (filterStatus) {
    const statusMap: Record<string, string> = {
      'pending': 'Pendiente',
      'approved': 'Aprobada', 
      'dispatched': 'Despachada',
      'finished': 'Terminada',
      'rejected': 'Rechazada'
    }
    
    const targetStatus = statusMap[filterStatus]
    if (targetStatus) {
      filteredData = fullData.filter((item: any) => item.estado === targetStatus)
    }
  }

  return filteredData.slice(0, count)
}

export function DataTable({
  title,
  type = "default",
  columns: providedColumns,
  data: providedData,
  totalRecords: providedTotalRecords,
  onRowClick,
  onEdit,
  onView
}: DataTableProps) {
  // Extract filter status from title or type
  const getFilterStatus = (title: string): string | undefined => {
    if (title.includes("Pendientes")) return "pending"
    if (title.includes("Aprobadas")) return "approved"
    if (title.includes("Despachadas")) return "dispatched"
    if (title.includes("Terminadas")) return "finished"
    if (title.includes("Rechazadas")) return "rejected"
    return undefined
  }

  const filterStatus = getFilterStatus(title)
  const mockData = providedData || getMockDataForType(type, 15, filterStatus)

  // Calculate dynamic total records based on filter
  const calculateTotalRecords = (): number => {
    if (providedTotalRecords) return providedTotalRecords
    
    // Mock data counts from useDynamicCounts hook
    const typeCounts: Record<string, Record<string, number>> = {
      warehouse: {
        total: 428,
        pending: 197,
        approved: 45,
        dispatched: 7,
        finished: 156,
        rejected: 23,
        'spare-parts': 34,
        additional: 12
      },
      decommission: {
        total: 852,
        pending: 718,
        approved: 89,
        rejected: 45
      },
      quotes: {
        total: 480,
        pending: 268,
        approved: 134,
        rejected: 78
      },
      service: {
        total: 1247,
        'pending-preventive': 234,
        'pending-cig': 156,
        approved: 445,
        rejected: 89
      },
      orders: {
        total: 4928,
        'open-preventive': 1858,
        'open-cig': 914,
        closed: 2156,
        changes: 67
      },
      visits: {
        total: 443,
        pending: 52,
        open: 104,
        closed: 287
      }
    }
    
    return typeCounts[type]?.[filterStatus || 'total'] || typeCounts[type]?.total || 100
  }

  const dynamicTotalRecords = calculateTotalRecords()
  const columns = providedColumns || getColumnsForType(type)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filters, setFilters] = useState<Record<string, string>>({})
  
  // Modal state for warehouse requests
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false)
  const [selectedWarehouseRequest, setSelectedWarehouseRequest] = useState<SolicitudBodega | null>(null)
  
  // Modal state for decommission requests
  const [isDecommissionModalOpen, setIsDecommissionModalOpen] = useState(false)
  const [selectedDecommissionRequest, setSelectedDecommissionRequest] = useState<SolicitudDesbaja | null>(null)

  // Filter the data based on current filters
  const filteredData = useMemo(() => {
    return mockData.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true
        const cellValue = String(row[key] || '').toLowerCase()
        return cellValue.includes(value.toLowerCase())
      })
    })
  }, [mockData, filters])

  // Sort the filtered data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortColumn, sortDirection])

  const totalPages = Math.ceil(dynamicTotalRecords / rowsPerPage)

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilter = (key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setFilters({})
    setCurrentPage(1)
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleRowClick = (row: any) => {
    if (type === "warehouse") {
      setSelectedWarehouseRequest(row)
      setIsWarehouseModalOpen(true)
    } else if (type === "decommission") {
      setSelectedDecommissionRequest(row)
      setIsDecommissionModalOpen(true)
    } else if (onRowClick) {
      onRowClick(row)
    }
  }

  const handleEditWarehouseRequest = (solicitud: SolicitudBodega) => {
    console.log('Editar solicitud bodega:', solicitud)
    setIsWarehouseModalOpen(false)
  }

  const handleApproveWarehouseRequest = (solicitud: SolicitudBodega) => {
    console.log('Aprobar solicitud bodega:', solicitud)
    setIsWarehouseModalOpen(false)
  }

  const handleRejectWarehouseRequest = (solicitud: SolicitudBodega) => {
    console.log('Rechazar solicitud bodega:', solicitud)
    setIsWarehouseModalOpen(false)
  }

  const handleEditDecommissionRequest = (solicitud: SolicitudDesbaja) => {
    console.log('Editar solicitud desbaja:', solicitud)
    setIsDecommissionModalOpen(false)
  }

  const handleApproveDecommissionRequest = (solicitud: SolicitudDesbaja) => {
    console.log('Aprobar solicitud desbaja:', solicitud)
    setIsDecommissionModalOpen(false)
  }

  const handleRejectDecommissionRequest = (solicitud: SolicitudDesbaja) => {
    console.log('Rechazar solicitud desbaja:', solicitud)
    setIsDecommissionModalOpen(false)
  }

  // Paginate the sorted data
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">
            Total: {dynamicTotalRecords.toLocaleString()} registros
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Columns3 className="h-4 w-4 mr-2" />
            Columnas
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.slice(0, 5).map((column) => (
          <div key={column.key}>
            <Input
              placeholder={`Filtrar por ${column.label}`}
              value={filters[column.key] || ""}
              onChange={(e) => handleFilterChange(column.key, e.target.value)}
              className="h-9"
            />
            {filters[column.key] && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter(column.key)}
                className="mt-1 h-6 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        ))}
      </div>

      {Object.keys(filters).length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filtros activos:</span>
          {Object.entries(filters).map(([key, value]) => (
            <div
              key={key}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
            >
              <span>{key}: {value}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter(key)}
                className="h-4 w-4 p-0 hover:bg-blue-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
            Limpiar todos
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                      column.sortable && "cursor-pointer hover:bg-gray-100"
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-blue-600">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm">
                      {column.key === "estado" ? (
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            row[column.key] === "Aprobada" && "bg-green-100 text-green-800",
                            row[column.key] === "Pendiente" && "bg-yellow-100 text-yellow-800",
                            row[column.key] === "Rechazada" && "bg-red-100 text-red-800",
                            row[column.key] === "Despachada" && "bg-blue-100 text-blue-800",
                            row[column.key] === "Terminada" && "bg-gray-100 text-gray-800"
                          )}
                        >
                          {row[column.key]}
                        </span>
                      ) : (
                        String(row[column.key] || "")
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowClick(row)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(row)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Filas por página:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * rowsPerPage) + 1} a{" "}
            {Math.min(currentPage * rowsPerPage, dynamicTotalRecords)} de{" "}
            {dynamicTotalRecords.toLocaleString()} registros
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Warehouse Modal */}
      <WarehouseRequestModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        solicitud={selectedWarehouseRequest}
        onEdit={handleEditWarehouseRequest}
        onApprove={handleApproveWarehouseRequest}
        onReject={handleRejectWarehouseRequest}
      />

      {/* Decommission Modal */}
      <DecommissionModal
        isOpen={isDecommissionModalOpen}
        onClose={() => setIsDecommissionModalOpen(false)}
        solicitud={selectedDecommissionRequest}
        onEdit={handleEditDecommissionRequest}
        onApprove={handleApproveDecommissionRequest}
        onReject={handleRejectDecommissionRequest}
      />
    </div>
  )
}