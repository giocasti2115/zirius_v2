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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, Plus, Edit, Shield, Users, Key, Lock, 
  UserCheck, Settings, Eye, EyeOff, CheckCircle2 
} from 'lucide-react';

interface Permiso {
  id: number;
  modulo: string;
  accion: string;
  descripcion?: string;
  categoria: string;
  activo: boolean;
}

interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  activo: boolean;
  total_usuarios: number;
  permisos: number[];
  fecha_creacion: string;
}

interface UsuarioPermiso {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  rol_id: number;
  permisos_adicionales: number[];
  permisos_denegados: number[];
  ultimo_acceso?: string;
}

export default function PermisosPage() {
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioPermiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('roles');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedRol, setSelectedRol] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Rol | null>(null);

  const [newRol, setNewRol] = useState({
    nombre: '',
    descripcion: '',
    color: '#3B82F6',
    permisos: [] as number[]
  });

  // Datos de fallback
  const permisosFallback: Permiso[] = [
    // Dashboard
    { id: 1, modulo: 'dashboard', accion: 'ver', descripcion: 'Ver dashboard principal', categoria: 'Dashboard', activo: true },
    
    // Clientes
    { id: 2, modulo: 'clientes', accion: 'ver', descripcion: 'Ver lista de clientes', categoria: 'Clientes', activo: true },
    { id: 3, modulo: 'clientes', accion: 'crear', descripcion: 'Crear nuevos clientes', categoria: 'Clientes', activo: true },
    { id: 4, modulo: 'clientes', accion: 'editar', descripcion: 'Editar información de clientes', categoria: 'Clientes', activo: true },
    { id: 5, modulo: 'clientes', accion: 'eliminar', descripcion: 'Eliminar clientes', categoria: 'Clientes', activo: true },
    
    // Equipos
    { id: 6, modulo: 'equipos', accion: 'ver', descripcion: 'Ver inventario de equipos', categoria: 'Equipos', activo: true },
    { id: 7, modulo: 'equipos', accion: 'crear', descripcion: 'Registrar nuevos equipos', categoria: 'Equipos', activo: true },
    { id: 8, modulo: 'equipos', accion: 'editar', descripcion: 'Modificar información de equipos', categoria: 'Equipos', activo: true },
    { id: 9, modulo: 'equipos', accion: 'dar_baja', descripcion: 'Dar de baja equipos', categoria: 'Equipos', activo: true },
    
    // Solicitudes
    { id: 10, modulo: 'solicitudes', accion: 'ver', descripcion: 'Ver solicitudes de servicio', categoria: 'Solicitudes', activo: true },
    { id: 11, modulo: 'solicitudes', accion: 'crear', descripcion: 'Crear nuevas solicitudes', categoria: 'Solicitudes', activo: true },
    { id: 12, modulo: 'solicitudes', accion: 'asignar', descripcion: 'Asignar solicitudes a técnicos', categoria: 'Solicitudes', activo: true },
    { id: 13, modulo: 'solicitudes', accion: 'cerrar', descripcion: 'Cerrar solicitudes completadas', categoria: 'Solicitudes', activo: true },
    
    // Órdenes
    { id: 14, modulo: 'ordenes', accion: 'ver', descripcion: 'Ver órdenes de trabajo', categoria: 'Órdenes', activo: true },
    { id: 15, modulo: 'ordenes', accion: 'crear', descripcion: 'Crear órdenes de trabajo', categoria: 'Órdenes', activo: true },
    { id: 16, modulo: 'ordenes', accion: 'ejecutar', descripcion: 'Ejecutar órdenes asignadas', categoria: 'Órdenes', activo: true },
    
    // Visitas
    { id: 17, modulo: 'visitas', accion: 'ver', descripcion: 'Ver calendario de visitas', categoria: 'Visitas', activo: true },
    { id: 18, modulo: 'visitas', accion: 'programar', descripcion: 'Programar nuevas visitas', categoria: 'Visitas', activo: true },
    { id: 19, modulo: 'visitas', accion: 'ejecutar', descripcion: 'Ejecutar visitas programadas', categoria: 'Visitas', activo: true },
    
    // Informes
    { id: 20, modulo: 'informes', accion: 'ver', descripcion: 'Ver informes del sistema', categoria: 'Informes', activo: true },
    { id: 21, modulo: 'informes', accion: 'exportar', descripcion: 'Exportar informes', categoria: 'Informes', activo: true },
    
    // Generales (Configuración)
    { id: 22, modulo: 'generales', accion: 'ver', descripcion: 'Ver configuración general', categoria: 'Generales', activo: true },
    { id: 23, modulo: 'generales', accion: 'usuarios', descripcion: 'Gestionar usuarios del sistema', categoria: 'Generales', activo: true },
    { id: 24, modulo: 'generales', accion: 'permisos', descripcion: 'Gestionar permisos y roles', categoria: 'Generales', activo: true },
    { id: 25, modulo: 'generales', accion: 'configurar', descripcion: 'Configurar parámetros del sistema', categoria: 'Generales', activo: true }
  ];

  const rolesFallback: Rol[] = [
    {
      id: 1, nombre: 'Administrador', descripcion: 'Acceso completo al sistema',
      color: '#DC2626', activo: true, total_usuarios: 2,
      permisos: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],
      fecha_creacion: '2024-01-10T00:00:00Z'
    },
    {
      id: 2, nombre: 'Coordinador', descripcion: 'Gestión de solicitudes y asignaciones',
      color: '#2563EB', activo: true, total_usuarios: 3,
      permisos: [1,2,3,4,6,7,8,10,11,12,13,14,15,17,18,20],
      fecha_creacion: '2024-01-15T00:00:00Z'
    },
    {
      id: 3, nombre: 'Técnico', descripcion: 'Ejecución de órdenes y visitas',
      color: '#059669', activo: true, total_usuarios: 8,
      permisos: [1,6,10,14,16,17,19],
      fecha_creacion: '2024-01-15T00:00:00Z'
    },
    {
      id: 4, nombre: 'Analista', descripcion: 'Análisis e informes del sistema',
      color: '#7C3AED', activo: true, total_usuarios: 2,
      permisos: [1,2,6,10,14,17,20,21],
      fecha_creacion: '2024-01-20T00:00:00Z'
    }
  ];

  const usuariosFallback: UsuarioPermiso[] = [
    {
      id: 1, nombre: 'Juan Carlos', apellido: 'Rodríguez', email: 'juan.rodriguez@empresa.com',
      rol: 'Administrador', rol_id: 1, permisos_adicionales: [], permisos_denegados: [],
      ultimo_acceso: '2024-12-20T09:30:00Z'
    },
    {
      id: 2, nombre: 'María Elena', apellido: 'González', email: 'maria.gonzalez@empresa.com',
      rol: 'Técnico', rol_id: 3, permisos_adicionales: [11, 12], permisos_denegados: [],
      ultimo_acceso: '2024-12-20T08:15:00Z'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPermisos(permisosFallback);
      setRoles(rolesFallback);
      setUsuarios(usuariosFallback);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const categorias = [...new Set(permisos.map(p => p.categoria))];
  
  const filteredRoles = roles.filter(rol =>
    rol.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPermisos = permisos.filter(permiso => {
    const matchesSearch = permiso.modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permiso.accion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || permiso.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  const handleCreateRol = () => {
    console.log('Crear rol:', newRol);
    setIsCreateDialogOpen(false);
    setNewRol({ nombre: '', descripcion: '', color: '#3B82F6', permisos: [] });
  };

  const togglePermiso = (permisoId: number) => {
    setNewRol(prev => ({
      ...prev,
      permisos: prev.permisos.includes(permisoId)
        ? prev.permisos.filter(id => id !== permisoId)
        : [...prev.permisos, permisoId]
    }));
  };

  const colorPresets = [
    { name: 'Rojo', value: '#DC2626' },
    { name: 'Azul', value: '#2563EB' },
    { name: 'Verde', value: '#059669' },
    { name: 'Púrpura', value: '#7C3AED' },
    { name: 'Naranja', value: '#EA580C' },
    { name: 'Amarillo', value: '#CA8A04' },
    { name: 'Gris', value: '#6B7280' }
  ];

  const ColorPicker = ({ value, onChange }: { value: string; onChange: (color: string) => void }) => (
    <div className="grid grid-cols-7 gap-2 mt-2">
      {colorPresets.map((color) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Permisos</h1>
          <p className="text-gray-600 mt-1">Gestione roles, permisos y accesos del sistema</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Rol
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Rol</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Rol *</Label>
                  <Input
                    id="nombre"
                    value={newRol.nombre}
                    onChange={(e) => setNewRol({...newRol, nombre: e.target.value})}
                    placeholder="Supervisor"
                  />
                </div>
                <div>
                  <Label>Color del Rol</Label>
                  <ColorPicker
                    value={newRol.color}
                    onChange={(color) => setNewRol({...newRol, color})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={newRol.descripcion}
                  onChange={(e) => setNewRol({...newRol, descripcion: e.target.value})}
                  placeholder="Descripción del rol y sus responsabilidades..."
                  rows={2}
                />
              </div>
              
              <div>
                <Label className="text-base font-semibold">Permisos del Rol</Label>
                <p className="text-sm text-gray-600 mb-4">
                  Seleccione los permisos que tendrá este rol
                </p>
                
                {categorias.map(categoria => {
                  const permisosCategoria = permisos.filter(p => p.categoria === categoria);
                  const permisosSeleccionados = permisosCategoria.filter(p => 
                    newRol.permisos.includes(p.id)
                  ).length;
                  
                  return (
                    <div key={categoria} className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{categoria}</h4>
                        <Badge variant="outline">
                          {permisosSeleccionados}/{permisosCategoria.length}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                        {permisosCategoria.map(permiso => (
                          <div key={permiso.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={`permiso-${permiso.id}`}
                              checked={newRol.permisos.includes(permiso.id)}
                              onCheckedChange={() => togglePermiso(permiso.id)}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={`permiso-${permiso.id}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {permiso.modulo}.{permiso.accion}
                              </Label>
                              {permiso.descripcion && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {permiso.descripcion}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateRol}>
                  Crear Rol
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                <p className="text-sm text-gray-600">Roles Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Key className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{permisos.length}</p>
                <p className="text-sm text-gray-600">Permisos Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {roles.reduce((sum, rol) => sum + rol.total_usuarios, 0)}
                </p>
                <p className="text-sm text-gray-600">Usuarios con Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{categorias.length}</p>
                <p className="text-sm text-gray-600">Módulos</p>
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
                  placeholder="Buscar roles o permisos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {activeTab === 'permisos' && (
              <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los módulos</SelectItem>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">Roles del Sistema</TabsTrigger>
          <TabsTrigger value="permisos">Matriz de Permisos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios y Accesos</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((rol) => (
              <Card key={rol.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: rol.color }}
                      />
                      <CardTitle className="text-lg">{rol.nombre}</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingItem(rol)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  {rol.descripcion && (
                    <p className="text-sm text-gray-600 mt-2">{rol.descripcion}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Usuarios:</span>
                      <Badge variant="outline">{rol.total_usuarios}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Permisos:</span>
                      <Badge variant="outline">{rol.permisos.length}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Estado:</span>
                      <Badge 
                        className={rol.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      >
                        {rol.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => setSelectedRol(rol.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Permisos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permisos">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Permisos por Módulo</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {categorias.map(categoria => {
                    const permisosCategoria = filteredPermisos.filter(p => p.categoria === categoria);
                    if (permisosCategoria.length === 0) return null;

                    return (
                      <div key={categoria}>
                        <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                          <Settings className="w-5 h-5" />
                          <span>{categoria}</span>
                          <Badge variant="outline">{permisosCategoria.length}</Badge>
                        </h3>
                        
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Permiso</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Estado</TableHead>
                                {roles.map(rol => (
                                  <TableHead key={rol.id} className="text-center">
                                    <div className="flex items-center justify-center space-x-1">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: rol.color }}
                                      />
                                      <span className="text-xs">{rol.nombre}</span>
                                    </div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {permisosCategoria.map((permiso) => (
                                <TableRow key={permiso.id}>
                                  <TableCell>
                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                      {permiso.modulo}.{permiso.accion}
                                    </code>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {permiso.descripcion || 'Sin descripción'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      className={permiso.activo 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                      }
                                    >
                                      {permiso.activo ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                  </TableCell>
                                  {roles.map(rol => (
                                    <TableCell key={rol.id} className="text-center">
                                      {rol.permisos.includes(permiso.id) ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                                      ) : (
                                        <div className="w-5 h-5 mx-auto"></div>
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios y Permisos Especiales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol Principal</TableHead>
                      <TableHead>Permisos Adicionales</TableHead>
                      <TableHead>Restricciones</TableHead>
                      <TableHead>Último Acceso</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {usuario.nombre} {usuario.apellido}
                            </div>
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            style={{ 
                              backgroundColor: roles.find(r => r.id === usuario.rol_id)?.color || '#6B7280',
                              color: 'white'
                            }}
                          >
                            {usuario.rol}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {usuario.permisos_adicionales.length > 0 ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              +{usuario.permisos_adicionales.length}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">Ninguno</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {usuario.permisos_denegados.length > 0 ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700">
                              -{usuario.permisos_denegados.length}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">Ninguna</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {usuario.ultimo_acceso ? (
                            <span className="text-sm">
                              {new Date(usuario.ultimo_acceso).toLocaleDateString('es-ES')}
                            </span>
                          ) : (
                            <span className="text-gray-400">Nunca</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Key className="w-4 h-4 mr-1" />
                            Gestionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de detalles de rol */}
      {selectedRol && (
        <Dialog open={!!selectedRol} onOpenChange={() => setSelectedRol(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: roles.find(r => r.id === selectedRol)?.color }}
                />
                <span>Permisos del Rol: {roles.find(r => r.id === selectedRol)?.nombre}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {categorias.map(categoria => {
                const rolPermisos = roles.find(r => r.id === selectedRol)?.permisos || [];
                const permisosCategoria = permisos.filter(p => 
                  p.categoria === categoria && rolPermisos.includes(p.id)
                );
                
                if (permisosCategoria.length === 0) return null;

                return (
                  <div key={categoria}>
                    <h4 className="font-medium text-gray-900 mb-2">{categoria}</h4>
                    <div className="space-y-2 pl-4">
                      {permisosCategoria.map(permiso => (
                        <div key={permiso.id} className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {permiso.modulo}.{permiso.accion}
                          </code>
                          {permiso.descripcion && (
                            <span className="text-sm text-gray-600">
                              - {permiso.descripcion}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}