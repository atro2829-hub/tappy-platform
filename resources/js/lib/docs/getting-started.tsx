import {
    Callout,
    CardGrid,
    Code,
    CodeBlock,
    DocCard,
    DocTable,
    H2,
    Lead,
    LI,
    P,
    Step,
    Steps,
    Strong,
    UL,
} from '@/components/docs/ui';

import type { DocPage } from './types';

export const gettingStartedPages: DocPage[] = [
    {
        slug: 'introduction',
        title: 'Introduction',
        description:
            'Tappy is a global airtime, data and gift-card platform with a prepaid wallet, AI copilot, reseller tooling and a full admin back office.',
        group: 'Getting Started',
        icon: 'sparkles',
        body: (
            <>
                <Lead>
                    Tappy is a complete top-up & payments platform. Customers
                    fund a prepaid wallet, then send airtime and data and buy
                    gift cards around the world — individually, in bulk, or on a
                    recurring schedule. Resellers manage an agent network and
                    earn commission, while admins run the whole platform from a
                    dedicated back office.
                </Lead>

                <H2 id="features">What you can do</H2>
                <CardGrid cols={2}>
                    <DocCard icon="phone" title="Airtime & data">
                        Send top-ups with automatic operator detection from the
                        recipient's phone number.
                    </DocCard>
                    <DocCard icon="gift" title="Gift cards">
                        Browse a brand catalog and deliver digital gift cards by
                        email or SMS.
                    </DocCard>
                    <DocCard icon="layers" title="Bulk payouts">
                        Upload a CSV and pay thousands of recipients in one
                        batch, with per-row results.
                    </DocCard>
                    <DocCard icon="wallet" title="Prepaid wallet">
                        A real ledger with funding, holds, fees, refunds and
                        optional auto-reload.
                    </DocCard>
                    <DocCard icon="sparkles" title="AI Copilot">
                        Type a request in plain English; the copilot drafts the
                        action for you to confirm.
                    </DocCard>
                    <DocCard icon="percent" title="Reseller tooling">
                        Manage a customer/agent network and track commission and
                        payouts.
                    </DocCard>
                    <DocCard icon="code" title="Developer API">
                        Issue API keys and receive webhooks for transaction
                        events.
                    </DocCard>
                    <DocCard icon="settings" title="White-label & CMS">
                        Rebrand the whole platform and edit the public homepage
                        from the admin dashboard — no code.
                    </DocCard>
                </CardGrid>

                <H2 id="audience">Who it's for</H2>
                <P>
                    Tappy ships with four roles, each with a tailored dashboard
                    and navigation:
                </P>
                <UL>
                    <LI>
                        <Strong>Business</Strong> — the default account for a
                        company selling top-ups, with full selling, bulk and
                        developer tools.
                    </LI>
                    <LI>
                        <Strong>Reseller</Strong> — everything a business has,
                        plus an agent-network manager and an earnings dashboard.
                    </LI>
                    <LI>
                        <Strong>Customer</Strong> — a streamlined personal
                        account for sending top-ups and buying gift cards.
                    </LI>
                    <LI>
                        <Strong>Admin</Strong> — the platform operator, with
                        user management, KYC, risk, commissions, catalog and
                        audit.
                    </LI>
                </UL>

                <H2 id="stack">How it's built</H2>
                <P>
                    Tappy is a modern Laravel application with a single-page
                    React front end:
                </P>
                <UL>
                    <LI>
                        <Strong>Laravel 13</Strong> (PHP 8.3+) with{' '}
                        <Strong>Laravel Fortify</Strong> for authentication
                    </LI>
                    <LI>
                        <Strong>Inertia.js v3</Strong> +{' '}
                        <Strong>React 19</Strong> +{' '}
                        <Strong>Tailwind CSS v4</Strong>
                    </LI>
                    <LI>
                        Money is stored as integer minor units (cents) for exact
                        accounting — never floats
                    </LI>
                </UL>

                <Callout type="tip" title="Runs fully offline out of the box">
                    Every external integration (top-up provider, card payments,
                    AI) sits behind a driver abstraction with a built-in{' '}
                    <Code>fake</Code> implementation. You can install Tappy and
                    explore <em>every</em> feature with zero API keys, then
                    switch to live providers when you're ready. See{' '}
                    <a href="/documentation/configuration">Configuration</a>.
                </Callout>
            </>
        ),
    },

    {
        slug: 'quick-start',
        title: 'Quick start',
        description:
            'Install Tappy, seed the demo data, and sign in with a ready-made account for each role — in about five minutes.',
        group: 'Getting Started',
        icon: 'bolt',
        body: (
            <>
                <H2 id="requirements">Requirements</H2>
                <UL>
                    <LI>
                        <Strong>PHP 8.3+</Strong> with the usual Laravel
                        extensions
                    </LI>
                    <LI>
                        <Strong>Composer</Strong> and{' '}
                        <Strong>Node.js 18+</Strong> with npm
                    </LI>
                    <LI>
                        A database — <Strong>SQLite</Strong> works out of the
                        box; MySQL/MariaDB and PostgreSQL are also supported
                    </LI>
                </UL>

                <H2 id="install">Install</H2>
                <P>
                    From the project root, run the bundled setup script. It
                    installs PHP and Node dependencies, creates your{' '}
                    <Code>.env</Code>, generates an app key, runs migrations,
                    and builds the front-end assets:
                </P>
                <CodeBlock title="terminal" code="composer run setup" />
                <P>Prefer to do it by hand? The equivalent steps are:</P>
                <CodeBlock
                    title="terminal"
                    code={`composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run build`}
                />

                <H2 id="seed">Seed the demo data</H2>
                <P>
                    Load realistic sample data and one ready-made login per
                    role. This step is optional but recommended for evaluating
                    the platform:
                </P>
                <CodeBlock title="terminal" code="php artisan db:seed" />
                <P>This creates four accounts, all with the password below:</P>
                <DocTable
                    head={['Email', 'Role', "What you'll see"]}
                    rows={[
                        [
                            <Code key="b">business@tappy.test</Code>,
                            'Business',
                            'Full selling, bulk, reports and developer tools',
                        ],
                        [
                            <Code key="r">reseller@tappy.test</Code>,
                            'Reseller',
                            'Everything above plus customers & earnings',
                        ],
                        [
                            <Code key="c">customer@tappy.test</Code>,
                            'Customer',
                            'Streamlined personal top-up account',
                        ],
                        [
                            <Code key="a">admin@tappy.test</Code>,
                            'Admin',
                            'Users, KYC, risk, commissions, catalog & audit',
                        ],
                    ]}
                />
                <Callout type="note" title="Demo password">
                    Every seeded account uses the password <Code>password</Code>
                    . Change or remove these accounts before going to
                    production.
                </Callout>

                <H2 id="run">Run the app</H2>
                <P>
                    The <Code>dev</Code> script starts the PHP server, a queue
                    worker, the log viewer and the Vite dev server together:
                </P>
                <CodeBlock title="terminal" code="composer run dev" />
                <P>
                    Then open the app in your browser and sign in with one of
                    the demo accounts. The documentation you're reading is
                    always available at <Code>/documentation</Code>.
                </P>

                <Callout
                    type="warning"
                    title="Queue worker required for delivery"
                >
                    Top-ups, gift cards and bulk batches are delivered by{' '}
                    <strong>queued jobs</strong>. The <Code>dev</Code> script
                    runs a worker for you; in production you must run{' '}
                    <Code>php artisan queue:work</Code> and a scheduler. See{' '}
                    <a href="/documentation/scheduled-tasks">Scheduled tasks</a>
                    .
                </Callout>
            </>
        ),
    },

    {
        slug: 'configuration',
        title: 'Configuration',
        description:
            'Tappy uses driver-based integrations so it works offline with fakes. Configure your .env to switch each one to a live provider.',
        group: 'Getting Started',
        icon: 'settings',
        body: (
            <>
                <P>
                    All configuration lives in your <Code>.env</Code> file. The
                    three external integrations — the top-up provider, card
                    payments, and the AI copilot — each have a <Code>fake</Code>{' '}
                    driver that is active by default, so nothing reaches the
                    network until you opt in.
                </P>

                <H2 id="app">App & database</H2>
                <DocTable
                    head={['Variable', 'Default', 'Purpose']}
                    rows={[
                        [
                            <Code key="1">APP_NAME</Code>,
                            'Laravel',
                            'Shown in the UI and emails',
                        ],
                        [
                            <Code key="2">APP_URL</Code>,
                            'http://localhost',
                            'Canonical URL used in links & webhooks',
                        ],
                        [
                            <Code key="3">APP_ENV</Code>,
                            'local',
                            'Set to production when you deploy',
                        ],
                        [
                            <Code key="4">APP_DEBUG</Code>,
                            'true',
                            'Set to false in production',
                        ],
                        [
                            <Code key="5">DB_CONNECTION</Code>,
                            'sqlite',
                            'sqlite, mysql, mariadb or pgsql',
                        ],
                    ]}
                />

                <H2 id="provider">Top-up provider (Reloadly)</H2>
                <P>
                    Airtime, data and gift cards are fulfilled through{' '}
                    <Strong>Reloadly</Strong>. Leave the driver as{' '}
                    <Code>fake</Code> for offline development, or set it to{' '}
                    <Code>reloadly</Code> with your credentials to go live.
                </P>
                <DocTable
                    head={['Variable', 'Default', 'Purpose']}
                    rows={[
                        [
                            <Code key="1">PROVIDER_DRIVER</Code>,
                            'fake',
                            'fake or reloadly',
                        ],
                        [
                            <Code key="2">RELOADLY_CLIENT_ID</Code>,
                            '—',
                            'OAuth client ID from your Reloadly dashboard',
                        ],
                        [
                            <Code key="3">RELOADLY_CLIENT_SECRET</Code>,
                            '—',
                            'OAuth client secret',
                        ],
                        [
                            <Code key="4">RELOADLY_SANDBOX</Code>,
                            'true',
                            'true for sandbox, false for live money',
                        ],
                        [
                            <Code key="5">RELOADLY_WEBHOOK_SECRET</Code>,
                            '—',
                            'Verifies inbound status callbacks',
                        ],
                        [
                            <Code key="6">RELOADLY_BULK_DELAY_MS</Code>,
                            '0',
                            'Per-row pacing for large bulk batches',
                        ],
                    ]}
                />

                <H2 id="payments">Card payments (Stripe)</H2>
                <P>
                    Wallet funding by card runs through{' '}
                    <Strong>Stripe Checkout</Strong>. With the <Code>fake</Code>{' '}
                    driver, funding is credited instantly so you can test the
                    wallet without a Stripe account.
                </P>
                <DocTable
                    head={['Variable', 'Default', 'Purpose']}
                    rows={[
                        [
                            <Code key="1">PAYMENT_DRIVER</Code>,
                            'fake',
                            'fake or stripe',
                        ],
                        [
                            <Code key="2">STRIPE_KEY</Code>,
                            '—',
                            'Stripe publishable key',
                        ],
                        [
                            <Code key="3">STRIPE_SECRET</Code>,
                            '—',
                            'Stripe secret key',
                        ],
                        [
                            <Code key="4">STRIPE_WEBHOOK_SECRET</Code>,
                            '—',
                            'Verifies Stripe webhook events',
                        ],
                    ]}
                />

                <H2 id="ai">AI Copilot</H2>
                <P>
                    The copilot understands natural-language requests. The{' '}
                    <Code>fake</Code> driver is deterministic and needs no key;
                    for real language understanding, point it at Anthropic or
                    OpenRouter.
                </P>
                <DocTable
                    head={['Variable', 'Default', 'Purpose']}
                    rows={[
                        [
                            <Code key="1">AI_DRIVER</Code>,
                            'fake',
                            'fake, anthropic, openai, openrouter, groq or gemini',
                        ],
                        [
                            <Code key="2">ANTHROPIC_API_KEY</Code>,
                            '—',
                            'Required when AI_DRIVER=anthropic',
                        ],
                        [
                            <Code key="3">ANTHROPIC_MODEL</Code>,
                            'claude-3-5-haiku-latest',
                            'Model identifier',
                        ],
                        [
                            <Code key="4">OPENROUTER_API_KEY</Code>,
                            '—',
                            'Required when AI_DRIVER=openrouter',
                        ],
                        [
                            <Code key="5">OPENROUTER_MODEL</Code>,
                            'anthropic/claude-3.5-haiku',
                            'Model identifier',
                        ],
                    ]}
                />
                <Callout type="note">
                    If an AI key is missing, the copilot automatically falls
                    back to the <Code>fake</Code> engine instead of erroring —
                    so the feature never breaks. Admins can also pick the
                    provider (Anthropic, OpenAI, OpenRouter, Groq or Gemini) and
                    model from <Strong>Settings → Integrations</Strong> without
                    editing <Code>.env</Code>.
                </Callout>

                <H2 id="going-live">Going live</H2>
                <Steps>
                    <Step n={1} title="Switch the environment">
                        Set <Code>APP_ENV=production</Code> and{' '}
                        <Code>APP_DEBUG=false</Code>, and use a real domain in{' '}
                        <Code>APP_URL</Code>.
                    </Step>
                    <Step n={2} title="Enable live providers">
                        Set <Code>PROVIDER_DRIVER=reloadly</Code> and{' '}
                        <Code>PAYMENT_DRIVER=stripe</Code> with their
                        credentials. Keep <Code>RELOADLY_SANDBOX=true</Code>{' '}
                        until you've tested end-to-end.
                    </Step>
                    <Step n={3} title="Register webhooks">
                        Add the Reloadly and Stripe webhook URLs and their
                        signing secrets — see{' '}
                        <a href="/documentation/webhooks">Webhooks</a>.
                    </Step>
                    <Step n={4} title="Run the worker & scheduler">
                        Keep a queue worker running and add the scheduler to
                        cron — see{' '}
                        <a href="/documentation/scheduled-tasks">
                            Scheduled tasks
                        </a>
                        .
                    </Step>
                </Steps>

                <Callout
                    type="warning"
                    title="Use a server database in production"
                >
                    SQLite is perfect for evaluation. For production load, use
                    MySQL or PostgreSQL and consider Redis for cache, queue and
                    sessions.
                </Callout>
            </>
        ),
    },

    {
        slug: 'user-roles',
        title: 'User roles & access',
        description:
            'Four roles determine which features and navigation a signed-in user sees. Access is enforced on the server for every route.',
        group: 'Getting Started',
        icon: 'users',
        body: (
            <>
                <H2 id="roles">The four roles</H2>
                <DocTable
                    head={['Role', 'Description']}
                    rows={[
                        [
                            <Strong key="b">Business</Strong>,
                            'Default account for selling top-ups; full feature set',
                        ],
                        [
                            <Strong key="r">Reseller</Strong>,
                            'Business features plus an agent network and earnings',
                        ],
                        [
                            <Strong key="c">Customer</Strong>,
                            'Streamlined personal account',
                        ],
                        [
                            <Strong key="a">Admin</Strong>,
                            'Platform operator with the admin back office',
                        ],
                    ]}
                />

                <H2 id="assignment">How roles are assigned</H2>
                <UL>
                    <LI>
                        At sign-up, visitors pick an account type —{' '}
                        <Strong>Personal</Strong>, <Strong>Business</Strong> or{' '}
                        <Strong>Reseller</Strong> (the latter two also provide a
                        business name). The Admin role can never be
                        self-registered.
                    </LI>
                    <LI>
                        Admins can create users with any role and change a
                        user's role later from{' '}
                        <a href="/documentation/admin-users">Users</a>.
                    </LI>
                    <LI>
                        Guard rails prevent an admin from demoting themselves or
                        removing the last remaining admin.
                    </LI>
                </UL>

                <H2 id="matrix">What each role sees</H2>
                <P>
                    Each role gets a navigation tailored to what it needs. This
                    table summarizes the primary areas surfaced for each role.
                </P>
                <DocTable
                    head={['Area', 'Business', 'Reseller', 'Customer', 'Admin']}
                    rows={[
                        ['Send top-ups & gift cards', '✓', '✓', '✓', '—'],
                        ['Bulk payouts', '✓', '✓', '—', 'View jobs'],
                        ['Wallet & transactions', '✓', '✓', '✓', '✓'],
                        ['Reports', '✓', '✓', '—', '✓'],
                        ['Developer API & webhooks', '✓', '✓', '—', 'API logs'],
                        ['Customers & earnings', '—', '✓', '—', '—'],
                        ['Admin back office', '—', '—', '—', '✓'],
                    ]}
                />

                <Callout type="note" title="How access is enforced">
                    The <Strong>Reseller</Strong> tools and the{' '}
                    <Strong>Admin</Strong> back office are restricted on the
                    server — only those roles can reach them; anyone else gets a
                    403. The other areas are shared by every signed-in account
                    and simply tailored through each role's navigation. All
                    access also requires a verified email and an active
                    (non-suspended) account.
                </Callout>

                <Callout type="note" title="Account status">
                    Any account can be <Strong>active</Strong> or{' '}
                    <Strong>suspended</Strong>. A suspended user is signed out
                    immediately and blocked from signing back in until an admin
                    reactivates them. See{' '}
                    <a href="/documentation/account-security">
                        Account & security
                    </a>
                    .
                </Callout>
            </>
        ),
    },
];
