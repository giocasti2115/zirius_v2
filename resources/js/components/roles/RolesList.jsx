import React from 'react';
import { usePage, Link } from '@inertiajs/react';

export default function RolesList() {
    const { roles } = usePage().props;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Roles</h1>
                <Link href={route('roles.create')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Crear Rol</Link>
            </div>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Nombre</th>
                        <th className="py-2 px-4 border-b">Descripción</th>
                        <th className="py-2 px-4 border-b">Permisos</th>
                        <th className="py-2 px-4 border-b">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.data.map(role => (
                        <tr key={role.id}>
                            <td className="py-2 px-4 border-b">{role.id}</td>
                            <td className="py-2 px-4 border-b">{role.name}</td>
                            <td className="py-2 px-4 border-b">{role.description}</td>
                            <td className="py-2 px-4 border-b">{role.permissions.map(p => p.name).join(', ')}</td>
                            <td className="py-2 px-4 border-b">
                                {/* <Link href={route('roles.show', role.id)} className="text-blue-500 hover:underline mr-2">Ver</Link> */}
                                <Link href={route('roles.edit', role.id)} className="text-yellow-500 hover:underline mr-2">Editar</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
