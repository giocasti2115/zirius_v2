
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { DataTable } from '../components/DataTable';

const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Nombre', sortable: true },
    { key: 'description', label: 'Descripción', sortable: true },
];

const mockData = [
    { id: 1, name: 'view-users', description: 'Ver usuarios' },
    { id: 2, name: 'view-roles', description: 'Ver roles' },
    { id: 3, name: 'view-permissions', description: 'Ver permisos' },
];

export default function PermissionsList() {
    return (
        <MainLayout>
            <Head title="Permisos" />
            <DataTable title="Permisos" data={mockData} columns={columns} />
        </MainLayout>
    );
}
