'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Settings, Flag, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { GeneralesService, Estado, Prioridad } from '@/lib/services/generales.service';

export default function EstadosPrioridadesPage() {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [prioridades, setPrioridades] = useState<Prioridad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('estados');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Estado | Prioridad | null>(null);

  const [newEstado, setNewEstado] = useState({
    nombre: '',
    descripcion: '',
    color: '#10B981',
    categoria: '',
    orden: 1
  });

  const [newPrioridad, setNewPrioridad] = useState({
    nombre: '',
    descripcion: '',
    color: '#6B7280',
    nivel: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [estadosData, prioridadesData] = await Promise.all([
        GeneralesService.getEstados(),
        GeneralesService.getPrioridades()
      ]);
      setEstados(estadosData);
      setPrioridades(prioridadesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEstados = estados.filter(estado =>
    estado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estado.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrioridades = prioridades.filter(prioridad =>
    prioridad.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadosByCategoria = (categoria: string) => {
    return filteredEstados.filter(estado => estado.categoria === categoria);
  };

  const categorias = [...new Set(estados.map(e => e.categoria))];

  const colorPresets = [
    { name: 'Verde', value: '#10B981' },
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Amarillo', value: '#F59E0B' },
    { name: 'Naranja', value: '#EA580C' },
    { name: 'Rojo', value: '#EF4444' },
    { name: 'Púrpura', value: '#8B5CF6' },
    { name: 'Gris', value: '#6B7280' }
  ];

  const ColorPicker = ({ value, onChange, colors = colorPresets }: {
    value: string;
    onChange: (color: string) => void;
    colors?: { name: string; value: string }[];
  }) => (
    <div className="grid grid-cols-7 gap-2 mt-2">
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          className={`w-8 h-8 rounded-full border-2 ${
            value === color.value ? 'border-gray-800' : 'border-gray-200'
          }`}
          style={{ backgroundColor: color.value }}
          onClick={() => onChange(color.value)}
          title={color.name}
        />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estados y Prioridades</h1>
          <p className="text-gray-600 mt-1">Configure los estados y prioridades del sistema ZIRIUS</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo {activeTab === 'estados' ? 'Estado' : 'Prioridad'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Crear {activeTab === 'estados' ? 'Nuevo Estado' : 'Nueva Prioridad'}
              </DialogTitle>
            </DialogHeader>
            
            {activeTab === 'estados' ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={newEstado.nombre}
                    onChange={(e) => setNewEstado({...newEstado, nombre: e.target.value})}
                    placeholder="Activo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select
                    value={newEstado.categoria}
                    onValueChange={(value) => setNewEstado({...newEstado, categoria: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipos">Equipos</SelectItem>
                      <SelectItem value="solicitudes">Solicitudes</SelectItem>
                      <SelectItem value="ordenes">Órdenes</SelectItem>
                      <SelectItem value="visitas">Visitas</SelectItem>
                      <SelectItem value="cotizaciones">Cotizaciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={newEstado.descripcion}
                    onChange={(e) => setNewEstado({...newEstado, descripcion: e.target.value})}
                    placeholder="Descripción del estado..."
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label>Color</Label>
                  <ColorPicker
                    value={newEstado.color}
                    onChange={(color) => setNewEstado({...newEstado, color})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="orden">Orden</Label>
                  <Input
                    id="orden"
                    type="number"
                    min="1"
                    value={newEstado.orden}
                    onChange={(e) => setNewEstado({...newEstado, orden: parseInt(e.target.value)})}
                  />
                </div>
                
                <Button 
                  onClick={() => {
                    console.log('Crear estado:', newEstado);
                    setIsCreateDialogOpen(false);
                  }} 
                  className="w-full"
                >
                  Crear Estado
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre-prioridad">Nombre *</Label>
                  <Input
                    id="nombre-prioridad"
                    value={newPrioridad.nombre}
                    onChange={(e) => setNewPrioridad({...newPrioridad, nombre: e.target.value})}
                    placeholder="Alta"
                  />
                </div>
                
                <div>
                  <Label htmlFor="nivel">Nivel (1-5) *</Label>
                  <Select
                    value={newPrioridad.nivel.toString()}
                    onValueChange={(value) => setNewPrioridad({...newPrioridad, nivel: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muy Baja</SelectItem>
                      <SelectItem value="2">2 - Baja</SelectItem>
                      <SelectItem value="3">3 - Media</SelectItem>
                      <SelectItem value="4">4 - Alta</SelectItem>
                      <SelectItem value="5">5 - Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="descripcion-prioridad">Descripción</Label>
                  <Textarea
                    id="descripcion-prioridad"
                    value={newPrioridad.descripcion}
                    onChange={(e) => setNewPrioridad({...newPrioridad, descripcion: e.target.value})}
                    placeholder="Descripción de la prioridad..."
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label>Color</Label>
                  <ColorPicker
                    value={newPrioridad.color}
                    onChange={(color) => setNewPrioridad({...newPrioridad, color})}
                  />
                </div>
                
                <Button 
                  onClick={() => {
                    console.log('Crear prioridad:', newPrioridad);
                    setIsCreateDialogOpen(false);
                  }} 
                  className="w-full"
                >
                  Crear Prioridad
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
              <Settings className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{estados.length}</p>
                <p className="text-sm text-gray-600">Total Estados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Flag className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{prioridades.length}</p>
                <p className="text-sm text-gray-600">Prioridades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{categorias.length}</p>
                <p className="text-sm text-gray-600">Categorías</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {estados.filter(e => e.activo).length}
                </p>
                <p className="text-sm text-gray-600">Estados Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar estados o prioridades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Estados y Prioridades */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="estados">Estados del Sistema</TabsTrigger>
          <TabsTrigger value="prioridades">Prioridades</TabsTrigger>
        </TabsList>

        <TabsContent value="estados" className="space-y-6">
          {/* Estados por categoría */}
          {categorias.map(categoria => {
            const estadosCategoria = getEstadosByCategoria(categoria);
            if (estadosCategoria.length === 0) return null;

            return (
              <Card key={categoria}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Estados de {categoria.charAt(0).toUpperCase() + categoria.slice(1)}</span>
                    <Badge variant="outline">{estadosCategoria.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {estadosCategoria.map((estado) => (
                      <div
                        key={estado.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: estado.color }}
                              />
                              <h3 className="font-semibold">{estado.nombre}</h3>
                              <Badge 
                                className={estado.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                              >
                                {estado.activo ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>
                            
                            {estado.descripcion && (
                              <p className="text-sm text-gray-600 mb-2">
                                {estado.descripcion}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Orden: {estado.orden}</span>
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingItem(estado)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="prioridades">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Prioridades</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPrioridades
                    .sort((a, b) => b.nivel - a.nivel)
                    .map((prioridad) => (
                      <div
                        key={prioridad.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: prioridad.color }}
                          >
                            {prioridad.nivel}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-lg">{prioridad.nombre}</h3>
                            {prioridad.descripcion && (
                              <p className="text-sm text-gray-600">{prioridad.descripcion}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <Badge 
                            style={{ backgroundColor: prioridad.color, color: 'white' }}
                          >
                            Nivel {prioridad.nivel}
                          </Badge>
                          
                          <Badge 
                            className={prioridad.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {prioridad.activo ? 'Activa' : 'Inactiva'}
                          </Badge>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingItem(prioridad)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
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
                Editar {'categoria' in editingItem ? 'Estado' : 'Prioridad'}
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
              
              <div>
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Textarea
                  id="edit-descripcion"
                  value={editingItem.descripcion || ''}
                  onChange={(e) => setEditingItem({...editingItem, descripcion: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Color</Label>
                <ColorPicker
                  value={editingItem.color}
                  onChange={(color) => setEditingItem({...editingItem, color})}
                />
              </div>
              
              {'categoria' in editingItem && (
                <div>
                  <Label htmlFor="edit-orden">Orden</Label>
                  <Input
                    id="edit-orden"
                    type="number"
                    min="1"
                    value={editingItem.orden}
                    onChange={(e) => setEditingItem({...editingItem, orden: parseInt(e.target.value)})}
                  />
                </div>
              )}
              
              {'nivel' in editingItem && (
                <div>
                  <Label htmlFor="edit-nivel">Nivel</Label>
                  <Select
                    value={editingItem.nivel.toString()}
                    onValueChange={(value) => setEditingItem({...editingItem, nivel: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Muy Baja</SelectItem>
                      <SelectItem value="2">2 - Baja</SelectItem>
                      <SelectItem value="3">3 - Media</SelectItem>
                      <SelectItem value="4">4 - Alta</SelectItem>
                      <SelectItem value="5">5 - Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
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