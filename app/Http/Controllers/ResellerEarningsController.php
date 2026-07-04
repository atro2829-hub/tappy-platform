<?php

namespace App\Http\Controllers;

use App\Services\ResellerEarnings;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResellerEarningsController extends Controller
{
    public function __construct(private readonly ResellerEarnings $earnings) {}

    public function index(Request $request): Response
    {
        return Inertia::render('reseller/earnings', [
            'earnings' => $this->earnings->for($request->user()),
        ]);
    }
}
