"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, XCircle, AlertTriangle, Eye, RefreshCw, MessageSquare, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface SolicitudRechazada {
  id: number;
  codigo: string;
  fechaSolicitud: string;
  fechaRechazo: string;
  solicitante: string;
  area: string;
  responsableRechazo: string;
  motivoRechazo: string;
  observacionesRechazo: string;
  totalItems: number;
  valorEstimado: number;
  estado: 'rechazada';
  puedeReaperturar: boolean;
  categoriaRechazo: 'presupuesto' | 'disponibilidad' | 'politicas' | 'documentacion' | 'tecnico' | 'otro';
  items: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
    unidad: string;
    valorUnitario: number;
    motivoRechazoItem?: string;
  }>;
}

const SolicitudesBodegaRechazadas = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudRechazada[]>([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<SolicitudRechazada[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('todas');
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [filterFecha, setFilterFecha] = useState<string>('todas');
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudRechazada | null>(null);
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false);
  const [reaperturaDialogOpen, setReaperturaDialogOpen] = useState(false);
  const [justificacionReapertura, setJustificacionReapertura] = useState('');
  const { toast } = useToast();

  // Datos de ejemplo
  const solicitudesEjemplo: SolicitudRechazada[] = [
    {
      id: 1,
      codigo: "SB-2024-003",
      fechaSolicitud: "2024-11-10",
      fechaRechazo: "2024-11-12",
      solicitante: "Juan Pérez",
      area: "Mantenimiento",
      responsableRechazo: "Ana López",
      motivoRechazo: "Presupuesto insuficiente para el período actual",
      observacionesRechazo: "El costo excede el presupuesto asignado al área para este mes. Se recomienda solicitar en el próximo período.",
      totalItems: 5,
      valorEstimado: 4500000,
      estado: "rechazada",
      puedeReaperturar: true,
      categoriaRechazo: "presupuesto",
      items: [
        { codigo: "REP-008", descripcion: "Motor reductor 5HP", cantidad: 1, unidad: "UND", valorUnitario: 3500000, motivoRechazoItem: "Costo muy alto" },
        { codigo: "REP-009", descripcion: "Acoplamiento flexible", cantidad: 2, unidad: "UND", valorUnitario: 250000 },
        { codigo: "ACC-003", descripcion: "Grasa industrial", cantidad: 2, unidad: "KG", valorUnitario: 125000 }
      ]
    },
    {
      id: 2,
      codigo: "SB-2024-007",
      fechaSolicitud: "2024-11-08",
      fechaRechazo: "2024-11-09",
      solicitante: "María García",
      area: "Operaciones",
      responsableRechazo: "Carlos Mendoza",
      motivoRechazo: "Items no disponibles en inventario",
      observacionesRechazo: "Los repuestos solicitados no están disponibles y el tiempo de importación es de 6 semanas.",
      totalItems: 8,
      valorEstimado: 2800000,
      estado: "rechazada",
      puedeReaperturar: false,
      categoriaRechazo: "disponibilidad",
      items: [
        { codigo: "REP-010", descripcion: "Sensor de proximidad", cantidad: 4, unidad: "UND", valorUnitario: 350000, motivoRechazoItem: "No disponible" },
        { codigo: "REP-011", descripcion: "PLC modular", cantidad: 1, unidad: "UND", valorUnitario: 1400000, motivoRechazoItem: "Descontinuado" },
        { codigo: "ACC-004", descripcion: "Cable de señal", cantidad: 50, unidad: "MTS", valorUnitario: 8000 }
      ]
    },
    {
      id: 3,
      codigo: "SB-2024-011",
      fechaSolicitud: "2024-11-05",
      fechaRechazo: "2024-11-06",
      solicitante: "Carlos Rodríguez",
      area: "Calidad",
      responsableRechazo: "Diego Martín",
      motivoRechazo: "Falta documentación técnica requerida",
      observacionesRechazo: "No se presentaron las especificaciones técnicas ni la justificación de necesidad del equipo solicitado.",
      totalItems: 3,
      valorEstimado: 1200000,
      estado: "rechazada",
      puedeReaperturar: true,
      categoriaRechazo: "documentacion",
      items: [
        { codigo: "INS-005", descripcion: "Medidor de dureza", cantidad: 1, unidad: "UND", valorUnitario: 800000, motivoRechazoItem: "Falta especificación" },
        { codigo: "INS-006", descripcion: "Kit de calibración", cantidad: 1, unidad: "SET", valorUnitario: 300000 },
        { codigo: "ACC-005", descripcion: "Estuche de transporte", cantidad: 1, unidad: "UND", valorUnitario: 100000 }
      ]
    },
    {
      id: 4,
      codigo: "SB-2024-015",
      fechaSolicitud: "2024-11-14",
      fechaRechazo: "2024-11-15",
      solicitante: "Ana López",
      area: "Mantenimiento",
      responsableRechazo: "Ana López",
      motivoRechazo: "No cumple con políticas de compras",
      observacionesRechazo: "La solicitud incluye items que no están en el catálogo aprobado de proveedores.",
      totalItems: 12,
      valorEstimado: 3200000,
      estado: "rechazada",
      puedeReaperturar: true,
      categoriaRechazo: "politicas",
      items: [
        { codigo: "HER-005", descripcion: "Taladro industrial", cantidad: 2, unidad: "UND", valorUnitario: 450000, motivoRechazoItem: "Proveedor no aprobado" },
        { codigo: "HER-006", descripcion: "Kit de brocas", cantidad: 5, unidad: "SET", valorUnitario: 120000 },
        { codigo: "ACC-006", descripcion: "Extensión eléctrica", cantidad: 5, unidad: "UND", valorUnitario: 85000, motivoRechazoItem: "No cumple normas" }
      ]
    }
  ];

  useEffect(() => {
    setSolicitudes(solicitudesEjemplo);
    setFilteredSolicitudes(solicitudesEjemplo);
  }, []);

  useEffect(() => {
    let filtered = solicitudes.filter(solicitud => {
      const matchesSearch = solicitud.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           solicitud.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           solicitud.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           solicitud.motivoRechazo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesArea = filterArea === 'todas' || solicitud.area === filterArea;
      const matchesCategoria = filterCategoria === 'todas' || solicitud.categoriaRechazo === filterCategoria;
      
      let matchesFecha = true;
      if (filterFecha !== 'todas') {
        const hoy = new Date();
        const fechaRechazo = new Date(solicitud.fechaRechazo);
        const diffTime = Math.abs(hoy.getTime() - fechaRechazo.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filterFecha) {
          case 'semana':
            matchesFecha = diffDays <= 7;
            break;
          case 'mes':
            matchesFecha = diffDays <= 30;
            break;
          case 'trimestre':
            matchesFecha = diffDays <= 90;
            break;
        }
      }
      
      return matchesSearch && matchesArea && matchesCategoria && matchesFecha;
    });

    setFilteredSolicitudes(filtered);
  }, [searchTerm, filterArea, filterCategoria, filterFecha, solicitudes]);

  const verDetalle = (solicitud: SolicitudRechazada) => {
    setSelectedSolicitud(solicitud);
    setDetalleDialogOpen(true);
  };

  const iniciarReapertura = (solicitud: SolicitudRechazada) => {
    if (!solicitud.puedeReaperturar) {
      toast({
        title: "Acción no permitida",
        description: "Esta solicitud no puede ser reaperturada",
        variant: "destructive"
      });
      return;
    }
    setSelectedSolicitud(solicitud);
    setJustificacionReapertura('');
    setReaperturaDialogOpen(true);
  };

  const confirmarReapertura = () => {
    if (!selectedSolicitud) return;

    // Simular API call
    setTimeout(() => {
      toast({
        title: "Solicitud Reaperturada",
        description: `La solicitud ${selectedSolicitud.codigo} ha sido reaperturada y será revisada nuevamente.`,
      });

      // Remover de la lista de rechazadas
      setSolicitudes(prev => prev.filter(s => s.id !== selectedSolicitud.id));
      setReaperturaDialogOpen(false);
      setSelectedSolicitud(null);
      setJustificacionReapertura('');
    }, 1000);
  };

  const getCategoriaInfo = (categoria: string) => {
    const categorias: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      presupuesto: { label: "Presupuesto", color: "destructive", icon: <AlertTriangle className="w-4 h-4" /> },
      disponibilidad: { label: "Disponibilidad", color: "secondary", icon: <XCircle className="w-4 h-4" /> },
      politicas: { label: "Políticas", color: "default", icon: <MessageSquare className="w-4 h-4" /> },
      documentacion: { label: "Documentación", color: "outline", icon: <Calendar className="w-4 h-4" /> },
      tecnico: { label: "Técnico", color: "secondary", icon: <AlertTriangle className="w-4 h-4" /> },
      otro: { label: "Otro", color: "outline", icon: <XCircle className="w-4 h-4" /> }
    };
    return categorias[categoria] || categorias.otro;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const areas = Array.from(new Set(solicitudes.map(s => s.area)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Solicitudes Rechazadas</h1>
          <p className="text-muted-foreground">
            Gestión de solicitudes rechazadas y opciones de reapertura
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-lg px-3 py-1">
            <XCircle className="w-4 h-4 mr-2" />
            {filteredSolicitudes.length} Rechazadas
          </Badge>
        </div>
      </div>

      {/* Estadísticas por categoría */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Object.entries(
          solicitudes.reduce((acc, s) => {
            acc[s.categoriaRechazo] = (acc[s.categoriaRechazo] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([categoria, count]) => {
          const info = getCategoriaInfo(categoria);
          return (
            <Card key={categoria}>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  {info.icon}
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{info.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las áreas</SelectItem>
                {areas.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría de rechazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                <SelectItem value="presupuesto">Presupuesto</SelectItem>
                <SelectItem value="disponibilidad">Disponibilidad</SelectItem>
                <SelectItem value="politicas">Políticas</SelectItem>
                <SelectItem value="documentacion">Documentación</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterFecha} onValueChange={setFilterFecha}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los períodos</SelectItem>
                <SelectItem value="semana">Última semana</SelectItem>
                <SelectItem value="mes">Último mes</SelectItem>
                <SelectItem value="trimestre">Último trimestre</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterArea('todas');
                setFilterCategoria('todas');
                setFilterFecha('todas');
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de solicitudes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitudes Rechazadas</CardTitle>
          <CardDescription>
            Solicitudes que han sido rechazadas con posibilidad de reapertura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fecha Rechazo</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Valor Est.</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Reapertura</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSolicitudes.map((solicitud) => {
                const categoriaInfo = getCategoriaInfo(solicitud.categoriaRechazo);
                return (
                  <TableRow key={solicitud.id}>
                    <TableCell className="font-medium">{solicitud.codigo}</TableCell>
                    <TableCell>{new Date(solicitud.fechaRechazo).toLocaleDateString()}</TableCell>
                    <TableCell>{solicitud.solicitante}</TableCell>
                    <TableCell>{solicitud.area}</TableCell>
                    <TableCell>
                      <Badge variant={categoriaInfo.color as any}>
                        {categoriaInfo.icon}
                        <span className="ml-1">{categoriaInfo.label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(solicitud.valorEstimado)}</TableCell>
                    <TableCell>{solicitud.responsableRechazo}</TableCell>
                    <TableCell>
                      <Badge variant={solicitud.puedeReaperturar ? "default" : "secondary"}>
                        {solicitud.puedeReaperturar ? "Permitida" : "No permitida"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verDetalle(solicitud)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        {solicitud.puedeReaperturar && (
                          <Button
                            size="sm"
                            onClick={() => iniciarReapertura(solicitud)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Reabrir
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredSolicitudes.length === 0 && (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron solicitudes rechazadas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalle */}
      <Dialog open={detalleDialogOpen} onOpenChange={setDetalleDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalle de Solicitud Rechazada</DialogTitle>
            <DialogDescription>
              Información completa del rechazo de {selectedSolicitud?.codigo}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSolicitud && (
            <div className="space-y-6">
              {/* Información del rechazo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <XCircle className="w-5 h-5 mr-2 text-red-500" />
                    Información del Rechazo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Fecha de Rechazo:</span>
                      <p>{new Date(selectedSolicitud.fechaRechazo).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium">Responsable:</span>
                      <p>{selectedSolicitud.responsableRechazo}</p>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Categoría:</span>
                    <div className="mt-1">
                      <Badge variant={getCategoriaInfo(selectedSolicitud.categoriaRechazo).color as any}>
                        {getCategoriaInfo(selectedSolicitud.categoriaRechazo).icon}
                        <span className="ml-1">{getCategoriaInfo(selectedSolicitud.categoriaRechazo).label}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Motivo:</span>
                    <p className="mt-1">{selectedSolicitud.motivoRechazo}</p>
                  </div>
                  <div>
                    <span className="font-medium">Observaciones:</span>
                    <p className="mt-1 text-sm">{selectedSolicitud.observacionesRechazo}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Items solicitados */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Items Solicitados</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Unidad</TableHead>
                        <TableHead>Valor Unit.</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Observación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSolicitud.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.codigo}</TableCell>
                          <TableCell>{item.descripcion}</TableCell>
                          <TableCell>{item.cantidad}</TableCell>
                          <TableCell>{item.unidad}</TableCell>
                          <TableCell>{formatCurrency(item.valorUnitario)}</TableCell>
                          <TableCell>{formatCurrency(item.valorUnitario * item.cantidad)}</TableCell>
                          <TableCell>
                            {item.motivoRechazoItem ? (
                              <Badge variant="destructive" className="text-xs">
                                {item.motivoRechazoItem}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de reapertura */}
      <Dialog open={reaperturaDialogOpen} onOpenChange={setReaperturaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reaperturar Solicitud</DialogTitle>
            <DialogDescription>
              ¿Está seguro de reabrir la solicitud {selectedSolicitud?.codigo}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Justificación para la reapertura</label>
              <Textarea
                placeholder="Explique por qué esta solicitud debe ser reaperturada..."
                value={justificacionReapertura}
                onChange={(e) => setJustificacionReapertura(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReaperturaDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarReapertura}
              disabled={!justificacionReapertura.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reabrir Solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SolicitudesBodegaRechazadas;