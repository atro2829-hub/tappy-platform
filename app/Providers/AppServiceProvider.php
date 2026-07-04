<?php

namespace App\Providers;

use App\Services\Ai\AnthropicProvider;
use App\Services\Ai\Contracts\LlmProvider;
use App\Services\Ai\FakeLlmProvider;
use App\Services\Ai\GeminiProvider;
use App\Services\Ai\OpenAiCompatibleProvider;
use App\Services\Payments\Contracts\PaymentGateway;
use App\Services\Providers\Contracts\GiftCardProvider;
use App\Services\Providers\Contracts\TopUpProvider;
use App\Services\Providers\ProviderRegistry;
use App\Support\AiModels;
use Carbon\CarbonImmutable;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Each provider category resolves its active adapter from the registry,
        // which reads the admin-selected driver (System Settings → Integrations)
        // and falls back to the network-free fake driver. Adding a provider is a
        // single entry in ProviderRegistry plus its adapter class.
        $this->app->singleton(TopUpProvider::class, fn (): TopUpProvider => ProviderRegistry::make('topup'));
        $this->app->singleton(GiftCardProvider::class, fn (): GiftCardProvider => ProviderRegistry::make('giftcard'));
        $this->app->singleton(PaymentGateway::class, fn (): PaymentGateway => ProviderRegistry::make('payment'));

        // The AI Copilot LLM. Defaults to the network-free fake engine; a real
        // provider (Anthropic, OpenAI, OpenRouter, Groq, Gemini) is used only
        // when its API key is present.
        $this->app->singleton(LlmProvider::class, function (): LlmProvider {
            $driver = (string) config('services.ai.driver', 'fake');

            if (! AiModels::isProvider($driver) || blank(config("services.{$driver}.key"))) {
                return new FakeLlmProvider;
            }

            $key = (string) config("services.{$driver}.key");
            $model = (string) config("services.{$driver}.model");

            return match ($driver) {
                'anthropic' => new AnthropicProvider($key, $model),
                'gemini' => new GeminiProvider($key, $model),
                'openrouter' => new OpenAiCompatibleProvider($key, $model, AiModels::ENDPOINTS['openrouter'], ['X-Title' => 'Tappy Copilot']),
                default => new OpenAiCompatibleProvider($key, $model, AiModels::ENDPOINTS[$driver]),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        // Inertia consumes resources directly; drop the "data" envelope.
        JsonResource::withoutWrapping();

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
