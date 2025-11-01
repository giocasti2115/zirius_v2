import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';

export default function UserForm({ user = null, roles = [] }) {
    const { data, setData, post, put, processing, errors } = useForm({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        password: '',
        password_confirmation: '',
        roles: user?.roles?.map(r => r.id) || [],
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (user) {
            put(route('users.update', user.id), {
                onSuccess: () => router.visit(route('users.index')),
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => router.visit(route('users.index')),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">{user ? 'Editar Usuario' : 'Crear Usuario'}</h2>
            <div className="mb-4">
                <label className="block mb-1">Nombre</label>
                <input type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.first_name && <div className="text-red-500 text-xs">{errors.first_name}</div>}
            </div>
            <div className="mb-4">
                <label className="block mb-1">Apellido</label>
                <input type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.last_name && <div className="text-red-500 text-xs">{errors.last_name}</div>}
            </div>
            <div className="mb-4">
                <label className="block mb-1">Email</label>
                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
            </div>
            <div className="mb-4">
                <label className="block mb-1">Teléfono</label>
                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.phone && <div className="text-red-500 text-xs">{errors.phone}</div>}
            </div>
            <div className="mb-4">
                <label className="block mb-1">Contraseña</label>
                <input type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.password && <div className="text-red-500 text-xs">{errors.password}</div>}
            </div>
            <div className="mb-4">
                <label className="block mb-1">Confirmar Contraseña</label>
                <input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="w-full border rounded px-3 py-2" />
                {errors.password_confirmation && <div className="text-red-500 text-xs">{errors.password_confirmation}</div>}
            </div>
            <div className="mb-4">
                <label className="block mb-1">Roles</label>
                <select multiple value={data.roles} onChange={e => setData('roles', Array.from(e.target.selectedOptions, opt => Number(opt.value)))} className="w-full border rounded px-3 py-2">
                    {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                </select>
                {errors.roles && <div className="text-red-500 text-xs">{errors.roles}</div>}
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={processing}>
                {user ? 'Actualizar' : 'Crear'}
            </button>
        </form>
    );
}
