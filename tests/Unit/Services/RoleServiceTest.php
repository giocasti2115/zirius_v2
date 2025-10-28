<?php

namespace Tests\Unit\Services;

use App\Models\Permission;
use App\Models\Role;
use App\Repositories\RoleRepository;
use App\Services\RoleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleServiceTest extends TestCase
{
    use RefreshDatabase;

    private RoleService $roleService;
    private RoleRepository $roleRepository;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->roleRepository = app(RoleRepository::class);
        $this->roleService = app(RoleService::class);
    }

    public function test_it_can_create_role_with_basic_data(): void
    {
        $roleData = [
            'name' => 'editor',
            'description' => 'Editor role with content management permissions'
        ];

        $role = $this->roleService->create($roleData);

        $this->assertInstanceOf(Role::class, $role);
        $this->assertEquals($roleData['name'], $role->name);
        $this->assertEquals($roleData['description'], $role->description);
        $this->assertEmpty($role->permissions);
    }

    public function test_it_can_create_role_with_permissions(): void
    {
        $permission = Permission::factory()->create(['name' => 'edit_content']);
        
        $roleData = [
            'name' => 'editor',
            'description' => 'Editor role',
            'permissions' => [$permission->id]
        ];

        $role = $this->roleService->create($roleData);

        $this->assertInstanceOf(Role::class, $role);
        $this->assertCount(1, $role->permissions);
        $this->assertEquals($permission->id, $role->permissions->first()->id);
    }

    public function test_it_can_update_role(): void
    {
        $role = Role::factory()->create();
        
        $updateData = [
            'name' => 'updated_role',
            'description' => 'Updated description'
        ];

        $updatedRole = $this->roleService->update($role, $updateData);

        $this->assertEquals($updateData['name'], $updatedRole->name);
        $this->assertEquals($updateData['description'], $updatedRole->description);
    }

    public function test_it_can_update_role_permissions(): void
    {
        $role = Role::factory()->create();
        $permission1 = Permission::factory()->create(['name' => 'edit_content']);
        $permission2 = Permission::factory()->create(['name' => 'delete_content']);

        // First assign one permission
        $this->roleService->update($role, ['permissions' => [$permission1->id]]);
        $this->assertCount(1, $role->fresh()->permissions);

        // Then update to different permission
        $updatedRole = $this->roleService->update($role, ['permissions' => [$permission2->id]]);
        $this->assertCount(1, $updatedRole->permissions);
        $this->assertEquals($permission2->id, $updatedRole->permissions->first()->id);
    }

    public function test_it_can_find_role_by_id(): void
    {
        $role = Role::factory()->create();

        $foundRole = $this->roleService->find($role->id);

        $this->assertInstanceOf(Role::class, $foundRole);
        $this->assertEquals($role->id, $foundRole->id);
    }

    public function test_it_returns_null_for_nonexistent_role(): void
    {
        $this->assertNull($this->roleService->find(999));
    }

    public function test_it_can_delete_role(): void
    {
        $role = Role::factory()->create();

        $result = $this->roleService->delete($role);

        $this->assertTrue($result);
        $this->assertNull($this->roleService->find($role->id));
    }

    public function test_it_can_list_all_roles(): void
    {
        $roles = Role::factory()->count(3)->create();

        $result = $this->roleService->all();

        $this->assertCount(3, $result);
        foreach ($roles as $role) {
            $this->assertContains($role->id, $result->pluck('id'));
        }
    }

    public function test_deleting_role_detaches_permissions(): void
    {
        $role = Role::factory()->create();
        $permission = Permission::factory()->create();
        
        $this->roleService->update($role, ['permissions' => [$permission->id]]);
        $this->assertCount(1, $role->fresh()->permissions);

        $this->roleService->delete($role);
        
        // The permission should still exist but not be attached to any roles
        $this->assertDatabaseHas('permissions', ['id' => $permission->id]);
        $this->assertDatabaseMissing('permission_role', ['role_id' => $role->id]);
    }
}