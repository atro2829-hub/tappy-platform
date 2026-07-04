<?php

namespace App\Listeners;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Auth\Events\Login;

class RecordLoginAudit
{
    /**
     * Record an audit entry whenever a user authenticates.
     */
    public function handle(Login $event): void
    {
        if ($event->user instanceof User) {
            AuditLog::record('auth.login', 'Signed in', $event->user, ip: request()->ip());
        }
    }
}
