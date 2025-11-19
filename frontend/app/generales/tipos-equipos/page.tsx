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
import { Search, Plus, Edit, Trash2, Package, Hash, Tag } from 'lucide-react';
import { GeneralesService, TipoEquipo } from '@/lib/services/generales.service';

export default function TiposEquiposPage() {
  const [tipos, setTipos] = useState<TipoEquipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoEquipo | null>(null);

  const [newTipo, setNewTipo] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    categoria: ''
  });

  useEffect(() => {
    loadTipos();
  }, [searchTerm, showInactive]);

  const loadTipos = async () => {
    try {
      setLoading(true);
      const data = await GeneralesService.getTiposEquipos({
        search: searchTerm || undefined,
        activo: showInactive ? undefined : true
      });
      setTipos(data);
    } catch (error) {
      console.error('Error cargando tipos de equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTipo = async () => {
    try {
      if (!newTipo.nombre || !newTipo.codigo) {
        alert('Nombre y código son requeridos');
        return;
      }

      await GeneralesService.createTipoEquipo(newTipo);
      setIsCreateDialogOpen(false);
      setNewTipo({
        nombre: '',
        descripcion: '',
        codigo: '',
        categoria: ''
      });
      loadTipos();
    } catch (error) {
      console.error('Error creando tipo de equipo:', error);
      alert('Error al crear el tipo de equipo');
    }
  };

  const getCategoriaColor = (categoria?: string) => {
    if (!categoria) return 'bg-gray-100 text-gray-800';
    
    const colors: { [key: string]: string } = {
      'Monitoreo': 'bg-blue-100 text-blue-800',
      'Respiratorio': 'bg-green-100 text-green-800',
      'Infusión': 'bg-purple-100 text-purple-800',
      'Diagnóstico': 'bg-orange-100 text-orange-800',
      'Quirúrgico': 'bg-red-100 text-red-800',
      'Laboratorio': 'bg-yellow-100 text-yellow-800',
      'Rehabilitación': 'bg-pink-100 text-pink-800'
    };
    
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  const totalEquipos = tipos.reduce((sum, tipo) => sum + tipo.total_equipos, 0);
  const tiposActivos = tipos.filter(tipo => tipo.activo).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tipos de Equipos</h1>
          <p className="text-gray-600 mt-1">Gestione los tipos de equipos médicos del sistema</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Tipo de Equipo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={newTipo.nombre}
                  onChange={(e) => setNewTipo({...newTipo, nombre: e.target.value})}
                  placeholder="Monitor de Signos Vitales"
                />
              </div>
              
              <div>
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={newTipo.codigo}
                  onChange={(e) => setNewTipo({...newTipo, codigo: e.target.value.toUpperCase()})}
                  placeholder="MSV"
                />
              </div>
              
              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  value={newTipo.categoria}
                  onChange={(e) => setNewTipo({...newTipo, categoria: e.target.value})}
                  placeholder="Monitoreo"
                />
              </div>
              
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={newTipo.descripcion}
                  onChange={(e) => setNewTipo({...newTipo, descripcion: e.target.value})}
                  placeholder="Descripción del tipo de equipo..."
                  rows={3}
                />
              </div>
              
              <Button onClick={handleCreateTipo} className="w-full">
                Crear Tipo de Equipo
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
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{tipos.length}</p>
                <p className="text-sm text-gray-600">Total Tipos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Tag className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{tiposActivos}</p>
                <p className="text-sm text-gray-600">Tipos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Hash className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalEquipos}</p>
                <p className="text-sm text-gray-600">Equipos Registrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(tipos.map(t => t.categoria).filter(Boolean)).size}
                </p>
                <p className="text-sm text-gray-600">Categorías</p>
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
                  placeholder="Buscar tipos de equipos..."
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
              <Label htmlFor="show-inactive">Mostrar inactivos</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de tipos de equipos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tipos de Equipos</CardTitle>
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
                    <TableHead>Tipo de Equipo</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Equipos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tipos.map((tipo) => (
                    <TableRow key={tipo.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tipo.nombre}</div>
                          {tipo.descripcion && (
                            <div className="text-sm text-gray-500 mt-1">
                              {tipo.descripcion}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {tipo.codigo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tipo.categoria ? (
                          <Badge className={getCategoriaColor(tipo.categoria)}>
                            {tipo.categoria}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">Sin categoría</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{tipo.total_equipos}</span>
                          <span className="text-gray-500">equipos</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={tipo.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        >
                          {tipo.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTipo(tipo)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
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
      {editingTipo && (
        <Dialog open={!!editingTipo} onOpenChange={() => setEditingTipo(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Tipo de Equipo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editingTipo.nombre}
                  onChange={(e) => setEditingTipo({...editingTipo, nombre: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-codigo">Código</Label>
                <Input
                  id="edit-codigo"
                  value={editingTipo.codigo}
                  onChange={(e) => setEditingTipo({...editingTipo, codigo: e.target.value.toUpperCase()})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-categoria">Categoría</Label>
                <Input
                  id="edit-categoria"
                  value={editingTipo.categoria || ''}
                  onChange={(e) => setEditingTipo({...editingTipo, categoria: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Textarea
                  id="edit-descripcion"
                  value={editingTipo.descripcion || ''}
                  onChange={(e) => setEditingTipo({...editingTipo, descripcion: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-activo"
                  checked={editingTipo.activo}
                  onCheckedChange={(checked) => setEditingTipo({...editingTipo, activo: checked})}
                />
                <Label htmlFor="edit-activo">Activo</Label>
              </div>
              
              <Button onClick={() => {
                // Implementar actualización
                setEditingTipo(null);
              }} className="w-full">
                Actualizar Tipo de Equipo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}