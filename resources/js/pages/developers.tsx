import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
    destroy,
    rotateWebhookSecret,
    sendTestEvent,
    store,
    updateWebhook,
} from '@/actions/App/Http/Controllers/DeveloperController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/data-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelBody, PanelHead } from '@/components/ui/panel';
import { Stat } from '@/components/ui/stat';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, UnderlineTabs } from '@/components/ui/tabs';
import { useSandbox } from '@/hooks/use-sandbox';
import { fmtInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types/ui';

type ApiKey = {
    id: string;
    name: string;
    prefix: string;
    secret: string;
    mode: string;
    created: string | null;
    lastUsed: string;
    calls: number;
};

type WebhookEvent = {
    id: string;
    type: string;
    status: string;
    code: number;
    time: string | null;
    attempts: number;
};

const CODE_SAMPLES: Record<string, string> = {
    node: `import Tappy from '@tappy/sdk';

const client = new Tappy({
  apiKey: process.env.TAPPY_API_KEY,
});

const topup = await client.topup.create({
  operator: 'mtn-ng',
  phone:    '+234 803 555 0142',
  amount:   1000,
  currency: 'NGN',
});

console.log(topup.id, topup.status);`,
    python: `import tappy

client = tappy.Client(api_key="tpy_live_...")

topup = client.topup.create(
    operator="mtn-ng",
    phone="+234 803 555 0142",
    amount=1000,
    currency="NGN",
)

print(topup.id, topup.status)`,
    curl: `curl -X POST https://api.tappy.io/v1/topup \\
  -H "Authorization: Bearer tpy_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "operator": "mtn-ng",
    "phone":    "+234 803 555 0142",
    "amount":   1000,
    "currency": "NGN"
  }'`,
    php: `$client = new \\Tappy\\Client([
    'api_key' => 'tpy_live_...',
]);

$topup = $client->topup->create([
    'operator' => 'mtn-ng',
    'phone'    => '+234 803 555 0142',
    'amount'   => 1000,
    'currency' => 'NGN',
]);

echo $topup->id . ' ' . $topup->status;`,
};

type DevStats = {
    apiKeys: number;
    webhookEvents: number;
    successRate: number;
    rateLimit: string;
};

type Webhook = {
    url: string | null;
    secret: string;
    events: string[];
    availableEvents: string[];
};

export default function ApiScreen({
    apiKeys = [],
    webhookEvents = [],
    webhook,
    stats,
}: {
    apiKeys?: ApiKey[];
    webhookEvents?: WebhookEvent[];
    webhook: Webhook;
    stats: DevStats;
}) {
    const { auth } = usePage<SharedData>().props;
    const role = auth.user.role;
    const isAdmin = role === 'admin';
    const { sandbox, setSandbox } = useSandbox();

    const [reveal, setReveal] = useState<Record<string, boolean>>({});
    const [createOpen, setCreateOpen] = useState(false);
    const [name, setName] = useState('');
    const [keyEnv, setKeyEnv] = useState('live');
    const [creating, setCreating] = useState(false);
    const [revoke, setRevoke] = useState<ApiKey | null>(null);
    const [revoking, setRevoking] = useState(false);
    const [freshKey, setFreshKey] = useState<string | null>(null);
    const [webhookUrl, setWebhookUrl] = useState(webhook.url ?? '');
    const [events, setEvents] = useState<string[]>(webhook.events ?? []);
    const [revealSecret, setRevealSecret] = useState(false);
    const [savingWebhook, setSavingWebhook] = useState(false);
    const [codeLang, setCodeLang] = useState('node');
    const [docsTab, setDocsTab] = useState('quickstart');

    const toggleReveal = (id: string) =>
        setReveal((r) => ({ ...r, [id]: !r[id] }));

    const toggleEvent = (e: string) =>
        setEvents((cur) =>
            cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e],
        );

    const saveWebhook = () =>
        router.post(
            updateWebhook.url(),
            { url: webhookUrl || null, events },
            {
                preserveScroll: true,
                onStart: () => setSavingWebhook(true),
                onFinish: () => setSavingWebhook(false),
            },
        );

    const rotateSecret = () =>
        router.post(rotateWebhookSecret.url(), {}, { preserveScroll: true });

    const maskedSecret = `${webhook.secret.slice(0, 6)}••••${webhook.secret.slice(-4)}`;

    // The freshly generated plaintext is delivered once via Inertia v3 flash.
    // Surface it on its matching key row so it can be revealed/copied a single
    // time; after a reload the row falls back to its masked secret.
    useEffect(() => {
        return router.on('flash', (event) => {
            const newKey = (event as CustomEvent).detail?.flash?.newKey as
                | string
                | undefined;

            if (newKey) {
                setFreshKey(newKey);
            }
        });
    }, []);

    const freshPrefix = freshKey?.slice(0, 12);
    const keys = apiKeys.map((k) =>
        freshKey && k.prefix === freshPrefix ? { ...k, secret: freshKey } : k,
    );

    const handleCreate = () => {
        if (!name.trim()) {
            toast.error('Name this key so you can recognise it later.');

            return;
        }

        setCreating(true);
        router.post(
            store.url(),
            { name, environment: keyEnv },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCreateOpen(false);
                    setName('');
                    setKeyEnv('live');
                    toast.success('API key created', {
                        description: "Copy it now — it won't be shown again.",
                    });
                },
                onError: () => toast.error('Could not create key'),
                onFinish: () => setCreating(false),
            },
        );
    };

    const handleRevoke = () => {
        if (!revoke) {
            return;
        }

        setRevoking(true);
        router.delete(destroy.url(Number(revoke.id)), {
            preserveScroll: true,
            onSuccess: () => {
                setRevoke(null);
                toast.error('Key revoked');
            },
            onError: () => toast.error('Could not revoke key'),
            onFinish: () => setRevoking(false),
        });
    };

    return (
        <>
            <Head title="API & Webhooks" />
            <Page>
                <PageHeader
                    title={isAdmin ? 'API logs' : 'API & Webhooks'}
                    desc={
                        isAdmin
                            ? 'Inspect upstream provider calls, latencies and webhook deliveries.'
                            : 'Build on Tappy — manage keys, webhooks and monitor usage.'
                    }
                    actions={
                        <>
                            <Button variant="outline">
                                <Icon name="external" className="size-4" />
                                API docs
                            </Button>
                            {!isAdmin && (
                                <Button onClick={() => setCreateOpen(true)}>
                                    <Icon name="plus" className="size-4" />
                                    Create key
                                </Button>
                            )}
                        </>
                    }
                />

                {/* KPI stats */}
                <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]">
                    <Stat
                        label="Active API keys"
                        value={String(stats.apiKeys)}
                        icon="cpu"
                        accent="primary"
                    />
                    <Stat
                        label="Webhook events"
                        value={String(stats.webhookEvents)}
                        icon="webhook"
                        accent="info"
                    />
                    <Stat
                        label="Success rate"
                        value={`${stats.successRate}%`}
                        icon="checkcircle"
                        accent="success"
                    />
                    <Stat
                        label="Rate limit"
                        value={stats.rateLimit}
                        icon="signal"
                        accent="warning"
                        sub="per API key"
                    />
                </div>

                {/* Keys + Webhook */}
                <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                    {/* API Keys panel */}
                    <Panel>
                        <PanelHead
                            title="API keys"
                            desc="Treat secret keys like passwords — never expose them client-side."
                            action={
                                isAdmin ? undefined : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[12px] text-muted-foreground">
                                            Mode
                                        </span>
                                        <Tabs
                                            tabs={[
                                                {
                                                    value: 'production',
                                                    label: 'Production',
                                                },
                                                {
                                                    value: 'sandbox',
                                                    label: 'Sandbox',
                                                },
                                            ]}
                                            value={
                                                sandbox
                                                    ? 'sandbox'
                                                    : 'production'
                                            }
                                            onChange={(v) =>
                                                setSandbox(v === 'sandbox')
                                            }
                                        />
                                    </div>
                                )
                            }
                        />
                        <PanelBody className="pt-3">
                            {keys.map((k) => (
                                <div
                                    key={k.id}
                                    className="border-b py-3 last:border-b-0"
                                >
                                    <div className="mb-2 flex items-center gap-2.5">
                                        <span className="text-[13px] font-semibold whitespace-nowrap">
                                            {k.name}
                                        </span>
                                        <Badge
                                            variant={
                                                k.mode === 'live'
                                                    ? 'success'
                                                    : 'warning'
                                            }
                                        >
                                            {k.mode}
                                        </Badge>
                                        <span className="flex-1" />
                                        <span className="hidden text-[11.5px] whitespace-nowrap text-muted-foreground sm:inline">
                                            {fmtInt(k.calls)} calls ·{' '}
                                            {k.lastUsed}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <code className="min-w-0 flex-1 overflow-hidden rounded-[var(--radius)] bg-muted px-[10px] py-[7px] font-mono text-[12px] text-ellipsis whitespace-nowrap">
                                            {reveal[k.id]
                                                ? k.secret
                                                : k.prefix +
                                                  '••••••••••••' +
                                                  k.secret.slice(-4)}
                                        </code>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => toggleReveal(k.id)}
                                        >
                                            <Icon
                                                name={
                                                    reveal[k.id]
                                                        ? 'eyeoff'
                                                        : 'eye'
                                                }
                                                className="size-3.5"
                                            />
                                        </Button>
                                        <CopyButton text={k.secret} />
                                        {!isAdmin && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setRevoke(k)}
                                            >
                                                <Icon
                                                    name="trash"
                                                    className="size-3.5"
                                                />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </PanelBody>
                    </Panel>

                    {/* Webhook panel */}
                    <Panel>
                        <PanelHead
                            title="Webhook endpoint"
                            desc="We POST event payloads here with an HMAC signature."
                        />
                        <PanelBody className="pt-3">
                            <Field label="Endpoint URL">
                                <Input
                                    icon="link"
                                    value={webhookUrl}
                                    placeholder="https://your-app.com/webhooks/tappy"
                                    onChange={(e) =>
                                        setWebhookUrl(e.target.value)
                                    }
                                />
                            </Field>

                            <div className="my-[14px] flex items-center gap-2">
                                <Icon
                                    name="lock"
                                    className="size-3.5 text-muted-foreground"
                                />
                                <span className="text-[12px] text-muted-foreground">
                                    Signing secret
                                </span>
                                <code className="rounded-md bg-muted px-2 py-1 font-mono text-[11.5px]">
                                    {revealSecret
                                        ? webhook.secret
                                        : maskedSecret}
                                </code>
                                <span className="flex-1" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    aria-label={
                                        revealSecret
                                            ? 'Hide secret'
                                            : 'Reveal secret'
                                    }
                                    onClick={() => setRevealSecret((v) => !v)}
                                >
                                    <Icon
                                        name={revealSecret ? 'eyeoff' : 'eye'}
                                        className="size-3.5"
                                    />
                                </Button>
                                <CopyButton text={webhook.secret} />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    aria-label="Rotate signing secret"
                                    onClick={rotateSecret}
                                >
                                    <Icon name="refresh" className="size-3.5" />
                                </Button>
                            </div>

                            <div className="mb-1.5 text-[12.5px] font-medium">
                                Subscribed events
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {webhook.availableEvents.map((e) => {
                                    const on = events.includes(e);

                                    return (
                                        <button
                                            key={e}
                                            type="button"
                                            onClick={() => toggleEvent(e)}
                                            aria-pressed={on}
                                            className={cn(
                                                'rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors',
                                                on
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border text-muted-foreground hover:bg-accent',
                                            )}
                                        >
                                            {e}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Button
                                    className="flex-1"
                                    onClick={saveWebhook}
                                    disabled={savingWebhook}
                                >
                                    {savingWebhook ? 'Saving…' : 'Save webhook'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        router.post(
                                            sendTestEvent.url(),
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    <Icon name="zap" className="size-4" />
                                    Send test
                                </Button>
                            </div>
                        </PanelBody>
                    </Panel>
                </div>

                {/* Webhook deliveries table */}
                <Panel className="mb-4">
                    <PanelHead
                        title="Recent webhook deliveries"
                        action={
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                    router.reload({
                                        only: ['webhookEvents', 'stats'],
                                    })
                                }
                            >
                                <Icon name="refresh" className="size-3.5" />
                                Refresh
                            </Button>
                        }
                    />
                    <div className="mt-2">
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Event ID</TH>
                                    <TH>Type</TH>
                                    <TH className="hidden sm:table-cell">
                                        Attempts
                                    </TH>
                                    <TH>Response</TH>
                                    <TH right>Time</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {webhookEvents.map((e) => (
                                    <TR key={e.id}>
                                        <TD>
                                            <span className="font-mono text-[11.5px]">
                                                {e.id}
                                            </span>
                                        </TD>
                                        <TD>
                                            <Badge variant="muted">
                                                {e.type}
                                            </Badge>
                                        </TD>
                                        <TD className="hidden sm:table-cell">
                                            <span className="tnum text-[12.5px]">
                                                {e.attempts}
                                            </span>
                                        </TD>
                                        <TD>
                                            <span className="inline-flex items-center gap-1.5">
                                                <span
                                                    className="inline-block size-[7px] rounded-full"
                                                    style={{
                                                        background: `hsl(var(--${e.code < 300 ? 'success' : 'destructive'}))`,
                                                    }}
                                                />
                                                <span className="font-mono text-[12px]">
                                                    {e.code}
                                                </span>
                                                <StatusBadge
                                                    status={e.status}
                                                />
                                            </span>
                                        </TD>
                                        <TD right>
                                            <span className="tnum font-mono text-[12px] text-muted-foreground">
                                                {e.time}
                                            </span>
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                </Panel>

                {/* Code samples */}
                <Panel className="mb-4">
                    <PanelHead
                        title="Code samples"
                        desc="Quickstart snippets for the most common top-up flow."
                    />
                    <PanelBody className="pt-3">
                        <div className="mb-3">
                            <Tabs
                                tabs={[
                                    { value: 'node', label: 'Node.js' },
                                    { value: 'python', label: 'Python' },
                                    { value: 'curl', label: 'cURL' },
                                    { value: 'php', label: 'PHP' },
                                ]}
                                value={codeLang}
                                onChange={setCodeLang}
                            />
                        </div>
                        <div className="relative">
                            <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[12px]">
                                {CODE_SAMPLES[codeLang]}
                            </pre>
                            <div className="absolute top-2 right-2">
                                <CopyButton
                                    text={CODE_SAMPLES[codeLang]}
                                    label="Copy"
                                />
                            </div>
                        </div>
                    </PanelBody>
                </Panel>

                {/* Docs tabs */}
                <Panel>
                    <PanelBody className="pt-0">
                        <UnderlineTabs
                            tabs={[
                                { value: 'quickstart', label: 'Quickstart' },
                                { value: 'auth', label: 'Authentication' },
                                { value: 'errors', label: 'Errors' },
                                { value: 'webhooks', label: 'Webhooks' },
                                { value: 'sdks', label: 'SDKs' },
                            ]}
                            value={docsTab}
                            onChange={setDocsTab}
                            className="mb-4"
                        />

                        {docsTab === 'quickstart' && (
                            <div className="space-y-4 text-[13.5px] leading-relaxed text-muted-foreground">
                                <p>
                                    The Tappy API is organized around{' '}
                                    <span className="font-semibold text-foreground">
                                        REST
                                    </span>
                                    . Our API has predictable resource-oriented
                                    URLs, accepts JSON-encoded request bodies,
                                    returns JSON-encoded responses, and uses
                                    standard HTTP response codes,
                                    authentication, and verbs.
                                </p>
                                <div>
                                    <div className="mb-1.5 text-[12.5px] font-medium text-foreground">
                                        Base URL
                                    </div>
                                    <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[12px]">
                                        https://api.tappy.io/v1
                                    </pre>
                                </div>
                                <div>
                                    <div className="mb-1.5 text-[12.5px] font-medium text-foreground">
                                        Required headers
                                    </div>
                                    <div className="overflow-hidden rounded-md border text-[12.5px]">
                                        <div className="flex gap-4 border-b px-3.5 py-2.5">
                                            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11.5px]">
                                                Authorization
                                            </kbd>
                                            <span>
                                                Bearer token using your API key
                                            </span>
                                        </div>
                                        <div className="flex gap-4 px-3.5 py-2.5">
                                            <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11.5px]">
                                                Content-Type
                                            </kbd>
                                            <span>
                                                <code className="font-mono">
                                                    application/json
                                                </code>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {docsTab === 'auth' && (
                            <div className="space-y-4 text-[13.5px] leading-relaxed text-muted-foreground">
                                <p>
                                    Authenticate by including your API key in
                                    the{' '}
                                    <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11.5px]">
                                        Authorization
                                    </kbd>{' '}
                                    header of every request. Keep your API keys
                                    secure — do not share them in publicly
                                    accessible areas such as GitHub, client-side
                                    code, and so forth.
                                </p>
                                <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[12px]">
                                    {`Authorization: Bearer tpy_live_8f2a9c4e1b7d6035a8f1`}
                                </pre>
                                <p>
                                    Use{' '}
                                    <Badge variant="warning" className="inline">
                                        test
                                    </Badge>{' '}
                                    keys in sandbox mode — they behave
                                    identically to live keys but no real money
                                    moves.
                                </p>
                            </div>
                        )}

                        {docsTab === 'errors' && (
                            <div className="space-y-4 text-[13.5px] leading-relaxed text-muted-foreground">
                                <p>
                                    Tappy uses conventional HTTP response codes
                                    to indicate the success or failure of an API
                                    request.
                                </p>
                                <div className="overflow-hidden rounded-md border text-[12.5px]">
                                    {[
                                        {
                                            code: '200',
                                            desc: 'OK — request succeeded',
                                        },
                                        {
                                            code: '400',
                                            desc: 'Bad Request — invalid parameters',
                                        },
                                        {
                                            code: '401',
                                            desc: 'Unauthorized — invalid or missing API key',
                                        },
                                        {
                                            code: '402',
                                            desc: 'Insufficient funds — wallet balance too low',
                                        },
                                        {
                                            code: '422',
                                            desc: 'Unprocessable Entity — validation error',
                                        },
                                        {
                                            code: '429',
                                            desc: 'Too Many Requests — rate limit exceeded',
                                        },
                                        {
                                            code: '500',
                                            desc: 'Server Error — try again shortly',
                                        },
                                    ].map((r, i, arr) => (
                                        <div
                                            key={r.code}
                                            className={`flex gap-4 px-3.5 py-2.5 ${i < arr.length - 1 ? 'border-b' : ''}`}
                                        >
                                            <kbd className="w-10 shrink-0 rounded bg-muted px-1.5 py-0.5 text-center font-mono text-[11.5px]">
                                                {r.code}
                                            </kbd>
                                            <span>{r.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {docsTab === 'webhooks' && (
                            <div className="space-y-4 text-[13.5px] leading-relaxed text-muted-foreground">
                                <p>
                                    Tappy sends webhook events to your
                                    configured endpoint to notify your
                                    application when asynchronous events occur.
                                    All payloads are signed with an{' '}
                                    <span className="font-semibold text-foreground">
                                        HMAC-SHA256
                                    </span>{' '}
                                    signature using your signing secret.
                                </p>
                                <div>
                                    <div className="mb-1.5 text-[12.5px] font-medium text-foreground">
                                        Verify the signature
                                    </div>
                                    <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[12px]">
                                        {`const sig = req.headers['tappy-signature'];
const expected = createHmac('sha256', whsec)
  .update(rawBody)
  .digest('hex');
if (sig !== expected) throw new Error('Invalid signature');`}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {docsTab === 'sdks' && (
                            <div className="space-y-4 text-[13.5px] leading-relaxed text-muted-foreground">
                                <p>
                                    Official SDKs are available for the most
                                    popular languages and runtimes:
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {[
                                        {
                                            lang: 'Node.js / TypeScript',
                                            pkg: 'npm install @tappy/sdk',
                                        },
                                        {
                                            lang: 'Python',
                                            pkg: 'pip install tappy',
                                        },
                                        {
                                            lang: 'PHP',
                                            pkg: 'composer require tappy/sdk',
                                        },
                                        {
                                            lang: 'Go',
                                            pkg: 'go get github.com/tappy/tappy-go',
                                        },
                                    ].map((s) => (
                                        <div
                                            key={s.lang}
                                            className="rounded-md border p-3"
                                        >
                                            <div className="mb-1 text-[12.5px] font-semibold text-foreground">
                                                {s.lang}
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <code className="font-mono text-[11.5px]">
                                                    {s.pkg}
                                                </code>
                                                <CopyButton text={s.pkg} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </PanelBody>
                </Panel>

                {/* Create key dialog */}
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent className="sm:max-w-[420px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Icon name="key" className="size-4" />
                                Create API key
                            </DialogTitle>
                            <DialogDescription>
                                Name this key so you can recognise it later.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Field label="Key name">
                                <Input
                                    placeholder="e.g. Production server"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Field>
                            <div>
                                <div className="mb-1.5 text-[12.5px] font-medium">
                                    Environment
                                </div>
                                <Tabs
                                    tabs={[
                                        { value: 'live', label: 'Production' },
                                        {
                                            value: 'sandbox',
                                            label: 'Sandbox',
                                        },
                                    ]}
                                    value={keyEnv}
                                    onChange={setKeyEnv}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setCreateOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={creating}>
                                Create key
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Revoke key dialog */}
                <Dialog
                    open={!!revoke}
                    onOpenChange={(open) => !open && setRevoke(null)}
                >
                    <DialogContent className="sm:max-w-[420px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <Icon name="alert" className="size-4" />
                                Revoke API key?
                            </DialogTitle>
                            <DialogDescription>
                                {revoke && (
                                    <>
                                        &ldquo;{revoke.name}&rdquo; will stop
                                        working immediately. Any service using
                                        it will fail. This cannot be undone.
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setRevoke(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleRevoke}
                                disabled={revoking}
                            >
                                <Icon name="trash" className="size-4" />
                                Revoke key
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Page>
        </>
    );
}
