"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Truck, Package, Calendar, Eye, Download, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface SolicitudDespachada {
  id: number;
  codigo: string;
  fechaSolicitud: string;
  fechaAprobacion: string;
  fechaDespacho: string;
  solicitante: string;
  area: string;
  responsableDespacho: string;
  transportista?: string;
  guiaRemision?: string;
  totalItems: number;
  valorTotal: number;
  estado: 'despachada';
  observaciones?: string;
  direccionEntrega: string;
  items: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
    cantidadDespachada: number;
    unidad: string;
    valorUnitario: number;
  }>;
}

const SolicitudesBodegaDespachadas = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudDespachada[]>([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<SolicitudDespachada[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('todas');
  const [filterFecha, setFilterFecha] = useState<string>('todas');
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudDespachada | null>(null);
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false);

  // Datos de ejemplo
  const solicitudesEjemplo: SolicitudDespachada[] = [
    {
      id: 1,
      codigo: "SB-2024-001",
      fechaSolicitud: "2024-11-10",
      fechaAprobacion: "2024-11-11",
      fechaDespacho: "2024-11-12",
      solicitante: "Juan Pérez",
      area: "Mantenimiento",
      responsableDespacho: "Carlos Mendoza",
      transportista: "Trans Rápido S.A.S",
      guiaRemision: "GR-001-2024",
      totalItems: 5,
      valorTotal: 2450000,
      estado: "despachada",
      observaciones: "Despacho urgente completado",
      direccionEntrega: "Planta Principal - Bloque A",
      items: [
        { codigo: "REP-001", descripcion: "Rodamiento SKF 6205", cantidad: 2, cantidadDespachada: 2, unidad: "UND", valorUnitario: 85000 },
        { codigo: "REP-002", descripcion: "Correa V tipo A", cantidad: 3, cantidadDespachada: 3, unidad: "UND", valorUnitario: 45000 },
        { codigo: "ACC-001", descripcion: "Lubricante industrial", cantidad: 1, cantidadDespachada: 1, unidad: "GAL", valorUnitario: 120000 }
      ]
    },
    {
      id: 2,
      codigo: "SB-2024-005",
      fechaSolicitud: "2024-11-08",
      fechaAprobacion: "2024-11-09",
      fechaDespacho: "2024-11-11",
      solicitante: "María García",
      area: "Operaciones",
      responsableDespacho: "Ana López",
      totalItems: 8,
      valorTotal: 1750000,
      estado: "despachada",
      direccionEntrega: "Área de Operaciones - Piso 2",
      items: [
        { codigo: "HER-001", descripcion: "Llave inglesa 12''", cantidad: 2, cantidadDespachada: 2, unidad: "UND", valorUnitario: 65000 },
        { codigo: "HER-002", descripcion: "Destornillador plano", cantidad: 6, cantidadDespachada: 6, unidad: "UND", valorUnitario: 25000 }
      ]
    },
    {
      id: 3,
      codigo: "SB-2024-008",
      fechaSolicitud: "2024-11-05",
      fechaAprobacion: "2024-11-06",
      fechaDespacho: "2024-11-10",
      solicitante: "Carlos Rodríguez",
      area: "Calidad",
      responsableDespacho: "Diego Martín",
      transportista: "Logística Express",
      guiaRemision: "GR-002-2024",
      totalItems: 12,
      valorTotal: 3200000,
      estado: "despachada",
      observaciones: "Entrega programada cumplida",
      direccionEntrega: "Laboratorio de Calidad",
      items: [
        { codigo: "INS-001", descripcion: "Calibrador Vernier", cantidad: 1, cantidadDespachada: 1, unidad: "UND", valorUnitario: 450000 },
        { codigo: "INS-002", descripcion: "Micrómetro 0-25mm", cantidad: 2, cantidadDespachada: 2, unidad: "UND", valorUnitario: 380000 }
      ]
    },
    {
      id: 4,
      codigo: "SB-2024-012",
      fechaSolicitud: "2024-11-14",
      fechaAprobacion: "2024-11-15",
      fechaDespacho: "2024-11-16",
      solicitante: "Ana López",
      area: "Mantenimiento",
      responsableDespacho: "Carlos Mendoza",
      totalItems: 6,
      valorTotal: 2100000,
      estado: "despachada",
      direccionEntrega: "Taller de Mantenimiento",
      items: [
        { codigo: "REP-005", descripcion: "Motor eléctrico 2HP", cantidad: 1, cantidadDespachada: 1, unidad: "UND", valorUnitario: 1200000 },
        { codigo: "REP-006", descripcion: "Contactores 24V", cantidad: 5, cantidadDespachada: 5, unidad: "UND", valorUnitario: 180000 }
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
                           solicitud.responsableDespacho.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesArea = filterArea === 'todas' || solicitud.area === filterArea;
      
      let matchesFecha = true;
      if (filterFecha !== 'todas') {
        const hoy = new Date();
        const fechaDespacho = new Date(solicitud.fechaDespacho);
        const diffTime = Math.abs(hoy.getTime() - fechaDespacho.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filterFecha) {
          case 'hoy':
            matchesFecha = diffDays === 0;
            break;
          case 'semana':
            matchesFecha = diffDays <= 7;
            break;
          case 'mes':
            matchesFecha = diffDays <= 30;
            break;
        }
      }
      
      return matchesSearch && matchesArea && matchesFecha;
    });

    setFilteredSolicitudes(filtered);
  }, [searchTerm, filterArea, filterFecha, solicitudes]);

  const verDetalle = (solicitud: SolicitudDespachada) => {
    setSelectedSolicitud(solicitud);
    setDetalleDialogOpen(true);
  };

  const descargarGuia = (solicitud: SolicitudDespachada) => {
    // Implementar descarga de guía de remisión
    console.log(`Descargando guía ${solicitud.guiaRemision} para ${solicitud.codigo}`);
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
          <h1 className="text-3xl font-bold">Solicitudes Despachadas</h1>
          <p className="text-muted-foreground">
            Historial de solicitudes que han sido despachadas desde bodega
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Truck className="w-4 h-4 mr-2" />
            {filteredSolicitudes.length} Despachadas
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <SelectValue placeholder="Período de despacho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los períodos</SelectItem>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="semana">Última semana</SelectItem>
                <SelectItem value="mes">Último mes</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterArea('todas');
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
          <CardTitle>Lista de Solicitudes Despachadas</CardTitle>
          <CardDescription>
            Registro completo de despachos realizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fecha Despacho</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Guía</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSolicitudes.map((solicitud) => (
                <TableRow key={solicitud.id}>
                  <TableCell className="font-medium">{solicitud.codigo}</TableCell>
                  <TableCell>{new Date(solicitud.fechaDespacho).toLocaleDateString()}</TableCell>
                  <TableCell>{solicitud.solicitante}</TableCell>
                  <TableCell>{solicitud.area}</TableCell>
                  <TableCell>{solicitud.responsableDespacho}</TableCell>
                  <TableCell>{solicitud.totalItems}</TableCell>
                  <TableCell>{formatCurrency(solicitud.valorTotal)}</TableCell>
                  <TableCell>
                    {solicitud.guiaRemision ? (
                      <Badge variant="outline">
                        <Package className="w-3 h-3 mr-1" />
                        {solicitud.guiaRemision}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
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
                      {solicitud.guiaRemision && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => descargarGuia(solicitud)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Guía
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredSolicitudes.length === 0 && (
            <div className="text-center py-8">
              <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron solicitudes despachadas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalle */}
      <Dialog open={detalleDialogOpen} onOpenChange={setDetalleDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalle de Solicitud Despachada</DialogTitle>
            <DialogDescription>
              Información completa del despacho {selectedSolicitud?.codigo}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSolicitud && (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información de Solicitud</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Código:</span>
                      <span>{selectedSolicitud.codigo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Solicitante:</span>
                      <span>{selectedSolicitud.solicitante}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Área:</span>
                      <span>{selectedSolicitud.area}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Fecha Solicitud:</span>
                      <span>{new Date(selectedSolicitud.fechaSolicitud).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información de Despacho</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Fecha Despacho:</span>
                      <span>{new Date(selectedSolicitud.fechaDespacho).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Responsable:</span>
                      <span>{selectedSolicitud.responsableDespacho}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Transportista:</span>
                      <span>{selectedSolicitud.transportista || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Guía Remisión:</span>
                      <span>{selectedSolicitud.guiaRemision || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dirección de entrega */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Dirección de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{selectedSolicitud.direccionEntrega}</p>
                </CardContent>
              </Card>

              {/* Items despachados */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Items Despachados</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Solicitado</TableHead>
                        <TableHead>Despachado</TableHead>
                        <TableHead>Unidad</TableHead>
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
                          <TableCell>
                            <Badge variant={item.cantidad === item.cantidadDespachada ? "default" : "destructive"}>
                              {item.cantidadDespachada}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.unidad}</TableCell>
                          <TableCell>{formatCurrency(item.valorUnitario)}</TableCell>
                          <TableCell>{formatCurrency(item.valorUnitario * item.cantidadDespachada)}</TableCell>
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

              {/* Observaciones */}
              {selectedSolicitud.observaciones && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Observaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedSolicitud.observaciones}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SolicitudesBodegaDespachadas;