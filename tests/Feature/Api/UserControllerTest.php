<?php

namespace Tests\Feature\Api;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles and permissions
        $this->artisan('db:seed', ['--class' => \Database\Seeders\RolePermissionSeeder::class]);
        
        // Create an admin user for testing using the helper method
        $adminData = $this->createAdminUserAndToken();
        $this->admin = $adminData['user'];
        $this->token = $adminData['token'];
    }

    public function test_can_list_users(): void
    {
        User::factory()->count(5)->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson('/api/users');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'first_name',
                            'last_name',
                            'email',
                            'created_at',
                            'updated_at'
                        ]
                    ],
                    'current_page',
                    'total'
                ]
            ]);
    }

    public function test_can_create_user(): void
    {
        $role = Role::factory()->create();
        
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '1234567890',
            'roles' => [$role->id]
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/users', $userData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'phone',
                    'roles'
                ],
                'message'
            ]);

        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
            'first_name' => $userData['first_name']
        ]);

        $user = User::where('email', $userData['email'])->first();
        $this->assertTrue($user->roles->contains($role->id));
    }

    public function test_can_show_user(): void
    {
        $user = User::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->getJson("/api/users/{$user->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'first_name',
                    'last_name',
                    'email',
                    'created_at',
                    'updated_at'
                ]
            ]);
    }

    public function test_can_update_user(): void
    {
        $user = User::factory()->create();
        $role = Role::factory()->create();

        $updateData = [
            'first_name' => 'Updated Name',
            'email' => 'updated@example.com',
            'roles' => [$role->id]
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/users/{$user->id}", $updateData);

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'first_name',
                    'email',
                    'roles'
                ],
                'message'
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'first_name' => $updateData['first_name'],
            'email' => $updateData['email']
        ]);

        $this->assertTrue($user->fresh()->roles->contains($role->id));
    }

    public function test_can_delete_user(): void
    {
        $user = User::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->deleteJson("/api/users/{$user->id}");

        $response->assertOk()
            ->assertJsonStructure(['message']);

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_cannot_create_user_with_existing_email(): void
    {
        $existingUser = User::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->postJson('/api/users', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => $existingUser->email,
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_cannot_update_user_with_existing_email(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/users/{$user1->id}", [
            'email' => $user2->email
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_unauthenticated_user_cannot_access_api(): void
    {
        $response = $this->getJson('/api/users');
        $response->assertStatus(401);
    }

    public function test_editor_can_view_but_not_modify_users(): void
    {
        $editorData = $this->createEditorUserAndToken();
        $user = User::factory()->create();

        // Editor can list users
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $editorData['token'],
        ])->getJson('/api/users');
        $response->assertOk();

        // Editor can view specific user
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $editorData['token'],
        ])->getJson("/api/users/{$user->id}");
        $response->assertOk();

        // Editor cannot create users
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $editorData['token'],
        ])->postJson('/api/users', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ]);
        $response->assertForbidden();

        // Editor cannot update users
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $editorData['token'],
        ])->putJson("/api/users/{$user->id}", [
            'first_name' => 'Updated Name'
        ]);
        $response->assertForbidden();

        // Editor cannot delete users
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $editorData['token'],
        ])->deleteJson("/api/users/{$user->id}");
        $response->assertForbidden();
    }

    public function test_basic_user_can_only_view_own_profile(): void
    {
        $userData = $this->createBasicUserAndToken();
        $otherUser = User::factory()->create();

        // User can view their own profile
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $userData['token'],
        ])->getJson("/api/users/{$userData['user']->id}");
        $response->assertOk();

        // User cannot view other users
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $userData['token'],
        ])->getJson("/api/users/{$otherUser->id}");
        $response->assertForbidden();

        // User cannot list all users
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $userData['token'],
        ])->getJson('/api/users');
        $response->assertForbidden();
    }

    public function test_can_update_user_password(): void
    {
        $user = User::factory()->create();
        $newPassword = 'newpassword123';

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->putJson("/api/users/{$user->id}", [
            'password' => $newPassword,
            'password_confirmation' => $newPassword
        ]);

        $response->assertOk();

        // Verify the user can login with new password
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => $newPassword
        ]);

        $loginResponse->assertOk();
    }
}