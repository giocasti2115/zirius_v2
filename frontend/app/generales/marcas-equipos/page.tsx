'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Building2, Globe, Package } from 'lucide-react';
import { GeneralesService, Marca } from '@/lib/services/generales.service';

export default function MarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMarca, setEditingMarca] = useState<Marca | null>(null);

  const [newMarca, setNewMarca] = useState({
    nombre: '',
    descripcion: '',
    pais_origen: ''
  });

  const paisesMedicos = [
    'Estados Unidos', 'Alemania', 'Países Bajos', 'Japón', 'Suecia', 
    'Reino Unido', 'Francia', 'Italia', 'Suiza', 'China', 'Corea del Sur',
    'Brasil', 'México', 'Colombia', 'España', 'Canadá', 'Australia'
  ];

  useEffect(() => {
    loadMarcas();
  }, [searchTerm, showInactive]);

  const loadMarcas = async () => {
    try {
      setLoading(true);
      const data = await GeneralesService.getMarcas({
        search: searchTerm || undefined,
        activo: showInactive ? undefined : true
      });
      setMarcas(data);
    } catch (error) {
      console.error('Error cargando marcas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMarca = async () => {
    try {
      if (!newMarca.nombre) {
        alert('El nombre es requerido');
        return;
      }

      await GeneralesService.createMarca(newMarca);
      setIsCreateDialogOpen(false);
      setNewMarca({
        nombre: '',
        descripcion: '',
        pais_origen: ''
      });
      loadMarcas();
    } catch (error) {
      console.error('Error creando marca:', error);
      alert('Error al crear la marca');
    }
  };

  const getPaisFlag = (pais?: string) => {
    const flags: { [key: string]: string } = {
      'Estados Unidos': '🇺🇸',
      'Alemania': '🇩🇪',
      'Países Bajos': '🇳🇱',
      'Japón': '🇯🇵',
      'Suecia': '🇸🇪',
      'Reino Unido': '🇬🇧',
      'Francia': '🇫🇷',
      'Italia': '🇮🇹',
      'Suiza': '🇨🇭',
      'China': '🇨🇳',
      'Corea del Sur': '🇰🇷',
      'Brasil': '🇧🇷',
      'México': '🇲🇽',
      'Colombia': '🇨🇴',
      'España': '🇪🇸',
      'Canadá': '🇨🇦',
      'Australia': '🇦🇺'
    };
    
    return flags[pais || ''] || '🌍';
  };

  const totalEquipos = marcas.reduce((sum, marca) => sum + marca.total_equipos, 0);
  const marcasActivas = marcas.filter(marca => marca.activo).length;
  const paisesUnicos = new Set(marcas.map(m => m.pais_origen).filter(Boolean)).size;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marcas de Equipos</h1>
          <p className="text-gray-600 mt-1">Gestione las marcas de equipos médicos del sistema</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Marca
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nueva Marca</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={newMarca.nombre}
                  onChange={(e) => setNewMarca({...newMarca, nombre: e.target.value})}
                  placeholder="Philips"
                />
              </div>
              
              <div>
                <Label htmlFor="pais">País de Origen</Label>
                <Input
                  id="pais"
                  value={newMarca.pais_origen}
                  onChange={(e) => setNewMarca({...newMarca, pais_origen: e.target.value})}
                  placeholder="Países Bajos"
                  list="paises"
                />
                <datalist id="paises">
                  {paisesMedicos.map(pais => (
                    <option key={pais} value={pais} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={newMarca.descripcion}
                  onChange={(e) => setNewMarca({...newMarca, descripcion: e.target.value})}
                  placeholder="Descripción de la marca..."
                  rows={3}
                />
              </div>
              
              <Button onClick={handleCreateMarca} className="w-full">
                Crear Marca
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{marcas.length}</p>
                <p className="text-sm text-gray-600">Total Marcas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{marcasActivas}</p>
                <p className="text-sm text-gray-600">Marcas Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{paisesUnicos}</p>
                <p className="text-sm text-gray-600">Países</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalEquipos}</p>
                <p className="text-sm text-gray-600">Equipos Registrados</p>
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
                  placeholder="Buscar marcas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive">Mostrar inactivas</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de marcas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Marcas</CardTitle>
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
                    <TableHead>Marca</TableHead>
                    <TableHead>País de Origen</TableHead>
                    <TableHead>Equipos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marcas.map((marca) => (
                    <TableRow key={marca.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-lg">{marca.nombre}</div>
                          {marca.descripcion && (
                            <div className="text-sm text-gray-500 mt-1">
                              {marca.descripcion}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {marca.pais_origen ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getPaisFlag(marca.pais_origen)}</span>
                            <span>{marca.pais_origen}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No especificado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-lg">{marca.total_equipos}</span>
                          <span className="text-gray-500">equipos</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={marca.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        >
                          {marca.activo ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingMarca(marca)}
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

      {/* Dialog de edición */}
      {editingMarca && (
        <Dialog open={!!editingMarca} onOpenChange={() => setEditingMarca(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Marca</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editingMarca.nombre}
                  onChange={(e) => setEditingMarca({...editingMarca, nombre: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-pais">País de Origen</Label>
                <Input
                  id="edit-pais"
                  value={editingMarca.pais_origen || ''}
                  onChange={(e) => setEditingMarca({...editingMarca, pais_origen: e.target.value})}
                  list="paises-edit"
                />
                <datalist id="paises-edit">
                  {paisesMedicos.map(pais => (
                    <option key={pais} value={pais} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Textarea
                  id="edit-descripcion"
                  value={editingMarca.descripcion || ''}
                  onChange={(e) => setEditingMarca({...editingMarca, descripcion: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-activo"
                  checked={editingMarca.activo}
                  onCheckedChange={(checked) => setEditingMarca({...editingMarca, activo: checked})}
                />
                <Label htmlFor="edit-activo">Activa</Label>
              </div>
              
              <Button onClick={() => {
                // Implementar actualización
                setEditingMarca(null);
              }} className="w-full">
                Actualizar Marca
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Top marcas por equipos */}
      {marcas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Marcas por Número de Equipos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marcas
                .sort((a, b) => b.total_equipos - a.total_equipos)
                .slice(0, 5)
                .map((marca, index) => (
                  <div key={marca.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getPaisFlag(marca.pais_origen)}</span>
                        <div>
                          <div className="font-medium">{marca.nombre}</div>
                          <div className="text-sm text-gray-500">{marca.pais_origen}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">{marca.total_equipos}</div>
                      <div className="text-sm text-gray-500">equipos</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}