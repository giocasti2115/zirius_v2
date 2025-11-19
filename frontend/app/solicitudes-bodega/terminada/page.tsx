"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Package, Calendar, Eye, Download, MapPin, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface SolicitudTerminada {
  id: number;
  codigo: string;
  fechaSolicitud: string;
  fechaAprobacion: string;
  fechaDespacho: string;
  fechaRecepcion: string;
  fechaConfirmacion: string;
  solicitante: string;
  area: string;
  responsableDespacho: string;
  responsableRecepcion: string;
  transportista?: string;
  guiaRemision?: string;
  totalItems: number;
  valorTotal: number;
  estado: 'terminada';
  observacionesDespacho?: string;
  observacionesRecepcion?: string;
  calificacion?: number;
  direccionEntrega: string;
  tiempoTotal: number; // en días
  items: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
    cantidadRecibida: number;
    unidad: string;
    valorUnitario: number;
    estado: 'recibido' | 'faltante' | 'dañado';
  }>;
}

const SolicitudesBodegaTerminadas = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudTerminada[]>([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<SolicitudTerminada[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('todas');
  const [filterFecha, setFilterFecha] = useState<string>('todas');
  const [filterCalificacion, setFilterCalificacion] = useState<string>('todas');
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudTerminada | null>(null);
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false);

  // Datos de ejemplo
  const solicitudesEjemplo: SolicitudTerminada[] = [
    {
      id: 1,
      codigo: "SB-2024-001",
      fechaSolicitud: "2024-11-01",
      fechaAprobacion: "2024-11-02",
      fechaDespacho: "2024-11-03",
      fechaRecepcion: "2024-11-03",
      fechaConfirmacion: "2024-11-04",
      solicitante: "Juan Pérez",
      area: "Mantenimiento",
      responsableDespacho: "Carlos Mendoza",
      responsableRecepcion: "Juan Pérez",
      transportista: "Trans Rápido S.A.S",
      guiaRemision: "GR-001-2024",
      totalItems: 5,
      valorTotal: 2450000,
      estado: "terminada",
      observacionesDespacho: "Despacho urgente completado",
      observacionesRecepcion: "Recibido en perfectas condiciones",
      calificacion: 5,
      direccionEntrega: "Planta Principal - Bloque A",
      tiempoTotal: 3,
      items: [
        { codigo: "REP-001", descripcion: "Rodamiento SKF 6205", cantidad: 2, cantidadRecibida: 2, unidad: "UND", valorUnitario: 85000, estado: "recibido" },
        { codigo: "REP-002", descripcion: "Correa V tipo A", cantidad: 3, cantidadRecibida: 3, unidad: "UND", valorUnitario: 45000, estado: "recibido" },
        { codigo: "ACC-001", descripcion: "Lubricante industrial", cantidad: 1, cantidadRecibida: 1, unidad: "GAL", valorUnitario: 120000, estado: "recibido" }
      ]
    },
    {
      id: 2,
      codigo: "SB-2024-005",
      fechaSolicitud: "2024-10-28",
      fechaAprobacion: "2024-10-29",
      fechaDespacho: "2024-10-30",
      fechaRecepcion: "2024-10-31",
      fechaConfirmacion: "2024-11-01",
      solicitante: "María García",
      area: "Operaciones",
      responsableDespacho: "Ana López",
      responsableRecepcion: "María García",
      totalItems: 8,
      valorTotal: 1750000,
      estado: "terminada",
      observacionesRecepcion: "Un item llegó con defecto menor",
      calificacion: 4,
      direccionEntrega: "Área de Operaciones - Piso 2",
      tiempoTotal: 4,
      items: [
        { codigo: "HER-001", descripcion: "Llave inglesa 12''", cantidad: 2, cantidadRecibida: 2, unidad: "UND", valorUnitario: 65000, estado: "recibido" },
        { codigo: "HER-002", descripcion: "Destornillador plano", cantidad: 6, cantidadRecibida: 5, unidad: "UND", valorUnitario: 25000, estado: "faltante" }
      ]
    },
    {
      id: 3,
      codigo: "SB-2024-008",
      fechaSolicitud: "2024-10-25",
      fechaAprobacion: "2024-10-26",
      fechaDespacho: "2024-10-27",
      fechaRecepcion: "2024-10-28",
      fechaConfirmacion: "2024-10-28",
      solicitante: "Carlos Rodríguez",
      area: "Calidad",
      responsableDespacho: "Diego Martín",
      responsableRecepcion: "Carlos Rodríguez",
      transportista: "Logística Express",
      guiaRemision: "GR-002-2024",
      totalItems: 12,
      valorTotal: 3200000,
      estado: "terminada",
      observacionesDespacho: "Entrega programada cumplida",
      observacionesRecepcion: "Excelente servicio y calidad",
      calificacion: 5,
      direccionEntrega: "Laboratorio de Calidad",
      tiempoTotal: 3,
      items: [
        { codigo: "INS-001", descripcion: "Calibrador Vernier", cantidad: 1, cantidadRecibida: 1, unidad: "UND", valorUnitario: 450000, estado: "recibido" },
        { codigo: "INS-002", descripcion: "Micrómetro 0-25mm", cantidad: 2, cantidadRecibida: 2, unidad: "UND", valorUnitario: 380000, estado: "recibido" }
      ]
    },
    {
      id: 4,
      codigo: "SB-2024-010",
      fechaSolicitud: "2024-10-20",
      fechaAprobacion: "2024-10-21",
      fechaDespacho: "2024-10-22",
      fechaRecepcion: "2024-10-23",
      fechaConfirmacion: "2024-10-24",
      solicitante: "Ana López",
      area: "Mantenimiento",
      responsableDespacho: "Carlos Mendoza",
      responsableRecepcion: "Ana López",
      totalItems: 6,
      valorTotal: 2100000,
      estado: "terminada",
      observacionesRecepcion: "Motor llegó con daño en la carcasa",
      calificacion: 2,
      direccionEntrega: "Taller de Mantenimiento",
      tiempoTotal: 4,
      items: [
        { codigo: "REP-005", descripcion: "Motor eléctrico 2HP", cantidad: 1, cantidadRecibida: 1, unidad: "UND", valorUnitario: 1200000, estado: "dañado" },
        { codigo: "REP-006", descripcion: "Contactores 24V", cantidad: 5, cantidadRecibida: 5, unidad: "UND", valorUnitario: 180000, estado: "recibido" }
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
                           solicitud.area.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesArea = filterArea === 'todas' || solicitud.area === filterArea;
      const matchesCalificacion = filterCalificacion === 'todas' || 
                                  (filterCalificacion === 'alta' && solicitud.calificacion && solicitud.calificacion >= 4) ||
                                  (filterCalificacion === 'media' && solicitud.calificacion && solicitud.calificacion === 3) ||
                                  (filterCalificacion === 'baja' && solicitud.calificacion && solicitud.calificacion <= 2);
      
      let matchesFecha = true;
      if (filterFecha !== 'todas') {
        const hoy = new Date();
        const fechaConfirmacion = new Date(solicitud.fechaConfirmacion);
        const diffTime = Math.abs(hoy.getTime() - fechaConfirmacion.getTime());
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
      
      return matchesSearch && matchesArea && matchesFecha && matchesCalificacion;
    });

    setFilteredSolicitudes(filtered);
  }, [searchTerm, filterArea, filterFecha, filterCalificacion, solicitudes]);

  const verDetalle = (solicitud: SolicitudTerminada) => {
    setSelectedSolicitud(solicitud);
    setDetalleDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, string> = {
      recibido: "default",
      faltante: "destructive",
      dañado: "secondary"
    };
    return variants[estado] || "default";
  };

  const getCalificacionStars = (calificacion: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < calificacion ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const areas = Array.from(new Set(solicitudes.map(s => s.area)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Solicitudes Terminadas</h1>
          <p className="text-muted-foreground">
            Historial completo de solicitudes finalizadas y confirmadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <CheckCircle className="w-4 h-4 mr-2" />
            {filteredSolicitudes.length} Terminadas
          </Badge>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio Calificación</p>
                <div className="flex items-center mt-1">
                  <span className="text-2xl font-bold">
                    {(solicitudes.reduce((acc, s) => acc + (s.calificacion || 0), 0) / solicitudes.length).toFixed(1)}
                  </span>
                  <div className="flex ml-2">
                    {getCalificacionStars(Math.round(solicitudes.reduce((acc, s) => acc + (s.calificacion || 0), 0) / solicitudes.length))}
                  </div>
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold">
                  {(solicitudes.reduce((acc, s) => acc + s.tiempoTotal, 0) / solicitudes.length).toFixed(1)} días
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">
                  {solicitudes.reduce((acc, s) => acc + s.totalItems, 0)}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(solicitudes.reduce((acc, s) => acc + s.valorTotal, 0))}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, solicitante..."
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
            <Select value={filterCalificacion} onValueChange={setFilterCalificacion}>
              <SelectTrigger>
                <SelectValue placeholder="Calificación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las calificaciones</SelectItem>
                <SelectItem value="alta">Alta (4-5 estrellas)</SelectItem>
                <SelectItem value="media">Media (3 estrellas)</SelectItem>
                <SelectItem value="baja">Baja (1-2 estrellas)</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterArea('todas');
                setFilterFecha('todas');
                setFilterCalificacion('todas');
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
          <CardTitle>Lista de Solicitudes Terminadas</CardTitle>
          <CardDescription>
            Registro completo de solicitudes finalizadas con evaluación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fecha Finalización</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Tiempo Total</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSolicitudes.map((solicitud) => (
                <TableRow key={solicitud.id}>
                  <TableCell className="font-medium">{solicitud.codigo}</TableCell>
                  <TableCell>{new Date(solicitud.fechaConfirmacion).toLocaleDateString()}</TableCell>
                  <TableCell>{solicitud.solicitante}</TableCell>
                  <TableCell>{solicitud.area}</TableCell>
                  <TableCell>{solicitud.totalItems}</TableCell>
                  <TableCell>
                    <Badge variant={solicitud.tiempoTotal <= 3 ? "default" : "secondary"}>
                      {solicitud.tiempoTotal} días
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(solicitud.valorTotal)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {solicitud.calificacion ? (
                        <>
                          <span className="mr-2">{solicitud.calificacion}</span>
                          <div className="flex">
                            {getCalificacionStars(solicitud.calificacion)}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Sin calificar</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verDetalle(solicitud)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredSolicitudes.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron solicitudes terminadas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalle */}
      <Dialog open={detalleDialogOpen} onOpenChange={setDetalleDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Detalle de Solicitud Terminada</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud {selectedSolicitud?.codigo}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSolicitud && (
            <div className="space-y-6">
              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline del Proceso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground">Solicitud</div>
                      <div className="text-lg">{new Date(selectedSolicitud.fechaSolicitud).toLocaleDateString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground">Aprobación</div>
                      <div className="text-lg">{new Date(selectedSolicitud.fechaAprobacion).toLocaleDateString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground">Despacho</div>
                      <div className="text-lg">{new Date(selectedSolicitud.fechaDespacho).toLocaleDateString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground">Recepción</div>
                      <div className="text-lg">{new Date(selectedSolicitud.fechaRecepcion).toLocaleDateString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground">Confirmación</div>
                      <div className="text-lg">{new Date(selectedSolicitud.fechaConfirmacion).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información General</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Solicitante:</span>
                      <span>{selectedSolicitud.solicitante}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Área:</span>
                      <span>{selectedSolicitud.area}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Responsable Despacho:</span>
                      <span>{selectedSolicitud.responsableDespacho}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Responsable Recepción:</span>
                      <span>{selectedSolicitud.responsableRecepcion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tiempo Total:</span>
                      <Badge variant={selectedSolicitud.tiempoTotal <= 3 ? "default" : "secondary"}>
                        {selectedSolicitud.tiempoTotal} días
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evaluación del Servicio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="font-medium">Calificación:</span>
                      <div className="flex items-center mt-2">
                        <span className="text-2xl font-bold mr-2">{selectedSolicitud.calificacion}</span>
                        <div className="flex">
                          {selectedSolicitud.calificacion && getCalificacionStars(selectedSolicitud.calificacion)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Observaciones de Recepción:</span>
                      <p className="mt-1 text-sm">{selectedSolicitud.observacionesRecepcion || 'Sin observaciones'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Items recibidos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Items Recibidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Solicitado</TableHead>
                        <TableHead>Recibido</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Valor Unit.</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSolicitud.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.codigo}</TableCell>
                          <TableCell>{item.descripcion}</TableCell>
                          <TableCell>{item.cantidad}</TableCell>
                          <TableCell>{item.cantidadRecibida}</TableCell>
                          <TableCell>
                            <Badge variant={getEstadoBadge(item.estado) as any}>
                              {item.estado}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(item.valorUnitario)}</TableCell>
                          <TableCell>{formatCurrency(item.valorUnitario * item.cantidadRecibida)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-end">
                    <div className="text-lg font-bold">
                      Total: {formatCurrency(selectedSolicitud.valorTotal)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SolicitudesBodegaTerminadas;