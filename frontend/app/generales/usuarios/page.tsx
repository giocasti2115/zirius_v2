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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit, Trash2, Users, UserCheck, UserX, Shield, Activity } from 'lucide-react';
import { GeneralesService, Usuario } from '@/lib/services/generales.service';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRol, setSelectedRol] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total_usuarios: 0,
    usuarios_activos: 0,
    tecnicos: 0,
    administradores: 0,
    usuarios_activos_semana: 0
  });

  const [newUsuario, setNewUsuario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    telefono: '',
    rol: '' as Usuario['rol'],
    clave: ''
  });

  useEffect(() => {
    loadUsuarios();
    loadStats();
  }, [currentPage, searchTerm, selectedRol, selectedEstado]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const response = await GeneralesService.getUsuarios({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        rol: selectedRol || undefined,
        estado: selectedEstado || undefined
      });
      
      setUsuarios(response.usuarios);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const estadisticas = await GeneralesService.getEstadisticas();
      setStats(estadisticas.usuarios);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleCreateUsuario = async () => {
    try {
      if (!newUsuario.nombre || !newUsuario.apellido || !newUsuario.email || !newUsuario.documento || !newUsuario.rol) {
        alert('Todos los campos requeridos deben ser completados');
        return;
      }

      await GeneralesService.createUsuario(newUsuario);
      setIsCreateDialogOpen(false);
      setNewUsuario({
        nombre: '',
        apellido: '',
        email: '',
        documento: '',
        telefono: '',
        rol: '' as Usuario['rol'],
        clave: ''
      });
      loadUsuarios();
      loadStats();
    } catch (error) {
      console.error('Error creando usuario:', error);
      alert('Error al crear el usuario');
    }
  };

  const handleUpdateUsuario = async () => {
    try {
      if (!editingUsuario) return;

      await GeneralesService.updateUsuario(editingUsuario.id, {
        nombre: editingUsuario.nombre,
        apellido: editingUsuario.apellido,
        email: editingUsuario.email,
        telefono: editingUsuario.telefono,
        rol: editingUsuario.rol,
        estado: editingUsuario.estado
      });
      
      setEditingUsuario(null);
      loadUsuarios();
      loadStats();
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      alert('Error al actualizar el usuario');
    }
  };

  const handleDeleteUsuario = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;

    try {
      await GeneralesService.deleteUsuario(id);
      loadUsuarios();
      loadStats();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar el usuario');
    }
  };

  const getRolBadgeColor = (rol: Usuario['rol']) => {
    switch (rol) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'coordinador': return 'bg-blue-100 text-blue-800';
      case 'tecnico': return 'bg-green-100 text-green-800';
      case 'analista': return 'bg-purple-100 text-purple-800';
      case 'comercial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoBadgeColor = (estado: Usuario['estado']) => {
    return estado === 'activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administre los usuarios del sistema ZIRIUS</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={newUsuario.nombre}
                    onChange={(e) => setNewUsuario({...newUsuario, nombre: e.target.value})}
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    value={newUsuario.apellido}
                    onChange={(e) => setNewUsuario({...newUsuario, apellido: e.target.value})}
                    placeholder="Apellido"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUsuario.email}
                  onChange={(e) => setNewUsuario({...newUsuario, email: e.target.value})}
                  placeholder="usuario@empresa.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documento">Documento *</Label>
                  <Input
                    id="documento"
                    value={newUsuario.documento}
                    onChange={(e) => setNewUsuario({...newUsuario, documento: e.target.value})}
                    placeholder="12345678"
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={newUsuario.telefono}
                    onChange={(e) => setNewUsuario({...newUsuario, telefono: e.target.value})}
                    placeholder="3001234567"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="rol">Rol *</Label>
                <Select onValueChange={(value) => setNewUsuario({...newUsuario, rol: value as Usuario['rol']})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="coordinador">Coordinador</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="analista">Analista</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="clave">Clave Temporal</Label>
                <Input
                  id="clave"
                  type="password"
                  value={newUsuario.clave}
                  onChange={(e) => setNewUsuario({...newUsuario, clave: e.target.value})}
                  placeholder="Dejar vacío para generar automáticamente"
                />
              </div>
              
              <Button onClick={handleCreateUsuario} className="w-full">
                Crear Usuario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total_usuarios}</p>
                <p className="text-sm text-gray-600">Total Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.usuarios_activos}</p>
                <p className="text-sm text-gray-600">Usuarios Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.administradores}</p>
                <p className="text-sm text-gray-600">Administradores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.tecnicos}</p>
                <p className="text-sm text-gray-600">Técnicos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.usuarios_activos_semana}</p>
                <p className="text-sm text-gray-600">Activos esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, email o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedRol} onValueChange={setSelectedRol}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los roles</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="coordinador">Coordinador</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="analista">Analista</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
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
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Actividad</TableHead>
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
                          {usuario.telefono && (
                            <div className="text-sm text-gray-500">{usuario.telefono}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.documento}</TableCell>
                      <TableCell>
                        <Badge className={getRolBadgeColor(usuario.rol)}>
                          {usuario.rol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEstadoBadgeColor(usuario.estado)}>
                          {usuario.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Solicitudes: {usuario.solicitudes_creadas || 0}</div>
                          <div>Visitas: {usuario.visitas_asignadas || 0}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {usuario.ultimo_acceso ? (
                          <div className="text-sm">
                            {new Date(usuario.ultimo_acceso).toLocaleDateString('es-ES')}
                          </div>
                        ) : (
                          <span className="text-gray-400">Nunca</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUsuario(usuario)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUsuario(usuario.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
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
        </CardContent>
      </Card>

      {/* Dialog de edición */}
      {editingUsuario && (
        <Dialog open={!!editingUsuario} onOpenChange={() => setEditingUsuario(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nombre">Nombre</Label>
                  <Input
                    id="edit-nombre"
                    value={editingUsuario.nombre}
                    onChange={(e) => setEditingUsuario({...editingUsuario, nombre: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-apellido">Apellido</Label>
                  <Input
                    id="edit-apellido"
                    value={editingUsuario.apellido}
                    onChange={(e) => setEditingUsuario({...editingUsuario, apellido: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUsuario.email}
                  onChange={(e) => setEditingUsuario({...editingUsuario, email: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-telefono">Teléfono</Label>
                <Input
                  id="edit-telefono"
                  value={editingUsuario.telefono || ''}
                  onChange={(e) => setEditingUsuario({...editingUsuario, telefono: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-rol">Rol</Label>
                <Select
                  value={editingUsuario.rol}
                  onValueChange={(value) => setEditingUsuario({...editingUsuario, rol: value as Usuario['rol']})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="coordinador">Coordinador</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="analista">Analista</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-estado">Estado</Label>
                <Select
                  value={editingUsuario.estado}
                  onValueChange={(value) => setEditingUsuario({...editingUsuario, estado: value as Usuario['estado']})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleUpdateUsuario} className="w-full">
                Actualizar Usuario
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}