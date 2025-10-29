<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthenticationService
{
    public function __construct(protected UserService $userService)
    {
    }

    /**
     * Register a new user and return user + token
     */
    public function register(array $data): array
    {
        $user = $this->userService->create($data);
        $token = $user->createToken('auth-token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Attempt login and return user + token
     */
    public function login(array $credentials): array
    {
        $user = $this->userService->findByEmail($credentials['email'] ?? '');
        
        if (!$user || !\Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Logout current token
     */
    public function logout(Request $request): void
    {
        $request->user()->currentAccessToken()->delete();
    }
}
