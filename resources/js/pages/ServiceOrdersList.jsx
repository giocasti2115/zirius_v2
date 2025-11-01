import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from '../components/DataTable';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'orden', label: 'Orden', sortable: true },
  { key: 'fecha', label: 'Fecha', sortable: true },
  { key: 'equipo', label: 'Equipo', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'tecnico', label: 'Técnico', sortable: true },
  { key: 'prioridad', label: 'Prioridad', sortable: true },
];

const mockData = [
  { id: 1, orden: 'ORD-001', fecha: '2025-10-01', equipo: 'Monitor', estado: 'Abierta', tecnico: 'Juan', prioridad: 'Alta' },
  { id: 2, orden: 'ORD-002', fecha: '2025-10-02', equipo: 'Bascula', estado: 'Cerrada', tecnico: 'Maria', prioridad: 'Media' },
];

export default function ServiceOrdersList() {
  return (
    <MainLayout>
      <Head title="Órdenes de Servicio" />
      <DataTable title="Órdenes de Servicio" data={mockData} columns={columns} />
    </MainLayout>
  );
}
