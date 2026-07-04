<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('shows the verification page to a business account', function () {
    $user = User::factory()->create(['role' => 'business', 'kyc_status' => 'pending']);

    $this->actingAs($user)->get(route('kyc.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/verification')
            ->has('documentTypes', 3)
            ->where('kycStatus', 'pending')
            ->where('locked', false)
        );
});

it('forbids KYC for personal (customer) accounts', function () {
    $customer = User::factory()->create(['role' => 'customer']);

    $this->actingAs($customer)->get(route('kyc.edit'))->assertForbidden();
    $this->actingAs($customer)
        ->post(route('kyc.update'), ['identity' => UploadedFile::fake()->image('id.png')])
        ->assertForbidden();
});

it('stores uploaded documents privately and moves the account into review', function () {
    Storage::fake('local');
    $user = User::factory()->create(['role' => 'reseller', 'kyc_status' => 'pending']);

    $this->actingAs($user)->post(route('kyc.update'), [
        'identity' => UploadedFile::fake()->image('id.png'),
        'address' => UploadedFile::fake()->create('bill.pdf', 200, 'application/pdf'),
    ])->assertRedirect();

    $user->refresh();
    expect($user->kyc_status)->toBe('review')
        ->and($user->kycDocuments()->count())->toBe(2);

    $identity = $user->kycDocuments()->where('type', 'identity')->first();
    expect($identity->path)->toStartWith('kyc/'.$user->id);
    Storage::disk('local')->assertExists($identity->path);
});

it('requires the mandatory documents before submitting', function () {
    $user = User::factory()->create(['role' => 'business', 'kyc_status' => 'pending']);

    $this->actingAs($user)->post(route('kyc.update'), [
        // Only the optional registration doc — identity + address are missing.
        'registration' => UploadedFile::fake()->create('reg.pdf', 100, 'application/pdf'),
    ])->assertSessionHasErrors(['identity', 'address']);

    expect($user->kycDocuments()->count())->toBe(0);
});

it('rejects disallowed file types and oversized uploads', function () {
    $user = User::factory()->create(['role' => 'business', 'kyc_status' => 'pending']);

    $this->actingAs($user)
        ->post(route('kyc.update'), ['identity' => UploadedFile::fake()->create('malware.exe', 10)])
        ->assertSessionHasErrors('identity');

    $this->actingAs($user)
        ->post(route('kyc.update'), ['identity' => UploadedFile::fake()->create('huge.pdf', 6000, 'application/pdf')])
        ->assertSessionHasErrors('identity');
});

it('replaces a previously uploaded document of the same type', function () {
    Storage::fake('local');
    $user = User::factory()->create(['role' => 'business', 'kyc_status' => 'pending']);

    $this->actingAs($user)->post(route('kyc.update'), [
        'identity' => UploadedFile::fake()->image('old.png'),
        'address' => UploadedFile::fake()->create('bill.pdf', 100, 'application/pdf'),
    ]);

    $oldPath = $user->kycDocuments()->where('type', 'identity')->first()->path;

    $this->actingAs($user)->post(route('kyc.update'), [
        'identity' => UploadedFile::fake()->image('new.png'),
    ])->assertRedirect();

    expect($user->kycDocuments()->where('type', 'identity')->count())->toBe(1)
        ->and($user->kycDocuments()->count())->toBe(2);
    Storage::disk('local')->assertMissing($oldPath);
});

it('locks uploads once the account is approved', function () {
    $user = User::factory()->create(['role' => 'business', 'kyc_status' => 'approved']);

    $this->actingAs($user)->get(route('kyc.edit'))
        ->assertInertia(fn (Assert $page) => $page->where('locked', true));

    $this->actingAs($user)
        ->post(route('kyc.update'), ['identity' => UploadedFile::fake()->image('id.png')])
        ->assertForbidden();
});

it('shows real document counts in the admin KYC queue', function () {
    Storage::fake('local');
    $biz = User::factory()->create(['role' => 'business', 'kyc_status' => 'review']);
    Storage::disk('local')->put('kyc/'.$biz->id.'/id.png', 'data');
    $biz->kycDocuments()->create([
        'type' => 'identity', 'original_name' => 'id.png',
        'path' => 'kyc/'.$biz->id.'/id.png', 'mime_type' => 'image/png', 'size' => 4,
    ]);

    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)->get(route('admin.kyc'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/kyc')
            ->where('queue.0.docs', 1)
            ->has('queue.0.documents', 1)
            ->where('queue.0.documents.0.label', 'Government ID')
        );
});

it('lets an admin stream a document but forbids everyone else', function () {
    Storage::fake('local');
    $biz = User::factory()->create(['role' => 'business']);
    Storage::disk('local')->put('kyc/'.$biz->id.'/id.png', 'binary-data');
    $doc = $biz->kycDocuments()->create([
        'type' => 'identity', 'original_name' => 'id.png',
        'path' => 'kyc/'.$biz->id.'/id.png', 'mime_type' => 'image/png', 'size' => 11,
    ]);

    $admin = User::factory()->create(['role' => 'admin']);

    // Guest first (actingAs persists for the rest of the test once set).
    $this->get(route('admin.kyc.document', $doc))->assertRedirect(route('login'));
    // A non-admin (even the document's owner) cannot reach the admin route.
    $this->actingAs($biz)->get(route('admin.kyc.document', $doc))->assertForbidden();
    // An admin can stream it.
    $this->actingAs($admin)->get(route('admin.kyc.document', $doc))->assertOk();
});
