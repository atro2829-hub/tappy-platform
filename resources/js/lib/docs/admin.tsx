import {
    Callout,
    Code,
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

export const adminPages: DocPage[] = [
    {
        slug: 'admin-overview',
        title: 'Admin overview',
        description:
            'The admin back office for platform operators — user management, KYC, risk, commissions, catalog and audit, plus oversight of all money movement.',
        group: 'Administration',
        icon: 'dashboard',
        body: (
            <>
                <P>
                    Accounts with the <Strong>Admin</Strong> role get a
                    dedicated navigation and an operations-focused overview
                    instead of a personal selling view. Every admin route is
                    protected on the server (authenticated, email-verified,
                    active and admin-only).
                </P>

                <H2 id="dedicated">Dedicated admin screens</H2>
                <DocTable
                    head={['Menu', 'What it does']}
                    rows={[
                        [
                            <a key="1" href="/documentation/admin-users">
                                Users
                            </a>,
                            'Create, search, suspend and manage every account',
                        ],
                        [
                            <a key="2" href="/documentation/admin-kyc">
                                KYC reviews
                            </a>,
                            'Approve, review or reject business verifications',
                        ],
                        [
                            <a key="3" href="/documentation/admin-commissions">
                                Commissions
                            </a>,
                            'Set the markup/fee rules that drive pricing',
                        ],
                        [
                            <a key="4" href="/documentation/admin-catalog">
                                Countries & operators
                            </a>,
                            'Browse and sync the provider catalog',
                        ],
                        [
                            <a key="5" href="/documentation/admin-risk">
                                Risk & fraud
                            </a>,
                            'Review held transactions and risk flags',
                        ],
                        [
                            <a key="6" href="/documentation/admin-audit">
                                Audit logs
                            </a>,
                            'An immutable trail of sensitive actions',
                        ],
                        [
                            <a key="7" href="/documentation/admin-settings">
                                System settings
                            </a>,
                            'White-label branding, integrations and the landing-page CMS',
                        ],
                    ]}
                />

                <H2 id="shared">Shared screens, platform-wide</H2>
                <P>
                    Admins also use several screens that exist for every role,
                    but with platform-wide scope:
                </P>
                <UL>
                    <LI>
                        <a href="/documentation/transactions">Transactions</a>{' '}
                        and <a href="/documentation/wallet">Wallet ledger</a> —
                        across all users
                    </LI>
                    <LI>
                        <a href="/documentation/bulk-payouts">Bulk jobs</a>,{' '}
                        <a href="/documentation/support">Support tickets</a> and{' '}
                        <a href="/documentation/reports">Reports</a>
                    </LI>
                    <LI>
                        <a href="/documentation/developer-api">
                            API &amp; webhook logs
                        </a>{' '}
                        and <a href="/documentation/ai-copilot">AI activity</a>
                    </LI>
                </UL>

                <Callout type="note" title="Live nav badges">
                    The admin sidebar shows live counts — for example,
                    businesses awaiting KYC and transactions needing risk
                    attention — so the work that needs you is always visible.
                </Callout>
            </>
        ),
    },

    {
        slug: 'admin-users',
        title: 'Users',
        description:
            'Create accounts, change roles, manage KYC decisions, and suspend or reactivate any user on the platform.',
        group: 'Administration',
        icon: 'users',
        body: (
            <>
                <H2 id="list">The user list</H2>
                <P>
                    Search by name, email or business name and filter by role.
                    The header summarizes totals — all users, businesses,
                    resellers and suspended accounts — and each row shows the
                    user's role, KYC status, account status and wallet balance.
                    Export the list to CSV at any time.
                </P>

                <H2 id="invite">Inviting a user</H2>
                <P>
                    Create a user with a name, unique email, role, and optional
                    business name and country. The new user is emailed a secure
                    link to set their own password, their email is marked
                    verified, and the action is recorded in the audit log.
                </P>

                <H2 id="actions">Row actions</H2>
                <DocTable
                    head={['Action', 'Effect']}
                    rows={[
                        [
                            'Log in as user',
                            'Impersonate a non-admin account for support, then return with one click',
                        ],
                        [
                            'Approve / Review / Reject KYC',
                            'Sets the KYC status and notifies the user',
                        ],
                        [
                            'Change role',
                            'Moves the user between Business, Reseller, Customer and Admin',
                        ],
                        ['Suspend', 'Signs the user out and blocks sign-in'],
                        ['Reactivate', 'Restores a suspended account'],
                    ]}
                />

                <Callout type="note" title="Impersonation">
                    <Strong>Log in as user</Strong> signs you in as a non-admin
                    account so you see exactly what they see — their dashboard,
                    navigation and data. A banner stays on screen the whole time;
                    click <Strong>Stop impersonating</Strong> to return to your
                    own account. Both actions are audit-logged, and admins and
                    suspended accounts can't be impersonated.
                </Callout>

                <H2 id="manual-wallet">Manual wallet adjustments</H2>
                <P>
                    Top up or correct a user's wallet by hand — for example when
                    a Business, Reseller or Agent pays you in cash and you credit
                    their account. From a user's row menu, under{' '}
                    <Strong>Wallet</Strong>:
                </P>
                <DocTable
                    head={['Action', 'Effect']}
                    rows={[
                        [
                            'Add funds',
                            'Credits the wallet by the amount you enter',
                        ],
                        [
                            'Deduct funds',
                            "Debits the wallet — refused if it would overdraw the balance",
                        ],
                    ]}
                />
                <P>
                    Each adjustment requires an <Strong>amount</Strong> and a{' '}
                    <Strong>note / reference</Strong> (e.g. a receipt number). The
                    dialog shows the current balance, and every movement is
                    written to the user's immutable wallet ledger and recorded in
                    the audit log with your name, the amount and the note.
                </P>
                <Callout type="note" title="Accountable by design">
                    Manual credits and debits use the same locked, idempotent
                    ledger as every other transaction — so balances stay accurate
                    and every cash movement is traceable.
                </Callout>

                <Callout type="warning" title="Admin safeguards">
                    To prevent lock-outs, you can't change your own admin role,
                    and the platform won't let you demote the last remaining
                    admin.
                </Callout>
            </>
        ),
    },

    {
        slug: 'admin-kyc',
        title: 'KYC reviews',
        description:
            'Work the verification queue for business and reseller accounts and record an approval decision for each.',
        group: 'Administration',
        icon: 'shieldcheck',
        body: (
            <>
                <H2 id="queue">The review queue</H2>
                <P>
                    The queue lists business and reseller accounts by KYC status
                    — <Strong>pending</Strong>, <Strong>in review</Strong>,{' '}
                    <Strong>approved</Strong> and <Strong>rejected</Strong> —
                    with counts for each, and shows how many documents each
                    applicant has uploaded. Open any applicant to view their
                    documents and details.
                </P>

                <H2 id="decision">Recording a decision</H2>
                <Steps>
                    <Step n={1} title="Approve">
                        Marks the account verified and unlocks full transacting
                        limits. The applicant is notified in-app.
                    </Step>
                    <Step n={2} title="Request more info">
                        Moves the account to <em>in review</em> and prompts the
                        applicant for more information.
                    </Step>
                    <Step n={3} title="Reject">
                        Declines verification; the applicant is notified that
                        they need to resubmit.
                    </Step>
                </Steps>

                <Callout type="note" title="Reviewing documents">
                    Applicants upload their identity documents (government ID,
                    proof of address and an optional business registration) from{' '}
                    <Strong>Settings → Verification</Strong>; files are stored on
                    the private disk, never a public URL. Open an applicant to
                    view each uploaded document before recording your decision —
                    the user is notified of the outcome in-app.
                </Callout>
            </>
        ),
    },

    {
        slug: 'admin-risk',
        title: 'Risk & fraud',
        description:
            'Hold high-value orders for approval before delivery, review automatic risk flags, and tune the rules that drive both.',
        group: 'Administration',
        icon: 'flag',
        body: (
            <>
                <H2 id="holds">Held transactions</H2>
                <P>
                    When an order's value is at or above the high-value
                    threshold, Tappy captures the funds but{' '}
                    <Strong>holds delivery</Strong> in a <Code>Review</Code>{' '}
                    state until an admin decides:
                </P>
                <UL>
                    <LI>
                        <Strong>Approve</Strong> — releases the order and
                        delivers it immediately.
                    </LI>
                    <LI>
                        <Strong>Reject</Strong> — cancels the order and refunds
                        the customer in full.
                    </LI>
                </UL>

                <H2 id="flags">Risk flags</H2>
                <P>
                    Transactions are flagged automatically based on the active
                    rules. For each flag you can <Strong>clear</Strong> it once
                    reviewed, or <Strong>block</Strong> the user (which suspends
                    the account). Flags are classified by severity:
                </P>
                <DocTable
                    head={['Flag', 'Severity']}
                    rows={[
                        [
                            'Large transaction (at or above the high threshold)',
                            'High',
                        ],
                        ['Elevated transaction value', 'Medium'],
                        ['Failed payment attempt', 'Medium'],
                        ['Auto-refund issued', 'Low'],
                    ]}
                />

                <H2 id="rules">The rules engine</H2>
                <P>
                    Tune the thresholds from the rules dialog. Defaults are
                    shown below; held delivery uses the high-severity threshold.
                </P>
                <DocTable
                    head={['Rule', 'Default', 'Effect']}
                    rows={[
                        [
                            'Flag at or above',
                            '$200',
                            'Raises a flag for review',
                        ],
                        [
                            'High severity at or above',
                            '$500',
                            'Marks high severity & holds delivery for approval',
                        ],
                        [
                            'Flag failed transactions',
                            'On',
                            'Flags failed payments',
                        ],
                        [
                            'Flag refunded transactions',
                            'On',
                            'Flags auto-refunds',
                        ],
                    ]}
                />
                <Callout type="note">
                    Funds are always captured up front; only <em>delivery</em>{' '}
                    is deferred while an order is held, so approving is instant
                    and rejecting refunds cleanly.
                </Callout>
            </>
        ),
    },

    {
        slug: 'admin-commissions',
        title: 'Commissions & pricing',
        description:
            'Define the markup rules that set the fee on every product. These rules drive the real pricing customers pay.',
        group: 'Administration',
        icon: 'percent',
        body: (
            <>
                <H2 id="rules">Markup rules</H2>
                <P>
                    Each rule targets a product, region and tier, and sets a
                    percentage markup, an optional flat fee, and an optional
                    cap. The fee a customer pays at checkout is computed from
                    the matching rule.
                </P>

                <H2 id="defaults">Built-in defaults</H2>
                <DocTable
                    head={['Product', 'Default fee']}
                    rows={[
                        ['Airtime', '1.5% + $0.20'],
                        ['Data', '1.5% + $0.20'],
                        ['Gift cards', '4.0%'],
                    ]}
                />
                <P>
                    The header also surfaces your platform margin over the last
                    30 days, average markup, reseller payouts and the number of
                    active rules.
                </P>

                <Callout type="tip">
                    Create, edit and delete rules at any time. If no rule
                    matches a product, Tappy falls back to the built-in defaults
                    above, so pricing is never undefined.
                </Callout>
            </>
        ),
    },

    {
        slug: 'admin-catalog',
        title: 'Countries & operators',
        description:
            'Browse the countries and operators Tappy can reach, and sync the live catalog from your provider.',
        group: 'Administration',
        icon: 'globe',
        body: (
            <>
                <H2 id="browse">Browsing the catalog</H2>
                <P>
                    Pick a country to see its operators, their pricing type
                    (fixed denominations or a range) and currency. The page also
                    shows your current provider driver and when the catalog was
                    last synced.
                </P>

                <H2 id="sync">Syncing the live catalog</H2>
                <P>
                    Use <Strong>Force sync</Strong> to pull the latest operators
                    and countries from Reloadly. The result is cached for seven
                    days, and the action is rate-limited to protect the provider
                    API.
                </P>
                <Callout type="warning" title="Requires the live provider">
                    Sync only works when <Code>PROVIDER_DRIVER=reloadly</Code>{' '}
                    with valid credentials. With the <Code>fake</Code> driver
                    you see a built-in reference catalog instead.
                </Callout>
            </>
        ),
    },

    {
        slug: 'admin-audit',
        title: 'Audit logs',
        description:
            'An immutable, searchable trail of sensitive platform actions for compliance and incident response.',
        group: 'Administration',
        icon: 'audit',
        body: (
            <>
                <H2 id="log">What's recorded</H2>
                <P>
                    Every sensitive action is written to the audit log with the
                    actor, a description, the originating IP address and a
                    timestamp. Page through the history or export it to CSV.
                </P>
                <UL>
                    <LI>
                        <Strong>User events</Strong> — invited, role changed,
                        suspended, reactivated
                    </LI>
                    <LI>
                        <Strong>KYC events</Strong> — approved, marked for
                        review, rejected
                    </LI>
                    <LI>
                        <Strong>Risk events</Strong> — held order
                        approved/rejected, flag cleared, rules updated
                    </LI>
                    <LI>
                        <Strong>Auth &amp; wallet events</Strong> — sign-in and
                        balance-affecting actions
                    </LI>
                </UL>
                <Callout type="note">
                    Audit entries are append-only — they're never edited or
                    deleted from the UI — so the trail stays trustworthy.
                </Callout>
            </>
        ),
    },

    {
        slug: 'admin-settings',
        title: 'System settings',
        description:
            'White-label the platform, connect your integrations, and edit the public homepage — all from the admin dashboard.',
        group: 'Administration',
        icon: 'settings',
        body: (
            <>
                <P>
                    Admins configure the platform under{' '}
                    <Strong>Settings</Strong>, in a dedicated{' '}
                    <Strong>Platform</Strong> group: Branding, Landing page and
                    Integrations.
                </P>

                <H2 id="branding">Branding (white-label)</H2>
                <P>
                    Make Tappy your own: set the app name, upload light and dark
                    logos and a favicon, choose how the brand appears on each
                    surface (dashboard, auth pages, homepage, footer), and toggle
                    the public marketing homepage on or off. Changes apply across
                    the whole app instantly — no code edits.
                </P>

                <H2 id="landing">Landing-page CMS</H2>
                <P>
                    Edit every section of the public homepage from{' '}
                    <Strong>Settings → Landing page</Strong> — hero, products,
                    pricing, FAQ, footer and more. Show or hide sections, add or
                    remove items (FAQ entries, pricing plans, feature bullets),
                    edit the SEO title, description and social-share image, and
                    reset any section to its shipped default. Edits go live on
                    save.
                </P>

                <H2 id="integrations">Integrations</H2>
                <P>
                    Connect external services from{' '}
                    <Strong>Settings → Integrations</Strong>. Each provider has a
                    live <Strong>Test connection</Strong> button and a{' '}
                    <Strong>Sandbox</Strong> toggle for safe testing, and secrets
                    are encrypted at rest and never returned to the browser.
                </P>
                <DocTable
                    head={['Integration', 'Used for']}
                    rows={[
                        [
                            'Email (SMTP)',
                            'Outbound mail — invites and notifications',
                        ],
                        ['Stripe', 'Card payments for wallet funding'],
                        [
                            'Airtime / data providers',
                            'Reloadly, DingConnect, DT One',
                        ],
                        [
                            'Gift-card providers',
                            'Reloadly, Tremendous, Tillo, Giftbit, Tango Card',
                        ],
                        ['AWS S3', 'Off-server file storage'],
                        [
                            'AI Copilot',
                            'Anthropic, OpenAI, OpenRouter, Groq or Gemini',
                        ],
                    ]}
                />

                <H2 id="active-providers">Choosing active providers</H2>
                <P>
                    Tappy can connect several top-up and gift-card providers at
                    once. In the <Strong>Active providers</Strong> card you pick
                    which connected provider fulfils each category — airtime &amp;
                    data, gift cards, and wallet payments — so you can switch
                    suppliers without any code change. Customers never see these
                    provider names.
                </P>
                <P>
                    Each fulfilment category also takes an optional{' '}
                    <Strong>fallback</Strong> provider. A fallback only covers
                    read paths — operator detection and gift-card catalogs — if
                    the primary can't answer; live orders always run on the
                    primary, so money movements are never silently re-routed.
                </P>

                <Callout type="note">
                    Settings saved here override the matching <Code>.env</Code>{' '}
                    values at runtime for the groups you enable — so you can
                    configure a live deployment entirely from the UI.
                </Callout>
            </>
        ),
    },
];
