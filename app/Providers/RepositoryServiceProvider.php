<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\UserRepository;
use App\Repositories\RoleRepository;
use App\Repositories\PermissionRepository;
use App\Services\AuthenticationService;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(UserRepository::class, UserRepository::class);
        $this->app->singleton(RoleRepository::class, RoleRepository::class);
        $this->app->singleton(PermissionRepository::class, PermissionRepository::class);
        $this->app->singleton(AuthenticationService::class, AuthenticationService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
