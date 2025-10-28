# Permissions & Roles

This document explains the seeders and middleware added for roles/permissions.

Seeders
-------
- `Database\Seeders\RolePermissionSeeder` creates default granular permissions and roles:
  - Permissions seeded (examples): `view-users`, `create-users`, `update-users`, `delete-users`,
    `view-roles`, `create-roles`, `update-roles`, `delete-roles`,
    `view-permissions`, `create-permissions`, `update-permissions`, `delete-permissions`.
  - Roles seeded: `admin`, `editor`, `user`
  - `admin` receives all permissions by default

- `Database\Seeders\AdminUserSeeder` creates an admin user (if not exists):
  - Email: `admin@example.com`
  - Password: `password` (change in production)
  - Assigns the `admin` role to that user

To run seeders locally (inside the app container):

```bash
# run migrations + seeders (testing or local environment)
php artisan migrate:fresh --seed

# or specifically
php artisan db:seed --class=\Database\Seeders\RolePermissionSeeder
php artisan db:seed --class=\Database\Seeders\AdminUserSeeder
```

Middleware
----------
- `App\Http\Middleware\EnsurePermission` — checks that the authenticated user has the requested permission or is `admin`.

Usage in routes (example):

```php
// Only users with the 'create-users' permission or admin can hit this route
Route::post('/users', function () { /* ... */ })->middleware('auth:sanctum', 'permission:create-users');
```

Notes
-----
- Policies are registered in `App\Providers\AuthServiceProvider` and controllers use `authorizeResource(...)`.
- The `UserPolicy` allows users to view/update themselves even without explicit permissions; other actions are guarded by granular permissions.
- If your HTTP kernel is custom, `app/Http/Kernel.php` now includes a `permission` alias linking to `App\Http\Middleware\EnsurePermission`.

Security
--------
- Change the default admin password and email in production.
- You can extend the permission set with more granular names (e.g., `create-role`, `delete-role`, `assign-role`) as needed.
