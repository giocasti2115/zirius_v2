import MainLayout from '../layouts/MainLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <MainLayout>
            <Head title="Dashboard" />
            <h1 className="text-3xl font-bold mb-6">Panel de Control</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">Usuarios</h2>
                    <p>Gestiona los usuarios del sistema.</p>
                    <a href="/users" className="text-blue-500 hover:underline mt-2 block">Ir a Usuarios</a>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">Roles</h2>
                    <p>Gestiona los roles y sus permisos.</p>
                    <a href="/roles" className="text-blue-500 hover:underline mt-2 block">Ir a Roles</a>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-2">Permisos</h2>
                    <p>Gestiona los permisos del sistema.</p>
                    <a href="/permissions" className="text-blue-500 hover:underline mt-2 block">Ir a Permisos</a>
                </div>
            </div>
        </MainLayout>
    );
}
