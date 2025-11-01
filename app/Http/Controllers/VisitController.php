<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VisitController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->input('filter');
        $query = Visit::query();
        if ($filter) {
            $query->where('status', $filter);
        }
        $visits = $query->paginate(10);
        return Inertia::render('VisitsList', [
            'visits' => $visits,
            'filter' => $filter,
        ]);
    }
}
