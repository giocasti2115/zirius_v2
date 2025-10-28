<?php

namespace App\Repositories;

use App\Models\Role;

class RoleRepository
{
    public function all()
    {
        return Role::with('permissions')->get();
    }

    public function create(array $data): Role
    {
        return Role::create($data);
    }

    public function find(int $id): ?Role
    {
        return Role::with('permissions')->find($id);
    }

    public function update(Role $role, array $data): bool
    {
        return $role->update($data);
    }

    public function delete(Role $role): bool
    {
        return (bool) $role->delete();
    }
}
