'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  Building2, 
  Users, 
  MapPin,
  Phone,
  Mail,
  Filter,
  Eye,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { clientesService, Cliente } from '@/lib/services/clientes.service';

export default function ClientesPage() {
  // Estados principales
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  
  // Estados de paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(25);
  const [totalRegistros, setTotalRegistros] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, [paginaActual, registrosPorPagina]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroTipo, filtroEstado]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando clientes...');
      
      const [clientesData, estadisticasData] = await Promise.all([
        clientesService.obtenerClientes({ 
          limit: registrosPorPagina,
          page: paginaActual,
          nombre: busqueda || undefined,
          tipo: filtroTipo || undefined,
          estado: filtroEstado || undefined
        }),
        clientesService.obtenerEstadisticas()
      ]);

      if (clientesData.success) {
        setClientes(clientesData.data.clientes);
        setTotalRegistros(clientesData.data.total);
        console.log('✅ Clientes cargados:', clientesData.data.clientes.length);
      } else {
        setError('Error cargando clientes');
      }

      if (estadisticasData.success) {
        setEstadisticas(estadisticasData.data);
      }
      
    } catch (error) {
      console.error('❌ Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    cargarDatos();
  };

  // Funciones de paginación
  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
  const paginaAnterior = () => setPaginaActual(prev => Math.max(prev - 1, 1));
  const paginaSiguiente = () => setPaginaActual(prev => Math.min(prev + 1, totalPaginas));
  const irAPagina = (pagina: number) => setPaginaActual(pagina);

  const getTipoBadge = (tipo: string) => {
    const colores = {
      'hospital': 'bg-red-50 text-red-700 border-red-200',
      'clinica': 'bg-blue-50 text-blue-700 border-blue-200',
      'ips': 'bg-green-50 text-green-700 border-green-200',
      'particular': 'bg-purple-50 text-purple-700 border-purple-200'
    };

    return (
      <Badge variant="outline" className={colores[tipo as keyof typeof colores] || 'bg-gray-50 text-gray-700 border-gray-200'}>
        {tipo?.charAt(0).toUpperCase() + tipo?.slice(1)}
      </Badge>
    );
  };

  const getEstadoBadge = (estado: string) => {
    return (
      <Badge 
        variant={estado === 'activo' ? 'default' : 'secondary'}
        className={estado === 'activo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
      >
        {estado === 'activo' ? 'Activo' : 'Inactivo'}
      </Badge>
    );
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && clientes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">
            Administra la información de clientes y centros médicos
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total || 0}</p>
                <p className="text-xs text-gray-600">Total Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.activos || 0}</p>
                <p className="text-xs text-gray-600">Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.hospitales || 0}</p>
                <p className="text-xs text-gray-600">Hospitales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.clinicas || 0}</p>
                <p className="text-xs text-gray-600">Clínicas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="hospital">Hospital</option>
                <option value="clinica">Clínica</option>
                <option value="ips">IPS</option>
                <option value="particular">Particular</option>
              </select>
            </div>
            <div>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div>
              <Button onClick={handleBuscar} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Listado de Clientes ({totalRegistros.toLocaleString()} total)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Ciudad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Solicitudes</TableHead>
                        <TableHead>Fecha Registro</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientes.map((cliente) => (
                        <TableRow key={cliente.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-xs">
                            {cliente.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{cliente.nombre}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {cliente.email}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {cliente.telefono}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTipoBadge(cliente.tipo)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{cliente.contacto_principal}</div>
                            <div className="text-xs text-gray-500">{cliente.nit}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{cliente.ciudad}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getEstadoBadge(cliente.estado)}
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="text-sm font-medium">{cliente.total_solicitudes}</div>
                              <div className="text-xs text-gray-500">{cliente.total_ordenes} órdenes</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {formatearFecha(cliente.fecha_registro)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Información de Registros y Paginación */}
              {totalRegistros > 0 && (
                <div className="flex items-center justify-between px-2 py-3 border-t bg-gray-50 rounded-b-lg">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      Mostrando {((paginaActual - 1) * registrosPorPagina) + 1} a{' '}
                      {Math.min(paginaActual * registrosPorPagina, totalRegistros)} de{' '}
                      {totalRegistros.toLocaleString()} registros
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Filas por página:</span>
                      <select 
                        value={registrosPorPagina}
                        onChange={(e) => {
                          setRegistrosPorPagina(Number(e.target.value));
                          setPaginaActual(1);
                        }}
                        className="px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  
                  {totalPaginas > 1 && (
                    <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={paginaAnterior}
                      disabled={paginaActual === 1}
                      className="px-3 py-1 text-sm"
                    >
                      Anterior
                    </Button>
                    
                    {/* Números de página */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                        const pagina = i + 1;
                        return (
                          <Button
                            key={pagina}
                            variant={paginaActual === pagina ? "default" : "outline"}
                            size="sm"
                            onClick={() => irAPagina(pagina)}
                            className="px-3 py-1 text-sm w-8"
                          >
                            {pagina}
                          </Button>
                        );
                      })}
                      {totalPaginas > 5 && (
                        <>
                          <span className="px-2 py-1 text-sm text-gray-500">...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => irAPagina(totalPaginas)}
                            className="px-3 py-1 text-sm"
                          >
                            {totalPaginas}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={paginaSiguiente}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-1 text-sm"
                    >
                      Siguiente
                    </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
