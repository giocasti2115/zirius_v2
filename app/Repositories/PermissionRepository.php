<?php

namespace App\Repositories;

use App\Models\Permission;

class PermissionRepository
{
    public function all()
    {
        return Permission::all();
    }

    public function create(array $data): Permission
    {
        return Permission::create($data);
    }

    public function find(int $id): ?Permission
    {
        return Permission::find($id);
    }

    public function update(Permission $permission, array $data): bool
    {
        return $permission->update($data);
    }

    public function delete(Permission $permission): bool
    {
        return (bool) $permission->delete();
    }
}
