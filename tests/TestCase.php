<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Create an admin user and return both the user and their token.
     */
    protected function createAdminUserAndToken(): array
    {
        $admin = \App\Models\User::factory()->admin()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        return ['user' => $admin, 'token' => $token];
    }

    /**
     * Create an editor user and return both the user and their token.
     */
    protected function createEditorUserAndToken(): array
    {
        $editor = \App\Models\User::factory()->editor()->create();
        $token = $editor->createToken('test-token')->plainTextToken;

        return ['user' => $editor, 'token' => $token];
    }

    /**
     * Create a basic user and return both the user and their token.
     */
    protected function createBasicUserAndToken(): array
    {
        $user = \App\Models\User::factory()->basicUser()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Create a user with a specific role and return both the user and their token.
     */
    protected function createUserWithRoleAndToken(string $roleName): array
    {
        $user = \App\Models\User::factory()->create();
        $role = \App\Models\Role::firstOrCreate(
            ['name' => $roleName],
            ['description' => ucfirst($roleName) . ' role']
        );
        $user->roles()->syncWithoutDetaching([$role->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }
}
