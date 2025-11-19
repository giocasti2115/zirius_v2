"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Download, Calendar, Filter, Zap, Settings, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FalloInforme {
  id: number;
  equipo: string;
  codigoEquipo: string;
  tipoFallo: string;
  categoriaFallo: 'mecanico' | 'electrico' | 'hidraulico' | 'neumatico' | 'software' | 'operacional';
  criticidad: 'alta' | 'media' | 'baja';
  frecuencia: number;
  tiempoPromedioParo: number; // en horas
  costoPromedio: number;
  totalOcurrencias: number;
  tendencia: 'subiendo' | 'bajando' | 'estable';
  ultimaOcurrencia: string;
  impactoProduccion: 'alto' | 'medio' | 'bajo';
  estadoActual: 'resuelto' | 'pendiente' | 'recurrente';
  ocurrenciasPorMes: Array<{
    mes: string;
    cantidad: number;
    tiempoParo: number;
    costo: number;
  }>;
  repuestosAsociados: string[];
  causasComunes: string[];
}

interface EstadisticasFallos {
  totalFallos: number;
  tiempoTotalParo: number;
  costoTotal: number;
  falloMasFrecuente: string;
  equipoMasProblematico: string;
  tendenciaGeneral: 'subiendo' | 'bajando' | 'estable';
  mtbf: number; // Mean Time Between Failures
  mttr: number; // Mean Time To Repair
}

const InformesFallos = () => {
  const [fallos, setFallos] = useState<FalloInforme[]>([]);
  const [filteredFallos, setFilteredFallos] = useState<FalloInforme[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasFallos | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [filterCriticidad, setFilterCriticidad] = useState<string>('todas');
  const [filterEstado, setFilterEstado] = useState<string>('todas');
  const [selectedFallo, setSelectedFallo] = useState<FalloInforme | null>(null);
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo
  const fallosEjemplo: FalloInforme[] = [
    {
      id: 1,
      equipo: "Bomba centrífuga #1",
      codigoEquipo: "BCP-001",
      tipoFallo: "Desgaste de rodamientos",
      categoriaFallo: "mecanico",
      criticidad: "alta",
      frecuencia: 8.5,
      tiempoPromedioParo: 4.2,
      costoPromedio: 850000,
      totalOcurrencias: 15,
      tendencia: "subiendo",
      ultimaOcurrencia: "2024-11-15",
      impactoProduccion: "alto",
      estadoActual: "recurrente",
      ocurrenciasPorMes: [
        { mes: "Oct", cantidad: 5, tiempoParo: 18, costo: 4250000 },
        { mes: "Nov", cantidad: 6, tiempoParo: 22, costo: 5100000 },
        { mes: "Dic", cantidad: 4, tiempoParo: 15, costo: 3400000 }
      ],
      repuestosAsociados: ["Rodamiento SKF 6205", "Retén de aceite", "Lubricante industrial"],
      causasComunes: ["Falta de lubricación", "Sobrecarga del sistema", "Vibración excesiva"]
    },
    {
      id: 2,
      equipo: "Motor ventilador #3",
      codigoEquipo: "MVE-003",
      tipoFallo: "Sobrecalentamiento bobinado",
      categoriaFallo: "electrico",
      criticidad: "media",
      frecuencia: 3.2,
      tiempoPromedioParo: 6.8,
      costoPromedio: 1200000,
      totalOcurrencias: 8,
      tendencia: "estable",
      ultimaOcurrencia: "2024-11-10",
      impactoProduccion: "medio",
      estadoActual: "resuelto",
      ocurrenciasPorMes: [
        { mes: "Oct", cantidad: 3, tiempoParo: 18, costo: 3600000 },
        { mes: "Nov", cantidad: 3, tiempoParo: 21, costo: 3600000 },
        { mes: "Dic", cantidad: 2, tiempoParo: 14, costo: 2400000 }
      ],
      repuestosAsociados: ["Bobinado motor", "Ventilador de refrigeración", "Termostato"],
      causasComunes: ["Bloqueo de ventilación", "Voltaje inadecuado", "Ambiente polvoriento"]
    },
    {
      id: 3,
      equipo: "Prensa hidráulica",
      codigoEquipo: "PHI-001",
      tipoFallo: "Fuga en cilindro principal",
      categoriaFallo: "hidraulico",
      criticidad: "alta",
      frecuencia: 5.8,
      tiempoPromedioParo: 3.5,
      costoPromedio: 650000,
      totalOcurrencias: 12,
      tendencia: "bajando",
      ultimaOcurrencia: "2024-11-08",
      impactoProduccion: "alto",
      estadoActual: "resuelto",
      ocurrenciasPorMes: [
        { mes: "Oct", cantidad: 5, tiempoParo: 16, costo: 3250000 },
        { mes: "Nov", cantidad: 4, tiempoParo: 12, costo: 2600000 },
        { mes: "Dic", cantidad: 3, tiempoParo: 9, costo: 1950000 }
      ],
      repuestosAsociados: ["Sellos hidráulicos", "Filtro de aceite", "Válvula de presión"],
      causasComunes: ["Desgaste de sellos", "Contaminación del aceite", "Presión excesiva"]
    },
    {
      id: 4,
      equipo: "Transportador #2",
      codigoEquipo: "TRA-002",
      tipoFallo: "Deslizamiento de correa",
      categoriaFallo: "mecanico",
      criticidad: "baja",
      frecuencia: 12.3,
      tiempoPromedioParo: 0.8,
      costoPromedio: 85000,
      totalOcurrencias: 28,
      tendencia: "subiendo",
      ultimaOcurrencia: "2024-11-12",
      impactoProduccion: "bajo",
      estadoActual: "pendiente",
      ocurrenciasPorMes: [
        { mes: "Oct", cantidad: 8, tiempoParo: 6, costo: 680000 },
        { mes: "Nov", cantidad: 10, tiempoParo: 8, costo: 850000 },
        { mes: "Dic", cantidad: 10, tiempoParo: 8, costo: 850000 }
      ],
      repuestosAsociados: ["Correa V tipo A-50", "Tensor de correa", "Polea conductora"],
      causasComunes: ["Tensión inadecuada", "Desgaste natural", "Desalineación de poleas"]
    },
    {
      id: 5,
      equipo: "Sistema de control PLC",
      codigoEquipo: "PLC-001",
      tipoFallo: "Error de comunicación",
      categoriaFallo: "software",
      criticidad: "media",
      frecuencia: 2.1,
      tiempoPromedioParo: 2.3,
      costoPromedio: 450000,
      totalOcurrencias: 6,
      tendencia: "estable",
      ultimaOcurrencia: "2024-11-05",
      impactoProduccion: "medio",
      estadoActual: "resuelto",
      ocurrenciasPorMes: [
        { mes: "Oct", cantidad: 2, tiempoParo: 4, costo: 900000 },
        { mes: "Nov", cantidad: 2, tiempoParo: 5, costo: 900000 },
        { mes: "Dic", cantidad: 2, tiempoParo: 4, costo: 900000 }
      ],
      repuestosAsociados: ["Módulo de comunicación", "Cable Ethernet", "Fuente de alimentación"],
      causasComunes: ["Interferencia electromagnética", "Cable dañado", "Configuración incorrecta"]
    }
  ];

  const estadisticasEjemplo: EstadisticasFallos = {
    totalFallos: 69,
    tiempoTotalParo: 185.4,
    costoTotal: 28750000,
    falloMasFrecuente: "Deslizamiento de correa",
    equipoMasProblematico: "Transportador #2",
    tendenciaGeneral: "subiendo",
    mtbf: 168, // horas
    mttr: 3.2  // horas
  };

  useEffect(() => {
    setFallos(fallosEjemplo);
    setFilteredFallos(fallosEjemplo);
    setEstadisticas(estadisticasEjemplo);
  }, []);

  useEffect(() => {
    let filtered = fallos.filter(fallo => {
      const matchesSearch = fallo.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fallo.codigoEquipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           fallo.tipoFallo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategoria = filterCategoria === 'todas' || fallo.categoriaFallo === filterCategoria;
      const matchesCriticidad = filterCriticidad === 'todas' || fallo.criticidad === filterCriticidad;
      const matchesEstado = filterEstado === 'todas' || fallo.estadoActual === filterEstado;
      
      return matchesSearch && matchesCategoria && matchesCriticidad && matchesEstado;
    });

    setFilteredFallos(filtered);
  }, [searchTerm, filterCategoria, filterCriticidad, filterEstado, fallos]);

  const getCategoriaInfo = (categoria: string) => {
    const categorias: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      mecanico: { label: "Mecánico", color: "default", icon: <Settings className="w-4 h-4" /> },
      electrico: { label: "Eléctrico", color: "destructive", icon: <Zap className="w-4 h-4" /> },
      hidraulico: { label: "Hidráulico", color: "secondary", icon: <BarChart3 className="w-4 h-4" /> },
      neumatico: { label: "Neumático", color: "outline", icon: <TrendingUp className="w-4 h-4" /> },
      software: { label: "Software", color: "default", icon: <Settings className="w-4 h-4" /> },
      operacional: { label: "Operacional", color: "secondary", icon: <Clock className="w-4 h-4" /> }
    };
    return categorias[categoria] || categorias.mecanico;
  };

  const getCriticidadBadge = (criticidad: string) => {
    const variants: Record<string, string> = {
      alta: "destructive",
      media: "default",
      baja: "secondary"
    };
    return variants[criticidad] || "default";
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subiendo': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'bajando': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'estable': return <BarChart3 className="w-4 h-4 text-blue-500" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getImpactoColor = (impacto: string) => {
    switch (impacto) {
      case 'alto': return 'text-red-600';
      case 'medio': return 'text-yellow-600';
      case 'bajo': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const verDetalle = (fallo: FalloInforme) => {
    setSelectedFallo(fallo);
    setDetalleDialogOpen(true);
  };

  const exportarReporte = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Exportando reporte de fallos...');
    }, 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Informe de Fallos</h1>
          <p className="text-muted-foreground">
            Análisis detallado de fallos de equipos y tendencias de mantenimiento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportarReporte} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            {loading ? 'Exportando...' : 'Exportar Reporte'}
          </Button>
        </div>
      </div>

      {/* Estadísticas generales */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Fallos</p>
                  <p className="text-2xl font-bold">{estadisticas.totalFallos}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tiempo Total Paro</p>
                  <p className="text-2xl font-bold">{formatHours(estadisticas.tiempoTotalParo)}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Costo Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(estadisticas.costoTotal)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">MTBF / MTTR</p>
                  <p className="text-xl font-bold">{formatHours(estadisticas.mtbf)} / {formatHours(estadisticas.mttr)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fallos..."
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
                <SelectItem value="mecanico">Mecánico</SelectItem>
                <SelectItem value="electrico">Eléctrico</SelectItem>
                <SelectItem value="hidraulico">Hidráulico</SelectItem>
                <SelectItem value="neumatico">Neumático</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="operacional">Operacional</SelectItem>
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
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todos los estados</SelectItem>
                <SelectItem value="resuelto">Resuelto</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="recurrente">Recurrente</SelectItem>
              </SelectContent>
            </Select>
            <div className="col-span-1">
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterCategoria('todas');
                setFilterCriticidad('todas');
                setFilterEstado('todas');
                setDateRange({
                  from: addDays(new Date(), -30),
                  to: new Date(),
                });
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de fallos */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado de Fallos</CardTitle>
          <CardDescription>
            Registro completo de fallos con análisis de frecuencia y costos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead>Tipo de Fallo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Criticidad</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Tiempo Paro Prom.</TableHead>
                <TableHead>Costo Promedio</TableHead>
                <TableHead>Tendencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFallos.map((fallo) => {
                const categoriaInfo = getCategoriaInfo(fallo.categoriaFallo);
                return (
                  <TableRow key={fallo.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{fallo.equipo}</p>
                        <p className="text-sm text-muted-foreground">{fallo.codigoEquipo}</p>
                      </div>
                    </TableCell>
                    <TableCell>{fallo.tipoFallo}</TableCell>
                    <TableCell>
                      <Badge variant={categoriaInfo.color as any}>
                        {categoriaInfo.icon}
                        <span className="ml-1">{categoriaInfo.label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getCriticidadBadge(fallo.criticidad) as any}>
                        {fallo.criticidad.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {fallo.frecuencia}/mes
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={getImpactoColor(fallo.impactoProduccion)}>
                        {formatHours(fallo.tiempoPromedioParo)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(fallo.costoPromedio)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getTendenciaIcon(fallo.tendencia)}
                        <span className="ml-1 capitalize text-sm">{fallo.tendencia}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        fallo.estadoActual === 'resuelto' ? 'default' :
                        fallo.estadoActual === 'recurrente' ? 'destructive' : 'secondary'
                      }>
                        {fallo.estadoActual}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => verDetalle(fallo)}
                      >
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredFallos.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron fallos en el período seleccionado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top fallos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Fallos Más Frecuentes</CardTitle>
            <CardDescription>Fallos que ocurren con mayor frecuencia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFallos
                .sort((a, b) => b.totalOcurrencias - a.totalOcurrencias)
                .slice(0, 5)
                .map((fallo, index) => (
                  <div key={fallo.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{fallo.equipo}</p>
                        <p className="text-sm text-muted-foreground">{fallo.tipoFallo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{fallo.totalOcurrencias} ocurrencias</p>
                      <p className="text-sm text-muted-foreground">{formatHours(fallo.tiempoPromedioParo)} promedio</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Fallos Más Costosos</CardTitle>
            <CardDescription>Fallos con mayor impacto económico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFallos
                .sort((a, b) => (b.costoPromedio * b.totalOcurrencias) - (a.costoPromedio * a.totalOcurrencias))
                .slice(0, 5)
                .map((fallo, index) => (
                  <div key={fallo.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{fallo.equipo}</p>
                        <p className="text-sm text-muted-foreground">{fallo.tipoFallo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(fallo.costoPromedio * fallo.totalOcurrencias)}</p>
                      <p className="text-sm text-muted-foreground">{fallo.totalOcurrencias} ocurrencias</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de detalle */}
      <Dialog open={detalleDialogOpen} onOpenChange={setDetalleDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalle del Fallo</DialogTitle>
            <DialogDescription>
              Análisis completo del fallo en {selectedFallo?.equipo}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFallo && (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información del Equipo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Equipo:</span>
                      <span>{selectedFallo.equipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Código:</span>
                      <span>{selectedFallo.codigoEquipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tipo de Fallo:</span>
                      <span>{selectedFallo.tipoFallo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Categoría:</span>
                      <Badge variant={getCategoriaInfo(selectedFallo.categoriaFallo).color as any}>
                        {getCategoriaInfo(selectedFallo.categoriaFallo).label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estadísticas del Fallo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Ocurrencias:</span>
                      <Badge variant="outline">{selectedFallo.totalOcurrencias}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Frecuencia:</span>
                      <span>{selectedFallo.frecuencia}/mes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tiempo Paro Promedio:</span>
                      <span>{formatHours(selectedFallo.tiempoPromedioParo)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Costo Promedio:</span>
                      <span>{formatCurrency(selectedFallo.costoPromedio)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Repuestos asociados */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Repuestos Asociados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedFallo.repuestosAsociados.map((repuesto, index) => (
                      <Badge key={index} variant="outline">{repuesto}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Causas comunes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Causas Comunes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedFallo.causasComunes.map((causa, index) => (
                      <li key={index} className="text-sm">{causa}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InformesFallos;