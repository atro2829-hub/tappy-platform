<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Creates one demo account per role so every persona can be explored by
     * logging in (password: "password").
     */
    public function run(): void
    {
        // One demo account per role. Idempotent so the seeder can be re-run
        // safely (e.g. after adding new demo data) without duplicate-email errors.
        $accounts = [
            ['state' => 'business', 'name' => 'Olivia Carter', 'email' => 'business@tappy.test'],
            ['state' => 'reseller', 'name' => 'Samuel Adeyemi', 'email' => 'reseller@tappy.test'],
            ['state' => 'customer', 'name' => 'Daniel Mensah', 'email' => 'customer@tappy.test'],
            ['state' => 'admin', 'name' => 'Sysadmin', 'email' => 'admin@tappy.test'],
        ];

        foreach ($accounts as $account) {
            if (User::query()->where('email', $account['email'])->exists()) {
                continue;
            }

            User::factory()->{$account['state']}()->create([
                'name' => $account['name'],
                'email' => $account['email'],
            ]);
        }

        $this->call([
            CommissionRuleSeeder::class,
            DemoSeeder::class,
        ]);
    }
}
