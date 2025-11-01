import React from 'react';
import { useForm, router } from '@inertiajs/react';

export default function RoleForm({ role = null, permissions = [] }) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name || '',
        description: role?.description || '',
        permissions: role?.permissions?.map(p => p.id) || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (role) {
            put(route('roles.update', role.id), {
                onSuccess: () => router.visit(route('roles.index')),
            });
        } else {
            post(route('roles.store'), {
                onSuccess: () => router.visit(route('roles.index')),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">{role ? 'Editar Rol' : 'Crear Rol'}</h2>
            <div className="mb-4">
                <label className="block mb-1">Nombre</label>
                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
            </div>
            <div className="mb-4">
                <label className="block mb-1">Descripción</label>
                <input type="text" value={data.description} onChange={e => setData('description', e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.description && <div className="text-red-500 text-xs">{errors.description}</div>}
            </div>
            <div className="mb-4">
                <label className="block mb-1">Permisos</label>
                <select multiple value={data.permissions} onChange={e => setData('permissions', Array.from(e.target.selectedOptions, opt => Number(opt.value)))} className="w-full border rounded px-3 py-2">
                    {permissions.map(permission => (
                        <option key={permission.id} value={permission.id}>{permission.name}</option>
                    ))}
                </select>
                {errors.permissions && <div className="text-red-500 text-xs">{errors.permissions}</div>}
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={processing}>
                {role ? 'Actualizar' : 'Crear'}
            </button>
        </form>
    );
}
