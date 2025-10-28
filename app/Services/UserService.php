<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(protected UserRepository $repository)
    {
    }

    public function paginate(array $params = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->repository->paginate($params, $perPage);
    }

    public function create(array $data): User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user = $this->repository->create(Arr::only($data, ['first_name','last_name','email','phone','password','is_active']));

        if (!empty($data['roles'])) {
            $user->roles()->sync(Arr::wrap($data['roles']));
        }

        return $user->load('roles');
    }

    public function find(int $id): ?User
    {
        return $this->repository->find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->repository->findByEmail($email);
    }

    public function update(User $user, array $data): User
    {
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $this->repository->update($user, Arr::only($data, ['first_name','last_name','email','phone','password','is_active']));

        if (array_key_exists('roles', $data)) {
            $user->roles()->sync(Arr::wrap($data['roles']));
        }

        return $user->load('roles');
    }

    public function delete(User $user): bool
    {
        return $this->repository->delete($user);
    }
}
