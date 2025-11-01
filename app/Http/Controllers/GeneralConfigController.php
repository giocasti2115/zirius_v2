<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class GeneralConfigController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->input('tab');
        // Aquí deberías cargar los datos reales según el tab
        return Inertia::render('GeneralConfigList', [
            'tab' => $tab,
        ]);
    }
}
