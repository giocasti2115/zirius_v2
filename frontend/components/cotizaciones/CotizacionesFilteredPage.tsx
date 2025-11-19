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
  FileText, 
  DollarSign, 
  Calendar,
  User,
  Eye,
  Edit,
  Download,
  ArrowLeft,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { cotizacionesService, Cotizacion } from '@/lib/services/cotizaciones.service';
import { CotizacionesStats } from './CotizacionesStats';

interface CotizacionesFilteredPageProps {
  title: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  description: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  emptyMessage: string;
}

export function CotizacionesFilteredPage({ 
  title, 
  estado, 
  description, 
  badgeVariant, 
  emptyMessage 
}: CotizacionesFilteredPageProps) {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const filteredCotizaciones = cotizaciones.filter(cotizacion =>
    cotizacion.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cotizacion.id.toString().includes(searchTerm) ||
    cotizacion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const cargarCotizaciones = async () => {
      try {
        setLoading(true);
        const response = await cotizacionesService.obtenerCotizaciones({
          page: currentPage,
          limit: 10,
          estado: estado
        });
        
        if (response.success && response.data) {
          setCotizaciones(response.data.cotizaciones);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error('Error cargando cotizaciones:', error);
        // Datos mock basados en el estado
        setCotizaciones(generateMockData(estado));
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    cargarCotizaciones();
  }, [currentPage, estado]);

  const generateMockData = (estado: string): Cotizacion[] => {
    const baseData = [
      {
        id: 1,
        cliente_id: 1,
        cliente_nombre: 'Clínica Dental Norte',
        descripcion: 'Mantenimiento preventivo anual',
        valor_total: 2500000,
        fecha_creacion: '2024-01-15',
        fecha_vencimiento: '2024-02-15',
        estado: estado as any,
        usuario_creador: 'Juan Pérez'
      },
      {
        id: 2,
        cliente_id: 2,
        cliente_nombre: 'Hospital San José',
        descripcion: 'Reparación de equipo de rayos X',
        valor_total: 4800000,
        fecha_creacion: '2024-01-20',
        fecha_vencimiento: '2024-02-20',
        estado: estado as any,
        usuario_creador: 'María González'
      },
      {
        id: 3,
        cliente_id: 3,
        cliente_nombre: 'Centro Médico Sur',
        descripcion: 'Instalación de nuevo equipo',
        valor_total: 15000000,
        fecha_creacion: '2024-01-25',
        fecha_vencimiento: '2024-02-25',
        estado: estado as any,
        usuario_creador: 'Carlos López'
      }
    ];

    return baseData;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'aprobada':
        return <Badge variant="default" className="bg-green-100 text-green-700">Aprobada</Badge>;
      case 'rechazada':
        return <Badge variant="destructive">Rechazada</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/cotizaciones">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
        <Badge variant={badgeVariant} className="text-lg px-4 py-2">
          {filteredCotizaciones.length} cotizaciones
        </Badge>
      </div>

      {/* Estadísticas */}
      <CotizacionesStats estado={estado} />

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente, ID o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Lista de Cotizaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCotizaciones.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{emptyMessage}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado por</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCotizaciones.map((cotizacion) => (
                  <TableRow key={cotizacion.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">#{cotizacion.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {cotizacion.cliente_nombre}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={cotizacion.descripcion}>
                        {cotizacion.descripcion}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(cotizacion.valor_total)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(cotizacion.fecha_creacion)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(cotizacion.fecha_vencimiento)}
                      </div>
                    </TableCell>
                    <TableCell>{getEstadoBadge(cotizacion.estado)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {cotizacion.usuario_creador}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}