"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, Clock, TrendingUp, BarChart3, Download, Calendar, Filter, AlertTriangle, Settings, Wrench } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface CorrectivoResultado {
  id: number;
  codigoOrden: string;
  tipoMantenimiento: 'correctivo_urgente' | 'correctivo_programado' | 'correctivo_mejora';
  equipo: string;
  codigoEquipo: string;
  problema: string;
  categoriaProblema: 'mecanico' | 'electrico' | 'hidraulico' | 'neumatico' | 'software' | 'estructural';
  fechaReporte: string;
  fechaInicio: string;
  fechaFinalizacion: string;
  tiempoRespuesta: number; // horas desde reporte hasta inicio
  tiempoResolucion: number; // horas desde inicio hasta finalización
  estado: 'exitoso' | 'parcial' | 'fallido' | 'pendiente_seguimiento';
  eficiencia: number; // porcentaje de efectividad
  costoTotal: number;
  tecnicoResponsable: string;
  repuestosUtilizados: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
    costo: number;
  }>;
  accionesRealizadas: string[];
  problemasEncontrados: string[];
  solucionAplicada: string;
  pruebasFuncionamiento: boolean;
  satisfaccionUsuario: number; // 1-5
  recurrencia: 'primera_vez' | 'recurrente' | 'cronica';
  impactoProduccion: 'alto' | 'medio' | 'bajo';
  disponibilidadEquipo: number; // porcentaje post-mantenimiento
  observaciones?: string;
  leccionesAprendidas?: string;
  recomendacionesFuturas?: string;
}

interface EstadisticasCorrectivos {
  totalCorrectivos: number;
  exitosos: number;
  tasaExito: number;
  tiempoPromedioRespuesta: number;
  tiempoPromedioResolucion: number;
  costoPromedio: number;
  satisfaccionPromedio: number;
  disponibilidadPromedio: number;
}

const InformesCorrectivosResultados = () => {
  const [correctivos, setCorrectivos] = useState<CorrectivoResultado[]>([]);
  const [filteredCorrectivos, setFilteredCorrectivos] = useState<CorrectivoResultado[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasCorrectivos | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [selectedCorrectivo, setSelectedCorrectivo] = useState<CorrectivoResultado | null>(null);
  const [detalleDialogOpen, setDetalleDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo
  const correctivosEjemplo: CorrectivoResultado[] = [
    {
      id: 1,
      codigoOrden: "OT-CORR-001",
      tipoMantenimiento: "correctivo_urgente",
      equipo: "Bomba centrífuga #1",
      codigoEquipo: "BCP-001",
      problema: "Vibración excesiva y ruido anormal",
      categoriaProblema: "mecanico",
      fechaReporte: "2024-11-10T08:30:00",
      fechaInicio: "2024-11-10T09:15:00",
      fechaFinalizacion: "2024-11-10T13:30:00",
      tiempoRespuesta: 0.75,
      tiempoResolucion: 4.25,
      estado: "exitoso",
      eficiencia: 95,
      costoTotal: 850000,
      tecnicoResponsable: "Carlos Mendoza",
      repuestosUtilizados: [
        { codigo: "REP-001", descripcion: "Rodamiento SKF 6205", cantidad: 2, costo: 170000 },
        { codigo: "REP-015", descripcion: "Retén de aceite", cantidad: 1, costo: 45000 }
      ],
      accionesRealizadas: [
        "Desmontaje de bomba",
        "Inspección de rodamientos",
        "Reemplazo de rodamientos dañados",
        "Verificación de alineación",
        "Montaje y pruebas"
      ],
      problemasEncontrados: ["Rodamientos con desgaste avanzado", "Falta de lubricación"],
      solucionAplicada: "Reemplazo de rodamientos y mejora del sistema de lubricación",
      pruebasFuncionamiento: true,
      satisfaccionUsuario: 5,
      recurrencia: "recurrente",
      impactoProduccion: "alto",
      disponibilidadEquipo: 98,
      observaciones: "Se implementó programa de lubricación preventiva",
      leccionesAprendidas: "Importancia del mantenimiento preventivo en rodamientos",
      recomendacionesFuturas: "Monitoreo de vibración mensual"
    },
    {
      id: 2,
      codigoOrden: "OT-CORR-002",
      tipoMantenimiento: "correctivo_programado",
      equipo: "Motor ventilador #3",
      codigoEquipo: "MVE-003",
      problema: "Sobrecalentamiento del bobinado",
      categoriaProblema: "electrico",
      fechaReporte: "2024-11-08T14:20:00",
      fechaInicio: "2024-11-09T07:00:00",
      fechaFinalizacion: "2024-11-09T16:30:00",
      tiempoRespuesta: 16.67,
      tiempoResolucion: 9.5,
      estado: "exitoso",
      eficiencia: 90,
      costoTotal: 1200000,
      tecnicoResponsable: "Ana López",
      repuestosUtilizados: [
        { codigo: "REP-020", descripcion: "Bobinado motor 3HP", cantidad: 1, costo: 800000 },
        { codigo: "REP-021", descripcion: "Ventilador refrigeración", cantidad: 1, costo: 150000 }
      ],
      accionesRealizadas: [
        "Desmontaje del motor",
        "Análisis del bobinado",
        "Rebobinado completo",
        "Instalación de ventilador mejorado",
        "Pruebas de funcionamiento"
      ],
      problemasEncontrados: ["Bobinado quemado por sobrecarga", "Ventilación insuficiente"],
      solucionAplicada: "Rebobinado y mejora del sistema de ventilación",
      pruebasFuncionamiento: true,
      satisfaccionUsuario: 4,
      recurrencia: "primera_vez",
      impactoProduccion: "medio",
      disponibilidadEquipo: 95,
      observaciones: "Se mejoró el sistema de ventilación",
      recomendacionesFuturas: "Verificar carga del motor mensualmente"
    },
    {
      id: 3,
      codigoOrden: "OT-CORR-003",
      tipoMantenimiento: "correctivo_urgente",
      equipo: "Prensa hidráulica",
      codigoEquipo: "PHI-001",
      problema: "Fuga masiva de aceite hidráulico",
      categoriaProblema: "hidraulico",
      fechaReporte: "2024-11-12T11:45:00",
      fechaInicio: "2024-11-12T12:30:00",
      fechaFinalizacion: "2024-11-13T10:15:00",
      tiempoRespuesta: 0.75,
      tiempoResolucion: 21.75,
      estado: "parcial",
      eficiencia: 75,
      costoTotal: 650000,
      tecnicoResponsable: "Diego Martín",
      repuestosUtilizados: [
        { codigo: "REP-030", descripcion: "Sellos hidráulicos", cantidad: 4, costo: 320000 },
        { codigo: "REP-031", descripcion: "Aceite hidráulico", cantidad: 20, costo: 200000 }
      ],
      accionesRealizadas: [
        "Identificación del punto de fuga",
        "Reemplazo de sellos principales",
        "Limpieza del sistema",
        "Recarga de aceite hidráulico"
      ],
      problemasEncontrados: ["Sellos deteriorados", "Contaminación del aceite", "Presión irregular"],
      solucionAplicada: "Reemplazo parcial de sellos, pendiente revisión completa",
      pruebasFuncionamiento: true,
      satisfaccionUsuario: 3,
      recurrencia: "recurrente",
      impactoProduccion: "alto",
      disponibilidadEquipo: 85,
      observaciones: "Requiere mantenimiento mayor programado",
      recomendacionesFuturas: "Programar overhaul completo del sistema hidráulico"
    },
    {
      id: 4,
      codigoOrden: "OT-CORR-004",
      tipoMantenimiento: "correctivo_mejora",
      equipo: "Transportador #2",
      codigoEquipo: "TRA-002",
      problema: "Deslizamiento frecuente de correa",
      categoriaProblema: "mecanico",
      fechaReporte: "2024-11-05T09:15:00",
      fechaInicio: "2024-11-06T08:00:00",
      fechaFinalizacion: "2024-11-06T12:30:00",
      tiempoRespuesta: 22.75,
      tiempoResolucion: 4.5,
      estado: "exitoso",
      eficiencia: 98,
      costoTotal: 285000,
      tecnicoResponsable: "Carlos Mendoza",
      repuestosUtilizados: [
        { codigo: "REP-040", descripcion: "Correa V reforzada", cantidad: 2, costo: 120000 },
        { codigo: "REP-041", descripcion: "Tensor automático", cantidad: 1, costo: 85000 }
      ],
      accionesRealizadas: [
        "Análisis de alineación de poleas",
        "Instalación de tensor automático",
        "Reemplazo por correa reforzada",
        "Ajuste de tensión óptima"
      ],
      problemasEncontrados: ["Desalineación de poleas", "Tensión inadecuada"],
      solucionAplicada: "Corrección de alineación e instalación de tensor automático",
      pruebasFuncionamiento: true,
      satisfaccionUsuario: 5,
      recurrencia: "cronica",
      impactoProduccion: "bajo",
      disponibilidadEquipo: 99,
      leccionesAprendidas: "La implementación de tensores automáticos reduce significativamente los problemas recurrentes",
      recomendacionesFuturas: "Aplicar solución similar en otros transportadores"
    },
    {
      id: 5,
      codigoOrden: "OT-CORR-005",
      tipoMantenimiento: "correctivo_urgente",
      equipo: "Sistema PLC Principal",
      codigoEquipo: "PLC-001",
      problema: "Pérdida de comunicación con sensores",
      categoriaProblema: "software",
      fechaReporte: "2024-11-14T15:30:00",
      fechaInicio: "2024-11-14T16:00:00",
      fechaFinalizacion: "2024-11-15T08:30:00",
      tiempoRespuesta: 0.5,
      tiempoResolucion: 16.5,
      estado: "exitoso",
      eficiencia: 92,
      costoTotal: 450000,
      tecnicoResponsable: "Ana López",
      repuestosUtilizados: [
        { codigo: "REP-050", descripcion: "Módulo comunicación", cantidad: 1, costo: 350000 },
        { codigo: "REP-051", descripcion: "Cable Ethernet industrial", cantidad: 50, costo: 75000 }
      ],
      accionesRealizadas: [
        "Diagnóstico del sistema de comunicación",
        "Reemplazo del módulo dañado",
        "Reconfiguración de parámetros",
        "Pruebas de conectividad completas"
      ],
      problemasEncontrados: ["Módulo de comunicación averiado", "Interferencia electromagnética"],
      solucionAplicada: "Reemplazo de módulo y mejora del blindaje",
      pruebasFuncionamiento: true,
      satisfaccionUsuario: 4,
      recurrencia: "primera_vez",
      impactoProduccion: "medio",
      disponibilidadEquipo: 97,
      recomendacionesFuturas: "Implementar sistema de monitoreo de comunicaciones"
    }
  ];

  const estadisticasEjemplo: EstadisticasCorrectivos = {
    totalCorrectivos: 5,
    exitosos: 4,
    tasaExito: 90.0,
    tiempoPromedioRespuesta: 8.1,
    tiempoPromedioResolucion: 11.3,
    costoPromedio: 687000,
    satisfaccionPromedio: 4.2,
    disponibilidadPromedio: 94.8
  };

  useEffect(() => {
    setCorrectivos(correctivosEjemplo);
    setFilteredCorrectivos(correctivosEjemplo);
    setEstadisticas(estadisticasEjemplo);
  }, []);

  useEffect(() => {
    let filtered = correctivos.filter(correctivo => {
      const matchesSearch = correctivo.codigoOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           correctivo.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           correctivo.problema.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           correctivo.tecnicoResponsable.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTipo = filterTipo === 'todos' || correctivo.tipoMantenimiento === filterTipo;
      const matchesEstado = filterEstado === 'todos' || correctivo.estado === filterEstado;
      const matchesCategoria = filterCategoria === 'todas' || correctivo.categoriaProblema === filterCategoria;
      
      return matchesSearch && matchesTipo && matchesEstado && matchesCategoria;
    });

    setFilteredCorrectivos(filtered);
  }, [searchTerm, filterTipo, filterEstado, filterCategoria, correctivos]);

  const getEstadoInfo = (estado: string) => {
    const estados: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      exitoso: { color: "default", icon: <CheckCircle className="w-4 h-4 text-green-500" />, label: "Exitoso" },
      parcial: { color: "secondary", icon: <Clock className="w-4 h-4 text-yellow-500" />, label: "Parcial" },
      fallido: { color: "destructive", icon: <XCircle className="w-4 h-4 text-red-500" />, label: "Fallido" },
      pendiente_seguimiento: { color: "outline", icon: <AlertTriangle className="w-4 h-4 text-orange-500" />, label: "Pend. Seguimiento" }
    };
    return estados[estado] || estados.exitoso;
  };

  const getTipoMantenimientoInfo = (tipo: string) => {
    const tipos: Record<string, { color: string; label: string }> = {
      correctivo_urgente: { color: "destructive", label: "Urgente" },
      correctivo_programado: { color: "default", label: "Programado" },
      correctivo_mejora: { color: "secondary", label: "Mejora" }
    };
    return tipos[tipo] || tipos.correctivo_urgente;
  };

  const getCategoriaInfo = (categoria: string) => {
    const categorias: Record<string, { color: string; icon: React.ReactNode }> = {
      mecanico: { color: "default", icon: <Settings className="w-4 h-4" /> },
      electrico: { color: "destructive", icon: <AlertTriangle className="w-4 h-4" /> },
      hidraulico: { color: "secondary", icon: <BarChart3 className="w-4 h-4" /> },
      neumatico: { color: "outline", icon: <TrendingUp className="w-4 h-4" /> },
      software: { color: "default", icon: <Settings className="w-4 h-4" /> },
      estructural: { color: "secondary", icon: <Wrench className="w-4 h-4" /> }
    };
    return categorias[categoria] || categorias.mecanico;
  };

  const getImpactoColor = (impacto: string) => {
    switch (impacto) {
      case 'alto': return 'text-red-600';
      case 'medio': return 'text-yellow-600';
      case 'bajo': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSatisfaccionStars = (satisfaccion: number) => {
    return '★'.repeat(satisfaccion) + '☆'.repeat(5 - satisfaccion);
  };

  const verDetalle = (correctivo: CorrectivoResultado) => {
    setSelectedCorrectivo(correctivo);
    setDetalleDialogOpen(true);
  };

  const exportarReporte = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Exportando reporte de correctivos...');
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
          <h1 className="text-3xl font-bold">Resultados de Correctivos</h1>
          <p className="text-muted-foreground">
            Análisis de efectividad y resultados de mantenimientos correctivos
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
                  <p className="text-sm font-medium text-muted-foreground">Tasa de Éxito</p>
                  <p className="text-2xl font-bold">{estadisticas.tasaExito.toFixed(1)}%</p>
                  <Progress value={estadisticas.tasaExito} className="mt-2" />
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tiempo Prom. Respuesta</p>
                  <p className="text-2xl font-bold">{formatHours(estadisticas.tiempoPromedioRespuesta)}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Satisfacción Prom.</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold mr-2">{estadisticas.satisfaccionPromedio.toFixed(1)}</p>
                    <span className="text-yellow-500">{getSatisfaccionStars(Math.round(estadisticas.satisfaccionPromedio))}</span>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Disponibilidad Prom.</p>
                  <p className="text-2xl font-bold">{estadisticas.disponibilidadPromedio.toFixed(1)}%</p>
                  <Progress value={estadisticas.disponibilidadPromedio} className="mt-2" />
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
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
                placeholder="Buscar correctivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="correctivo_urgente">Urgente</SelectItem>
                <SelectItem value="correctivo_programado">Programado</SelectItem>
                <SelectItem value="correctivo_mejora">Mejora</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="exitoso">Exitoso</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="fallido">Fallido</SelectItem>
                <SelectItem value="pendiente_seguimiento">Pend. Seguimiento</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategoria} onValueChange={setFilterCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="mecanico">Mecánico</SelectItem>
                <SelectItem value="electrico">Eléctrico</SelectItem>
                <SelectItem value="hidraulico">Hidráulico</SelectItem>
                <SelectItem value="neumatico">Neumático</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="estructural">Estructural</SelectItem>
              </SelectContent>
            </Select>
            <div className="col-span-1">
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterTipo('todos');
                setFilterEstado('todos');
                setFilterCategoria('todas');
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

      {/* Tabla de correctivos */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Resultados por Correctivo</CardTitle>
          <CardDescription>
            Evaluación detallada de la efectividad de cada mantenimiento correctivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Problema</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Eficiencia</TableHead>
                <TableHead>T. Resolución</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Satisfacción</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCorrectivos.map((correctivo) => {
                const estadoInfo = getEstadoInfo(correctivo.estado);
                const tipoInfo = getTipoMantenimientoInfo(correctivo.tipoMantenimiento);
                return (
                  <TableRow key={correctivo.id}>
                    <TableCell className="font-medium">{correctivo.codigoOrden}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{correctivo.equipo}</p>
                        <p className="text-sm text-muted-foreground">{correctivo.codigoEquipo}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={correctivo.problema}>
                      {correctivo.problema}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tipoInfo.color as any}>
                        {tipoInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={estadoInfo.color as any}>
                        {estadoInfo.icon}
                        <span className="ml-1">{estadoInfo.label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={correctivo.eficiencia} className="w-16" />
                        <span className="text-sm font-medium">{correctivo.eficiencia}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getImpactoColor(correctivo.impactoProduccion)}`}>
                        {formatHours(correctivo.tiempoResolucion)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(correctivo.costoTotal)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-1">{correctivo.satisfaccionUsuario}</span>
                        <span className="text-yellow-500 text-sm">
                          {getSatisfaccionStars(correctivo.satisfaccionUsuario)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => verDetalle(correctivo)}
                      >
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredCorrectivos.length === 0 && (
            <div className="text-center py-8">
              <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron correctivos en el período seleccionado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top correctivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Mejor Eficiencia</CardTitle>
            <CardDescription>Correctivos con mayor efectividad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCorrectivos
                .sort((a, b) => b.eficiencia - a.eficiencia)
                .slice(0, 5)
                .map((correctivo, index) => (
                  <div key={correctivo.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{correctivo.codigoOrden}</p>
                        <p className="text-sm text-muted-foreground">{correctivo.equipo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{correctivo.eficiencia}%</p>
                      <p className="text-sm text-muted-foreground">{formatHours(correctivo.tiempoResolucion)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Mayor Satisfacción</CardTitle>
            <CardDescription>Correctivos mejor evaluados por usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCorrectivos
                .sort((a, b) => b.satisfaccionUsuario - a.satisfaccionUsuario)
                .slice(0, 5)
                .map((correctivo, index) => (
                  <div key={correctivo.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{correctivo.codigoOrden}</p>
                        <p className="text-sm text-muted-foreground">{correctivo.equipo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold flex items-center">
                        {correctivo.satisfaccionUsuario}
                        <span className="text-yellow-500 ml-1">
                          {getSatisfaccionStars(correctivo.satisfaccionUsuario)}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">{correctivo.disponibilidadEquipo}% disponib.</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de detalle */}
      <Dialog open={detalleDialogOpen} onOpenChange={setDetalleDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Detalle del Correctivo</DialogTitle>
            <DialogDescription>
              Análisis completo del mantenimiento {selectedCorrectivo?.codigoOrden}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCorrectivo && (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información del Correctivo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Orden:</span>
                      <span>{selectedCorrectivo.codigoOrden}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Equipo:</span>
                      <span>{selectedCorrectivo.equipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Problema:</span>
                      <span className="text-sm">{selectedCorrectivo.problema}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Técnico:</span>
                      <span>{selectedCorrectivo.tecnicoResponsable}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resultados y Métricas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Estado:</span>
                      <Badge variant={getEstadoInfo(selectedCorrectivo.estado).color as any}>
                        {getEstadoInfo(selectedCorrectivo.estado).label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Eficiencia:</span>
                      <span className="font-bold">{selectedCorrectivo.eficiencia}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Satisfacción:</span>
                      <div className="flex items-center">
                        <span className="mr-1">{selectedCorrectivo.satisfaccionUsuario}</span>
                        <span className="text-yellow-500">
                          {getSatisfaccionStars(selectedCorrectivo.satisfaccionUsuario)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Disponibilidad:</span>
                      <span className="font-bold">{selectedCorrectivo.disponibilidadEquipo}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timeline del Correctivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Reporte</p>
                      <p className="text-lg">{new Date(selectedCorrectivo.fechaReporte).toLocaleDateString()}</p>
                      <p className="text-sm">{new Date(selectedCorrectivo.fechaReporte).toLocaleTimeString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Inicio</p>
                      <p className="text-lg">{new Date(selectedCorrectivo.fechaInicio).toLocaleDateString()}</p>
                      <p className="text-sm">{new Date(selectedCorrectivo.fechaInicio).toLocaleTimeString()}</p>
                      <Badge variant="outline" className="mt-1">
                        T. Respuesta: {formatHours(selectedCorrectivo.tiempoRespuesta)}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Finalización</p>
                      <p className="text-lg">{new Date(selectedCorrectivo.fechaFinalizacion).toLocaleDateString()}</p>
                      <p className="text-sm">{new Date(selectedCorrectivo.fechaFinalizacion).toLocaleTimeString()}</p>
                      <Badge variant="outline" className="mt-1">
                        T. Resolución: {formatHours(selectedCorrectivo.tiempoResolucion)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acciones realizadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Acciones Realizadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedCorrectivo.accionesRealizadas.map((accion, index) => (
                      <li key={index} className="text-sm">{accion}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* Repuestos utilizados */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Repuestos Utilizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Costo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCorrectivo.repuestosUtilizados.map((repuesto, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{repuesto.codigo}</TableCell>
                          <TableCell>{repuesto.descripcion}</TableCell>
                          <TableCell>{repuesto.cantidad}</TableCell>
                          <TableCell>{formatCurrency(repuesto.costo)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Lecciones aprendidas y recomendaciones */}
              {(selectedCorrectivo.leccionesAprendidas || selectedCorrectivo.recomendacionesFuturas) && (
                <div className="grid grid-cols-1 gap-6">
                  {selectedCorrectivo.leccionesAprendidas && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Lecciones Aprendidas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{selectedCorrectivo.leccionesAprendidas}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {selectedCorrectivo.recomendacionesFuturas && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Recomendaciones Futuras</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{selectedCorrectivo.recomendacionesFuturas}</p>
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

export default InformesCorrectivosResultados;