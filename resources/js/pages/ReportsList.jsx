import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from '../components/DataTable';

const columns = [
  { key: 'equipo', label: 'Equipo', sortable: true },
  { key: 'modelo', label: 'Modelo', sortable: true },
  { key: 'sede', label: 'Sede', sortable: true },
  { key: 'correctivos', label: 'Correctivos', sortable: true },
  { key: 'promedio', label: 'Promedio', sortable: true },
  { key: 'total', label: 'Total', sortable: true },
];

const mockData = [
  { equipo: 'Monitor', modelo: 'M-100', sede: 'Sede Norte', correctivos: 5, promedio: '2h', total: '$500,000' },
  { equipo: 'Bascula', modelo: 'B-200', sede: 'Sede Sur', correctivos: 2, promedio: '1h', total: '$200,000' },
];

export default function ReportsList() {
  return (
    <MainLayout>
      <Head title="Informes" />
      <DataTable title="Informes" data={mockData} columns={columns} />
    </MainLayout>
  );
}
