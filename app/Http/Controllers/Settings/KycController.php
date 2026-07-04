<?php

namespace App\Http\Controllers\Settings;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\KycDocument;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Self-service KYC verification: Business and Reseller accounts upload identity
 * documents, which an admin reviews on /admin/kyc. Files are stored on the
 * private disk and never exposed via a public URL.
 */
class KycController extends Controller
{
    /** Disk holding KYC uploads (private — storage/app/private). */
    private const DISK = 'local';

    public function edit(Request $request): Response
    {
        $user = $request->user();
        $this->authorizeKyc($user);

        $types = [];
        foreach (KycDocument::TYPES as $key => $definition) {
            $types[] = ['key' => $key] + $definition;
        }

        $documents = $user->kycDocuments()->get()->mapWithKeys(fn (KycDocument $document): array => [
            $document->type => [
                'name' => $document->original_name,
                'size' => $document->size,
                'uploadedAt' => $document->updated_at?->diffForHumans(),
            ],
        ]);

        return Inertia::render('settings/verification', [
            'kycStatus' => $user->kyc_status,
            'documentTypes' => $types,
            'documents' => $documents,
            'locked' => $user->kyc_status === 'approved',
        ]);
    }

    /**
     * Store newly uploaded documents and move the account into manual review.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();
        $this->authorizeKyc($user);
        abort_if($user->kyc_status === 'approved', 403, 'Your account is already verified.');

        $rules = [];
        foreach (array_keys(KycDocument::TYPES) as $key) {
            $rules[$key] = ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:5120'];
        }
        $request->validate($rules);

        // Every required document must be present — either uploaded now or already on file.
        $missing = [];
        foreach (KycDocument::TYPES as $key => $definition) {
            if (! $definition['required']) {
                continue;
            }

            $hasNew = $request->file($key) instanceof UploadedFile;
            $hasExisting = $user->kycDocuments()->where('type', $key)->exists();

            if (! $hasNew && ! $hasExisting) {
                $missing[$key] = 'The '.strtolower($definition['label']).' is required.';
            }
        }

        if ($missing !== []) {
            throw ValidationException::withMessages($missing);
        }

        $stored = 0;
        foreach (array_keys(KycDocument::TYPES) as $key) {
            $file = $request->file($key);

            if (! $file instanceof UploadedFile) {
                continue;
            }

            $name = $file->getClientOriginalName();
            $mime = $file->getMimeType();
            $size = (int) $file->getSize();

            // Replace any previous file of this type before storing the new one.
            $existing = $user->kycDocuments()->where('type', $key)->first();
            if ($existing) {
                Storage::disk(self::DISK)->delete($existing->path);
            }

            $path = $file->store('kyc/'.$user->id, self::DISK);

            $user->kycDocuments()->updateOrCreate(
                ['type' => $key],
                ['original_name' => $name, 'path' => $path, 'mime_type' => $mime, 'size' => $size],
            );

            $stored++;
        }

        if ($stored === 0) {
            return back()->with('toast', ['type' => 'error', 'message' => 'Select at least one document to upload.']);
        }

        if ($user->kyc_status !== 'review') {
            $user->update(['kyc_status' => 'review']);
        }

        AuditLog::record('kyc.submitted', $user->name.' submitted KYC documents', $user, ['documents' => $stored], $request->ip());

        return back()->with('toast', ['type' => 'success', 'message' => 'Documents submitted for review.']);
    }

    /** KYC verification only applies to Business and Reseller accounts. */
    private function authorizeKyc(User $user): void
    {
        abort_unless(in_array($user->role, [Role::Business, Role::Reseller], true), 403);
    }
}
