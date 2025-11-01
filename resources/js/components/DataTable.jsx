import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

// Columnas de ejemplo para usuarios
const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Nombre', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Rol', sortable: true },
];

// Datos mock para mostrar en la tabla
const mockData = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  { id: 2, name: 'Juan Perez', email: 'juan@example.com', role: 'user' },
  { id: 3, name: 'Maria Lopez', email: 'maria@example.com', role: 'user' },
];

export function DataTable({ title = 'Usuarios', data = mockData, columns: cols = columns }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Exportar</Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-100">
              {cols.map((column) => (
                <th key={column.key} className="p-2 text-left text-sm font-semibold">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={row.id || idx} className="border-b hover:bg-gray-50">
                {cols.map((column) => (
                  <td key={column.key} className="p-2 text-sm">{row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
