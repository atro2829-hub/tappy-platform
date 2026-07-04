<?php

namespace Database\Seeders;

use App\Models\Recipient;
use App\Models\Ticket;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Realistic demo data for the seeded persona accounts so every role has
 * something to explore. Idempotent — skips if the reseller already has
 * customers (so re-seeding does not duplicate).
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $business = User::query()->where('email', 'business@tappy.test')->first();
        $reseller = User::query()->where('email', 'reseller@tappy.test')->first();
        $customer = User::query()->where('email', 'customer@tappy.test')->first();

        if ($business === null || $reseller === null || $customer === null) {
            return;
        }

        if ($reseller->customers()->exists()) {
            return;
        }

        // Reseller's downstream customers, each with attributed top-ups so their
        // orders / volume / commission are real on the customers screen.
        $customers = [
            ['Adaeze Okafor', '+2348031112201', 'NG', 'Agent'],
            ['Kwame Mensah', '+233201112202', 'GH', 'Agent'],
            ['Rahim Uddin', '+8801712112203', 'BD', 'Standard'],
            ['Priya Sharma', '+919812112204', 'IN', 'Standard'],
            ['Grace Wanjiru', '+254712112205', 'KE', 'Agent'],
            ['Mark Santos', '+639171112206', 'PH', 'Standard'],
        ];

        foreach ($customers as [$name, $contact, $country, $tier]) {
            $reseller->customers()->create([
                'name' => $name,
                'contact' => $contact,
                'country' => $country,
                'tier' => $tier,
                'status' => 'active',
            ]);

            Transaction::factory()->success()->count(fake()->numberBetween(1, 4))->create([
                'user_id' => $reseller->id,
                'recipient' => $contact,
                'recipient_name' => $name,
                'country' => $country,
            ]);
        }

        Recipient::factory()->count(4)->create(['user_id' => $reseller->id]);

        // Business activity feeds both the business and admin dashboards.
        Transaction::factory()->success()->count(12)->create(['user_id' => $business->id]);
        Transaction::factory()->failed()->count(2)->create(['user_id' => $business->id]);
        Recipient::factory()->count(5)->create(['user_id' => $business->id]);

        // Customer activity.
        Recipient::factory()->count(3)->create(['user_id' => $customer->id]);
        Transaction::factory()->success()->count(5)->create(['user_id' => $customer->id]);

        // A few support tickets across personas.
        Ticket::factory()->create(['user_id' => $business->id, 'status' => 'open', 'priority' => 'high']);
        Ticket::factory()->create(['user_id' => $reseller->id, 'status' => 'pending', 'priority' => 'medium']);
        Ticket::factory()->create(['user_id' => $customer->id, 'status' => 'resolved', 'priority' => 'low']);
    }
}
