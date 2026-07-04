import { useEffect, useState } from 'react';

import { status as transactionStatus } from '@/actions/App/Http/Controllers/TransactionController';

/** Backend statuses that are final — polling stops once one is reached. */
const TERMINAL = ['success', 'failed', 'refunded'];

interface Options {
    /** Poll interval in ms (default 3s). */
    intervalMs?: number;
    /** Stop after this many polls so we never loop forever (default 40 ≈ 2min). */
    maxPolls?: number;
}

/**
 * Polls a transaction's status by reference until it settles, then stops.
 * Returns the latest backend status (or null until the first response).
 *
 * Polling only runs while `active` is true and a `reference` is present. All
 * timers and in-flight effects are torn down on unmount or when the inputs
 * change (cancelled flag + clearTimeout), so there is no memory leak and no
 * state updates after unmount.
 */
export function useTransactionStatus(
    reference: string | null,
    active: boolean,
    { intervalMs = 3000, maxPolls = 40 }: Options = {},
): string | null {
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        if (!active || !reference) {
            return;
        }

        let cancelled = false;
        let polls = 0;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const tick = async () => {
            polls += 1;

            try {
                const res = await fetch(transactionStatus.url(reference), {
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!cancelled && res.ok) {
                    const data: { status?: string } = await res.json();

                    if (data.status) {
                        setStatus(data.status);

                        if (TERMINAL.includes(data.status)) {
                            return; // settled — stop polling
                        }
                    }
                }
            } catch {
                // Ignore transient network errors and keep polling.
            }

            if (!cancelled && polls < maxPolls) {
                timer = setTimeout(tick, intervalMs);
            }
        };

        timer = setTimeout(tick, intervalMs);

        return () => {
            cancelled = true;

            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [reference, active, intervalMs, maxPolls]);

    return status;
}
