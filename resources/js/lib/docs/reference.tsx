import {
    Callout,
    Code,
    CodeBlock,
    DocTable,
    H2,
    LI,
    P,
    Step,
    Steps,
    Strong,
    UL,
} from '@/components/docs/ui';

import type { DocPage } from './types';

export const referencePages: DocPage[] = [
    {
        slug: 'webhooks',
        title: 'Webhooks',
        description:
            'Tappy receives signed callbacks from Reloadly and Stripe to keep transactions and wallet funding in sync. Here is how to register them.',
        group: 'Reference',
        icon: 'webhook',
        body: (
            <>
                <P>
                    Two inbound webhook endpoints keep Tappy in sync with your
                    providers. Both are public but verified by a signing secret,
                    so only authentic events are accepted.
                </P>

                <H2 id="reloadly">Reloadly status callbacks</H2>
                <P>
                    Reloadly calls this endpoint when an asynchronous top-up
                    finishes, so the matching transaction is updated to success
                    or failed (with an automatic refund on failure).
                </P>
                <DocTable
                    head={['Setting', 'Value']}
                    rows={[
                        [
                            'Endpoint',
                            <Code key="1">
                                POST {'{APP_URL}'}/webhooks/reloadly
                            </Code>,
                        ],
                        [
                            'Secret',
                            <Code key="2">RELOADLY_WEBHOOK_SECRET</Code>,
                        ],
                        ['Verification', 'HMAC signature on every request'],
                    ]}
                />
                <Steps>
                    <Step n={1} title="Register the URL">
                        In your Reloadly dashboard, set the webhook URL to{' '}
                        <Code>{'{APP_URL}'}/webhooks/reloadly</Code>.
                    </Step>
                    <Step n={2} title="Copy the secret">
                        Put the dashboard's webhook secret into{' '}
                        <Code>RELOADLY_WEBHOOK_SECRET</Code>.
                    </Step>
                </Steps>

                <H2 id="stripe">Stripe Checkout webhook</H2>
                <P>
                    Stripe notifies Tappy when a checkout completes, which
                    credits the user's wallet. Tappy re-fetches the session from
                    Stripe before crediting, so a forged event can never add
                    funds.
                </P>
                <DocTable
                    head={['Setting', 'Value']}
                    rows={[
                        [
                            'Endpoint',
                            <Code key="1">
                                POST {'{APP_URL}'}/webhooks/stripe
                            </Code>,
                        ],
                        [
                            'Event',
                            <Code key="2">checkout.session.completed</Code>,
                        ],
                        ['Secret', <Code key="3">STRIPE_WEBHOOK_SECRET</Code>],
                    ]}
                />
                <Steps>
                    <Step n={1} title="Add the endpoint">
                        In Stripe → Developers → Webhooks, add{' '}
                        <Code>{'{APP_URL}'}/webhooks/stripe</Code> and subscribe
                        to <Code>checkout.session.completed</Code>.
                    </Step>
                    <Step n={2} title="Copy the signing secret">
                        Put the endpoint's signing secret into{' '}
                        <Code>STRIPE_WEBHOOK_SECRET</Code>.
                    </Step>
                </Steps>

                <Callout type="warning" title="Fails closed in production">
                    If a webhook secret is missing in production, Tappy rejects
                    the request rather than trusting it. Always configure both
                    secrets before accepting live money.
                </Callout>

                <Callout type="note" title="Both are idempotent">
                    Duplicate deliveries are safe — an already-final transaction
                    or an already-credited checkout is acknowledged without
                    being processed twice.
                </Callout>
            </>
        ),
    },

    {
        slug: 'scheduled-tasks',
        title: 'Scheduled tasks & queue',
        description:
            'Delivery, recurring automations, auto-reload and reconciliation rely on a queue worker and the Laravel scheduler. Set both up in production.',
        group: 'Reference',
        icon: 'clock',
        body: (
            <>
                <H2 id="queue">The queue worker</H2>
                <P>
                    Top-ups, gift cards and bulk batches are delivered by
                    background jobs, so a worker must be running to fulfil
                    orders. In development, <Code>composer run dev</Code> starts
                    one for you. In production, keep a worker alive with a
                    process manager (Supervisor, systemd, etc.):
                </P>
                <CodeBlock
                    title="terminal"
                    code="php artisan queue:work --tries=3"
                />

                <H2 id="scheduler">The scheduler</H2>
                <P>
                    Three recurring commands keep the platform healthy. They run
                    via Laravel's scheduler, which you trigger from cron once a
                    minute:
                </P>
                <CodeBlock
                    title="crontab"
                    code="* * * * * cd /path/to/tappy && php artisan schedule:run >> /dev/null 2>&1"
                />
                <DocTable
                    head={['Command', 'Runs', 'Purpose']}
                    rows={[
                        [
                            <Code key="1">automations:run</Code>,
                            'Daily',
                            'Executes due recurring top-ups',
                        ],
                        [
                            <Code key="2">wallet:auto-reload</Code>,
                            'Hourly',
                            'Tops up wallets below their threshold',
                        ],
                        [
                            <Code key="3">transactions:reconcile</Code>,
                            'Every 5 min',
                            'Re-polls in-flight orders to confirm async providers; refunds only after a hard timeout',
                        ],
                    ]}
                />

                <H2 id="commands">Running commands manually</H2>
                <P>
                    Each command can also be run on demand, which is handy for
                    testing:
                </P>
                <CodeBlock
                    title="terminal"
                    code={`php artisan automations:run
php artisan wallet:auto-reload
php artisan transactions:reconcile`}
                />

                <Callout type="warning" title="Both are required in production">
                    Without a queue worker, orders are accepted but never
                    delivered. Without the scheduler, automations, auto-reload
                    and reconciliation never run. Configure both when you
                    deploy.
                </Callout>

                <H2 id="checklist">Production checklist</H2>
                <UL>
                    <LI>
                        <Strong>APP_ENV=production</Strong> and{' '}
                        <Strong>APP_DEBUG=false</Strong>
                    </LI>
                    <LI>A server database (MySQL or PostgreSQL)</LI>
                    <LI>
                        Live provider and payment drivers with webhook secrets
                        set
                    </LI>
                    <LI>A running queue worker and the scheduler in cron</LI>
                    <LI>Demo accounts removed or their passwords changed</LI>
                </UL>
            </>
        ),
    },
];
