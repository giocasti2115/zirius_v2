<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('view-roles');
    }

    public function view(User $user, Role $role): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('view-roles');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('create-roles');
    }

    public function update(User $user, Role $role): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('update-roles');
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('delete-roles');
    }
}
