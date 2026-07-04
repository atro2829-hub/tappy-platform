import { router, usePage } from '@inertiajs/react';

import { stop as stopImpersonation } from '@/actions/App/Http/Controllers/ImpersonationController';
import { Icon } from '@/components/ui/icon';
import type { SharedData } from '@/types';

/**
 * Persistent strip shown while an admin is signed in as another user, with a
 * one-click exit back to their own account.
 */
export function ImpersonationBanner() {
    const { auth, impersonating } = usePage<SharedData>().props;

    if (!impersonating) {
        return null;
    }

    const name = auth.user?.name ?? 'this user';

    return (
        <div
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-2 text-[12.5px]"
            style={{
                background: 'hsl(var(--warning) / 0.12)',
                borderBottom: '1px solid hsl(var(--warning) / 0.3)',
            }}
        >
            <span className="inline-flex items-center gap-1.5 font-medium">
                <Icon
                    name="eye"
                    className="size-3.5"
                    style={{ color: 'hsl(var(--warning))' }}
                />
                You’re viewing the app as <strong>{name}</strong> — impersonation
                is active.
            </span>
            <button
                type="button"
                onClick={() =>
                    router.post(stopImpersonation.url(), undefined, {
                        preserveScroll: false,
                    })
                }
                className="inline-flex items-center gap-1.5 rounded-md border bg-background/70 px-2.5 py-1 font-medium hover:bg-background"
                style={{ borderColor: 'hsl(var(--warning) / 0.4)' }}
            >
                <Icon name="logout" className="size-3.5" />
                Stop impersonating
            </button>
        </div>
    );
}
