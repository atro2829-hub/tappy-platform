<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\TicketReply;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TicketReply>
 */
class TicketReplyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ticket_id' => Ticket::factory(),
            'author' => fake()->name(),
            'body' => fake()->paragraph(),
        ];
    }
}
