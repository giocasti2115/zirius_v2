<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserRepository
{
    public function paginate(array $params = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = User::query();

        if (!empty($params['search'])) {
            $s = $params['search'];
            $query->where(function ($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                  ->orWhere('last_name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        // Apply is_active filter when provided
        if (array_key_exists('is_active', $params)) {
            $query->where('is_active', (bool) $params['is_active']);
        }

        return $query->with('roles')->paginate($perPage);
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function find(int $id): ?User
    {
        return User::with('roles')->find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::with('roles')->where('email', $email)->first();
    }

    public function update(User $user, array $data): bool
    {
        return $user->update($data);
    }

    public function delete(User $user): bool
    {
        return (bool) $user->delete();
    }
}
