<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBulkRequest;
use App\Http\Resources\BulkBatchResource;
use App\Jobs\ProcessBulkBatchJob;
use App\Models\BulkBatch;
use App\Models\BulkItem;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Inertia\Response;

class BulkController extends Controller
{
    /** Hard cap on rows accepted from a single bulk CSV. */
    private const MAX_ROWS = 5000;

    public function index(Request $request): Response
    {
        $paginator = $request->user()->bulkBatches()
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('bulk', [
            'batches' => BulkBatchResource::collection($paginator->items()),
            'pagination' => $this->paginationMeta($paginator),
        ]);
    }

    public function show(Request $request, BulkBatch $batch): Response
    {
        abort_unless($batch->user_id === $request->user()->id, 403);

        $paginator = $request->user()->bulkBatches()->latest('id')->paginate(15)->withQueryString();

        return Inertia::render('bulk', [
            'batches' => BulkBatchResource::collection($paginator->items()),
            'pagination' => $this->paginationMeta($paginator),
            'detail' => [
                'batch' => new BulkBatchResource($batch),
                'items' => $batch->items()->latest('id')->limit(200)->get()
                    ->map(fn (BulkItem $item): array => [
                        'id' => $item->id,
                        'recipient' => $item->recipient,
                        'country' => $item->country,
                        'amount' => Money::toDecimal($item->amount_usd_minor),
                        'status' => $item->status,
                    ]),
            ],
        ]);
    }

    public function store(StoreBulkRequest $request): RedirectResponse
    {
        /** @var UploadedFile $file */
        $file = $request->file('file');

        $rows = $this->parseCsv($file);
        $amountUsdMinor = array_sum(array_column($rows, 'amountMinor'));

        $batch = $request->user()->bulkBatches()->create([
            'name' => $file->getClientOriginalName(),
            'type' => $request->validated('type', 'airtime'),
            'total' => count($rows),
            'status' => 'queued',
            'amount_usd_minor' => $amountUsdMinor,
        ]);

        $batch->items()->createMany(array_map(fn (array $row): array => [
            'country' => $row['country'],
            'recipient' => $row['recipient'],
            'amount_usd_minor' => $row['amountMinor'],
            'status' => 'pending',
        ], $rows));

        ProcessBulkBatchJob::dispatch($batch->id);

        return back();
    }

    /**
     * Parse payout rows from an uploaded CSV.
     *
     * Rows are expected as [country, recipient, amount]. A leading header row
     * (non-numeric amount) is skipped, as are blank lines. The amount column is
     * treated as USD.
     *
     * @return list<array{country: string, recipient: string, amountMinor: int}>
     */
    private function parseCsv(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');

        if ($handle === false) {
            return [];
        }

        $rows = [];

        while (count($rows) < self::MAX_ROWS && ($columns = fgetcsv($handle)) !== false) {
            // Skip blank lines and header rows (amount column not numeric).
            $amount = isset($columns[2]) ? trim((string) $columns[2]) : '';

            if ($amount === '' || ! is_numeric($amount)) {
                continue;
            }

            $rows[] = [
                'country' => strtoupper(trim((string) ($columns[0] ?? ''))),
                'recipient' => trim((string) ($columns[1] ?? '')),
                'amountMinor' => Money::toMinor((float) $amount),
            ];
        }

        fclose($handle);

        return $rows;
    }
}
