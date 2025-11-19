'use client'

import { useState, useEffect } from 'react'
import { sedeApi, Sede, CreateSedeData } from '@/lib/api/sedes'
import { clienteApi, Cliente } from '@/lib/api/clientes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Search, Edit, Trash2, MapPin, Building, Phone, Mail, User, ArrowLeft } from 'lucide-react'

interface SedesTableProps {
  onSedeSelect?: (sede: Sede) => void
}

export function SedesTable({ onSedeSelect }: SedesTableProps) {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateSedeData>({
    cliente_id: 0,
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    contacto_principal: '',
    ciudad: '',
    departamento: '',
    codigo_postal: ''
  })

  const resetForm = () => {
    setFormData({
      cliente_id: 0,
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      contacto_principal: '',
      ciudad: '',
      departamento: '',
      codigo_postal: ''
    })
  }

  const fetchClientes = async () => {
    try {
      setLoadingClientes(true)
      const response = await clienteApi.getAll({ limit: 100 }) // Get all clients for selector
      if (response.success && response.data) {
        setClientes(response.data.clientes)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoadingClientes(false)
    }
  }

  const fetchSedes = async () => {
    try {
      setLoading(true)
      const response = await sedeApi.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm
      })
      
      if (response.success && response.data) {
        setSedes(response.data.sedes)
        setTotalPages(response.data.pagination.totalPages)
      } else {
        toast.error('Error al cargar sedes')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Error fetching sedes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSedes()
  }, [currentPage, searchTerm])

  useEffect(() => {
    fetchClientes()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.cliente_id === 0) {
      toast.error('Debe seleccionar un cliente')
      return
    }

    try {
      const response = await sedeApi.create(formData)
      if (response.success) {
        toast.success('Sede creada exitosamente')
        setIsCreateDialogOpen(false)
        resetForm()
        fetchSedes()
      } else {
        toast.error(response.error?.message || 'Error al crear sede')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Error creating sede:', error)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSede) return

    if (formData.cliente_id === 0) {
      toast.error('Debe seleccionar un cliente')
      return
    }

    try {
      const response = await sedeApi.update(selectedSede.id, formData)
      if (response.success) {
        toast.success('Sede actualizada exitosamente')
        setIsEditDialogOpen(false)
        resetForm()
        setSelectedSede(null)
        fetchSedes()
      } else {
        toast.error(response.error?.message || 'Error al actualizar sede')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Error updating sede:', error)
    }
  }

  const handleDelete = async (sede: Sede) => {
    if (!confirm(`¿Estás seguro de eliminar la sede "${sede.nombre}"?`)) return

    try {
      const response = await sedeApi.delete(sede.id)
      if (response.success) {
        toast.success('Sede eliminada exitosamente')
        fetchSedes()
      } else {
        toast.error(response.error?.message || 'Error al eliminar sede')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Error deleting sede:', error)
    }
  }

  const openEditDialog = (sede: Sede) => {
    setSelectedSede(sede)
    setFormData({
      cliente_id: sede.cliente_id,
      nombre: sede.nombre,
      direccion: sede.direccion || '',
      telefono: sede.telefono || '',
      email: sede.email || '',
      contacto_principal: sede.contacto_principal || '',
      ciudad: sede.ciudad || '',
      departamento: sede.departamento || '',
      codigo_postal: sede.codigo_postal || ''
    })
    setIsEditDialogOpen(true)
  }

  const getClienteName = (clienteId: number) => {
    const cliente = clientes.find(c => c.id === clienteId)
    return cliente?.nombre || `Cliente #${clienteId}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Sedes</h1>
          <p className="text-muted-foreground">
            Administra las sedes de tus clientes
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Sede
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nueva Sede</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Select 
                  value={formData.cliente_id.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, cliente_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingClientes ? (
                      <SelectItem value="0" disabled>Cargando clientes...</SelectItem>
                    ) : (
                      clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nombre}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la Sede *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto_principal">Contacto Principal</Label>
                  <Input
                    id="contacto_principal"
                    value={formData.contacto_principal}
                    onChange={(e) => setFormData({ ...formData, contacto_principal: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input
                    id="departamento"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo_postal">Código Postal</Label>
                  <Input
                    id="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Sede</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar sedes..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Lista de Sedes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sede</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sedes.map((sede) => (
                    <TableRow 
                      key={sede.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSedeSelect?.(sede)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{sede.nombre}</div>
                          {sede.direccion && (
                            <div className="text-sm text-muted-foreground">{sede.direccion}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {getClienteName(sede.cliente_id)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {sede.ciudad && sede.departamento && (
                            <div className="text-sm">{sede.ciudad}, {sede.departamento}</div>
                          )}
                          {sede.codigo_postal && (
                            <div className="text-xs text-muted-foreground">CP: {sede.codigo_postal}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {sede.contacto_principal && (
                            <div className="flex items-center gap-1 text-sm">
                              <User className="h-3 w-3" />
                              {sede.contacto_principal}
                            </div>
                          )}
                          {sede.telefono && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {sede.telefono}
                            </div>
                          )}
                          {sede.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {sede.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sede.activo ? 'default' : 'secondary'}>
                          {sede.activo ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditDialog(sede)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(sede)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {sedes.length === 0 && !loading && (
                <div className="text-center py-10">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay sedes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza creando una nueva sede.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Sede</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cliente">Cliente *</Label>
              <Select 
                value={formData.cliente_id.toString()} 
                onValueChange={(value) => setFormData({ ...formData, cliente_id: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {loadingClientes ? (
                    <SelectItem value="0" disabled>Cargando clientes...</SelectItem>
                  ) : (
                    clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nombre">Nombre de la Sede *</Label>
                <Input
                  id="edit-nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contacto_principal">Contacto Principal</Label>
                <Input
                  id="edit-contacto_principal"
                  value={formData.contacto_principal}
                  onChange={(e) => setFormData({ ...formData, contacto_principal: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-direccion">Dirección</Label>
              <Textarea
                id="edit-direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-telefono">Teléfono</Label>
                <Input
                  id="edit-telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ciudad">Ciudad</Label>
                <Input
                  id="edit-ciudad"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-departamento">Departamento</Label>
                <Input
                  id="edit-departamento"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-codigo_postal">Código Postal</Label>
                <Input
                  id="edit-codigo_postal"
                  value={formData.codigo_postal}
                  onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false)
                  resetForm()
                  setSelectedSede(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Actualizar Sede</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}