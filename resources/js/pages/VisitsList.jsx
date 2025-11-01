import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from '../components/DataTable';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'fecha', label: 'Fecha', sortable: true },
  { key: 'sede', label: 'Sede', sortable: true },
  { key: 'tecnico', label: 'Técnico', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'duracion', label: 'Duración', sortable: true },
];

const mockData = [
  { id: 1, fecha: '2025-10-01', sede: 'Sede Norte', tecnico: 'Juan', estado: 'Pendiente', duracion: '2h' },
  { id: 2, fecha: '2025-10-02', sede: 'Sede Sur', tecnico: 'Maria', estado: 'Cerrada', duracion: '1h' },
];

export default function VisitsList() {
  return (
    <MainLayout>
      <Head title="Visitas" />
      <DataTable title="Visitas" data={mockData} columns={columns} />
    </MainLayout>
  );
}
