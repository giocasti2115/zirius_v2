'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock,
  Shield,
  DollarSign,
  Zap,
  Activity,
  Calendar,
  Wrench,
  CheckCircle2,
  XCircle,
  Target,
  RefreshCw,
  Filter,
  Download,
  Settings
} from 'lucide-react';

// Librerías de gráficos
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface EquipoDashboard {
  id: number;
  nombre: string;
  codigo: string;
  disponibilidad: number; // %
  mtbf: number; // Mean Time Between Failures (horas)
  mttr: number; // Mean Time To Repair (horas)
  ultimoMantenimiento: string;
  proximoMantenimiento: string;
  estado: 'operativo' | 'mantenimiento' | 'falla' | 'calibracion';
  garantiaVigente: boolean;
  costoOperativo: number; // mensual
  horasUso: number; // del mes
  criticidad: 'alta' | 'media' | 'baja';
  alertas: string[];
}

interface MetricasGlobales {
  disponibilidadPromedio: number;
  mtbfPromedio: number;
  equiposCriticos: number;
  costoTotalMensual: number;
  mantenimientosPendientes: number;
  alertasActivas: number;
  eficienciaOperativa: number;
  garantiasVenciendo: number;
}

interface DashboardEquiposRealTimeProps {
  equipos: EquipoDashboard[];
  intervaloActualizacion?: number; // milisegundos
}

export default function DashboardEquiposRealTime({
  equipos = [],
  intervaloActualizacion = 30000
}: DashboardEquiposRealTimeProps) {
  const [equiposData, setEquiposData] = useState<EquipoDashboard[]>([]);
  const [metricas, setMetricas] = useState<MetricasGlobales | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroCriticidad, setFiltroCriticidad] = useState<string>('todas');
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());

  // Datos demo
  const equiposDemo: EquipoDashboard[] = [
    {
      id: 1,
      nombre: 'Ventilador Draeger V500',
      codigo: 'VEN001',
      disponibilidad: 98.5,
      mtbf: 2400,
      mttr: 4.2,
      ultimoMantenimiento: '2024-11-10',
      proximoMantenimiento: '2024-12-10',
      estado: 'operativo',
      garantiaVigente: true,
      costoOperativo: 1200,
      horasUso: 680,
      criticidad: 'alta',
      alertas: []
    },
    {
      id: 2,
      nombre: 'Monitor Philips IntelliVue',
      codigo: 'MON002',
      disponibilidad: 94.2,
      mtbf: 1800,
      mttr: 6.5,
      ultimoMantenimiento: '2024-11-05',
      proximoMantenimiento: '2024-11-25',
      estado: 'mantenimiento',
      garantiaVigente: true,
      costoOperativo: 800,
      horasUso: 720,
      criticidad: 'alta',
      alertas: ['Mantenimiento programado en curso']
    },
    {
      id: 3,
      nombre: 'Desfibrilador ZOLL',
      codigo: 'DEF003',
      disponibilidad: 89.8,
      mtbf: 960,
      mttr: 12.3,
      ultimoMantenimiento: '2024-10-15',
      proximoMantenimiento: '2024-11-18',
      estado: 'falla',
      garantiaVigente: false,
      costoOperativo: 600,
      horasUso: 480,
      criticidad: 'media',
      alertas: ['Falla en batería', 'Garantía vencida']
    },
    {
      id: 4,
      nombre: 'Bomba de Infusión B.Braun',
      codigo: 'BOM004',
      disponibilidad: 97.1,
      mtbf: 3200,
      mttr: 3.8,
      ultimoMantenimiento: '2024-11-12',
      proximoMantenimiento: '2024-12-12',
      estado: 'operativo',
      garantiaVigente: true,
      costoOperativo: 400,
      horasUso: 650,
      criticidad: 'media',
      alertas: []
    },
    {
      id: 5,
      nombre: 'Electrocardiógrafo Schiller',
      codigo: 'ECG005',
      disponibilidad: 92.3,
      mtbf: 1440,
      mttr: 8.7,
      ultimoMantenimiento: '2024-11-01',
      proximoMantenimiento: '2024-11-20',
      estado: 'calibracion',
      garantiaVigente: true,
      costoOperativo: 300,
      horasUso: 320,
      criticidad: 'baja',
      alertas: ['Calibración pendiente']
    }
  ];

  useEffect(() => {
    // Cargar datos iniciales
    const datosIniciales = equipos.length > 0 ? equipos : equiposDemo;
    setEquiposData(datosIniciales);
    calcularMetricas(datosIniciales);

    // Configurar actualización automática
    const interval = setInterval(() => {
      actualizarDatos();
    }, intervaloActualizacion);

    return () => clearInterval(interval);
  }, [equipos, intervaloActualizacion]);

  const calcularMetricas = (datos: EquipoDashboard[]) => {
    const metricas: MetricasGlobales = {
      disponibilidadPromedio: datos.reduce((acc, eq) => acc + eq.disponibilidad, 0) / datos.length,
      mtbfPromedio: datos.reduce((acc, eq) => acc + eq.mtbf, 0) / datos.length,
      equiposCriticos: datos.filter(eq => eq.criticidad === 'alta' && eq.estado !== 'operativo').length,
      costoTotalMensual: datos.reduce((acc, eq) => acc + eq.costoOperativo, 0),
      mantenimientosPendientes: datos.filter(eq => {
        const fecha = new Date(eq.proximoMantenimiento);
        const hoy = new Date();
        return fecha <= new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
      }).length,
      alertasActivas: datos.reduce((acc, eq) => acc + eq.alertas.length, 0),
      eficienciaOperativa: datos.filter(eq => eq.disponibilidad > 95).length / datos.length * 100,
      garantiasVenciendo: datos.filter(eq => !eq.garantiaVigente).length
    };

    setMetricas(metricas);
  };

  const actualizarDatos = () => {
    // Simular actualización en tiempo real
    setEquiposData(prevData => 
      prevData.map(equipo => ({
        ...equipo,
        disponibilidad: Math.max(85, Math.min(100, equipo.disponibilidad + (Math.random() - 0.5) * 2)),
        horasUso: equipo.horasUso + Math.floor(Math.random() * 3)
      }))
    );
    setUltimaActualizacion(new Date());
  };

  // Datos para gráficos
  const datosDisponibilidad = equiposData.map(eq => ({
    nombre: eq.codigo,
    disponibilidad: eq.disponibilidad,
    mtbf: eq.mtbf
  }));

  const datosCostos = equiposData.map(eq => ({
    nombre: eq.codigo,
    costo: eq.costoOperativo,
    horas: eq.horasUso
  }));

  const datosEstados = [
    { name: 'Operativo', value: equiposData.filter(eq => eq.estado === 'operativo').length, color: '#10B981' },
    { name: 'Mantenimiento', value: equiposData.filter(eq => eq.estado === 'mantenimiento').length, color: '#F59E0B' },
    { name: 'Falla', value: equiposData.filter(eq => eq.estado === 'falla').length, color: '#EF4444' },
    { name: 'Calibración', value: equiposData.filter(eq => eq.estado === 'calibracion').length, color: '#8B5CF6' }
  ];

  const datosHistoricos = [
    { mes: 'Jul', disponibilidad: 94.2, costos: 3200, mtbf: 2100 },
    { mes: 'Ago', disponibilidad: 95.8, costos: 3100, mtbf: 2300 },
    { mes: 'Sep', disponibilidad: 93.1, costos: 3400, mtbf: 2000 },
    { mes: 'Oct', disponibilidad: 96.5, costos: 2900, mtbf: 2400 },
    { mes: 'Nov', disponibilidad: metricas?.disponibilidadPromedio || 95, costos: metricas?.costoTotalMensual || 3300, mtbf: metricas?.mtbfPromedio || 2200 }
  ];

  const equiposFiltrados = equiposData.filter(equipo => {
    const matchEstado = filtroEstado === 'todos' || equipo.estado === filtroEstado;
    const matchCriticidad = filtroCriticidad === 'todas' || equipo.criticidad === filtroCriticidad;
    return matchEstado && matchCriticidad;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'operativo': return 'bg-green-500';
      case 'mantenimiento': return 'bg-yellow-500';
      case 'falla': return 'bg-red-500';
      case 'calibracion': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCriticidadBadge = (criticidad: string) => {
    switch (criticidad) {
      case 'alta': return 'destructive';
      case 'media': return 'default';
      case 'baja': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="w-6 h-6 text-emerald-600" />
                Dashboard en Tiempo Real
              </h2>
              <p className="text-sm text-gray-600">
                Última actualización: {ultimaActualizacion.toLocaleTimeString()}
              </p>
            </div>
            
            <div className="flex gap-3">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="todos">Todos los estados</option>
                <option value="operativo">Operativo</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="falla">Falla</option>
                <option value="calibracion">Calibración</option>
              </select>
              
              <select
                value={filtroCriticidad}
                onChange={(e) => setFiltroCriticidad(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="todas">Todas las criticidades</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
              
              <Button size="sm" variant="outline" onClick={actualizarDatos}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principales */}
      {metricas && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Disponibilidad</p>
                  <p className="text-xl font-bold text-green-600">
                    {metricas.disponibilidadPromedio.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">MTBF Promedio</p>
                  <p className="text-xl font-bold text-blue-600">
                    {Math.round(metricas.mtbfPromedio)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Críticos</p>
                  <p className="text-xl font-bold text-red-600">
                    {metricas.equiposCriticos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Costo Mensual</p>
                  <p className="text-xl font-bold text-purple-600">
                    ${metricas.costoTotalMensual.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Mantenimientos</p>
                  <p className="text-xl font-bold text-orange-600">
                    {metricas.mantenimientosPendientes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Alertas</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {metricas.alertasActivas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-indigo-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Eficiencia</p>
                  <p className="text-xl font-bold text-indigo-600">
                    {metricas.eficienciaOperativa.toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">Sin Garantía</p>
                  <p className="text-xl font-bold text-gray-600">
                    {metricas.garantiasVenciendo}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Disponibilidad por Equipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Disponibilidad por Equipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosDisponibilidad}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip />
                  <Bar dataKey="disponibilidad" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Estados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Distribución de Estados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosEstados}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {datosEstados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Tendencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia Histórica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Tendencias Históricas (5 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosHistoricos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="disponibilidad" stroke="#10B981" name="Disponibilidad %" />
                  <Line type="monotone" dataKey="mtbf" stroke="#3B82F6" name="MTBF (horas)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Costos Operativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              Costos Operativos vs Horas de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datosCostos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="costo" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla Detallada de Equipos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Detalles de Equipos ({equiposFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Equipo</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Disponibilidad</th>
                  <th className="text-left p-3">MTBF</th>
                  <th className="text-left p-3">MTTR</th>
                  <th className="text-left p-3">Próximo Mant.</th>
                  <th className="text-left p-3">Costo/Mes</th>
                  <th className="text-left p-3">Criticidad</th>
                  <th className="text-left p-3">Alertas</th>
                </tr>
              </thead>
              <tbody>
                {equiposFiltrados.map((equipo) => (
                  <tr key={equipo.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{equipo.nombre}</div>
                        <div className="text-gray-500">{equipo.codigo}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getEstadoColor(equipo.estado)}`}></div>
                        <span className="capitalize">{equipo.estado}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${equipo.disponibilidad}%` }}
                          ></div>
                        </div>
                        <span className="font-medium">{equipo.disponibilidad.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{equipo.mtbf}h</td>
                    <td className="p-3 font-medium">{equipo.mttr}h</td>
                    <td className="p-3">
                      {new Date(equipo.proximoMantenimiento).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-medium">
                      ${equipo.costoOperativo.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <Badge variant={getCriticidadBadge(equipo.criticidad)}>
                        {equipo.criticidad}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {equipo.alertas.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 font-medium">{equipo.alertas.length}</span>
                        </div>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}