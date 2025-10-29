# Roles and Permissions

## Roles

The application defines three default roles:

- **Admin**: Full system access
- **Editor**: Read-only access to users, roles, and permissions
- **User**: Basic access (view own profile)

## Permissions

### User Management
- `view-users`: View user list and details
- `create-users`: Create new users
- `update-users`: Modify user data
- `delete-users`: Remove users

### Role Management
- `view-roles`: View roles and their permissions
- `create-roles`: Create new roles
- `update-roles`: Modify roles
- `delete-roles`: Remove roles

### Permission Management
- `view-permissions`: View permission definitions
- `create-permissions`: Create new permissions
- `update-permissions`: Modify permissions
- `delete-permissions`: Remove permissions

## Default Role Permissions

### Admin
- All permissions

### Editor
- `view-users`
- `view-roles`
- `view-permissions`

### User
- View own profile (no explicit permission needed)
- `view-permissions`

## Usage in Code

### Checking Permissions
```php
// In controllers
$this->authorize('view', $user);
$this->authorize('create', User::class);

// In blade templates
@can('view', $user)
    <!-- Show content -->
@endcan

// Direct checks
if ($user->hasPermission('view-users')) {
    // Do something
}
```

### Middleware
```php
Route::middleware('permission:view-users')->get('/users', [UserController::class, 'index']);
```