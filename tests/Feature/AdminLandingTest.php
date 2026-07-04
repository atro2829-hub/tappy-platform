<?php

use App\Models\Setting;
use App\Models\User;
use App\Support\LandingContent;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function admin(): User
{
    return User::factory()->create(['role' => 'admin']);
}

it('shows the landing CMS editor to an admin with the current content', function () {
    $this->actingAs(admin())
        ->get(route('admin.settings.landing'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/landing')
            ->has('content.hero.title')
            ->has('content.faq.items')
        );
});

it('forbids non-admins from the landing CMS', function () {
    $customer = User::factory()->create(['role' => 'customer']);

    $this->actingAs($customer)->get(route('admin.settings.landing'))->assertForbidden();
    $this->actingAs($customer)
        ->post(route('admin.settings.landing.update'), ['content' => '{}'])
        ->assertForbidden();
});

it('renders the homepage with the default content until edited', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('content.hero.title', 'Global top-ups & gift cards from')
            ->where('content.copilot.enabled', true)
        );
});

it('persists edited content and reflects it on the public homepage', function () {
    $content = LandingContent::content();
    $content['hero']['title'] = 'Edited headline';
    $content['copilot']['enabled'] = false;

    $this->actingAs(admin())
        ->post(route('admin.settings.landing.update'), ['content' => json_encode($content)])
        ->assertRedirect();

    expect(Setting::get('landing')['hero']['title'])->toBe('Edited headline');

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('content.hero.title', 'Edited headline')
        ->where('content.copilot.enabled', false)
    );
});

it('only stores known sections and ignores client-supplied image paths', function () {
    $content = LandingContent::content();
    $content['hacker'] = 'inject';
    $content['seo']['image_path'] = '../../etc/passwd';

    $this->actingAs(admin())
        ->post(route('admin.settings.landing.update'), ['content' => json_encode($content)]);

    $stored = Setting::get('landing');
    expect($stored)->not->toHaveKey('hacker')
        ->and($stored['seo']['image_path'])->toBeNull();
});

it('resets a single section back to its shipped default', function () {
    LandingContent::save(['hero' => ['title' => 'Custom'], 'faq' => ['enabled' => false]]);
    expect(LandingContent::content()['hero']['title'])->toBe('Custom');

    $this->actingAs(admin())
        ->post(route('admin.settings.landing.reset'), ['section' => 'hero'])
        ->assertRedirect();

    expect(LandingContent::content()['hero']['title'])->toBe('Global top-ups & gift cards from')
        // Resetting 'hero' must not touch the 'faq' override.
        ->and(LandingContent::content()['faq']['enabled'])->toBeFalse();
});

it('rejects resetting an unknown section', function () {
    $this->actingAs(admin())
        ->post(route('admin.settings.landing.reset'), ['section' => 'bogus'])
        ->assertSessionHasErrors('section');
});

it('stores an uploaded social-share image and resolves it to a url', function () {
    Storage::fake('public');

    $content = LandingContent::content();

    $this->actingAs(admin())->post(route('admin.settings.landing.update'), [
        'content' => json_encode($content),
        'og_image' => UploadedFile::fake()->image('og.png', 1200, 630),
    ])->assertRedirect();

    $path = Setting::get('landing')['seo']['image_path'];
    expect($path)->not->toBeNull();
    Storage::disk('public')->assertExists($path);
    expect(LandingContent::seo()['image'])->toContain($path);
});

it('server-renders the SEO title and social meta in the homepage head', function () {
    $content = LandingContent::content();
    $content['seo']['title'] = 'Tappy SEO Headline';
    $content['seo']['description'] = 'A unique meta description for crawlers.';
    LandingContent::save($content);

    $this->get('/')
        ->assertSee('Tappy SEO Headline', false)
        ->assertSee('og:title', false)
        ->assertSee('A unique meta description for crawlers.', false);
});
