<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientFundsException;
use App\Http\Requests\PurchaseGiftCardRequest;
use App\Http\Resources\TransactionResource;
use App\Services\GiftCardService;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\ProviderRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class GiftCardController extends Controller
{
    public function __construct(
        private readonly GiftCardService $giftCards,
        private readonly GiftCardProvider $provider,
    ) {}

    public function index(): Response
    {
        // Catalog rarely changes; cache it per gift-card provider to avoid hitting
        // the API each visit (and to bust when the active provider changes).
        $products = Cache::remember(
            'giftcards:products:'.ProviderRegistry::activeId('giftcard'),
            now()->addHour(),
            fn (): array => $this->provider->listProducts(null, 60),
        );

        return Inertia::render('giftcards', ['products' => $products]);
    }

    public function store(PurchaseGiftCardRequest $request): JsonResponse|TransactionResource
    {
        try {
            $transaction = $this->giftCards->purchase($request->user(), $request->toInput());
        } catch (InsufficientFundsException) {
            return response()->json(
                ['message' => 'Insufficient wallet balance. Add funds and try again.'],
                422,
            );
        }

        $transaction->refresh();

        return new TransactionResource($transaction);
    }
}
