<?php

namespace App\Services;

use App\Models\Permission;
use App\Repositories\PermissionRepository;
use Illuminate\Support\Arr;

class PermissionService
{
    public function __construct(protected PermissionRepository $repository)
    {
    }

    public function all()
    {
        return $this->repository->all();
    }

    public function create(array $data): Permission
    {
        $perm = $this->repository->create(Arr::only($data, ['name','slug','description']));
        return $perm;
    }

    public function find(int $id): ?Permission
    {
        return $this->repository->find($id);
    }

    public function update(Permission $permission, array $data): Permission
    {
        $this->repository->update($permission, Arr::only($data, ['name','slug','description']));
        return $permission;
    }

    public function delete(Permission $permission): bool
    {
        return $this->repository->delete($permission);
    }
}
