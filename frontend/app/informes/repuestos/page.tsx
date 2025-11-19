"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Package, TrendingUp, TrendingDown, BarChart3, Download, Calendar, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { es } from "date-fns/locale";

interface RepuestoInforme {
  id: number;
  codigo: string;
  descripcion: string;
  categoria: string;
  totalConsumido: number;
  costoTotal: number;
  frecuenciaUso: number;
  stockActual: number;
  valorPromedio: number;
  proveedorPrincipal: string;
  equiposPrincipales: string[];
  tendencia: 'subiendo' | 'bajando' | 'estable';
  ultimoConsumo: string;
  consumoPorMes: Array<{
    mes: string;
    cantidad: number;
    costo: number;
  }>;
}

interface EstadisticaGeneral {
  totalRepuestos: number;
  consumoTotal: number;
  costoTotal: number;
  repuestoMasUsado: string;
  repuestoMasCostoso: string;
  tendenciaGeneral: 'subiendo' | 'bajando' | 'estable';
}

const InformesRepuestos = () => {
  const [repuestos, setRepuestos] = useState<RepuestoInforme[]>([]);
  const [filteredRepuestos, setFilteredRepuestos] = useState<RepuestoInforme[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticaGeneral | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('todas');
  const [filterTendencia, setFilterTendencia] = useState<string>('todas');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo
  const repuestosEjemplo: RepuestoInforme[] = [
    {
      id: 1,
      codigo: "REP-001",
      descripcion: "Rodamiento SKF 6205",
      categoria: "Rodamientos",
      totalConsumido: 45,
      costoTotal: 3825000,
      frecuenciaUso: 8.5,
      stockActual: 12,
      valorPromedio: 85000,
      proveedorPrincipal: "SKF Colombia",
      equiposPrincipales: ["Bomba centrífuga #1", "Motor ventilador #3", "Compresor principal"],
      tendencia: "subiendo",
      ultimoConsumo: "2024-11-15",
      consumoPorMes: [
        { mes: "Oct", cantidad: 15, costo: 1275000 },
        { mes: "Nov", cantidad: 18, costo: 1530000 },
        { mes: "Dic", cantidad: 12, costo: 1020000 }
      ]
    },
    {
      id: 2,
      codigo: "REP-002",
      descripcion: "Correa V tipo A-50",
      categoria: "Transmisión",
      totalConsumido: 38,
      costoTotal: 1710000,
      frecuenciaUso: 6.3,
      stockActual: 25,
      valorPromedio: 45000,
      proveedorPrincipal: "Gates Industrial",
      equiposPrincipales: ["Transportador #2", "Ventilador extractor"],
      tendencia: "estable",
      ultimoConsumo: "2024-11-12",
      consumoPorMes: [
        { mes: "Oct", cantidad: 12, costo: 540000 },
        { mes: "Nov", cantidad: 13, costo: 585000 },
        { mes: "Dic", cantidad: 13, costo: 585000 }
      ]
    },
    {
      id: 3,
      codigo: "REP-003",
      descripcion: "Filtro de aceite hidráulico",
      categoria: "Filtros",
      totalConsumido: 28,
      costoTotal: 3360000,
      frecuenciaUso: 4.7,
      stockActual: 8,
      valorPromedio: 120000,
      proveedorPrincipal: "Parker Hannifin",
      equiposPrincipales: ["Prensa hidráulica", "Elevador de carga", "Sistema hidráulico principal"],
      tendencia: "bajando",
      ultimoConsumo: "2024-11-08",
      consumoPorMes: [
        { mes: "Oct", cantidad: 12, costo: 1440000 },
        { mes: "Nov", cantidad: 8, costo: 960000 },
        { mes: "Dic", cantidad: 8, costo: 960000 }
      ]
    },
    {
      id: 4,
      codigo: "REP-004",
      descripcion: "Sensor de temperatura PT100",
      categoria: "Instrumentación",
      totalConsumido: 15,
      costoTotal: 3750000,
      frecuenciaUso: 2.5,
      stockActual: 5,
      valorPromedio: 250000,
      proveedorPrincipal: "Siemens",
      equiposPrincipales: ["Horno industrial", "Caldero", "Sistema de control"],
      tendencia: "subiendo",
      ultimoConsumo: "2024-11-10",
      consumoPorMes: [
        { mes: "Oct", cantidad: 4, costo: 1000000 },
        { mes: "Nov", cantidad: 6, costo: 1500000 },
        { mes: "Dic", cantidad: 5, costo: 1250000 }
      ]
    },
    {
      id: 5,
      codigo: "REP-005",
      descripcion: "Válvula solenoide 24VDC",
      categoria: "Válvulas",
      totalConsumido: 22,
      costoTotal: 8360000,
      frecuenciaUso: 3.7,
      stockActual: 3,
      valorPromedio: 380000,
      proveedorPrincipal: "ASCO Numatics",
      equiposPrincipales: ["Sistema neumático #1", "Línea de proceso A"],
      tendencia: "estable",
      ultimoConsumo: "2024-11-01",
      consumoPorMes: [
        { mes: "Oct", cantidad: 8, costo: 3040000 },
        { mes: "Nov", cantidad: 7, costo: 2660000 },
        { mes: "Dic", cantidad: 7, costo: 2660000 }
      ]
    }
  ];

  const estadisticasEjemplo: EstadisticaGeneral = {
    totalRepuestos: 148,
    consumoTotal: 21005000,
    costoTotal: 21005000,
    repuestoMasUsado: "Rodamiento SKF 6205",
    repuestoMasCostoso: "Válvula solenoide 24VDC",
    tendenciaGeneral: "subiendo"
  };

  useEffect(() => {
    setRepuestos(repuestosEjemplo);
    setFilteredRepuestos(repuestosEjemplo);
    setEstadisticas(estadisticasEjemplo);
  }, []);

  useEffect(() => {
    let filtered = repuestos.filter(repuesto => {
      const matchesSearch = repuesto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repuesto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repuesto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           repuesto.proveedorPrincipal.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategoria = filterCategoria === 'todas' || repuesto.categoria === filterCategoria;
      const matchesTendencia = filterTendencia === 'todas' || repuesto.tendencia === filterTendencia;
      
      return matchesSearch && matchesCategoria && matchesTendencia;
    });

    setFilteredRepuestos(filtered);
  }, [searchTerm, filterCategoria, filterTendencia, repuestos]);

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subiendo': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'bajando': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'estable': return <BarChart3 className="w-4 h-4 text-blue-500" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getTendenciaBadge = (tendencia: string) => {
    const variants: Record<string, string> = {
      subiendo: "destructive",
      bajando: "default",
      estable: "secondary"
    };
    return variants[tendencia] || "default";
  };

  const exportarReporte = () => {
    setLoading(true);
    // Simular exportación
    setTimeout(() => {
      setLoading(false);
      // Aquí iría la lógica real de exportación
      console.log('Exportando reporte de repuestos...');
    }, 2000);
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
          <h1 className="text-3xl font-bold">Informe de Repuestos</h1>
          <p className="text-muted-foreground">
            Análisis detallado del consumo y tendencias de repuestos
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
                  <p className="text-sm font-medium text-muted-foreground">Total Repuestos</p>
                  <p className="text-2xl font-bold">{estadisticas.totalRepuestos}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consumo Total</p>
                  <p className="text-2xl font-bold">{estadisticas.consumoTotal.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
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
                  <p className="text-sm font-medium text-muted-foreground">Tendencia General</p>
                  <div className="flex items-center mt-1">
                    {getTendenciaIcon(estadisticas.tendenciaGeneral)}
                    <span className="ml-2 capitalize">{estadisticas.tendenciaGeneral}</span>
                  </div>
                </div>
                {getTendenciaIcon(estadisticas.tendenciaGeneral)}
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <Select value={filterTendencia} onValueChange={setFilterTendencia}>
              <SelectTrigger>
                <SelectValue placeholder="Tendencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las tendencias</SelectItem>
                <SelectItem value="subiendo">Subiendo</SelectItem>
                <SelectItem value="bajando">Bajando</SelectItem>
                <SelectItem value="estable">Estable</SelectItem>
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
                setFilterTendencia('todas');
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

      {/* Tabla de repuestos */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado por Repuesto</CardTitle>
          <CardDescription>
            Consumo, costos y tendencias de cada repuesto en el período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Consumo Total</TableHead>
                <TableHead>Costo Total</TableHead>
                <TableHead>Freq. Uso</TableHead>
                <TableHead>Stock Actual</TableHead>
                <TableHead>Tendencia</TableHead>
                <TableHead>Último Uso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepuestos.map((repuesto) => (
                <TableRow key={repuesto.id}>
                  <TableCell className="font-medium">{repuesto.codigo}</TableCell>
                  <TableCell>{repuesto.descripcion}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{repuesto.categoria}</Badge>
                  </TableCell>
                  <TableCell className="font-bold">{repuesto.totalConsumido}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(repuesto.costoTotal)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {repuesto.frecuenciaUso}/mes
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={repuesto.stockActual <= 5 ? "destructive" : "default"}>
                      {repuesto.stockActual}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTendenciaBadge(repuesto.tendencia) as any}>
                      {getTendenciaIcon(repuesto.tendencia)}
                      <span className="ml-1 capitalize">{repuesto.tendencia}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(repuesto.ultimoConsumo).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
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
            <CardTitle>Top 5 - Más Consumidos</CardTitle>
            <CardDescription>Repuestos con mayor consumo en el período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRepuestos
                .sort((a, b) => b.totalConsumido - a.totalConsumido)
                .slice(0, 5)
                .map((repuesto, index) => (
                  <div key={repuesto.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{repuesto.codigo}</p>
                        <p className="text-sm text-muted-foreground">{repuesto.descripcion}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{repuesto.totalConsumido} unidades</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(repuesto.costoTotal)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 - Más Costosos</CardTitle>
            <CardDescription>Repuestos con mayor impacto económico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRepuestos
                .sort((a, b) => b.costoTotal - a.costoTotal)
                .slice(0, 5)
                .map((repuesto, index) => (
                  <div key={repuesto.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{repuesto.codigo}</p>
                        <p className="text-sm text-muted-foreground">{repuesto.descripcion}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(repuesto.costoTotal)}</p>
                      <p className="text-sm text-muted-foreground">{repuesto.totalConsumido} unidades</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InformesRepuestos;