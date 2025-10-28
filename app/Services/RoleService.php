<?php

namespace App\Services;

use App\Models\Role;
use App\Repositories\RoleRepository;
use Illuminate\Support\Arr;

class RoleService
{
    public function __construct(protected RoleRepository $repository)
    {
    }

    public function all()
    {
        return $this->repository->all();
    }

    public function create(array $data): Role
    {
        $role = $this->repository->create(Arr::only($data, ['name','description']));

        if (!empty($data['permissions'])) {
            $role->permissions()->sync(Arr::wrap($data['permissions']));
        }

        return $role->load('permissions');
    }

    public function find(int $id): ?Role
    {
        return $this->repository->find($id);
    }

    public function update(Role $role, array $data): Role
    {
        $this->repository->update($role, Arr::only($data, ['name','description']));

        if (array_key_exists('permissions', $data)) {
            $role->permissions()->sync(Arr::wrap($data['permissions']));
        }

        return $role->load('permissions');
    }

    public function delete(Role $role): bool
    {
        return $this->repository->delete($role);
    }
}
