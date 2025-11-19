"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, Package, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface SolicitudPendiente {
  id: number;
  codigo: string;
  fechaSolicitud: string;
  solicitante: string;
  area: string;
  prioridad: 'alta' | 'media' | 'baja';
  totalItems: number;
  valorEstimado: number;
  observaciones?: string;
  estado: 'pendiente';
  diasPendiente: number;
}

const SolicitudesBodegaPendientes = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<SolicitudPendiente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrioridad, setFilterPrioridad] = useState<string>('todas');
  const [filterArea, setFilterArea] = useState<string>('todas');
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudPendiente | null>(null);
  const [accionDialogOpen, setAccionDialogOpen] = useState(false);
  const [tipoAccion, setTipoAccion] = useState<'aprobar' | 'rechazar' | null>(null);
  const [observacionesAccion, setObservacionesAccion] = useState('');
  const { toast } = useToast();

  // Datos de ejemplo
  const solicitudesEjemplo: SolicitudPendiente[] = [
    {
      id: 1,
      codigo: "SB-2024-001",
      fechaSolicitud: "2024-11-15",
      solicitante: "Juan Pérez",
      area: "Mantenimiento",
      prioridad: "alta",
      totalItems: 5,
      valorEstimado: 2500000,
      observaciones: "Urgente para reparación crítica",
      estado: "pendiente",
      diasPendiente: 3
    },
    {
      id: 2,
      codigo: "SB-2024-002",
      fechaSolicitud: "2024-11-14",
      solicitante: "María García",
      area: "Operaciones",
      prioridad: "media",
      totalItems: 8,
      valorEstimado: 1800000,
      estado: "pendiente",
      diasPendiente: 4
    },
    {
      id: 3,
      codigo: "SB-2024-003",
      fechaSolicitud: "2024-11-13",
      solicitante: "Carlos Rodríguez",
      area: "Calidad",
      prioridad: "baja",
      totalItems: 3,
      valorEstimado: 750000,
      observaciones: "Para mejora de procesos",
      estado: "pendiente",
      diasPendiente: 5
    },
    {
      id: 4,
      codigo: "SB-2024-004",
      fechaSolicitud: "2024-11-16",
      solicitante: "Ana López",
      area: "Mantenimiento",
      prioridad: "alta",
      totalItems: 12,
      valorEstimado: 4200000,
      observaciones: "Repuestos para equipo principal",
      estado: "pendiente",
      diasPendiente: 2
    },
    {
      id: 5,
      codigo: "SB-2024-005",
      fechaSolicitud: "2024-11-12",
      solicitante: "Diego Martín",
      area: "Logística",
      prioridad: "media",
      totalItems: 6,
      valorEstimado: 1350000,
      estado: "pendiente",
      diasPendiente: 6
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
      
      const matchesPrioridad = filterPrioridad === 'todas' || solicitud.prioridad === filterPrioridad;
      const matchesArea = filterArea === 'todas' || solicitud.area === filterArea;
      
      return matchesSearch && matchesPrioridad && matchesArea;
    });

    setFilteredSolicitudes(filtered);
  }, [searchTerm, filterPrioridad, filterArea, solicitudes]);

  const getPrioridadBadge = (prioridad: string) => {
    const variants: Record<string, string> = {
      alta: "destructive",
      media: "default",
      baja: "secondary"
    };
    return variants[prioridad] || "default";
  };

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return <AlertCircle className="w-4 h-4" />;
      case 'media': return <Clock className="w-4 h-4" />;
      case 'baja': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleAccion = (solicitud: SolicitudPendiente, accion: 'aprobar' | 'rechazar') => {
    setSelectedSolicitud(solicitud);
    setTipoAccion(accion);
    setObservacionesAccion('');
    setAccionDialogOpen(true);
  };

  const confirmarAccion = () => {
    if (!selectedSolicitud || !tipoAccion) return;

    // Simular API call
    setTimeout(() => {
      const mensaje = tipoAccion === 'aprobar' 
        ? `Solicitud ${selectedSolicitud.codigo} aprobada exitosamente`
        : `Solicitud ${selectedSolicitud.codigo} rechazada`;

      toast({
        title: tipoAccion === 'aprobar' ? "Solicitud Aprobada" : "Solicitud Rechazada",
        description: mensaje,
      });

      // Remover de la lista de pendientes
      setSolicitudes(prev => prev.filter(s => s.id !== selectedSolicitud.id));
      setAccionDialogOpen(false);
      setSelectedSolicitud(null);
      setTipoAccion(null);
      setObservacionesAccion('');
    }, 1000);
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
          <h1 className="text-3xl font-bold">Solicitudes Pendientes</h1>
          <p className="text-muted-foreground">
            Gestiona las solicitudes de bodega pendientes de aprobación
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Clock className="w-4 h-4 mr-2" />
            {filteredSolicitudes.length} Pendientes
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
            <Select value={filterPrioridad} onValueChange={setFilterPrioridad}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las prioridades</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
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
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterPrioridad('todas');
                setFilterArea('todas');
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
          <CardTitle>Lista de Solicitudes Pendientes</CardTitle>
          <CardDescription>
            Solicitudes que requieren aprobación o rechazo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Valor Est.</TableHead>
                <TableHead>Días Pend.</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSolicitudes.map((solicitud) => (
                <TableRow key={solicitud.id}>
                  <TableCell className="font-medium">{solicitud.codigo}</TableCell>
                  <TableCell>{new Date(solicitud.fechaSolicitud).toLocaleDateString()}</TableCell>
                  <TableCell>{solicitud.solicitante}</TableCell>
                  <TableCell>{solicitud.area}</TableCell>
                  <TableCell>
                    <Badge variant={getPrioridadBadge(solicitud.prioridad) as any}>
                      {getPrioridadIcon(solicitud.prioridad)}
                      <span className="ml-1 capitalize">{solicitud.prioridad}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{solicitud.totalItems}</TableCell>
                  <TableCell>{formatCurrency(solicitud.valorEstimado)}</TableCell>
                  <TableCell>
                    <Badge variant={solicitud.diasPendiente > 5 ? "destructive" : "outline"}>
                      {solicitud.diasPendiente} días
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccion(solicitud, 'aprobar')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleAccion(solicitud, 'rechazar')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rechazar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredSolicitudes.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron solicitudes pendientes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación */}
      <Dialog open={accionDialogOpen} onOpenChange={setAccionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {tipoAccion === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
            </DialogTitle>
            <DialogDescription>
              {tipoAccion === 'aprobar' 
                ? `¿Está seguro de aprobar la solicitud ${selectedSolicitud?.codigo}?`
                : `¿Está seguro de rechazar la solicitud ${selectedSolicitud?.codigo}?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Observaciones</label>
              <Textarea
                placeholder={tipoAccion === 'aprobar' 
                  ? "Observaciones adicionales para la aprobación..."
                  : "Motivo del rechazo (requerido para rechazos)..."
                }
                value={observacionesAccion}
                onChange={(e) => setObservacionesAccion(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAccionDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarAccion}
              className={tipoAccion === 'aprobar' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={tipoAccion === 'rechazar' ? 'destructive' : 'default'}
              disabled={tipoAccion === 'rechazar' && !observacionesAccion.trim()}
            >
              {tipoAccion === 'aprobar' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SolicitudesBodegaPendientes;