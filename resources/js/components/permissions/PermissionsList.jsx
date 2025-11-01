import React from 'react';
import { usePage, Link } from '@inertiajs/react';

export default function PermissionsList() {
    const { permissions } = usePage().props;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Permisos</h1>
                <Link href={route('permissions.create')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Crear Permiso</Link>
            </div>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Nombre</th>
                        <th className="py-2 px-4 border-b">Slug</th>
                        <th className="py-2 px-4 border-b">Descripción</th>
                        <th className="py-2 px-4 border-b">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {permissions.data.map(permission => (
                        <tr key={permission.id}>
                            <td className="py-2 px-4 border-b">{permission.id}</td>
                            <td className="py-2 px-4 border-b">{permission.name}</td>
                            <td className="py-2 px-4 border-b">{permission.slug}</td>
                            <td className="py-2 px-4 border-b">{permission.description}</td>
                            <td className="py-2 px-4 border-b">
                                {/* <Link href={route('permissions.show', permission.id)} className="text-blue-500 hover:underline mr-2">Ver</Link> */}
                                <Link href={route('permissions.edit', permission.id)} className="text-yellow-500 hover:underline mr-2">Editar</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
