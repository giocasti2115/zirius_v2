<?php

namespace App\Http\Controllers;

use App\Models\WarehouseRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseRequestController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->input('filter');
        $query = WarehouseRequest::query();
        if ($filter) {
            $query->where('status', $filter);
        }
        $requests = $query->with('user')->paginate(10);
        return Inertia::render('WarehouseRequestsList', [
            'requests' => $requests,
            'filter' => $filter,
        ]);
    }

    // Métodos para create, store, show, edit, update, destroy pueden agregarse aquí
}
