<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class UserController extends ApiController
{
    public function __construct(protected UserService $service)
    {
        // Apply authorization resource mappings (policies)
        $this->authorizeResource(\App\Models\User::class, 'user');
    }

    public function index(Request $request): JsonResponse
    {
        $users = $this->service->paginate($request->only('search'), 10);
        return $this->successResponse($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20'],
            'roles' => ['array', 'exists:roles,id'],
        ]);

        $user = $this->service->create($validated);

        return $this->successResponse($user, 'User created successfully', 201);
    }

    public function show(User $user): JsonResponse
    {
        $u = $this->service->find($user->id);
        return $this->successResponse($u);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['sometimes', 'confirmed', Rules\Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['sometimes', 'boolean'],
            'roles' => ['sometimes', 'array', 'exists:roles,id'],
        ]);

        $updated = $this->service->update($user, $validated);

        return $this->successResponse($updated, 'User updated successfully');
    }

    public function destroy(User $user): JsonResponse
    {
        $this->service->delete($user);
        return $this->successResponse(null, 'User deleted successfully');
    }
}