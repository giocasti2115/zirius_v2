"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Plus, Edit2, Eye, Trash2, AlertTriangle, CheckCircle, Clock, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Repuesto {
  id: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  subcategoria: string;
  unidadMedida: string;
  stockMinimo: number;
  stockMaximo: number;
  stockActual: number;
  ubicacion: string;
  proveedor: string;
  valorUnitario: number;
  estado: 'activo' | 'inactivo' | 'descontinuado';
  criticidad: 'alta' | 'media' | 'baja';
  fechaUltimaCompra?: string;
  fechaUltimoMovimiento?: string;
  observaciones?: string;
  especificacionesTecnicas?: string;
  equiposCompatibles: string[];
}

const RepuestosBodega = () => {
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [filteredRepuestos, setFilteredRepuestos] = useState<Repuesto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [filterEstado, setFilterEstado] = useState<string>('todas');
  const [filterCriticidad, setFilterCriticidad] = useState<string>('todas');
  const [filterStock, setFilterStock] = useState<string>('todas');
  const [selectedRepuesto, setSelectedRepuesto] = useState<Repuesto | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Repuesto>>({});
  const { toast } = useToast();

  // Datos de ejemplo
  const repuestosEjemplo: Repuesto[] = [
    {
      id: 1,
      codigo: "REP-001",
      descripcion: "Rodamiento SKF 6205",
      categoria: "Rodamientos",
      subcategoria: "Rígidos de bolas",
      unidadMedida: "UND",
      stockMinimo: 5,
      stockMaximo: 25,
      stockActual: 3,
      ubicacion: "A-01-15",
      proveedor: "SKF Colombia",
      valorUnitario: 85000,
      estado: "activo",
      criticidad: "alta",
      fechaUltimaCompra: "2024-10-15",
      fechaUltimoMovimiento: "2024-11-10",
      observaciones: "Stock crítico - solicitar reposición",
      especificacionesTecnicas: "Diámetro interior: 25mm, Diámetro exterior: 52mm, Ancho: 15mm",
      equiposCompatibles: ["Bomba centrífuga #1", "Motor ventilador #3", "Compresor principal"]
    },
    {
      id: 2,
      codigo: "REP-002",
      descripcion: "Correa V tipo A-50",
      categoria: "Transmisión",
      subcategoria: "Correas",
      unidadMedida: "UND",
      stockMinimo: 10,
      stockMaximo: 50,
      stockActual: 35,
      ubicacion: "B-02-08",
      proveedor: "Gates Industrial",
      valorUnitario: 45000,
      estado: "activo",
      criticidad: "media",
      fechaUltimaCompra: "2024-11-01",
      fechaUltimoMovimiento: "2024-11-12",
      especificacionesTecnicas: "Tipo A, Longitud: 50 pulgadas",
      equiposCompatibles: ["Transportador #2", "Ventilador extractor"]
    },
    {
      id: 3,
      codigo: "REP-003",
      descripcion: "Filtro de aceite hidráulico",
      categoria: "Filtros",
      subcategoria: "Hidráulicos",
      unidadMedida: "UND",
      stockMinimo: 8,
      stockMaximo: 30,
      stockActual: 12,
      ubicacion: "C-03-22",
      proveedor: "Parker Hannifin",
      valorUnitario: 120000,
      estado: "activo",
      criticidad: "alta",
      fechaUltimaCompra: "2024-10-28",
      fechaUltimoMovimiento: "2024-11-08",
      especificacionesTecnicas: "10 micrones, Compatible con ISO 32/46",
      equiposCompatibles: ["Prensa hidráulica", "Elevador de carga", "Sistema hidráulico principal"]
    },
    {
      id: 4,
      codigo: "REP-004",
      descripción: "Sensor de temperatura PT100",
      categoria: "Instrumentación",
      subcategoria: "Sensores",
      unidadMedida: "UND",
      stockMinimo: 3,
      stockMaximo: 15,
      stockActual: 8,
      ubicacion: "D-01-05",
      proveedor: "Siemens",
      valorUnitario: 250000,
      estado: "activo",
      criticidad: "media",
      fechaUltimaCompra: "2024-09-20",
      fechaUltimoMovimiento: "2024-10-25",
      especificacionesTecnicas: "Rango: -50°C a +400°C, Clase A",
      equiposCompatibles: ["Horno industrial", "Caldero", "Sistema de control de temperatura"]
    },
    {
      id: 5,
      codigo: "REP-005",
      descripcion: "Válvula solenoide 24VDC",
      categoria: "Válvulas",
      subcategoria: "Solenoides",
      unidadMedida: "UND",
      stockMinimo: 2,
      stockMaximo: 10,
      stockActual: 1,
      ubicacion: "E-02-12",
      proveedor: "ASCO Numatics",
      valorUnitario: 380000,
      estado: "activo",
      criticidad: "alta",
      fechaUltimaCompra: "2024-08-15",
      fechaUltimoMovimiento: "2024-11-01",
      observaciones: "Stock crítico - equipo parado sin este repuesto",
      especificacionesTecnicas: "1/2 pulgada, Presión máx: 150 PSI",
      equiposCompatibles: ["Sistema neumático #1", "Línea de proceso A"]
    }
  ];

  useEffect(() => {
    setRepuestos(repuestosEjemplo);
    setFilteredRepuestos(repuestosEjemplo);
  }, []);

  useEffect(() => {
    let filtered = repuestos.filter(repuesto => {
      const matchesSearch = repuesto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repuesto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repuesto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repuesto.proveedor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategoria = filterCategoria === 'todas' || repuesto.categoria === filterCategoria;
      const matchesEstado = filterEstado === 'todas' || repuesto.estado === filterEstado;
      const matchesCriticidad = filterCriticidad === 'todas' || repuesto.criticidad === filterCriticidad;
      
      let matchesStock = true;
      if (filterStock !== 'todas') {
        switch (filterStock) {
          case 'critico':
            matchesStock = repuesto.stockActual <= repuesto.stockMinimo;
            break;
          case 'bajo':
            matchesStock = repuesto.stockActual > repuesto.stockMinimo && repuesto.stockActual <= (repuesto.stockMinimo + repuesto.stockMaximo) / 2;
            break;
          case 'normal':
            matchesStock = repuesto.stockActual > (repuesto.stockMinimo + repuesto.stockMaximo) / 2;
            break;
        }
      }
      
      return matchesSearch && matchesCategoria && matchesEstado && matchesCriticidad && matchesStock;
    });

    setFilteredRepuestos(filtered);
  }, [searchTerm, filterCategoria, filterEstado, filterCriticidad, filterStock, repuestos]);

  const getStockStatus = (repuesto: Repuesto) => {
    if (repuesto.stockActual <= repuesto.stockMinimo) {
      return { status: 'Crítico', variant: 'destructive', icon: <AlertTriangle className="w-4 h-4" /> };
    } else if (repuesto.stockActual <= (repuesto.stockMinimo + repuesto.stockMaximo) / 2) {
      return { status: 'Bajo', variant: 'secondary', icon: <Clock className="w-4 h-4" /> };
    } else {
      return { status: 'Normal', variant: 'default', icon: <CheckCircle className="w-4 h-4" /> };
    }
  };

  const getCriticidadBadge = (criticidad: string) => {
    const variants: Record<string, string> = {
      alta: "destructive",
      media: "default",
      baja: "secondary"
    };
    return variants[criticidad] || "default";
  };

  const abrirFormulario = (repuesto?: Repuesto) => {
    if (repuesto) {
      setIsEditing(true);
      setSelectedRepuesto(repuesto);
      setFormData(repuesto);
    } else {
      setIsEditing(false);
      setSelectedRepuesto(null);
      setFormData({
        codigo: '',
        descripcion: '',
        categoria: '',
        subcategoria: '',
        unidadMedida: 'UND',
        stockMinimo: 0,
        stockMaximo: 0,
        stockActual: 0,
        ubicacion: '',
        proveedor: '',
        valorUnitario: 0,
        estado: 'activo',
        criticidad: 'media',
        equiposCompatibles: []
      });
    }
    setFormDialogOpen(true);
  };

  const guardarRepuesto = () => {
    if (isEditing && selectedRepuesto) {
      setRepuestos(prev => prev.map(r => r.id === selectedRepuesto.id ? { ...formData, id: selectedRepuesto.id } as Repuesto : r));
      toast({
        title: "Repuesto actualizado",
        description: `El repuesto ${formData.codigo} ha sido actualizado exitosamente.`,
      });
    } else {
      const nuevoRepuesto: Repuesto = {
        ...formData,
        id: Date.now(),
        fechaUltimoMovimiento: new Date().toISOString().split('T')[0],
        equiposCompatibles: formData.equiposCompatibles || []
      } as Repuesto;
      
      setRepuestos(prev => [...prev, nuevoRepuesto]);
      toast({
        title: "Repuesto creado",
        description: `El repuesto ${formData.codigo} ha sido creado exitosamente.`,
      });
    }
    
    setFormDialogOpen(false);
    setFormData({});
  };

  const eliminarRepuesto = (repuesto: Repuesto) => {
    setSelectedRepuesto(repuesto);
    setDeleteDialogOpen(true);
  };

  const confirmarEliminacion = () => {
    if (selectedRepuesto) {
      setRepuestos(prev => prev.filter(r => r.id !== selectedRepuesto.id));
      toast({
        title: "Repuesto eliminado",
        description: `El repuesto ${selectedRepuesto.codigo} ha sido eliminado.`,
      });
      setDeleteDialogOpen(false);
      setSelectedRepuesto(null);
    }
  };

  const verDetalle = (repuesto: Repuesto) => {
    setSelectedRepuesto(repuesto);
    setDetalleDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const categorias = Array.from(new Set(repuestos.map(r => r.categoria)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Catálogo de Repuestos</h1>
          <p className="text-muted-foreground">
            Gestión completa del inventario de repuestos de bodega
          </p>
        </div>
        <Button onClick={() => abrirFormulario()}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Repuesto
        </Button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Repuestos</p>
                <p className="text-2xl font-bold">{repuestos.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Crítico</p>
                <p className="text-2xl font-bold text-red-600">
                  {repuestos.filter(r => r.stockActual <= r.stockMinimo).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Criticidad Alta</p>
                <p className="text-2xl font-bold">
                  {repuestos.filter(r => r.criticidad === 'alta').length}
                </p>
              </div>
              <Settings className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(repuestos.reduce((acc, r) => acc + (r.valorUnitario * r.stockActual), 0))}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar repuestos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
                <SelectItem value="descontinuado">Descontinuado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCriticidad} onValueChange={setFilterCriticidad}>
              <SelectTrigger>
                <SelectValue placeholder="Criticidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStock} onValueChange={setFilterStock}>
              <SelectTrigger>
                <SelectValue placeholder="Nivel Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los niveles</SelectItem>
                <SelectItem value="critico">Crítico</SelectItem>
                <SelectItem value="bajo">Bajo</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterCategoria('todas');
                setFilterEstado('todas');
                setFilterCriticidad('todas');
                setFilterStock('todas');
              }}
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de repuestos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Repuestos</CardTitle>
          <CardDescription>
            Inventario completo con información de stock y criticidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Criticidad</TableHead>
                <TableHead>Valor Unit.</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepuestos.map((repuesto) => {
                const stockStatus = getStockStatus(repuesto);
                return (
                  <TableRow key={repuesto.id}>
                    <TableCell className="font-medium">{repuesto.codigo}</TableCell>
                    <TableCell>{repuesto.descripcion}</TableCell>
                    <TableCell>{repuesto.categoria}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{repuesto.stockActual}</span>
                        <Badge variant={stockStatus.variant as any}>
                          {stockStatus.icon}
                          <span className="ml-1">{stockStatus.status}</span>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{repuesto.ubicacion}</TableCell>
                    <TableCell>
                      <Badge variant={getCriticidadBadge(repuesto.criticidad) as any}>
                        {repuesto.criticidad.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(repuesto.valorUnitario)}</TableCell>
                    <TableCell>
                      <Badge variant={repuesto.estado === 'activo' ? 'default' : 'secondary'}>
                        {repuesto.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verDetalle(repuesto)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirFormulario(repuesto)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarRepuesto(repuesto)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredRepuestos.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron repuestos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de formulario */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Repuesto' : 'Nuevo Repuesto'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Modifique la información del repuesto' : 'Complete la información del nuevo repuesto'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  value={formData.categoria || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="subcategoria">Subcategoría</Label>
                <Input
                  id="subcategoria"
                  value={formData.subcategoria || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategoria: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input
                  id="proveedor"
                  value={formData.proveedor || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, proveedor: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stockMinimo">Stock Mínimo</Label>
                  <Input
                    id="stockMinimo"
                    type="number"
                    value={formData.stockMinimo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockMinimo: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="stockMaximo">Stock Máximo</Label>
                  <Input
                    id="stockMaximo"
                    type="number"
                    value={formData.stockMaximo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockMaximo: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stockActual">Stock Actual</Label>
                  <Input
                    id="stockActual"
                    type="number"
                    value={formData.stockActual || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockActual: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="valorUnitario">Valor Unitario</Label>
                  <Input
                    id="valorUnitario"
                    type="number"
                    value={formData.valorUnitario || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, valorUnitario: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  id="ubicacion"
                  value={formData.ubicacion || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="criticidad">Criticidad</Label>
                  <Select value={formData.criticidad} onValueChange={(value) => setFormData(prev => ({ ...prev, criticidad: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                      <SelectItem value="descontinuado">Descontinuado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="especificaciones">Especificaciones Técnicas</Label>
              <Textarea
                id="especificaciones"
                value={formData.especificacionesTecnicas || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, especificacionesTecnicas: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarRepuesto}>
              {isEditing ? 'Actualizar' : 'Crear'} Repuesto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de detalle */}
      <Dialog open={detalleDialogOpen} onOpenChange={setDetalleDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalle del Repuesto</DialogTitle>
            <DialogDescription>
              Información completa del repuesto {selectedRepuesto?.codigo}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRepuesto && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Código:</span>
                      <span>{selectedRepuesto.codigo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Descripción:</span>
                      <span>{selectedRepuesto.descripcion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Categoría:</span>
                      <span>{selectedRepuesto.categoria}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Proveedor:</span>
                      <span>{selectedRepuesto.proveedor}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Stock e Inventario</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Stock Actual:</span>
                      <Badge variant={getStockStatus(selectedRepuesto).variant as any}>
                        {selectedRepuesto.stockActual} {selectedRepuesto.unidadMedida}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Stock Mínimo:</span>
                      <span>{selectedRepuesto.stockMinimo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Stock Máximo:</span>
                      <span>{selectedRepuesto.stockMaximo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ubicación:</span>
                      <span>{selectedRepuesto.ubicacion}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedRepuesto.especificacionesTecnicas && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Especificaciones Técnicas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedRepuesto.especificacionesTecnicas}</p>
                  </CardContent>
                </Card>
              )}

              {selectedRepuesto.equiposCompatibles && selectedRepuesto.equiposCompatibles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Equipos Compatibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedRepuesto.equiposCompatibles.map((equipo, index) => (
                        <Badge key={index} variant="outline">{equipo}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Repuesto</DialogTitle>
            <DialogDescription>
              ¿Está seguro de eliminar el repuesto {selectedRepuesto?.codigo}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarEliminacion}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RepuestosBodega;