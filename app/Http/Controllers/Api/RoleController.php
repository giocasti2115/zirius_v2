<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use App\Models\Role;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends ApiController
{
    public function __construct(protected RoleService $service)
    {
        // Apply authorization resource mappings (policies)
        $this->authorizeResource(\App\Models\Role::class, 'role');
    }

    public function index(): JsonResponse
    {
        $roles = $this->service->all();
        return $this->successResponse($roles);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles'],
            'description' => ['nullable', 'string'],
            'permissions' => ['array', 'exists:permissions,id'],
        ]);

        $role = $this->service->create($validated);

        return $this->successResponse($role, 'Role created successfully', 201);
    }

    public function show(Role $role): JsonResponse
    {
        $r = $this->service->find($role->id);
        return $this->successResponse($r);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', 'unique:roles,name,' . $role->id],
            'description' => ['nullable', 'string'],
            'permissions' => ['sometimes', 'array', 'exists:permissions,id'],
        ]);

        $updated = $this->service->update($role, $validated);

        return $this->successResponse($updated, 'Role updated successfully');
    }

    public function destroy(Role $role): JsonResponse
    {
        $this->service->delete($role);
        return $this->successResponse(null, 'Role deleted successfully');
    }
}
