
<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Solicitudes de Bodega
    Route::get('/warehouse-requests', [App\Http\Controllers\WarehouseRequestController::class, 'index'])->name('warehouse.requests.index');
    Route::get('/warehouse-requests/pending', [App\Http\Controllers\WarehouseRequestController::class, 'index'])->defaults('filter', 'pending')->name('warehouse.requests.pending');
    Route::get('/warehouse-requests/approved', [App\Http\Controllers\WarehouseRequestController::class, 'index'])->defaults('filter', 'approved')->name('warehouse.requests.approved');
    Route::get('/warehouse-requests/dispatched', [App\Http\Controllers\WarehouseRequestController::class, 'index'])->defaults('filter', 'dispatched')->name('warehouse.requests.dispatched');
    Route::get('/warehouse-requests/finished', [App\Http\Controllers\WarehouseRequestController::class, 'index'])->defaults('filter', 'finished')->name('warehouse.requests.finished');
    Route::get('/warehouse-requests/rejected', [App\Http\Controllers\WarehouseRequestController::class, 'index'])->defaults('filter', 'rejected')->name('warehouse.requests.rejected');
    Route::get('/warehouse-requests/spare', [App\Http\Controllers\WarehouseRequestController::class, 'index'])->defaults('filter', 'spare')->name('warehouse.requests.spare');
    Route::get('/warehouse-requests/items', [App\Http\Controllers\WarehouseRequestController::class, 'index'])->defaults('filter', 'items')->name('warehouse.requests.items');

    // Cotizaciones
    Route::get('/quotes', [App\Http\Controllers\QuoteController::class, 'index'])->name('quotes.index');
    Route::get('/quotes/pending', [App\Http\Controllers\QuoteController::class, 'index'])->defaults('filter', 'pending')->name('quotes.pending');
    Route::get('/quotes/approved', [App\Http\Controllers\QuoteController::class, 'index'])->defaults('filter', 'approved')->name('quotes.approved');
    Route::get('/quotes/rejected', [App\Http\Controllers\QuoteController::class, 'index'])->defaults('filter', 'rejected')->name('quotes.rejected');
    Route::get('/quotes/new', function () {
        return Inertia::render('QuoteForm');
    })->name('quotes.new');

    // Órdenes de Servicio
    Route::get('/service-orders', [App\Http\Controllers\ServiceOrderController::class, 'index'])->name('service.orders.index');
    Route::get('/service-orders/open-preventive', [App\Http\Controllers\ServiceOrderController::class, 'index'])->defaults('filter', 'open-preventive')->name('service.orders.open.preventive');
    Route::get('/service-orders/open-cig', [App\Http\Controllers\ServiceOrderController::class, 'index'])->defaults('filter', 'open-cig')->name('service.orders.open.cig');
    Route::get('/service-orders/closed', [App\Http\Controllers\ServiceOrderController::class, 'index'])->defaults('filter', 'closed')->name('service.orders.closed');

    // Visitas
    Route::get('/visits', [App\Http\Controllers\VisitController::class, 'index'])->name('visits.index');
    Route::get('/visits/pending', [App\Http\Controllers\VisitController::class, 'index'])->defaults('filter', 'pending')->name('visits.pending');
    Route::get('/visits/open', [App\Http\Controllers\VisitController::class, 'index'])->defaults('filter', 'open')->name('visits.open');
    Route::get('/visits/closed', [App\Http\Controllers\VisitController::class, 'index'])->defaults('filter', 'closed')->name('visits.closed');
    Route::get('/visits/calendar', [App\Http\Controllers\VisitController::class, 'index'])->defaults('filter', 'calendar')->name('visits.calendar');

    // Informes
    Route::get('/reports', [App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');

    // Configuración General
    Route::get('/general-config', [App\Http\Controllers\GeneralConfigController::class, 'index'])->name('general.config.index');
    Route::get('/general-config/users-access', [App\Http\Controllers\GeneralConfigController::class, 'index'])->defaults('tab', 'users-access')->name('general.config.users.access');
    Route::get('/general-config/equipment', [App\Http\Controllers\GeneralConfigController::class, 'index'])->defaults('tab', 'equipment')->name('general.config.equipment');
    Route::get('/general-config/maintenance', [App\Http\Controllers\GeneralConfigController::class, 'index'])->defaults('tab', 'maintenance')->name('general.config.maintenance');

    // Usuarios, Roles, Permisos
    Route::get('/users', function () {
        $users = \App\Models\User::with('roles')->paginate(10);
        return Inertia::render('UsersList', [
            'users' => $users
        ]);
    })->name('users.index');

    Route::get('/roles', function () {
        $roles = \App\Models\Role::with('permissions')->paginate(10);
        return Inertia::render('RolesList', [
            'roles' => $roles
        ]);
    })->name('roles.index');

    Route::get('/permissions', function () {
        $permissions = \App\Models\Permission::paginate(10);
        return Inertia::render('PermissionsList', [
            'permissions' => $permissions
        ]);
    })->name('permissions.index');

    Route::get('/users/create', function () {
        $roles = \App\Models\Role::all();
        return Inertia::render('UserForm', [
            'roles' => $roles
        ]);
    })->name('users.create');

    Route::get('/users/{user}/edit', function ($userId) {
        $user = \App\Models\User::with('roles')->findOrFail($userId);
        $roles = \App\Models\Role::all();
        return Inertia::render('UserForm', [
            'user' => $user,
            'roles' => $roles
        ]);
    })->name('users.edit');

    Route::get('/roles/create', function () {
        $permissions = \App\Models\Permission::all();
        return Inertia::render('RoleForm', [
            'permissions' => $permissions
        ]);
    })->name('roles.create');

    Route::get('/roles/{role}/edit', function ($roleId) {
        $role = \App\Models\Role::with('permissions')->findOrFail($roleId);
        $permissions = \App\Models\Permission::all();
        return Inertia::render('RoleForm', [
            'role' => $role,
            'permissions' => $permissions
        ]);
    })->name('roles.edit');

    Route::get('/permissions/create', function () {
        return Inertia::render('PermissionForm');
    })->name('permissions.create');

    Route::get('/permissions/{permission}/edit', function ($permissionId) {
        $permission = \App\Models\Permission::findOrFail($permissionId);
        return Inertia::render('PermissionForm', [
            'permission' => $permission
        ]);
    })->name('permissions.edit');
});

require __DIR__.'/auth.php';
