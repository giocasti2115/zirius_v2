<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // User permissions
            ['name' => 'View Users', 'slug' => 'view-users', 'description' => 'View user list and details'],
            ['name' => 'Create Users', 'slug' => 'create-users', 'description' => 'Create application users'],
            ['name' => 'Update Users', 'slug' => 'update-users', 'description' => 'Update user data'],
            ['name' => 'Delete Users', 'slug' => 'delete-users', 'description' => 'Delete users'],

            // Role permissions
            ['name' => 'View Roles', 'slug' => 'view-roles', 'description' => 'View roles and their permissions'],
            ['name' => 'Create Roles', 'slug' => 'create-roles', 'description' => 'Create roles'],
            ['name' => 'Update Roles', 'slug' => 'update-roles', 'description' => 'Update roles'],
            ['name' => 'Delete Roles', 'slug' => 'delete-roles', 'description' => 'Delete roles'],

            // Permission permissions
            ['name' => 'View Permissions', 'slug' => 'view-permissions', 'description' => 'View permission definitions'],
            ['name' => 'Create Permissions', 'slug' => 'create-permissions', 'description' => 'Create permissions'],
            ['name' => 'Update Permissions', 'slug' => 'update-permissions', 'description' => 'Update permissions'],
            ['name' => 'Delete Permissions', 'slug' => 'delete-permissions', 'description' => 'Delete permissions'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['slug' => $perm['slug']], $perm);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Administrator with full access']);
        $editorRole = Role::firstOrCreate(['name' => 'editor'], ['description' => 'Editor with content permissions']);
        $userRole = Role::firstOrCreate(['name' => 'user'], ['description' => 'Regular user']);

        // Attach all permissions to admin
        $allPermIds = Permission::pluck('id')->toArray();
        $adminRole->permissions()->sync($allPermIds);

        // Editor: allow viewing roles/permissions and updating users (example)
        $editorPerms = Permission::whereIn('slug', ['view-roles','view-permissions','update-users'])->pluck('id')->toArray();
        $editorRole->permissions()->sync($editorPerms);

        // User: minimal permissions (view own profile is allowed by policy without explicit permission)
        $userPerms = Permission::whereIn('slug', ['view-permissions'])->pluck('id')->toArray();
        $userRole->permissions()->sync($userPerms);
    }
}
