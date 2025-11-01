import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from '../components/DataTable';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'servicio', label: 'Servicio', sortable: true },
  { key: 'creacion', label: 'Creación', sortable: true },
  { key: 'equipo', label: 'Equipo', sortable: true },
  { key: 'estado', label: 'Estado', sortable: true },
  { key: 'sede', label: 'Sede', sortable: true },
];

const mockData = [
  { id: 1, servicio: 'Correctivo', creacion: '2025-10-01', equipo: 'Monitor', estado: 'Pendiente', sede: 'Sede Norte' },
  { id: 2, servicio: 'Preventivo', creacion: '2025-10-02', equipo: 'Bascula', estado: 'Aprobada', sede: 'Sede Sur' },
];

export default function WarehouseRequestsList() {
  return (
    <MainLayout>
      <Head title="Solicitudes de Bodega" />
      <DataTable title="Solicitudes de Bodega" data={mockData} columns={columns} />
    </MainLayout>
  );
}
