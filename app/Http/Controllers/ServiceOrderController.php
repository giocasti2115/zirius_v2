<?php

namespace App\Http\Controllers;

use App\Models\ServiceOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceOrderController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->input('filter');
        $query = ServiceOrder::query();
        if ($filter) {
            $query->where('status', $filter);
        }
        $orders = $query->paginate(10);
        return Inertia::render('ServiceOrdersList', [
            'orders' => $orders,
            'filter' => $filter,
        ]);
    }
}
