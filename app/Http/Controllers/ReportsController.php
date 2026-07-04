<?php

namespace App\Http\Controllers;

use App\Services\ReportsData;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    public function __construct(private readonly ReportsData $reports) {}

    public function index(Request $request): Response
    {
        return Inertia::render('reports', [
            'report' => $this->reports->for($request->user()),
        ]);
    }
}
