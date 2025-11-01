<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->input('filter');
        $query = Quote::query();
        if ($filter) {
            $query->where('status', $filter);
        }
        $quotes = $query->paginate(10);
        return Inertia::render('QuotesList', [
            'quotes' => $quotes,
            'filter' => $filter,
        ]);
    }
}
