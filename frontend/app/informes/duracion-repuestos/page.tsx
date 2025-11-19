"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, TrendingUp, TrendingDown, BarChart3, Download, Calendar, Filter, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DuracionRepuesto {
  id: number;
  codigoRepuesto: string;
  descripcionRepuesto: string;
  categoria: string;
  equipo: string;
  codigoEquipo: string;
  fechaInstalacion: string;
  fechaRemplazo?: string;
  duracionDias: number;
  duracionHoras: number;
  horasOperacion: number;
  estado: 'activo' | 'reemplazado' | 'en_revision';
  valorRepuesto: number;
  costoPorHora: number;
  eficiencia: 'excelente' | 'buena' | 'regular' | 'mala';
  motivoRemplazo?: string;
  condicionRemplazo?: 'desgaste_normal' | 'falla_prematura' | 'mantenimiento_preventivo' | 'accidente';
  proveedor: string;
  loteProduccion?: string;
  observaciones?: string;
  duracionEsperada: number; // en días
  rendimiento: number; // porcentaje respecto a duración esperada
}

interface EstadisticasDuracion {
  duracionPromedio: number;
  duracionMasLarga: number;
  duracionMasCorta: number;
  eficienciaPromedio: number;
  repuestoMasEficiente: string;
  repuestoMenosEficiente: string;
  costoPorHoraPromedio: number;
  totalRepuestosAnalizados: number;
}

const InformesDuracionRepuestos = () => {
  const [repuestos, setRepuestos] = useState<DuracionRepuesto[]>([]);
  const [filteredRepuestos, setFilteredRepuestos] = useState<DuracionRepuesto[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasDuracion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [filterEstado, setFilterEstado] = useState<string>('todas');
  const [filterEficiencia, setFilterEficiencia] = useState<string>('todas');
  const [selectedRepuesto, setSelectedRepuesto] = useState<DuracionRepuesto | null>(null);
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -90),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo
  const repuestosEjemplo: DuracionRepuesto[] = [
    {
      id: 1,
      codigoRepuesto: "REP-001",
      descripcionRepuesto: "Rodamiento SKF 6205",
      categoria: "Rodamientos",
      equipo: "Bomba centrífuga #1",
      codigoEquipo: "BCP-001",
      fechaInstalacion: "2024-08-15",
      fechaRemplazo: "2024-11-10",
      duracionDias: 87,
      duracionHoras: 2088,
      horasOperacion: 1950,
      estado: "reemplazado",
      valorRepuesto: 85000,
      costoPorHora: 43.6,
      eficiencia: "buena",
      motivoRemplazo: "Desgaste natural por horas de operación",
      condicionRemplazo: "desgaste_normal",
      proveedor: "SKF Colombia",
      loteProduccion: "SKF-2024-Q3-001",
      duracionEsperada: 90,
      rendimiento: 96.7
    },
    {
      id: 2,
      codigoRepuesto: "REP-002",
      descripcionRepuesto: "Correa V tipo A-50",
      categoria: "Transmisión",
      equipo: "Transportador #2",
      codigoEquipo: "TRA-002",
      fechaInstalacion: "2024-09-01",
      fechaRemplazo: "2024-10-15",
      duracionDias: 44,
      duracionHoras: 1056,
      horasOperacion: 880,
      estado: "reemplazado",
      valorRepuesto: 45000,
      costoPorHora: 51.1,
      eficiencia: "regular",
      motivoRemplazo: "Deslizamiento constante y pérdida de tensión",
      condicionRemplazo: "falla_prematura",
      proveedor: "Gates Industrial",
      loteProduccion: "GAT-2024-235",
      observaciones: "Posible problema de alineación de poleas",
      duracionEsperada: 75,
      rendimiento: 58.7
    },
    {
      id: 3,
      codigoRepuesto: "REP-003",
      descripcionRepuesto: "Filtro de aceite hidráulico",
      categoria: "Filtros",
      equipo: "Prensa hidráulica",
      codigoEquipo: "PHI-001",
      fechaInstalacion: "2024-07-20",
      fechaRemplazo: "2024-11-05",
      duracionDias: 108,
      duracionHoras: 2592,
      horasOperacion: 2160,
      estado: "reemplazado",
      valorRepuesto: 120000,
      costoPorHora: 55.6,
      eficiencia: "excelente",
      motivoRemplazo: "Mantenimiento preventivo programado",
      condicionRemplazo: "mantenimiento_preventivo",
      proveedor: "Parker Hannifin",
      loteProduccion: "PAR-HYD-2024-198",
      duracionEsperada: 100,
      rendimiento: 108.0
    },
    {
      id: 4,
      codigoRepuesto: "REP-004",
      descripcionRepuesto: "Sensor de temperatura PT100",
      categoria: "Instrumentación",
      equipo: "Horno industrial",
      codigoEquipo: "HOR-001",
      fechaInstalacion: "2024-06-10",
      duracionDias: 161,
      duracionHoras: 3864,
      horasOperacion: 3200,
      estado: "activo",
      valorRepuesto: 250000,
      costoPorHora: 78.1,
      eficiencia: "excelente",
      proveedor: "Siemens",
      loteProduccion: "SIE-PT100-2024-087",
      observaciones: "Funcionamiento óptimo, lecturas estables",
      duracionEsperada: 180,
      rendimiento: 89.4
    },
    {
      id: 5,
      codigoRepuesto: "REP-005",
      descripcionRepuesto: "Válvula solenoide 24VDC",
      categoria: "Válvulas",
      equipo: "Sistema neumático #1",
      codigoEquipo: "NEU-001",
      fechaInstalacion: "2024-10-01",
      fechaRemplazo: "2024-10-25",
      duracionDias: 24,
      duracionHoras: 576,
      horasOperacion: 480,
      estado: "reemplazado",
      valorRepuesto: 380000,
      costoPorHora: 791.7,
      eficiencia: "mala",
      motivoRemplazo: "Falla eléctrica inesperada - bobinado quemado",
      condicionRemplazo: "falla_prematura",
      proveedor: "ASCO Numatics",
      loteProduccion: "ASC-24V-2024-445",
      observaciones: "Posible sobrevoltaje en la red eléctrica",
      duracionEsperada: 120,
      rendimiento: 20.0
    },
    {
      id: 6,
      codigoRepuesto: "REP-006",
      descripcionRepuesto: "Contactores 24V",
      categoria: "Eléctricos",
      equipo: "Motor ventilador #3",
      codigoEquipo: "MVE-003",
      fechaInstalacion: "2024-05-15",
      duracionDias: 187,
      duracionHoras: 4488,
      horasOperacion: 3740,
      estado: "activo",
      valorRepuesto: 180000,
      costoPorHora: 48.1,
      eficiencia: "excelente",
      proveedor: "Schneider Electric",
      loteProduccion: "SCH-CNT-2024-156",
      duracionEsperada: 200,
      rendimiento: 93.5
    }
  ];

  const estadisticasEjemplo: EstadisticasDuracion = {
    duracionPromedio: 101.8,
    duracionMasLarga: 187,
    duracionMasCorta: 24,
    eficienciaPromedio: 82.1,
    repuestoMasEficiente: "Filtro de aceite hidráulico",
    repuestoMenosEficiente: "Válvula solenoide 24VDC",
    costoPorHoraPromedio: 178.0,
    totalRepuestosAnalizados: 6
  };

  useEffect(() => {
    setRepuestos(repuestosEjemplo);
    setFilteredRepuestos(repuestosEjemplo);
    setEstadisticas(estadisticasEjemplo);
  }, []);

  useEffect(() => {
    let filtered = repuestos.filter(repuesto => {
      const matchesSearch = repuesto.codigoRepuesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repuesto.descripcionRepuesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repuesto.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repuesto.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategoria = filterCategoria === 'todas' || repuesto.categoria === filterCategoria;
      const matchesEstado = filterEstado === 'todas' || repuesto.estado === filterEstado;
      const matchesEficiencia = filterEficiencia === 'todas' || repuesto.eficiencia === filterEficiencia;
      
      return matchesSearch && matchesCategoria && matchesEstado && matchesEficiencia;
    });

    setFilteredRepuestos(filtered);
  }, [searchTerm, filterCategoria, filterEstado, filterEficiencia, repuestos]);

  const getEficienciaInfo = (eficiencia: string) => {
    const eficiencias: Record<string, { color: string; icon: React.ReactNode }> = {
      excelente: { color: "default", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
      buena: { color: "secondary", icon: <CheckCircle className="w-4 h-4 text-blue-500" /> },
      regular: { color: "outline", icon: <Clock className="w-4 h-4 text-yellow-500" /> },
      mala: { color: "destructive", icon: <AlertTriangle className="w-4 h-4 text-red-500" /> }
    };
    return eficiencias[eficiencia] || eficiencias.regular;
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, string> = {
      activo: "default",
      reemplazado: "secondary",
      en_revision: "outline"
    };
    return variants[estado] || "default";
  };

  const getRendimientoColor = (rendimiento: number) => {
    if (rendimiento >= 90) return 'text-green-600';
    if (rendimiento >= 70) return 'text-blue-600';
    if (rendimiento >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const verDetalle = (repuesto: DuracionRepuesto) => {
    setSelectedRepuesto(repuesto);
    setDetalleDialogOpen(true);
  };

  const exportarReporte = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Exportando reporte de duración de repuestos...');
    }, 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDuration = (days: number) => {
    if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return remainingDays > 0 ? `${months}m ${remainingDays}d` : `${months}m`;
    }
    return `${days}d`;
  };

  const categorias = Array.from(new Set(repuestos.map(r => r.categoria)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Duración de Repuestos</h1>
          <p className="text-muted-foreground">
            Análisis de vida útil y eficiencia de repuestos instalados
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
                  <p className="text-sm font-medium text-muted-foreground">Duración Promedio</p>
                  <p className="text-2xl font-bold">{formatDuration(estadisticas.duracionPromedio)}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eficiencia Promedio</p>
                  <p className="text-2xl font-bold">{estadisticas.eficienciaPromedio.toFixed(1)}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Costo/Hora Promedio</p>
                  <p className="text-2xl font-bold">{formatCurrency(estadisticas.costoPorHoraPromedio)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Repuestos Analizados</p>
                  <p className="text-2xl font-bold">{estadisticas.totalRepuestosAnalizados}</p>
                </div>
                <Package className="w-8 h-8 text-orange-500" />
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
                <SelectItem value="reemplazado">Reemplazado</SelectItem>
                <SelectItem value="en_revision">En Revisión</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEficiencia} onValueChange={setFilterEficiencia}>
              <SelectTrigger>
                <SelectValue placeholder="Eficiencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="excelente">Excelente</SelectItem>
                <SelectItem value="buena">Buena</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="mala">Mala</SelectItem>
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
                setFilterEstado('todas');
                setFilterEficiencia('todas');
                setDateRange({
                  from: addDays(new Date(), -90),
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

      {/* Tabla de repuestos */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Duración por Repuesto</CardTitle>
          <CardDescription>
            Registro detallado de la vida útil y rendimiento de cada repuesto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Horas Op.</TableHead>
                <TableHead>Rendimiento</TableHead>
                <TableHead>Costo/Hora</TableHead>
                <TableHead>Eficiencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepuestos.map((repuesto) => {
                const eficienciaInfo = getEficienciaInfo(repuesto.eficiencia);
                return (
                  <TableRow key={repuesto.id}>
                    <TableCell className="font-medium">{repuesto.codigoRepuesto}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{repuesto.descripcionRepuesto}</p>
                        <p className="text-sm text-muted-foreground">{repuesto.categoria}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{repuesto.equipo}</p>
                        <p className="text-sm text-muted-foreground">{repuesto.codigoEquipo}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatDuration(repuesto.duracionDias)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{repuesto.horasOperacion.toLocaleString()}h</span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${getRendimientoColor(repuesto.rendimiento)}`}>
                        {repuesto.rendimiento.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(repuesto.costoPorHora)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={eficienciaInfo.color as any}>
                        {eficienciaInfo.icon}
                        <span className="ml-1 capitalize">{repuesto.eficiencia}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadge(repuesto.estado) as any}>
                        {repuesto.estado.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => verDetalle(repuesto)}
                      >
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredRepuestos.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron repuestos en el período seleccionado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top repuestos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Mayor Duración</CardTitle>
            <CardDescription>Repuestos con mejor vida útil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRepuestos
                .sort((a, b) => b.duracionDias - a.duracionDias)
                .slice(0, 5)
                .map((repuesto, index) => (
                  <div key={repuesto.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{repuesto.descripcionRepuesto}</p>
                        <p className="text-sm text-muted-foreground">{repuesto.equipo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatDuration(repuesto.duracionDias)}</p>
                      <p className="text-sm text-muted-foreground">{repuesto.horasOperacion.toLocaleString()}h</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Mejor Rendimiento</CardTitle>
            <CardDescription>Repuestos con mejor eficiencia vs esperado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRepuestos
                .sort((a, b) => b.rendimiento - a.rendimiento)
                .slice(0, 5)
                .map((repuesto, index) => (
                  <div key={repuesto.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{repuesto.descripcionRepuesto}</p>
                        <p className="text-sm text-muted-foreground">{repuesto.equipo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getRendimientoColor(repuesto.rendimiento)}`}>
                        {repuesto.rendimiento.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">{formatDuration(repuesto.duracionDias)}</p>
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
            <DialogTitle>Detalle de Duración del Repuesto</DialogTitle>
            <DialogDescription>
              Análisis completo de {selectedRepuesto?.descripcionRepuesto}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRepuesto && (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información del Repuesto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Código:</span>
                      <span>{selectedRepuesto.codigoRepuesto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Descripción:</span>
                      <span>{selectedRepuesto.descripcionRepuesto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Categoría:</span>
                      <span>{selectedRepuesto.categoria}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Proveedor:</span>
                      <span>{selectedRepuesto.proveedor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Lote:</span>
                      <span>{selectedRepuesto.loteProduccion || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rendimiento y Duración</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Duración Real:</span>
                      <Badge variant="outline">{formatDuration(selectedRepuesto.duracionDias)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Duración Esperada:</span>
                      <span>{formatDuration(selectedRepuesto.duracionEsperada)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Rendimiento:</span>
                      <span className={`font-bold ${getRendimientoColor(selectedRepuesto.rendimiento)}`}>
                        {selectedRepuesto.rendimiento.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Horas de Operación:</span>
                      <span>{selectedRepuesto.horasOperacion.toLocaleString()}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Costo por Hora:</span>
                      <span>{formatCurrency(selectedRepuesto.costoPorHora)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fechas importantes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline de Instalación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Fecha Instalación</p>
                      <p className="text-lg font-bold">{new Date(selectedRepuesto.fechaInstalacion).toLocaleDateString()}</p>
                    </div>
                    {selectedRepuesto.fechaRemplazo && (
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">Fecha Reemplazo</p>
                        <p className="text-lg font-bold">{new Date(selectedRepuesto.fechaRemplazo).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Estado Actual</p>
                      <Badge variant={getEstadoBadge(selectedRepuesto.estado) as any}>
                        {selectedRepuesto.estado.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Motivo de reemplazo y observaciones */}
              {(selectedRepuesto.motivoRemplazo || selectedRepuesto.observaciones) && (
                <div className="grid grid-cols-1 gap-6">
                  {selectedRepuesto.motivoRemplazo && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Motivo de Reemplazo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{selectedRepuesto.motivoRemplazo}</p>
                        {selectedRepuesto.condicionRemplazo && (
                          <Badge variant="outline" className="mt-2">
                            {selectedRepuesto.condicionRemplazo.replace('_', ' ')}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  {selectedRepuesto.observaciones && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Observaciones</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{selectedRepuesto.observaciones}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InformesDuracionRepuestos;