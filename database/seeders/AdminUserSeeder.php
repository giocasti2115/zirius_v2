<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminEmail = 'admin@example.com';

        $user = User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => $adminEmail,
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );

        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $user->roles()->syncWithoutDetaching([$adminRole->id]);
        }
    }
}
