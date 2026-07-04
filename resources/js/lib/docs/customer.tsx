import {
    Callout,
    CardGrid,
    Code,
    CodeBlock,
    DocCard,
    DocTable,
    H2,
    LI,
    P,
    Property,
    PropertyList,
    Step,
    Steps,
    Strong,
    UL,
} from '@/components/docs/ui';

import type { DocPage } from './types';

export const customerPages: DocPage[] = [
    {
        slug: 'dashboard',
        title: 'Dashboard',
        description:
            'Your home screen — wallet balance, key metrics, recent activity and one-tap shortcuts, tailored to your role.',
        group: 'Using Tappy',
        icon: 'dashboard',
        body: (
            <>
                <P>
                    The dashboard is the first screen after signing in. It
                    adapts to your role, but always centers on your wallet
                    balance, recent transactions and quick actions.
                </P>

                <H2 id="whats-here">What you'll find</H2>
                <UL>
                    <LI>
                        <Strong>Available balance</Strong> — your settled wallet
                        balance, with a shortcut to add funds
                    </LI>
                    <LI>
                        <Strong>Key metrics</Strong> — today's sales, 30-day
                        volume, successful and pending transaction counts, and
                        your success rate
                    </LI>
                    <LI>
                        <Strong>Recent transactions</Strong> — your latest
                        activity with status at a glance, linking to the full
                        history
                    </LI>
                    <LI>
                        <Strong>Quick actions</Strong> — jump straight to Send
                        airtime, Buy gift card or Bulk upload
                    </LI>
                    <LI>
                        <Strong>Saved recipients</Strong> — tap a saved contact
                        to start a top-up to them
                    </LI>
                    <LI>
                        <Strong>Getting started</Strong> — a short setup
                        checklist (verify identity, add funds, make your first
                        transaction) that disappears once you're up and running
                    </LI>
                </UL>

                <Callout type="note" title="Role-aware views">
                    Resellers also see commission earned and their active
                    customers; admins see a platform overview (GMV, active
                    users, failure rate and provider health) instead of a
                    personal selling view.
                </Callout>

                <H2 id="notifications">Notifications</H2>
                <P>
                    The bell in the top bar surfaces important updates — such as
                    a KYC decision or a failed transaction — with a count of
                    unread items. Open it to read recent alerts or mark them all
                    as read.
                </P>
            </>
        ),
    },

    {
        slug: 'wallet',
        title: 'Wallet',
        description:
            'A real prepaid balance with a complete ledger. Add funds by card, set up auto-reload, and review every credit, debit, hold, fee and refund.',
        group: 'Using Tappy',
        icon: 'wallet',
        body: (
            <>
                <P>
                    Every purchase on Tappy is paid from your wallet. Funds are
                    captured the moment you place an order and refunded
                    automatically if delivery fails, so your balance is always
                    accurate.
                </P>

                <H2 id="add-funds">Adding funds</H2>
                <Steps>
                    <Step n={1} title="Open the wallet">
                        Go to <Strong>Wallet</Strong> and choose{' '}
                        <Strong>Add funds</Strong>.
                    </Step>
                    <Step n={2} title="Choose an amount">
                        Enter any amount between <Strong>$1</Strong> and{' '}
                        <Strong>$100,000</Strong>, or use a quick preset ($100,
                        $500, $1,000, $5,000).
                    </Step>
                    <Step n={3} title="Pay">
                        Pay by card through Stripe Checkout. Your balance
                        updates as soon as the payment is confirmed.
                    </Step>
                </Steps>
                <Callout type="note">
                    When the payment driver is set to <Code>fake</Code> (the
                    default), funding is credited instantly so you can explore
                    the wallet without a card.
                </Callout>

                <H2 id="auto-reload">Auto-reload</H2>
                <P>
                    Never run out mid-batch. Enable auto-reload to automatically
                    top up your wallet when it falls below a threshold you
                    choose:
                </P>
                <UL>
                    <LI>
                        <Strong>Threshold</Strong> — when your balance drops
                        below this, a reload is triggered
                    </LI>
                    <LI>
                        <Strong>Reload amount</Strong> — how much to add each
                        time
                    </LI>
                </UL>
                <P>
                    Both values accept $1–$100,000. A reload runs at most once
                    per hour so you're never double-charged.
                </P>

                <H2 id="ledger">The ledger</H2>
                <P>
                    The wallet ledger is an immutable record of every movement.
                    Each entry shows its direction, reason, amount and the
                    resulting balance:
                </P>
                <DocTable
                    head={['Reason', 'Meaning']}
                    rows={[
                        [
                            <Strong key="1">Funding</Strong>,
                            'Money you added to the wallet',
                        ],
                        [
                            <Strong key="2">Purchase</Strong>,
                            'A top-up or gift card',
                        ],
                        [
                            <Strong key="3">Fee</Strong>,
                            'The processing fee on a purchase',
                        ],
                        [
                            <Strong key="4">Refund</Strong>,
                            'An automatic refund for a failed delivery',
                        ],
                        [
                            <Strong key="5">Adjustment</Strong>,
                            'A manual correction',
                        ],
                    ]}
                />
                <P>
                    Filter the ledger by reason, page through your history, and
                    export it to CSV for accounting.
                </P>
            </>
        ),
    },

    {
        slug: 'send-airtime',
        title: 'Send airtime & data',
        description:
            'Top up any mobile number around the world. Tappy detects the operator automatically and shows the exact cost before you pay.',
        group: 'Using Tappy',
        icon: 'phone',
        body: (
            <>
                <H2 id="how">How it works</H2>
                <Steps>
                    <Step n={1} title="Pick a country">
                        Search the country list by name or dialing code and
                        select the destination.
                    </Step>
                    <Step n={2} title="Enter the phone number">
                        As you type, Tappy auto-detects the mobile operator once
                        enough digits are entered and shows its logo. You can
                        also choose the operator manually if needed.
                    </Step>
                    <Step n={3} title="Choose the amount">
                        Pick a preset denomination or enter a custom amount
                        between <Strong>$0.50</Strong> and{' '}
                        <Strong>$1,000</Strong>. Switch to a data bundle where
                        the operator supports it.
                    </Step>
                    <Step n={4} title="Confirm & pay">
                        Review the recipient, amount, fee and total, then send.
                        You get a receipt with a transaction reference.
                    </Step>
                </Steps>

                <H2 id="fees">Fees</H2>
                <P>
                    Airtime and data carry a default processing fee of{' '}
                    <Strong>1.5% + $0.20</Strong>. The total (amount + fee) is
                    shown before you confirm and debited from your wallet.
                    Admins can customize fees per product — see{' '}
                    <a href="/documentation/admin-commissions">
                        Commissions &amp; pricing
                    </a>
                    .
                </P>

                <Callout type="tip" title="Delivery is asynchronous">
                    Orders are placed instantly and delivered by a background
                    worker. If the operator rejects a top-up, your wallet is
                    refunded automatically and the transaction is marked failed.
                </Callout>
            </>
        ),
    },

    {
        slug: 'gift-cards',
        title: 'Gift cards',
        description:
            'Browse a global brand catalog and deliver digital gift cards to any recipient by email or SMS.',
        group: 'Using Tappy',
        icon: 'gift',
        body: (
            <>
                <H2 id="buy">Buying a gift card</H2>
                <Steps>
                    <Step n={1} title="Find a brand">
                        Search the catalog and filter by country and category to
                        find the brand you want.
                    </Step>
                    <Step n={2} title="Choose value & quantity">
                        Select an available denomination and the number of
                        cards.
                    </Step>
                    <Step n={3} title="Set delivery">
                        Deliver by <Strong>email</Strong> or{' '}
                        <Strong>SMS</Strong>, enter the recipient address, and
                        add an optional personal message (up to 200 characters).
                    </Step>
                    <Step n={4} title="Confirm & pay">
                        Review the value, quantity, fee and total, then buy.
                    </Step>
                </Steps>

                <H2 id="fees">Fees</H2>
                <P>
                    Gift cards carry a default fee of <Strong>4%</Strong> of the
                    card value, shown before checkout. This is configurable by
                    admins.
                </P>
            </>
        ),
    },

    {
        slug: 'bulk-payouts',
        title: 'Bulk payouts',
        description:
            'Pay many recipients at once by uploading a CSV. Each row is processed independently, with failed rows refunded automatically.',
        group: 'Using Tappy',
        icon: 'layers',
        body: (
            <>
                <Callout type="note">
                    Bulk payouts appear in the <Strong>Business</Strong> and{' '}
                    <Strong>Reseller</Strong> navigation; admins can review bulk
                    jobs from their own menu.
                </Callout>

                <H2 id="format">CSV format</H2>
                <P>
                    Prepare a CSV with three columns — country, recipient and
                    amount (in USD). A header row is optional and skipped
                    automatically:
                </P>
                <CodeBlock
                    title="payouts.csv"
                    code={`country,recipient,amount
NG,+2348035550142,5.00
KE,+254712998221,3.50
BD,+8801712345678,2.00`}
                />
                <DocTable
                    head={['Column', 'Description']}
                    rows={[
                        [
                            <Code key="1">country</Code>,
                            'Two-letter ISO country code (e.g. NG, KE)',
                        ],
                        [
                            <Code key="2">recipient</Code>,
                            'The destination phone number',
                        ],
                        [
                            <Code key="3">amount</Code>,
                            'Amount in USD (decimal, e.g. 5.00)',
                        ],
                    ]}
                />
                <P>
                    A single file can contain up to <Strong>5,000 rows</Strong>.
                </P>

                <H2 id="processing">How a batch is processed</H2>
                <UL>
                    <LI>
                        The batch is <Strong>queued</Strong> and processed
                        row-by-row in the background.
                    </LI>
                    <LI>
                        Each row detects its operator and is charged and
                        delivered independently.
                    </LI>
                    <LI>
                        A row that can't be delivered (unknown operator or
                        insufficient funds) is marked <Strong>failed</Strong>{' '}
                        and refunded — it never blocks the rest of the batch.
                    </LI>
                    <LI>
                        Open any batch to see live progress and a per-row
                        breakdown.
                    </LI>
                </UL>
            </>
        ),
    },

    {
        slug: 'recipients',
        title: 'Saved recipients',
        description:
            'Save the numbers you send to most often for one-tap repeat top-ups.',
        group: 'Using Tappy',
        icon: 'bookmark',
        body: (
            <>
                <H2 id="manage">Managing recipients</H2>
                <UL>
                    <LI>
                        Save a recipient with a nickname, country and phone
                        number.
                    </LI>
                    <LI>
                        Star your most-used contacts to keep them at the top.
                    </LI>
                    <LI>
                        Search by name or number, then send a top-up in one tap.
                    </LI>
                    <LI>Edit or remove a recipient at any time.</LI>
                </UL>
                <Callout type="note">
                    Nicknames can be up to 80 characters and phone numbers up to
                    60.
                </Callout>
            </>
        ),
    },

    {
        slug: 'transactions',
        title: 'Transactions',
        description:
            'A searchable, filterable history of every order, with full receipts and CSV export.',
        group: 'Using Tappy',
        icon: 'receipt',
        body: (
            <>
                <H2 id="browse">Browsing history</H2>
                <P>
                    Search by reference, recipient number or recipient name, and
                    filter by status, product type or date range. Open any row
                    for a full receipt, or export your results to CSV.
                </P>

                <H2 id="statuses">Transaction statuses</H2>
                <DocTable
                    head={['Status', 'Meaning']}
                    rows={[
                        [
                            <Strong key="1">Pending</Strong>,
                            'Accepted and awaiting delivery',
                        ],
                        [
                            <Strong key="2">Processing</Strong>,
                            'Being delivered by the provider',
                        ],
                        [
                            <Strong key="3">Success</Strong>,
                            'Delivered successfully',
                        ],
                        [
                            <Strong key="4">Review</Strong>,
                            'A high-value order held for admin approval before delivery',
                        ],
                        [
                            <Strong key="5">Failed</Strong>,
                            'Could not be delivered — funds refunded',
                        ],
                        [
                            <Strong key="6">Refunded</Strong>,
                            'Reversed and credited back to your wallet',
                        ],
                    ]}
                />
            </>
        ),
    },

    {
        slug: 'automations',
        title: 'Automations',
        description:
            'Schedule recurring top-ups — daily, weekly or monthly — so the right people are always topped up.',
        group: 'Using Tappy',
        icon: 'refresh',
        body: (
            <>
                <H2 id="create">Creating an automation</H2>
                <P>
                    Set up a recurring recharge with a recipient, country,
                    operator, amount and frequency. You can build one from the
                    form, or just describe it to the{' '}
                    <a href="/documentation/ai-copilot">AI Copilot</a>.
                </P>
                <UL>
                    <LI>
                        Choose a frequency (e.g. daily, weekly, monthly) and the
                        next run date.
                    </LI>
                    <LI>Enable or pause any automation at any time.</LI>
                    <LI>
                        Track upcoming runs, and see the reason if a run fails.
                    </LI>
                </UL>
                <Callout type="warning" title="Requires the scheduler">
                    Due automations are executed once a day by the task
                    scheduler. In production, make sure the Laravel scheduler is
                    running — see{' '}
                    <a href="/documentation/scheduled-tasks">Scheduled tasks</a>
                    .
                </Callout>
            </>
        ),
    },

    {
        slug: 'ai-copilot',
        title: 'AI Copilot',
        description:
            'Describe what you want in plain English and the copilot drafts the action for you to confirm before anything is charged.',
        group: 'Using Tappy',
        icon: 'sparkles',
        body: (
            <>
                <H2 id="use">Using the copilot</H2>
                <P>
                    Open the copilot from anywhere and type a request. It
                    interprets your intent and either answers or prepares a
                    draft action:
                </P>
                <CardGrid cols={2}>
                    <DocCard icon="phone" title="Send a top-up">
                        "Send $5 airtime to +234 803 555 0142"
                    </DocCard>
                    <DocCard icon="gift" title="Buy a gift card">
                        "Buy a $10 Amazon gift card"
                    </DocCard>
                    <DocCard icon="wallet" title="Check your balance">
                        "What's my wallet balance?"
                    </DocCard>
                    <DocCard icon="receipt" title="Look up a transaction">
                        "What happened to transaction TXN-..."
                    </DocCard>
                </CardGrid>

                <Callout type="tip" title="You're always in control">
                    The copilot never spends money on its own. It drafts a
                    top-up and waits for you to confirm; only then is your
                    wallet charged.
                </Callout>

                <H2 id="activity">AI activity</H2>
                <P>
                    Every copilot interaction is logged under{' '}
                    <Strong>AI Activity</Strong>, where you can filter by status
                    and export the history. Requests can be up to 1,000
                    characters.
                </P>

                <Callout type="note">
                    With the default <Code>fake</Code> AI driver, the copilot
                    uses a deterministic engine and needs no API key. Add an
                    Anthropic or OpenRouter key for full natural-language
                    understanding — see{' '}
                    <a href="/documentation/configuration">Configuration</a>.
                </Callout>
            </>
        ),
    },

    {
        slug: 'reports',
        title: 'Reports',
        description:
            'Analytics on your last 30 days — revenue, margin, product mix and top destinations.',
        group: 'Using Tappy',
        icon: 'chart',
        body: (
            <>
                <P>
                    The reports screen summarizes your recent performance with
                    live figures computed from your transactions:
                </P>
                <UL>
                    <LI>
                        <Strong>Headline KPIs</Strong> — total revenue, gross
                        margin, transaction count and failure rate
                    </LI>
                    <LI>
                        <Strong>Revenue trend</Strong> — daily volume over the
                        last 30 days, plus a weekly view
                    </LI>
                    <LI>
                        <Strong>Product mix</Strong> — the share of volume
                        across airtime, data and gift cards
                    </LI>
                    <LI>
                        <Strong>Top destinations</Strong> — your highest-volume
                        countries with share and margin
                    </LI>
                </UL>
                <Callout type="note">
                    Reports appear in the Business, Reseller and Admin
                    navigation. Admins see platform-wide figures; everyone else
                    sees their own.
                </Callout>
            </>
        ),
    },

    {
        slug: 'reseller-customers',
        title: 'My customers',
        description:
            'Resellers build and manage a downstream customer/agent network, tracking each customer’s orders, volume and the commission they generate.',
        group: 'Reseller',
        icon: 'users',
        body: (
            <>
                <Callout type="note">
                    The reseller area is available only to accounts with the{' '}
                    <Strong>Reseller</Strong> role.
                </Callout>

                <H2 id="manage">Managing your network</H2>
                <P>
                    Each customer record tracks their tier, status, order count,
                    volume and the commission you've earned from them. The
                    header shows totals across your whole network.
                </P>
                <UL>
                    <LI>
                        Add customers individually with a name, contact, country
                        and tier (e.g. Agent or Customer).
                    </LI>
                    <LI>Search by name or contact and filter by tier.</LI>
                    <LI>Edit or remove a customer at any time.</LI>
                </UL>

                <H2 id="import">Bulk import</H2>
                <P>
                    Import your existing network from a CSV (up to 5,000 rows,
                    max 1&nbsp;MB). A header row is optional:
                </P>
                <CodeBlock
                    title="customers.csv"
                    code={`name,contact,country,tier
John Doe,+2348012345678,NG,Agent
Jane Smith,+254712345678,KE,Customer`}
                />
            </>
        ),
    },

    {
        slug: 'reseller-earnings',
        title: 'Earnings',
        description:
            'The reseller earnings dashboard: commission this month, lifetime totals, average margin, product breakdown and payout history.',
        group: 'Reseller',
        icon: 'percent',
        body: (
            <>
                <H2 id="overview">Your earnings at a glance</H2>
                <UL>
                    <LI>
                        <Strong>Commission this month</Strong> and{' '}
                        <Strong>lifetime commission</Strong>
                    </LI>
                    <LI>
                        <Strong>Average margin</Strong> across your sales
                    </LI>
                    <LI>
                        A <Strong>six-month commission trend</Strong> and a{' '}
                        <Strong>breakdown by product</Strong> (airtime, data and
                        gift cards)
                    </LI>
                    <LI>
                        Your <Strong>payout history</Strong> with period,
                        amount, method and status
                    </LI>
                </UL>
                <P>
                    Commission accrues automatically from the fees on
                    transactions attributed to your network. Export your
                    statement to CSV at any time.
                </P>
            </>
        ),
    },

    {
        slug: 'developer-api',
        title: 'Developer API & webhooks',
        description:
            'Issue API keys, subscribe to transaction webhooks, and send test events to verify your integration.',
        group: 'Using Tappy',
        icon: 'code',
        body: (
            <>
                <Callout type="note">
                    The developer area appears in the <Strong>Business</Strong>{' '}
                    and <Strong>Reseller</Strong> navigation; admins use it for
                    API logs.
                </Callout>

                <H2 id="keys">API keys</H2>
                <UL>
                    <LI>
                        Create a key with a name and an environment (
                        <Strong>live</Strong> or <Strong>sandbox</Strong>).
                    </LI>
                    <LI>
                        The full secret is shown <Strong>once</Strong> at
                        creation — copy it then; only a short prefix is stored
                        afterward.
                    </LI>
                    <LI>
                        Revoke a key instantly when it's no longer needed, and
                        see when each key was last used.
                    </LI>
                </UL>

                <H2 id="webhooks">Webhook events</H2>
                <P>
                    The developer screen lists recent webhook deliveries with
                    their status and response code. Available event types
                    include:
                </P>
                <PropertyList>
                    <Property name="transaction.success" type="event">
                        A transaction was delivered successfully.
                    </Property>
                    <Property name="transaction.failed" type="event">
                        A transaction failed and was refunded.
                    </Property>
                    <Property name="transaction.pending" type="event">
                        A transaction was accepted and is awaiting delivery.
                    </Property>
                    <Property name="transaction.refunded" type="event">
                        A transaction was reversed and refunded.
                    </Property>
                </PropertyList>

                <H2 id="test-event">Sending a test event</H2>
                <P>
                    Use <Strong>Send test event</Strong> to emit a sample{' '}
                    <Code>transaction.success</Code> event referencing your most
                    recent transaction, so you can confirm your endpoint is
                    wired up correctly. The API is rate-limited to 30 requests
                    per minute.
                </P>
            </>
        ),
    },

    {
        slug: 'account-security',
        title: 'Account & security',
        description:
            'Manage your profile, password, two-factor authentication and passkeys, and understand KYC and account status.',
        group: 'Using Tappy',
        icon: 'shield',
        body: (
            <>
                <H2 id="profile">Profile</H2>
                <P>
                    Update your name and email under{' '}
                    <Strong>Settings → Profile</Strong>. Changing your email
                    requires re-verifying the new address. You can also
                    permanently delete your account here.
                </P>

                <H2 id="password">Password</H2>
                <P>
                    Change your password under{' '}
                    <Strong>Settings → Security</Strong>. You'll confirm your
                    current password first, and the new password must meet the
                    displayed strength rules.
                </P>

                <H2 id="2fa">Two-factor authentication</H2>
                <P>
                    Add a second layer of protection with an authenticator app
                    (TOTP):
                </P>
                <Steps>
                    <Step n={1} title="Enable 2FA">
                        In <Strong>Security</Strong>, turn on two-factor
                        authentication and confirm your password.
                    </Step>
                    <Step n={2} title="Scan the QR code">
                        Scan it with Google Authenticator, Authy or similar,
                        then enter the 6-digit code to confirm.
                    </Step>
                    <Step n={3} title="Save recovery codes">
                        Store your one-time recovery codes somewhere safe — they
                        let you sign in if you lose your device.
                    </Step>
                </Steps>
                <P>
                    <Strong>Passkeys</Strong> are also supported for
                    passwordless sign-in, and can be added and removed from the
                    same screen.
                </P>

                <H2 id="appearance">Appearance</H2>
                <P>
                    Under <Strong>Settings → Appearance</Strong>, switch between
                    a light or dark theme and personalize the interface accent
                    and density. Your choice is remembered on this device.
                </P>

                <H2 id="kyc">KYC verification</H2>
                <P>
                    Business and reseller accounts verify their identity under{' '}
                    <Strong>Settings → Verification</Strong>. Upload a government
                    ID and proof of address (a business registration is
                    optional, up to 5&nbsp;MB each); your documents are stored
                    privately and submitted for review.
                </P>
                <P>
                    Your status is one of <Strong>pending</Strong>,{' '}
                    <Strong>in review</Strong>, <Strong>approved</Strong> or{' '}
                    <Strong>rejected</Strong>. New accounts start as pending;
                    you're notified in-app whenever an admin updates your status,
                    and approval unlocks full transacting limits. If you're
                    rejected, you can re-upload and resubmit.
                </P>

                <H2 id="status">Account status</H2>
                <Callout type="warning" title="Suspension">
                    If an admin suspends your account, you're signed out
                    immediately and can't sign back in until it's reactivated.
                    Contact support if you believe this is a mistake.
                </Callout>
            </>
        ),
    },

    {
        slug: 'support',
        title: 'Support',
        description:
            'Open a support ticket, track its status, and exchange replies with the support team.',
        group: 'Using Tappy',
        icon: 'headset',
        body: (
            <>
                <H2 id="open">Opening a ticket</H2>
                <P>
                    From <Strong>Support</Strong>, create a ticket with a
                    subject (up to 160 characters), a message (up to 2,000
                    characters) and a priority of <Strong>low</Strong>,{' '}
                    <Strong>medium</Strong> or <Strong>high</Strong>. You can
                    optionally reference a transaction if your question is about
                    a specific order.
                </P>

                <H2 id="track">Replies & status</H2>
                <UL>
                    <LI>
                        Each ticket gets a reference like{' '}
                        <Code>TKT-XXXXXX</Code>.
                    </LI>
                    <LI>
                        Open a ticket to read the full thread and add a reply.
                    </LI>
                    <LI>
                        Tickets move between <Strong>open</Strong>,{' '}
                        <Strong>pending</Strong> and <Strong>resolved</Strong>{' '}
                        as the conversation progresses.
                    </LI>
                </UL>
            </>
        ),
    },
];
