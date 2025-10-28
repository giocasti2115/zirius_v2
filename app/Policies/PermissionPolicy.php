<?php

namespace App\Policies;

use App\Models\Permission;
use App\Models\User;

class PermissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('view-permissions');
    }

    public function view(User $user, Permission $permission): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('view-permissions');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('create-permissions');
    }

    public function update(User $user, Permission $permission): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('update-permissions');
    }

    public function delete(User $user, Permission $permission): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('delete-permissions');
    }
}
