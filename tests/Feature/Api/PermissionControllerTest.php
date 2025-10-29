<?php

namespace Tests\Feature\Api;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionControllerTest extends TestCase
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

    public function test_can_list_permissions(): void
    {
        Permission::factory()->count(3)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/permissions');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'description',
                        'created_at',
                        'updated_at'
                    ]
                ]
            ]);
    }

    public function test_can_create_permission(): void
    {
        $permissionData = [
            'name' => 'Edit Posts',
            'description' => 'Can edit blog posts'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/permissions', $permissionData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'description'
                ],
                'message'
            ]);

        $this->assertDatabaseHas('permissions', [
            'name' => $permissionData['name'],
            'slug' => 'edit-posts',
            'description' => $permissionData['description']
        ]);
    }

    public function test_can_show_permission(): void
    {
        $permission = Permission::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson("/api/permissions/{$permission->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'description',
                    'created_at',
                    'updated_at'
                ]
            ]);
    }

    public function test_can_update_permission(): void
    {
        $permission = Permission::factory()->create();

        $updateData = [
            'name' => 'Updated Permission',
            'description' => 'Updated description'
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/permissions/{$permission->id}", $updateData);

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'description'
                ],
                'message'
            ]);

        $this->assertDatabaseHas('permissions', [
            'id' => $permission->id,
            'name' => $updateData['name'],
            'slug' => 'updated-permission',
            'description' => $updateData['description']
        ]);
    }

    public function test_can_delete_permission(): void
    {
        $permission = Permission::factory()->create();
        $role = Role::factory()->create();
        $role->permissions()->attach($permission->id);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->deleteJson("/api/permissions/{$permission->id}");

        $response->assertOk()
            ->assertJsonStructure(['message']);

        $this->assertDatabaseMissing('permissions', ['id' => $permission->id]);
        $this->assertDatabaseMissing('permission_role', ['permission_id' => $permission->id]);
    }

    public function test_cannot_create_permission_with_duplicate_name(): void
    {
        $existingPermission = Permission::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/permissions', [
            'name' => $existingPermission->name,
            'description' => 'New description'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_cannot_update_permission_with_duplicate_name(): void
    {
        $permission1 = Permission::factory()->create();
        $permission2 = Permission::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/permissions/{$permission1->id}", [
            'name' => $permission2->name
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_slug_is_automatically_generated(): void
    {
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/permissions', [
            'name' => 'Create New Posts',
            'description' => 'Can create new blog posts'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('permissions', [
            'name' => 'Create New Posts',
            'slug' => 'create-new-posts'
        ]);
    }

    public function test_unauthenticated_user_cannot_access_permissions(): void
    {
        $response = $this->getJson('/api/permissions');
        $response->assertStatus(401);
    }
}