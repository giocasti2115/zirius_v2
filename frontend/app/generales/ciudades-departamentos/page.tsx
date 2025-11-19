'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, MapPin, Building, Globe2, Users } from 'lucide-react';

interface Departamento {
  id: number;
  nombre: string;
  codigo: string;
  region: string;
  activo: boolean;
  total_ciudades: number;
  total_clientes: number;
  fecha_creacion: string;
}

interface Ciudad {
  id: number;
  nombre: string;
  departamento_id: number;
  departamento_nombre: string;
  codigo_postal?: string;
  activo: boolean;
  total_clientes: number;
  total_sedes: number;
  fecha_creacion: string;
}

export default function CiudadesDepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('departamentos');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Departamento | Ciudad | null>(null);

  const [newDepartamento, setNewDepartamento] = useState({
    nombre: '',
    codigo: '',
    region: ''
  });

  const [newCiudad, setNewCiudad] = useState({
    nombre: '',
    departamento_id: 0,
    codigo_postal: ''
  });

  const regiones = [
    'Región Caribe', 'Región Pacífica', 'Región Andina', 
    'Región Orinoquía', 'Región Amazonía', 'Región Insular'
  ];

  // Datos de fallback para desarrollo
  const departamentosFallback: Departamento[] = [
    {
      id: 1, nombre: 'Antioquia', codigo: 'ANT', region: 'Región Andina',
      activo: true, total_ciudades: 125, total_clientes: 45,
      fecha_creacion: '2024-01-10T00:00:00Z'
    },
    {
      id: 2, nombre: 'Cundinamarca', codigo: 'CUN', region: 'Región Andina',
      activo: true, total_ciudades: 116, total_clientes: 78,
      fecha_creacion: '2024-01-10T00:00:00Z'
    },
    {
      id: 3, nombre: 'Valle del Cauca', codigo: 'VAC', region: 'Región Pacífica',
      activo: true, total_ciudades: 42, total_clientes: 34,
      fecha_creacion: '2024-01-10T00:00:00Z'
    },
    {
      id: 4, nombre: 'Atlántico', codigo: 'ATL', region: 'Región Caribe',
      activo: true, total_ciudades: 23, total_clientes: 28,
      fecha_creacion: '2024-01-10T00:00:00Z'
    },
    {
      id: 5, nombre: 'Santander', codigo: 'SAN', region: 'Región Andina',
      activo: true, total_ciudades: 87, total_clientes: 22,
      fecha_creacion: '2024-01-10T00:00:00Z'
    }
  ];

  const ciudadesFallback: Ciudad[] = [
    {
      id: 1, nombre: 'Medellín', departamento_id: 1, departamento_nombre: 'Antioquia',
      codigo_postal: '050001', activo: true, total_clientes: 25, total_sedes: 67,
      fecha_creacion: '2024-01-10T00:00:00Z'
    },
    {
      id: 2, nombre: 'Bogotá D.C.', departamento_id: 2, departamento_nombre: 'Cundinamarca',
      codigo_postal: '110111', activo: true, total_clientes: 45, total_sedes: 128,
      fecha_creacion: '2024-01-10T00:00:00Z'
    },
    {
      id: 3, nombre: 'Cali', departamento_id: 3, departamento_nombre: 'Valle del Cauca',
      codigo_postal: '760001', activo: true, total_clientes: 18, total_sedes: 42,
      fecha_creacion: '2024-01-10T00:00:00Z'
    },
    {
      id: 4, nombre: 'Barranquilla', departamento_id: 4, departamento_nombre: 'Atlántico',
      codigo_postal: '080001', activo: true, total_clientes: 15, total_sedes: 38,
      fecha_creacion: '2024-01-10T00:00:00Z'
    },
    {
      id: 5, nombre: 'Bucaramanga', departamento_id: 5, departamento_nombre: 'Santander',
      codigo_postal: '680001', activo: true, total_clientes: 12, total_sedes: 29,
      fecha_creacion: '2024-01-10T00:00:00Z'
    },
    {
      id: 6, nombre: 'Bello', departamento_id: 1, departamento_nombre: 'Antioquia',
      codigo_postal: '051001', activo: true, total_clientes: 8, total_sedes: 15,
      fecha_creacion: '2024-01-10T00:00:00Z'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDepartamentos(departamentosFallback);
      setCiudades(ciudadesFallback);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartamentos = departamentos.filter(dept => {
    const matchesSearch = dept.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || dept.region === selectedRegion;
    const matchesActive = showInactive || dept.activo;
    
    return matchesSearch && matchesRegion && matchesActive;
  });

  const filteredCiudades = ciudades.filter(ciudad => {
    const matchesSearch = ciudad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ciudad.departamento_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartamento = !selectedDepartamento || ciudad.departamento_id.toString() === selectedDepartamento;
    const matchesActive = showInactive || ciudad.activo;
    
    return matchesSearch && matchesDepartamento && matchesActive;
  });

  const getRegionColor = (region: string) => {
    const colors: { [key: string]: string } = {
      'Región Caribe': 'bg-blue-100 text-blue-800',
      'Región Pacífica': 'bg-green-100 text-green-800',
      'Región Andina': 'bg-purple-100 text-purple-800',
      'Región Orinoquía': 'bg-yellow-100 text-yellow-800',
      'Región Amazonía': 'bg-emerald-100 text-emerald-800',
      'Región Insular': 'bg-cyan-100 text-cyan-800'
    };
    return colors[region] || 'bg-gray-100 text-gray-800';
  };

  const totalDepartamentos = departamentos.length;
  const totalCiudades = ciudades.length;
  const totalClientes = departamentos.reduce((sum, dept) => sum + dept.total_clientes, 0);
  const totalSedes = ciudades.reduce((sum, ciudad) => sum + ciudad.total_sedes, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ciudades y Departamentos</h1>
          <p className="text-gray-600 mt-1">Configure las ubicaciones geográficas del sistema</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo {activeTab === 'departamentos' ? 'Departamento' : 'Ciudad'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Crear {activeTab === 'departamentos' ? 'Nuevo Departamento' : 'Nueva Ciudad'}
              </DialogTitle>
            </DialogHeader>
            
            {activeTab === 'departamentos' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={newDepartamento.nombre}
                    onChange={(e) => setNewDepartamento({...newDepartamento, nombre: e.target.value})}
                    placeholder="Antioquia"
                  />
                </div>
                
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={newDepartamento.codigo}
                    onChange={(e) => setNewDepartamento({...newDepartamento, codigo: e.target.value.toUpperCase()})}
                    placeholder="ANT"
                    maxLength={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="region">Región *</Label>
                  <Select
                    value={newDepartamento.region}
                    onValueChange={(value) => setNewDepartamento({...newDepartamento, region: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar región" />
                    </SelectTrigger>
                    <SelectContent>
                      {regiones.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={() => {
                    console.log('Crear departamento:', newDepartamento);
                    setIsCreateDialogOpen(false);
                  }} 
                  className="w-full"
                >
                  Crear Departamento
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre-ciudad">Nombre *</Label>
                  <Input
                    id="nombre-ciudad"
                    value={newCiudad.nombre}
                    onChange={(e) => setNewCiudad({...newCiudad, nombre: e.target.value})}
                    placeholder="Medellín"
                  />
                </div>
                
                <div>
                  <Label htmlFor="departamento">Departamento *</Label>
                  <Select
                    value={newCiudad.departamento_id.toString()}
                    onValueChange={(value) => setNewCiudad({...newCiudad, departamento_id: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map(dept => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="codigo-postal">Código Postal</Label>
                  <Input
                    id="codigo-postal"
                    value={newCiudad.codigo_postal}
                    onChange={(e) => setNewCiudad({...newCiudad, codigo_postal: e.target.value})}
                    placeholder="050001"
                  />
                </div>
                
                <Button 
                  onClick={() => {
                    console.log('Crear ciudad:', newCiudad);
                    setIsCreateDialogOpen(false);
                  }} 
                  className="w-full"
                >
                  Crear Ciudad
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe2 className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalDepartamentos}</p>
                <p className="text-sm text-gray-600">Departamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCiudades}</p>
                <p className="text-sm text-gray-600">Ciudades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalClientes}</p>
                <p className="text-sm text-gray-600">Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalSedes}</p>
                <p className="text-sm text-gray-600">Sedes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {activeTab === 'departamentos' && (
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por región" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las regiones</SelectItem>
                  {regiones.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {activeTab === 'ciudades' && (
              <Select value={selectedDepartamento} onValueChange={setSelectedDepartamento}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los departamentos</SelectItem>
                  {departamentos.map(dept => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive">Mostrar inactivos</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="departamentos">Departamentos</TabsTrigger>
          <TabsTrigger value="ciudades">Ciudades</TabsTrigger>
        </TabsList>

        <TabsContent value="departamentos">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Departamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Región</TableHead>
                        <TableHead>Ciudades</TableHead>
                        <TableHead>Clientes</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDepartamentos.map((departamento) => (
                        <TableRow key={departamento.id}>
                          <TableCell>
                            <div className="font-medium">{departamento.nombre}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {departamento.codigo}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRegionColor(departamento.region)}>
                              {departamento.region}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold">{departamento.total_ciudades}</span>
                              <span className="text-gray-500">ciudades</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold">{departamento.total_clientes}</span>
                              <span className="text-gray-500">clientes</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={departamento.activo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                              }
                            >
                              {departamento.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem(departamento)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ciudades">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Ciudades</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ciudad</TableHead>
                        <TableHead>Departamento</TableHead>
                        <TableHead>Código Postal</TableHead>
                        <TableHead>Clientes</TableHead>
                        <TableHead>Sedes</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCiudades.map((ciudad) => (
                        <TableRow key={ciudad.id}>
                          <TableCell>
                            <div className="font-medium">{ciudad.nombre}</div>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-600">{ciudad.departamento_nombre}</span>
                          </TableCell>
                          <TableCell>
                            {ciudad.codigo_postal ? (
                              <Badge variant="outline" className="font-mono">
                                {ciudad.codigo_postal}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">Sin código</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold">{ciudad.total_clientes}</span>
                              <span className="text-gray-500">clientes</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold">{ciudad.total_sedes}</span>
                              <span className="text-gray-500">sedes</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={ciudad.activo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                              }
                            >
                              {ciudad.activo ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem(ciudad)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de edición */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Editar {'region' in editingItem ? 'Departamento' : 'Ciudad'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editingItem.nombre}
                  onChange={(e) => setEditingItem({...editingItem, nombre: e.target.value})}
                />
              </div>
              
              {'region' in editingItem ? (
                <>
                  <div>
                    <Label htmlFor="edit-codigo">Código</Label>
                    <Input
                      id="edit-codigo"
                      value={editingItem.codigo}
                      onChange={(e) => setEditingItem({...editingItem, codigo: e.target.value.toUpperCase()})}
                      maxLength={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-region">Región</Label>
                    <Select
                      value={editingItem.region}
                      onValueChange={(value) => setEditingItem({...editingItem, region: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {regiones.map(region => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="edit-codigo-postal">Código Postal</Label>
                    <Input
                      id="edit-codigo-postal"
                      value={(editingItem as Ciudad).codigo_postal || ''}
                      onChange={(e) => setEditingItem({...editingItem, codigo_postal: e.target.value})}
                    />
                  </div>
                </>
              )}
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-activo"
                  checked={editingItem.activo}
                  onCheckedChange={(checked) => setEditingItem({...editingItem, activo: checked})}
                />
                <Label htmlFor="edit-activo">Activo</Label>
              </div>
              
              <Button onClick={() => {
                console.log('Actualizar:', editingItem);
                setEditingItem(null);
              }} className="w-full">
                Actualizar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}