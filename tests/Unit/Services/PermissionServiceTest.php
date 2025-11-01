<?php

namespace Tests\Unit\Services;

use App\Models\Permission;
use App\Models\Role;
use App\Repositories\PermissionRepository;
use App\Services\PermissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionServiceTest extends TestCase
{
    use RefreshDatabase;

    private PermissionService $permissionService;
    private PermissionRepository $permissionRepository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->permissionRepository = app(PermissionRepository::class);
        $this->permissionService = app(PermissionService::class);
    }

    public function test_it_can_create_permission(): void
    {
        $permData = [
            'name' => 'Edit Posts',
            'slug' => 'edit-posts',
            'description' => 'Can edit blog posts'
        ];

        $permission = $this->permissionService->create($permData);

        $this->assertInstanceOf(Permission::class, $permission);
        $this->assertEquals($permData['name'], $permission->name);
        $this->assertEquals($permData['slug'], $permission->slug);
        $this->assertEquals($permData['description'], $permission->description);
    }

    public function test_it_can_update_permission(): void
    {
        $permission = Permission::factory()->create();

        $updateData = [
            'name' => 'Updated Permission',
            'slug' => 'updated-permission',
            'description' => 'Updated description'
        ];

        $updatedPermission = $this->permissionService->update($permission, $updateData);

        $this->assertEquals($updateData['name'], $updatedPermission->name);
        $this->assertEquals($updateData['slug'], $updatedPermission->slug);
        $this->assertEquals($updateData['description'], $updatedPermission->description);
    }

    public function test_it_can_find_permission_by_id(): void
    {
        $permission = Permission::factory()->create();

        $foundPermission = $this->permissionService->find($permission->id);

        $this->assertInstanceOf(Permission::class, $foundPermission);
        $this->assertEquals($permission->id, $foundPermission->id);
    }

    public function test_it_returns_null_for_nonexistent_permission(): void
    {
        $this->assertNull($this->permissionService->find(999));
    }

    public function test_it_can_delete_permission(): void
    {
        $permission = Permission::factory()->create();

        $result = $this->permissionService->delete($permission);

        $this->assertTrue($result);
        $this->assertNull($this->permissionService->find($permission->id));
    }

    public function test_it_can_list_all_permissions(): void
    {
        $permissions = Permission::factory()->count(3)->create();

        $result = $this->permissionService->all();

        $this->assertCount(3, $result);
        foreach ($permissions as $permission) {
            $this->assertContains($permission->id, $result->pluck('id'));
        }
    }

    public function test_deleting_permission_detaches_from_roles(): void
    {
        $permission = Permission::factory()->create();
        $role = Role::factory()->create();

        // Attach permission to role
        $role->permissions()->attach($permission);
        $this->assertTrue($role->permissions->contains($permission->id));

        // Delete permission
        $this->permissionService->delete($permission);

        // The role should still exist but not have the permission
        $this->assertDatabaseHas('roles', ['id' => $role->id]);
        $this->assertDatabaseMissing('permission_role', ['permission_id' => $permission->id]);
    }

    public function test_it_only_updates_fillable_fields(): void
    {
        $permission = Permission::factory()->create();
        $originalCreatedAt = $permission->created_at;

        $updateData = [
            'name' => 'Updated Name',
            'created_at' => now()->addDay() // This should be ignored
        ];

        $updatedPermission = $this->permissionService->update($permission, $updateData);

        $this->assertEquals('Updated Name', $updatedPermission->name);
        $this->assertEquals($originalCreatedAt, $updatedPermission->created_at);
    }
}
