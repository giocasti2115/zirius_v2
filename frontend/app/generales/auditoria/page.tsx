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
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { 
  Search, Plus, Eye, FileText, Calendar, User, Activity, 
  Shield, Filter, Download, RefreshCw 
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  description: string;
  ip_address: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  details: any;
}

export default function AuditoriaPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Datos de ejemplo
  useEffect(() => {
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        timestamp: '2024-01-15 10:30:25',
        user: 'admin@empresa.com',
        action: 'LOGIN',
        module: 'Autenticación',
        description: 'Inicio de sesión exitoso',
        ip_address: '192.168.1.100',
        severity: 'info',
        details: { browser: 'Chrome 120', os: 'Windows 11' }
      },
      {
        id: '2',
        timestamp: '2024-01-15 10:35:12',
        user: 'tecnico1@empresa.com',
        action: 'CREATE_ORDER',
        module: 'Órdenes de Trabajo',
        description: 'Creación de nueva orden de trabajo #OT-2024-001',
        ip_address: '192.168.1.105',
        severity: 'info',
        details: { order_id: 'OT-2024-001', equipment: 'Compresor Principal' }
      },
      {
        id: '3',
        timestamp: '2024-01-15 11:15:45',
        user: 'supervisor@empresa.com',
        action: 'APPROVE_REQUEST',
        module: 'Solicitudes Bodega',
        description: 'Aprobación de solicitud de repuestos',
        ip_address: '192.168.1.110',
        severity: 'info',
        details: { request_id: 'SOL-2024-025', amount: '$1,250.00' }
      },
      {
        id: '4',
        timestamp: '2024-01-15 11:45:30',
        user: 'sistema',
        action: 'BACKUP_FAILED',
        module: 'Sistema',
        description: 'Error en respaldo automático de base de datos',
        ip_address: 'localhost',
        severity: 'error',
        details: { error: 'Insufficient disk space', size: '2.5GB' }
      },
      {
        id: '5',
        timestamp: '2024-01-15 12:20:15',
        user: 'admin@empresa.com',
        action: 'MODIFY_PERMISSIONS',
        module: 'Usuarios',
        description: 'Modificación de permisos de usuario',
        ip_address: '192.168.1.100',
        severity: 'warning',
        details: { target_user: 'tecnico2@empresa.com', permissions: ['read', 'write'] }
      },
      {
        id: '6',
        timestamp: '2024-01-15 13:10:22',
        user: 'jefe.mantenimiento@empresa.com',
        action: 'EXPORT_REPORT',
        module: 'Informes',
        description: 'Exportación de informe de correctivos',
        ip_address: '192.168.1.115',
        severity: 'info',
        details: { report_type: 'monthly', period: '2023-12' }
      }
    ];

    setTimeout(() => {
      setAuditLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtrar logs
  useEffect(() => {
    let filtered = auditLogs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === selectedSeverity);
    }

    if (selectedModule !== 'all') {
      filtered = filtered.filter(log => log.module === selectedModule);
    }

    if (selectedUser !== 'all') {
      filtered = filtered.filter(log => log.user === selectedUser);
    }

    setFilteredLogs(filtered);
  }, [auditLogs, searchTerm, selectedSeverity, selectedModule, selectedUser]);

  const getSeverityColor = (severity: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      critical: 'bg-purple-100 text-purple-800'
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  const uniqueModules = [...new Set(auditLogs.map(log => log.module))];
  const uniqueUsers = [...new Set(auditLogs.map(log => log.user))];

  const handleExport = () => {
    const csvContent = [
      ['Fecha/Hora', 'Usuario', 'Acción', 'Módulo', 'Descripción', 'IP', 'Severidad'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user,
        log.action,
        log.module,
        log.description,
        log.ip_address,
        log.severity
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Auditoría del Sistema</h1>
          <p className="text-gray-600">Registro de actividades y eventos del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Eventos</p>
                <p className="text-2xl font-bold">{auditLogs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Errores</p>
                <p className="text-2xl font-bold text-red-600">
                  {auditLogs.filter(log => log.severity === 'error' || log.severity === 'critical').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold">{uniqueUsers.length}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Módulos Monitoreados</p>
                <p className="text-2xl font-bold">{uniqueModules.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar en logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Severidades</SelectItem>
                <SelectItem value="info">Información</SelectItem>
                <SelectItem value="warning">Advertencia</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger>
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Módulos</SelectItem>
                {uniqueModules.map(module => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Usuarios</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedSeverity('all');
              setSelectedModule('all');
              setSelectedUser('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Auditoría ({filteredLogs.length} eventos)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.module}</TableCell>
                  <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(log.severity)}>
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalles del Evento de Auditoría</DialogTitle>
                        </DialogHeader>
                        {selectedLog && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">ID del Evento</Label>
                                <p className="text-sm">{selectedLog.id}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Fecha/Hora</Label>
                                <p className="text-sm">{selectedLog.timestamp}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Usuario</Label>
                                <p className="text-sm">{selectedLog.user}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Dirección IP</Label>
                                <p className="text-sm">{selectedLog.ip_address}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Acción</Label>
                                <p className="text-sm">{selectedLog.action}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Módulo</Label>
                                <p className="text-sm">{selectedLog.module}</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="font-semibold">Descripción</Label>
                              <p className="text-sm mt-1">{selectedLog.description}</p>
                            </div>

                            <div>
                              <Label className="font-semibold">Severidad</Label>
                              <div className="mt-1">
                                <Badge className={getSeverityColor(selectedLog.severity)}>
                                  {selectedLog.severity}
                                </Badge>
                              </div>
                            </div>

                            <div>
                              <Label className="font-semibold">Detalles Técnicos</Label>
                              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                                <pre className="text-xs overflow-auto">
                                  {JSON.stringify(selectedLog.details, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}