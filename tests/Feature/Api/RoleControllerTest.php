<?php

namespace Tests\Feature\Api;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Create an admin user for testing
        $this->admin = User::factory()->admin()->create();
        $this->token = $this->admin->createToken('test-token')->plainTextToken;
    }

    public function test_can_list_roles(): void
    {
        Role::factory()->count(3)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/roles');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'description',
                        'created_at',
                        'updated_at'
                    ]
                ]
            ]);
    }

    public function test_can_create_role(): void
    {
        $permissions = Permission::factory()->count(2)->create();

        $roleData = [
            'name' => 'editor',
            'description' => 'Editor role',
            'permissions' => $permissions->pluck('id')->toArray()
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/roles', $roleData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'description',
                    'permissions'
                ],
                'message'
            ]);

        $this->assertDatabaseHas('roles', [
            'name' => $roleData['name'],
            'description' => $roleData['description']
        ]);

        $role = Role::where('name', $roleData['name'])->first();
        $this->assertCount(2, $role->permissions);
    }

    public function test_can_show_role(): void
    {
        $role = Role::factory()->create();
        $permissions = Permission::factory()->count(2)->create();
        $role->permissions()->attach($permissions->pluck('id'));

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson("/api/roles/{$role->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'description',
                    'permissions'
                ]
            ]);
    }

    public function test_can_update_role(): void
    {
        $role = Role::factory()->create();
        $newPermissions = Permission::factory()->count(2)->create();

        $updateData = [
            'name' => 'updated-role',
            'description' => 'Updated description',
            'permissions' => $newPermissions->pluck('id')->toArray()
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/roles/{$role->id}", $updateData);

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'description',
                    'permissions'
                ],
                'message'
            ]);

        $this->assertDatabaseHas('roles', [
            'id' => $role->id,
            'name' => $updateData['name'],
            'description' => $updateData['description']
        ]);

        $this->assertCount(2, $role->fresh()->permissions);
    }

    public function test_can_delete_role(): void
    {
        $role = Role::factory()->create();
        $permissions = Permission::factory()->count(2)->create();
        $role->permissions()->attach($permissions->pluck('id'));

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->deleteJson("/api/roles/{$role->id}");

        $response->assertOk()
            ->assertJsonStructure(['message']);

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
        // Permissions should still exist
        $this->assertDatabaseCount('permissions', 2);
    }

    public function test_cannot_create_role_with_duplicate_name(): void
    {
        $existingRole = Role::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/roles', [
            'name' => $existingRole->name,
            'description' => 'New description'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_cannot_update_role_with_duplicate_name(): void
    {
        $role1 = Role::factory()->create();
        $role2 = Role::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/roles/{$role1->id}", [
            'name' => $role2->name
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_unauthenticated_user_cannot_access_roles(): void
    {
        $response = $this->getJson('/api/roles');
        $response->assertStatus(401);
    }
}
