<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Models\User;
use App\Services\ResellerEarnings;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ResellerCustomerController extends Controller
{
    public function __construct(private readonly ResellerEarnings $earnings) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = trim((string) $request->query('search', ''));
        $tier = (string) $request->query('tier', 'all');

        $query = $user->customers()->latest('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('contact', 'like', "%{$search}%");
            });
        }

        if ($tier !== 'all') {
            $query->whereRaw('LOWER(tier) = ?', [strtolower($tier)]);
        }

        $paginator = $query->paginate(20)->withQueryString();
        $customers = collect($paginator->items());
        $this->attributeTransactions($user, $customers);

        return Inertia::render('reseller/customers', [
            'customers' => CustomerResource::collection($customers),
            'filters' => ['search' => $search, 'tier' => $tier],
            'pagination' => $this->paginationMeta($paginator),
            'stats' => [
                'total' => $user->customers()->count(),
                'agents' => $user->customers()->where('tier', 'Agent')->count(),
                'active' => $user->customers()->where('status', 'active')->count(),
            ],
            'commissionMtd' => $this->earnings->for($user)['commissionMtd'],
        ]);
    }

    /**
     * Attribute the reseller's successful transactions to their customers by
     * matching the topped-up number to the customer's contact, surfacing real
     * per-customer orders / volume / commission.
     *
     * @param  Collection<int, Customer>  $customers
     */
    private function attributeTransactions(User $user, Collection $customers): void
    {
        $digits = fn (?string $value): string => preg_replace('/\D/', '', (string) $value);

        $byPhone = [];

        foreach ($user->transactions()->where('status', 'success')->get(['recipient', 'amount_usd_minor', 'fee_minor']) as $transaction) {
            $key = $digits($transaction->recipient);

            if ($key === '') {
                continue;
            }

            $byPhone[$key] ??= ['orders' => 0, 'volume' => 0, 'commission' => 0];
            $byPhone[$key]['orders']++;
            $byPhone[$key]['volume'] += $transaction->amount_usd_minor;
            $byPhone[$key]['commission'] += $transaction->fee_minor;
        }

        foreach ($customers as $customer) {
            $stat = $byPhone[$digits($customer->contact)] ?? null;
            $customer->setAttribute('orders', $stat['orders'] ?? 0);
            $customer->setAttribute('volume_usd', $stat ? Money::toDecimal($stat['volume']) : 0.0);
            $customer->setAttribute('commission_usd', $stat ? Money::toDecimal($stat['commission']) : 0.0);
        }
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $request->user()->customers()->create($request->validated());

        return back();
    }

    /**
     * Bulk-import customers from an uploaded CSV (name, contact, country, tier).
     */
    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:1024'],
        ]);

        $handle = fopen($request->file('file')->getRealPath(), 'r');

        if ($handle === false) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Could not read the uploaded file.']);
        }

        $created = 0;
        $rows = 0;

        while ($rows < 5000 && ($row = fgetcsv($handle)) !== false) {
            $rows++;
            $name = trim((string) ($row[0] ?? ''));
            $contact = trim((string) ($row[1] ?? ''));

            // Skip the header row and any incomplete lines.
            if ($name === '' || $contact === '' || strtolower($name) === 'name') {
                continue;
            }

            $country = strtoupper(trim((string) ($row[2] ?? '')));

            $request->user()->customers()->create([
                'name' => $name,
                'contact' => $contact,
                'country' => strlen($country) === 2 ? $country : null,
                'tier' => trim((string) ($row[3] ?? '')) !== '' ? trim((string) $row[3]) : 'Standard',
                'status' => 'active',
            ]);
            $created++;
        }

        fclose($handle);

        return back()->with('toast', ['type' => 'success', 'message' => "Imported {$created} customers."]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        abort_unless($customer->reseller_id === $request->user()->id, 403);

        $customer->update($request->validated());

        return back();
    }

    public function destroy(Request $request, Customer $customer): RedirectResponse
    {
        abort_unless($customer->reseller_id === $request->user()->id, 403);

        $customer->delete();

        return back();
    }
}
