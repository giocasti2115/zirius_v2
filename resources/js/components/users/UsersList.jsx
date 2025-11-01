import React from 'react';
import { usePage, Link } from '@inertiajs/react';

export default function UsersList() {
    const { users } = usePage().props;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Usuarios</h1>
                <Link href={route('users.create')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Crear Usuario</Link>
            </div>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Nombre</th>
                        <th className="py-2 px-4 border-b">Email</th>
                        <th className="py-2 px-4 border-b">Rol</th>
                        <th className="py-2 px-4 border-b">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.data.map(user => (
                        <tr key={user.id}>
                            <td className="py-2 px-4 border-b">{user.id}</td>
                            <td className="py-2 px-4 border-b">{user.first_name} {user.last_name}</td>
                            <td className="py-2 px-4 border-b">{user.email}</td>
                            <td className="py-2 px-4 border-b">{user.roles.map(r => r.name).join(', ')}</td>
                            <td className="py-2 px-4 border-b">
                                {/* <Link href={route('users.show', user.id)} className="text-blue-500 hover:underline mr-2">Ver</Link> */}
                                <Link href={route('users.edit', user.id)} className="text-yellow-500 hover:underline mr-2">Editar</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
