<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use App\Models\Permission;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PermissionController extends ApiController
{
    public function __construct(protected PermissionService $service)
    {
        // Apply authorization resource mappings (policies)
        $this->authorizeResource(\App\Models\Permission::class, 'permission');
    }

    public function index(): JsonResponse
    {
        $permissions = $this->service->all();
        return $this->successResponse($permissions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:permissions'],
            'description' => ['nullable', 'string'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $permission = $this->service->create($validated);

        return $this->successResponse($permission, 'Permission created successfully', 201);
    }

    public function show(Permission $permission): JsonResponse
    {
        $p = $this->service->find($permission->id);
        return $this->successResponse($p);
    }

    public function update(Request $request, Permission $permission): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', 'unique:permissions,name,' . $permission->id],
            'description' => ['nullable', 'string'],
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $updated = $this->service->update($permission, $validated);

        return $this->successResponse($updated, 'Permission updated successfully');
    }

    public function destroy(Permission $permission): JsonResponse
    {
        $this->service->delete($permission);
        return $this->successResponse(null, 'Permission deleted successfully');
    }
}
