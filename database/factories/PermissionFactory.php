<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Permission>
 */
class PermissionFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);
        return [
            'name' => ucfirst($name),
            'slug' => str("$name")->slug()->value(),
            'description' => fake()->sentence(),
        ];
    }
}
