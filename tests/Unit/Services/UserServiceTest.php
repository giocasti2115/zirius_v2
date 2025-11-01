<?php

namespace Tests\Unit\Services;

use App\Models\Role;
use App\Models\User;
use App\Repositories\UserRepository;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    private UserService $userService;
    private UserRepository $userRepository;

    protected function setUp(): void
    {
        parent::setUp();

        $this->userRepository = app(UserRepository::class);
        $this->userService = app(UserService::class);
    }

    public function test_it_can_create_user_with_basic_data(): void
    {
        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'password' => 'password123',
            'is_active' => true
        ];

        $user = $this->userService->create($userData);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals($userData['first_name'], $user->first_name);
        $this->assertEquals($userData['last_name'], $user->last_name);
        $this->assertEquals($userData['email'], $user->email);
        $this->assertEquals($userData['phone'], $user->phone);
        $this->assertTrue(Hash::check($userData['password'], $user->password));
        $this->assertTrue($user->is_active);
        $this->assertEmpty($user->roles);
    }

    public function test_it_can_create_user_with_roles(): void
    {
        $role = Role::factory()->create(['name' => 'editor']);

        $userData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'roles' => [$role->id]
        ];

        $user = $this->userService->create($userData);

        $this->assertInstanceOf(User::class, $user);
        $this->assertCount(1, $user->roles);
        $this->assertEquals($role->id, $user->roles->first()->id);
    }

    public function test_it_can_update_user(): void
    {
        $user = User::factory()->create();

        $updateData = [
            'first_name' => 'Updated Name',
            'email' => 'updated@example.com',
            'password' => 'newpassword123'
        ];

        $updatedUser = $this->userService->update($user, $updateData);

        $this->assertEquals($updateData['first_name'], $updatedUser->first_name);
        $this->assertEquals($updateData['email'], $updatedUser->email);
        $this->assertTrue(Hash::check($updateData['password'], $updatedUser->password));
    }

    public function test_it_can_update_user_roles(): void
    {
        $user = User::factory()->create();
        $role1 = Role::factory()->create(['name' => 'editor']);
        $role2 = Role::factory()->create(['name' => 'admin']);

        // First assign one role
        $this->userService->update($user, ['roles' => [$role1->id]]);
        $this->assertCount(1, $user->fresh()->roles);

        // Then update to different role
        $updatedUser = $this->userService->update($user, ['roles' => [$role2->id]]);
        $this->assertCount(1, $updatedUser->roles);
        $this->assertEquals($role2->id, $updatedUser->roles->first()->id);
    }

    public function test_it_can_find_user_by_id(): void
    {
        $user = User::factory()->create();

        $foundUser = $this->userService->find($user->id);

        $this->assertInstanceOf(User::class, $foundUser);
        $this->assertEquals($user->id, $foundUser->id);
    }

    public function test_it_can_find_user_by_email(): void
    {
        $user = User::factory()->create();

        $foundUser = $this->userService->findByEmail($user->email);

        $this->assertInstanceOf(User::class, $foundUser);
        $this->assertEquals($user->email, $foundUser->email);
    }

    public function test_it_returns_null_for_nonexistent_user(): void
    {
        $this->assertNull($this->userService->find(999));
        $this->assertNull($this->userService->findByEmail('nonexistent@example.com'));
    }

    public function test_it_can_delete_user(): void
    {
        $user = User::factory()->create();

        $result = $this->userService->delete($user);

        $this->assertTrue($result);
        $this->assertNull($this->userService->find($user->id));
    }

    public function test_it_can_paginate_users(): void
    {
        User::factory()->count(15)->create();

        $result = $this->userService->paginate([], 10);

        $this->assertEquals(10, $result->perPage());
        $this->assertEquals(15, $result->total());
        $this->assertEquals(2, $result->lastPage());
    }

    public function test_it_can_paginate_users_with_filters(): void
    {
        User::factory()->count(3)->create(['is_active' => true]);
        User::factory()->count(2)->create(['is_active' => false]);

        $result = $this->userService->paginate(['is_active' => true], 10);

        $this->assertEquals(3, $result->total());
        foreach ($result as $user) {
            $this->assertTrue($user->is_active);
        }
    }
}
