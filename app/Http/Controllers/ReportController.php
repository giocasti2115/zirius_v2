<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $reports = Report::paginate(10);
        return Inertia::render('ReportsList', [
            'reports' => $reports,
        ]);
    }
}
