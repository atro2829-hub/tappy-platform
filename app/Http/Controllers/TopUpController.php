<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientFundsException;
use App\Http\Requests\DetectOperatorRequest;
use App\Http\Requests\PurchaseTopUpRequest;
use App\Http\Resources\TransactionResource;
use App\Http\Resources\WalletResource;
use App\Services\TopUpService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TopUpController extends Controller
{
    public function __construct(
        private readonly TopUpService $topUps,
        private readonly WalletService $wallets,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('topup', [
            'wallet' => new WalletResource($this->wallets->forUser($request->user())),
        ]);
    }

    public function detect(DetectOperatorRequest $request): JsonResponse
    {
        $operator = $this->topUps->detectOperator(
            $request->validated('phone'),
            strtoupper($request->validated('country')),
        );

        return response()->json($operator);
    }

    public function store(PurchaseTopUpRequest $request): JsonResponse|TransactionResource
    {
        try {
            $transaction = $this->topUps->purchase($request->user(), $request->toInput());
        } catch (InsufficientFundsException) {
            return response()->json(
                ['message' => 'Insufficient wallet balance. Add funds and try again.'],
                422,
            );
        }

        // Reflect any synchronous settlement (sync queue) before responding.
        $transaction->refresh();

        return new TransactionResource($transaction);
    }
}
