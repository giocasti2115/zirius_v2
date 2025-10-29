<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->optional()->phoneNumber(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create a user with admin role.
     */
    public function admin(): static
    {
        return $this->afterCreating(function (\App\Models\User $user) {
            // Ensure an admin role exists and attach it to the created user
            $role = \App\Models\Role::firstOrCreate(
                ['name' => 'admin'],
                ['description' => 'Administrator']
            );

            $user->roles()->syncWithoutDetaching([$role->id]);
        });
    }

    /**
     * Create a user with editor role.
     */
    public function editor(): static
    {
        return $this->afterCreating(function (\App\Models\User $user) {
            $role = \App\Models\Role::firstOrCreate(
                ['name' => 'editor'],
                ['description' => 'Editor with content management permissions']
            );

            $user->roles()->syncWithoutDetaching([$role->id]);
        });
    }

    /**
     * Create a basic user with default role.
     */
    public function basicUser(): static
    {
        return $this->afterCreating(function (\App\Models\User $user) {
            $role = \App\Models\Role::firstOrCreate(
                ['name' => 'user'],
                ['description' => 'Regular user with basic access']
            );

            $user->roles()->syncWithoutDetaching([$role->id]);
        });
    }
}
