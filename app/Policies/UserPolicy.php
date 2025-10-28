<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('view-users');
    }

    public function view(User $user, User $model): bool
    {
        // Allow users to view themselves or admins/managers
        return $user->id === $model->id || $user->hasRole('admin') || $user->hasPermission('view-users');
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('create-users');
    }

    public function update(User $user, User $model): bool
    {
        // Allow users to update themselves or admins/managers
        return $user->id === $model->id || $user->hasRole('admin') || $user->hasPermission('update-users');
    }

    public function delete(User $user, User $model): bool
    {
        return $user->hasRole('admin') || $user->hasPermission('delete-users');
    }
}
