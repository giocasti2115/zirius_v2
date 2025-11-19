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
import { Slider } from "@/components/ui/slider";
import { 
  Search, Plus, Edit, Settings, Database, Clock, Mail, 
  Server, Zap, Globe, Shield, Bell, AlertTriangle 
} from 'lucide-react';

interface VariableSistema {
  id: number;
  categoria: string;
  nombre: string;
  clave: string;
  valor: string;
  tipo: 'string' | 'number' | 'boolean' | 'json' | 'email';
  descripcion?: string;
  valor_defecto: string;
  requerido: boolean;
  activo: boolean;
  fecha_modificacion: string;
  modificado_por?: string;
}

export default function VariablesSistemaPage() {
  const [variables, setVariables] = useState<VariableSistema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<VariableSistema | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [newVariable, setNewVariable] = useState({
    categoria: '',
    nombre: '',
    clave: '',
    valor: '',
    tipo: 'string' as VariableSistema['tipo'],
    descripcion: '',
    requerido: false
  });

  // Datos de fallback para desarrollo
  const variablesFallback: VariableSistema[] = [
    // Sistema General
    {
      id: 1, categoria: 'Sistema', nombre: 'Nombre del Sistema', clave: 'system.name',
      valor: 'ZIRIUS V2', tipo: 'string', descripcion: 'Nombre que se muestra en la aplicación',
      valor_defecto: 'ZIRIUS', requerido: true, activo: true,
      fecha_modificacion: '2024-12-20T10:00:00Z', modificado_por: 'Admin'
    },
    {
      id: 2, categoria: 'Sistema', nombre: 'Versión', clave: 'system.version',
      valor: '2.1.0', tipo: 'string', descripcion: 'Versión actual del sistema',
      valor_defecto: '1.0.0', requerido: true, activo: true,
      fecha_modificacion: '2024-12-15T14:30:00Z', modificado_por: 'Admin'
    },
    {
      id: 3, categoria: 'Sistema', nombre: 'Modo Mantenimiento', clave: 'system.maintenance_mode',
      valor: 'false', tipo: 'boolean', descripcion: 'Activar modo de mantenimiento',
      valor_defecto: 'false', requerido: false, activo: true,
      fecha_modificacion: '2024-12-01T09:00:00Z'
    },

    // Base de Datos
    {
      id: 4, categoria: 'Base de Datos', nombre: 'Timeout de Conexión', clave: 'db.connection_timeout',
      valor: '30000', tipo: 'number', descripcion: 'Timeout de conexión en milisegundos',
      valor_defecto: '30000', requerido: true, activo: true,
      fecha_modificacion: '2024-11-20T16:45:00Z'
    },
    {
      id: 5, categoria: 'Base de Datos', nombre: 'Pool Máximo', clave: 'db.max_pool_size',
      valor: '20', tipo: 'number', descripcion: 'Número máximo de conexiones en el pool',
      valor_defecto: '10', requerido: true, activo: true,
      fecha_modificacion: '2024-11-18T11:20:00Z'
    },
    {
      id: 6, categoria: 'Base de Datos', nombre: 'Auto Backup', clave: 'db.auto_backup',
      valor: 'true', tipo: 'boolean', descripcion: 'Realizar respaldos automáticos',
      valor_defecto: 'true', requerido: false, activo: true,
      fecha_modificacion: '2024-12-10T08:00:00Z'
    },

    // Email
    {
      id: 7, categoria: 'Email', nombre: 'Servidor SMTP', clave: 'email.smtp_host',
      valor: 'smtp.gmail.com', tipo: 'string', descripcion: 'Servidor SMTP para envío de emails',
      valor_defecto: 'localhost', requerido: true, activo: true,
      fecha_modificacion: '2024-12-05T12:30:00Z'
    },
    {
      id: 8, categoria: 'Email', nombre: 'Puerto SMTP', clave: 'email.smtp_port',
      valor: '587', tipo: 'number', descripcion: 'Puerto del servidor SMTP',
      valor_defecto: '25', requerido: true, activo: true,
      fecha_modificacion: '2024-12-05T12:30:00Z'
    },
    {
      id: 9, categoria: 'Email', nombre: 'Email Remitente', clave: 'email.from_address',
      valor: 'noreply@zirius.com', tipo: 'email', descripcion: 'Dirección de email remitente',
      valor_defecto: 'system@localhost', requerido: true, activo: true,
      fecha_modificacion: '2024-12-05T12:35:00Z'
    },

    // Sesiones
    {
      id: 10, categoria: 'Sesiones', nombre: 'Duración de Sesión', clave: 'session.duration',
      valor: '480', tipo: 'number', descripcion: 'Duración de sesión en minutos',
      valor_defecto: '480', requerido: true, activo: true,
      fecha_modificacion: '2024-11-25T13:15:00Z'
    },
    {
      id: 11, categoria: 'Sesiones', nombre: 'Recordar Sesión', clave: 'session.remember_me',
      valor: 'true', tipo: 'boolean', descripcion: 'Permitir recordar sesión',
      valor_defecto: 'false', requerido: false, activo: true,
      fecha_modificacion: '2024-11-20T10:00:00Z'
    },

    // Notificaciones
    {
      id: 12, categoria: 'Notificaciones', nombre: 'Notificaciones Push', clave: 'notifications.push_enabled',
      valor: 'true', tipo: 'boolean', descripcion: 'Habilitar notificaciones push',
      valor_defecto: 'false', requerido: false, activo: true,
      fecha_modificacion: '2024-12-12T15:20:00Z'
    },
    {
      id: 13, categoria: 'Notificaciones', nombre: 'Email Notificaciones', clave: 'notifications.email_enabled',
      valor: 'true', tipo: 'boolean', descripcion: 'Habilitar notificaciones por email',
      valor_defecto: 'true', requerido: false, activo: true,
      fecha_modificacion: '2024-12-12T15:25:00Z'
    },

    // Seguridad
    {
      id: 14, categoria: 'Seguridad', nombre: 'Intentos Login', clave: 'security.max_login_attempts',
      valor: '5', tipo: 'number', descripcion: 'Máximo intentos de login fallidos',
      valor_defecto: '3', requerido: true, activo: true,
      fecha_modificacion: '2024-11-30T09:45:00Z'
    },
    {
      id: 15, categoria: 'Seguridad', nombre: 'Bloqueo Temporal', clave: 'security.lockout_duration',
      valor: '15', tipo: 'number', descripcion: 'Duración del bloqueo en minutos',
      valor_defecto: '10', requerido: true, activo: true,
      fecha_modificacion: '2024-11-30T09:50:00Z'
    }
  ];

  useEffect(() => {
    loadVariables();
  }, []);

  const loadVariables = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVariables(variablesFallback);
    } catch (error) {
      console.error('Error cargando variables:', error);
    } finally {
      setLoading(false);
    }
  };

  const categorias = [...new Set(variables.map(v => v.categoria))];
  
  const filteredVariables = variables.filter(variable => {
    const matchesSearch = variable.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variable.clave.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || variable.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  const getCategoriaIcon = (categoria: string) => {
    const icons: { [key: string]: any } = {
      'Sistema': Settings,
      'Base de Datos': Database,
      'Email': Mail,
      'Sesiones': Clock,
      'Notificaciones': Bell,
      'Seguridad': Shield
    };
    return icons[categoria] || Settings;
  };

  const getCategoriaColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'Sistema': 'bg-blue-100 text-blue-800',
      'Base de Datos': 'bg-green-100 text-green-800',
      'Email': 'bg-purple-100 text-purple-800',
      'Sesiones': 'bg-orange-100 text-orange-800',
      'Notificaciones': 'bg-yellow-100 text-yellow-800',
      'Seguridad': 'bg-red-100 text-red-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
  };

  const handleSaveVariable = (variable: VariableSistema, newValue: string) => {
    setVariables(prev => prev.map(v => 
      v.id === variable.id 
        ? { ...v, valor: newValue, fecha_modificacion: new Date().toISOString(), modificado_por: 'Usuario Actual' }
        : v
    ));
    setHasChanges(true);
  };

  const renderValueInput = (variable: VariableSistema, value: string, onChange: (value: string) => void) => {
    switch (variable.tipo) {
      case 'boolean':
        return (
          <Switch
            checked={value === 'true'}
            onCheckedChange={(checked) => onChange(checked.toString())}
          />
        );
      case 'number':
        const numValue = parseInt(value) || 0;
        const isPercentage = variable.clave.includes('percent') || variable.nombre.includes('%');
        const maxValue = isPercentage ? 100 : (variable.clave.includes('timeout') ? 60000 : 1000);
        
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Slider
                value={[numValue]}
                onValueChange={(values) => onChange(values[0].toString())}
                max={maxValue}
                min={0}
                step={variable.clave.includes('timeout') ? 1000 : 1}
                className="flex-1"
              />
              <Input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-20"
              />
            </div>
            <div className="text-xs text-gray-500">
              {isPercentage ? 'Porcentaje (0-100)' : 
               variable.clave.includes('timeout') ? 'Milisegundos' :
               variable.clave.includes('duration') ? 'Minutos' : 'Número'}
            </div>
          </div>
        );
      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="email@ejemplo.com"
          />
        );
      case 'json':
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            placeholder='{"clave": "valor"}'
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={variable.valor_defecto}
          />
        );
    }
  };

  const totalVariables = variables.length;
  const variablesActivas = variables.filter(v => v.activo).length;
  const variablesModificadas = variables.filter(v => v.valor !== v.valor_defecto).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Variables del Sistema</h1>
          <p className="text-gray-600 mt-1">Configure los parámetros operacionales de ZIRIUS</p>
        </div>
        
        <div className="flex space-x-3">
          {hasChanges && (
            <Button variant="outline" className="text-orange-600 border-orange-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Cambios Pendientes
            </Button>
          )}
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Variable
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Variable</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select
                    value={newVariable.categoria}
                    onValueChange={(value) => setNewVariable({...newVariable, categoria: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(categoria => (
                        <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                      ))}
                      <SelectItem value="Nueva">+ Nueva Categoría</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={newVariable.nombre}
                    onChange={(e) => setNewVariable({...newVariable, nombre: e.target.value})}
                    placeholder="Nombre descriptivo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="clave">Clave *</Label>
                  <Input
                    id="clave"
                    value={newVariable.clave}
                    onChange={(e) => setNewVariable({...newVariable, clave: e.target.value})}
                    placeholder="categoria.nombre_variable"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={newVariable.tipo}
                    onValueChange={(value: any) => setNewVariable({...newVariable, tipo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="boolean">Verdadero/Falso</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="valor">Valor Inicial *</Label>
                  <Input
                    id="valor"
                    value={newVariable.valor}
                    onChange={(e) => setNewVariable({...newVariable, valor: e.target.value})}
                    placeholder="Valor por defecto"
                  />
                </div>
                
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={newVariable.descripcion}
                    onChange={(e) => setNewVariable({...newVariable, descripcion: e.target.value})}
                    placeholder="Descripción de la variable..."
                    rows={2}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requerido"
                    checked={newVariable.requerido}
                    onCheckedChange={(checked) => setNewVariable({...newVariable, requerido: checked})}
                  />
                  <Label htmlFor="requerido">Variable requerida</Label>
                </div>
                
                <Button 
                  onClick={() => {
                    console.log('Crear variable:', newVariable);
                    setIsCreateDialogOpen(false);
                  }} 
                  className="w-full"
                >
                  Crear Variable
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalVariables}</p>
                <p className="text-sm text-gray-600">Variables Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{variablesActivas}</p>
                <p className="text-sm text-gray-600">Variables Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Edit className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{variablesModificadas}</p>
                <p className="text-sm text-gray-600">Modificadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{categorias.length}</p>
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
                  placeholder="Buscar variables por nombre o clave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Variables por categoría */}
      <div className="space-y-6">
        {categorias.map(categoria => {
          const variablesCategoria = filteredVariables.filter(v => v.categoria === categoria);
          if (variablesCategoria.length === 0) return null;

          const IconComponent = getCategoriaIcon(categoria);

          return (
            <Card key={categoria}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <IconComponent className="w-5 h-5" />
                  <span>{categoria}</span>
                  <Badge className={getCategoriaColor(categoria)}>
                    {variablesCategoria.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {variablesCategoria.map((variable) => (
                    <div
                      key={variable.id}
                      className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{variable.nombre}</h4>
                              <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {variable.clave}
                              </code>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {variable.tipo}
                              </Badge>
                              {variable.requerido && (
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  Requerido
                                </Badge>
                              )}
                              {variable.valor !== variable.valor_defecto && (
                                <Badge className="bg-orange-100 text-orange-800 text-xs">
                                  Modificado
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {variable.descripcion && (
                            <p className="text-sm text-gray-600">{variable.descripcion}</p>
                          )}
                          
                          <div className="flex items-center space-x-6">
                            <div className="flex-1">
                              <Label className="text-sm font-medium">Valor Actual</Label>
                              <div className="mt-1">
                                {renderValueInput(
                                  variable,
                                  variable.valor,
                                  (newValue) => handleSaveVariable(variable, newValue)
                                )}
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-500">
                              <div>Por defecto: <code>{variable.valor_defecto}</code></div>
                              {variable.fecha_modificacion && (
                                <div className="mt-1">
                                  Modificado: {new Date(variable.fecha_modificacion).toLocaleDateTime('es-ES')}
                                  {variable.modificado_por && ` por ${variable.modificado_por}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveVariable(variable, variable.valor_defecto)}
                            disabled={variable.valor === variable.valor_defecto}
                          >
                            Restaurar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingVariable(variable)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de edición */}
      {editingVariable && (
        <Dialog open={!!editingVariable} onOpenChange={() => setEditingVariable(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Variable: {editingVariable.nombre}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-nombre">Nombre</Label>
                <Input
                  id="edit-nombre"
                  value={editingVariable.nombre}
                  onChange={(e) => setEditingVariable({...editingVariable, nombre: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Textarea
                  id="edit-descripcion"
                  value={editingVariable.descripcion || ''}
                  onChange={(e) => setEditingVariable({...editingVariable, descripcion: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-valor-defecto">Valor por Defecto</Label>
                <Input
                  id="edit-valor-defecto"
                  value={editingVariable.valor_defecto}
                  onChange={(e) => setEditingVariable({...editingVariable, valor_defecto: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-requerido"
                  checked={editingVariable.requerido}
                  onCheckedChange={(checked) => setEditingVariable({...editingVariable, requerido: checked})}
                />
                <Label htmlFor="edit-requerido">Variable requerida</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-activo"
                  checked={editingVariable.activo}
                  onCheckedChange={(checked) => setEditingVariable({...editingVariable, activo: checked})}
                />
                <Label htmlFor="edit-activo">Variable activa</Label>
              </div>
              
              <Button onClick={() => {
                console.log('Actualizar variable:', editingVariable);
                setEditingVariable(null);
              }} className="w-full">
                Actualizar Variable
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}