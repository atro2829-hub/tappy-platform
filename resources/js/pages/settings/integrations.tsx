import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
    integrations as integrationsRoute,
    testIntegration,
    updateIntegration,
    updateProviders,
} from '@/actions/App/Http/Controllers/Admin/AdminSettingsController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type Group =
    | 'mail'
    | 'stripe'
    | 'reloadly'
    | 'dingconnect'
    | 'dtone'
    | 'tremendous'
    | 'tillo'
    | 'giftbit'
    | 'tango'
    | 'aws'
    | 'ai';

interface AiModel {
    value: string;
    label: string;
    free?: boolean;
}

interface IntegrationStatus {
    enabled: boolean;
    values: Record<string, string | number | boolean | null>;
    secrets: Record<string, boolean>;
}

interface ProviderOption {
    id: string;
    label: string;
    configured: boolean;
}

interface ProviderCategory {
    key: string;
    label: string;
    selected: string;
    options: ProviderOption[];
    supportsFallback: boolean;
    fallback: string;
}

interface Props {
    integrations: Record<Group, IntegrationStatus>;
    providers: ProviderCategory[];
    aiProviders: Record<string, string>;
    aiModels: Record<string, AiModel[]>;
}

const TABS: { value: Group; label: string; slug: string }[] = [
    { value: 'mail', label: 'Email', slug: 'email' },
    { value: 'stripe', label: 'Payments', slug: 'payments' },
    { value: 'reloadly', label: 'Reloadly', slug: 'top-ups' },
    { value: 'dingconnect', label: 'DingConnect', slug: 'dingconnect' },
    { value: 'dtone', label: 'DT One', slug: 'dtone' },
    { value: 'tremendous', label: 'Tremendous', slug: 'tremendous' },
    { value: 'tillo', label: 'Tillo', slug: 'tillo' },
    { value: 'giftbit', label: 'Giftbit', slug: 'giftbit' },
    { value: 'tango', label: 'Tango Card', slug: 'tango' },
    { value: 'aws', label: 'Storage', slug: 'storage' },
    { value: 'ai', label: 'AI Copilot', slug: 'ai' },
];

/** Resolve the active tab from the URL hash (e.g. #payments), defaulting to Email. */
function tabFromHash(): Group {
    if (typeof window === 'undefined') {
        return 'mail';
    }

    const slug = window.location.hash.replace('#', '');

    return TABS.find((t) => t.slug === slug)?.value ?? 'mail';
}

interface FieldDef {
    name: string;
    label: string;
    type?: 'text' | 'password' | 'number' | 'email';
    placeholder?: string;
    secret?: boolean;
    options?: { value: string; label: string }[];
    full?: boolean;
}

const FORMS: Record<
    Group,
    {
        title: string;
        desc: string;
        note: string;
        fields: FieldDef[];
        extraToggle?: { name: string; label: string };
    }
> = {
    mail: {
        title: 'Email (SMTP)',
        desc: 'Outgoing mail server for receipts, alerts and password resets.',
        note: 'Leave disabled to keep using the environment’s mail driver.',
        fields: [
            {
                name: 'host',
                label: 'SMTP host',
                placeholder: 'smtp.mailgun.org',
                full: true,
            },
            { name: 'port', label: 'Port', type: 'number', placeholder: '587' },
            {
                name: 'scheme',
                label: 'Encryption',
                options: [
                    { value: '', label: 'None' },
                    { value: 'tls', label: 'TLS' },
                    { value: 'ssl', label: 'SSL' },
                ],
            },
            { name: 'username', label: 'Username' },
            {
                name: 'password',
                label: 'Password',
                type: 'password',
                secret: true,
            },
            {
                name: 'from_address',
                label: 'From address',
                type: 'email',
                placeholder: 'noreply@example.com',
            },
            { name: 'from_name', label: 'From name', placeholder: 'Tappy' },
        ],
    },
    stripe: {
        title: 'Stripe',
        desc: 'Card payments that fund customer wallets at checkout.',
        note: 'Leave disabled to keep the environment’s payment driver.',
        fields: [
            {
                name: 'key',
                label: 'Publishable key',
                placeholder: 'pk_live_…',
                full: true,
            },
            {
                name: 'secret',
                label: 'Secret key',
                type: 'password',
                secret: true,
                placeholder: 'sk_live_…',
                full: true,
            },
            {
                name: 'webhook_secret',
                label: 'Webhook signing secret',
                type: 'password',
                secret: true,
                placeholder: 'whsec_…',
                full: true,
            },
        ],
    },
    reloadly: {
        title: 'Top-up provider',
        desc: 'Wholesale airtime, data, gift card and utility supply.',
        note: 'Customers never see this provider — it powers fulfilment behind your brand.',
        extraToggle: { name: 'sandbox', label: 'Sandbox mode' },
        fields: [
            { name: 'client_id', label: 'Client ID', full: true },
            {
                name: 'client_secret',
                label: 'Client secret',
                type: 'password',
                secret: true,
                full: true,
            },
            {
                name: 'webhook_secret',
                label: 'Webhook signature secret',
                type: 'password',
                secret: true,
                full: true,
            },
        ],
    },
    dingconnect: {
        title: 'DingConnect',
        desc: 'Wholesale airtime, data and bundle top-ups across global operators.',
        note: 'Customers never see this provider — it powers fulfilment behind your brand. Sandbox mode validates transfers without delivering real airtime.',
        extraToggle: {
            name: 'sandbox',
            label: 'Sandbox mode (validate-only, no real transfers)',
        },
        fields: [
            {
                name: 'api_key',
                label: 'API key',
                type: 'password',
                secret: true,
                full: true,
                placeholder: 'Your DingConnect API key',
            },
        ],
    },
    dtone: {
        title: 'DT One',
        desc: 'Global airtime, data and bundle top-ups across 160+ countries.',
        note: 'Customers never see this provider — it powers fulfilment behind your brand. Sandbox routes to DT One’s pre-production environment.',
        extraToggle: {
            name: 'sandbox',
            label: 'Sandbox mode (pre-production environment)',
        },
        fields: [
            { name: 'api_key', label: 'API key', full: true },
            {
                name: 'api_secret',
                label: 'API secret',
                type: 'password',
                secret: true,
                full: true,
                placeholder: 'Your DT One API secret',
            },
        ],
    },
    tremendous: {
        title: 'Tremendous',
        desc: 'Gift cards and digital rewards across 2,500+ brands and 230+ countries.',
        note: 'Customers never see this provider — it powers fulfilment behind your brand. Orders draw on your pre-funded Tremendous balance.',
        extraToggle: {
            name: 'sandbox',
            label: 'Sandbox mode (testflight — no real cards issued)',
        },
        fields: [
            {
                name: 'api_key',
                label: 'API key',
                type: 'password',
                secret: true,
                full: true,
                placeholder: 'Your Tremendous API key',
            },
        ],
    },
    tillo: {
        title: 'Tillo',
        desc: 'Gift cards and rewards across 4,000+ brands, issued in real time.',
        note: 'Customers never see this provider — it powers fulfilment behind your brand. Orders draw on your pre-funded Tillo float.',
        extraToggle: {
            name: 'sandbox',
            label: 'Sandbox mode (Tillo sandbox environment)',
        },
        fields: [
            { name: 'api_key', label: 'API key', full: true },
            {
                name: 'secret',
                label: 'Secret (signing key)',
                type: 'password',
                secret: true,
                full: true,
                placeholder: 'Your Tillo signing secret',
            },
            {
                name: 'sector',
                label: 'Sector',
                placeholder: 'marketplace',
                full: true,
            },
        ],
    },
    giftbit: {
        title: 'Giftbit',
        desc: 'Gift cards and prepaid rewards delivered by email or shareable link.',
        note: 'Customers never see this provider — it powers fulfilment behind your brand. Sandbox routes to Giftbit’s testbed environment.',
        extraToggle: {
            name: 'sandbox',
            label: 'Sandbox mode (testbed environment)',
        },
        fields: [
            {
                name: 'api_key',
                label: 'API key',
                type: 'password',
                secret: true,
                full: true,
                placeholder: 'Your Giftbit API token',
            },
        ],
    },
    tango: {
        title: 'Tango Card',
        desc: 'Rewards-as-a-service: gift cards and prepaid rewards via Tango RaaS.',
        note: 'Customers never see this provider — it powers fulfilment behind your brand. Orders draw on your funded Tango account.',
        extraToggle: {
            name: 'sandbox',
            label: 'Sandbox mode (integration environment)',
        },
        fields: [
            { name: 'platform_name', label: 'Platform name', full: true },
            {
                name: 'platform_key',
                label: 'Platform key',
                type: 'password',
                secret: true,
                full: true,
                placeholder: 'Your Tango platform key',
            },
            { name: 'account_identifier', label: 'Account identifier' },
            { name: 'customer_identifier', label: 'Customer identifier' },
        ],
    },
    aws: {
        title: 'Storage (S3)',
        desc: 'Object storage for uploads and exports.',
        note: 'Leave disabled to use local disk storage.',
        fields: [
            { name: 'access_key_id', label: 'Access key ID' },
            {
                name: 'secret_access_key',
                label: 'Secret access key',
                type: 'password',
                secret: true,
            },
            { name: 'region', label: 'Region', placeholder: 'us-east-1' },
            { name: 'bucket', label: 'Bucket', placeholder: 'my-bucket' },
            {
                name: 'url',
                label: 'Public URL (optional)',
                placeholder: 'https://cdn.example.com',
                full: true,
            },
        ],
    },
    ai: {
        title: 'AI Copilot',
        desc: 'The model powering the Copilot. Off uses the built-in, key-free engine.',
        note: 'Leave disabled to use the built-in engine — no API key required. OpenRouter offers free models.',
        fields: [
            { name: 'driver', label: 'Provider', options: [] },
            { name: 'model', label: 'Model', options: [] },
            {
                name: 'key',
                label: 'API key',
                type: 'password',
                secret: true,
                full: true,
                placeholder: 'sk-…',
            },
        ],
    },
};

function IntegrationForm({
    group,
    status,
    aiProviders,
    aiModels,
}: {
    group: Group;
    status: IntegrationStatus;
    aiProviders: Record<string, string>;
    aiModels: Record<string, AiModel[]>;
}) {
    const config = FORMS[group];

    const initial = useMemo(() => {
        const data: Record<string, string | number | boolean> = {
            enabled: status.enabled,
        };

        if (config.extraToggle) {
            data[config.extraToggle.name] = Boolean(
                status.values[config.extraToggle.name] ?? true,
            );
        }

        for (const f of config.fields) {
            if (f.type === 'number') {
                data[f.name] = (status.values[f.name] as number | null) ?? '';
            } else if (!f.secret) {
                data[f.name] = (status.values[f.name] as string | null) ?? '';
            } else {
                data[f.name] = '';
            }
        }

        return data;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [group]);

    const form = useForm(initial);

    // For the AI group the Provider and Model dropdowns are data-driven: the
    // provider list comes from the catalog, and the model list depends on the
    // selected provider (OpenRouter's free tiers are badged).
    const fields = useMemo(() => {
        if (group !== 'ai') {
            return config.fields;
        }

        const driver = String(form.data.driver ?? '');
        const models = aiModels[driver] ?? [];

        return config.fields.map((f) => {
            if (f.name === 'driver') {
                return {
                    ...f,
                    options: Object.entries(aiProviders).map(
                        ([value, label]) => ({ value, label }),
                    ),
                };
            }

            if (f.name === 'model') {
                const options = models.map((m) => ({
                    value: m.value,
                    label: m.free ? `${m.label} (free)` : m.label,
                }));

                // Keep a saved model visible as the active option even if it's
                // not in the curated catalog (e.g. a custom value from .env).
                const saved = String(form.data.model ?? '');

                if (saved && !options.some((o) => o.value === saved)) {
                    options.unshift({
                        value: saved,
                        label: `${saved} (current)`,
                    });
                }

                return { ...f, options };
            }

            return f;
        });
    }, [
        group,
        config.fields,
        form.data.driver,
        form.data.model,
        aiProviders,
        aiModels,
    ]);

    const save = () =>
        form.post(updateIntegration(group).url, { preserveScroll: true });

    const test = () =>
        router.post(
            testIntegration(group).url,
            {},
            {
                preserveScroll: true,
                onError: () => toast.error('Connection test could not run.'),
            },
        );

    return (
        <div className="space-y-4 rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-[15px] font-semibold tracking-[-0.01em]">
                        {config.title}
                    </h3>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                        {config.desc}
                    </p>
                </div>
                <Switch
                    checked={Boolean(form.data.enabled)}
                    onCheckedChange={(v) => form.setData('enabled', v)}
                    aria-label="Enable integration"
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                    <div key={f.name} className={cn(f.full && 'sm:col-span-2')}>
                        <Field
                            label={f.label}
                            error={
                                form.errors[
                                    f.name as keyof typeof form.errors
                                ] as string | undefined
                            }
                            hint={
                                f.secret && status.secrets[f.name]
                                    ? 'A value is saved — leave blank to keep it.'
                                    : undefined
                            }
                        >
                            {f.options ? (
                                <NativeSelect
                                    value={String(form.data[f.name] ?? '')}
                                    onChange={(e) => {
                                        // Switching AI provider resets the model to that
                                        // provider's first catalog entry.
                                        if (
                                            group === 'ai' &&
                                            f.name === 'driver'
                                        ) {
                                            const next =
                                                aiModels[e.target.value]?.[0]
                                                    ?.value ?? '';
                                            form.setData((data) => ({
                                                ...data,
                                                driver: e.target.value,
                                                model: next,
                                            }));

                                            return;
                                        }

                                        form.setData(f.name, e.target.value);
                                    }}
                                >
                                    {f.options.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            ) : (
                                <Input
                                    type={f.type ?? 'text'}
                                    value={String(form.data[f.name] ?? '')}
                                    onChange={(e) =>
                                        form.setData(f.name, e.target.value)
                                    }
                                    placeholder={
                                        f.secret && status.secrets[f.name]
                                            ? '•••••••• saved'
                                            : f.placeholder
                                    }
                                    autoComplete="off"
                                />
                            )}
                        </Field>
                    </div>
                ))}
            </div>

            {config.extraToggle && (
                <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <span className="text-[13px] font-medium">
                        {config.extraToggle.label}
                    </span>
                    <Switch
                        checked={Boolean(form.data[config.extraToggle.name])}
                        onCheckedChange={(v) =>
                            form.setData(config.extraToggle!.name, v)
                        }
                    />
                </label>
            )}

            <p className="text-xs text-muted-foreground">{config.note}</p>

            <div className="flex items-center justify-end gap-2 border-t pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={test}
                    disabled={form.processing}
                >
                    <Icon name="refresh" className="size-4" />
                    Test connection
                </Button>
                <Button type="button" onClick={save} disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Save'}
                </Button>
            </div>
        </div>
    );
}

/**
 * The active provider per category (airtime/data, gift cards, payments). The
 * dropdowns list every provider Tappy can fulfil each category with; switching
 * one re-binds fulfilment instantly. Credentials live in the tabs below.
 */
function ActiveProviders({ providers }: { providers: ProviderCategory[] }) {
    const form = useForm<{
        fallback: Record<string, string>;
        [key: string]: string | Record<string, string>;
    }>(() => {
        const primaries = Object.fromEntries(
            providers.map((c) => [c.key, c.selected]),
        );
        const fallback = Object.fromEntries(
            providers
                .filter((c) => c.supportsFallback)
                .map((c) => [c.key, c.fallback]),
        );

        return { ...primaries, fallback };
    });

    const save = () =>
        form.post(updateProviders().url, { preserveScroll: true });

    const optionLabel = (o: ProviderOption) =>
        o.configured ? o.label : `${o.label} (not configured)`;

    return (
        <div className="space-y-4 rounded-xl border bg-card p-5">
            <div>
                <h3 className="text-[15px] font-semibold tracking-[-0.01em]">
                    Active providers
                </h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                    Choose which connected provider fulfils each category.
                    Customers never see these names.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {providers.map((category) => {
                    const primary = String(form.data[category.key] ?? '');

                    return (
                        <div key={category.key} className="space-y-3">
                            <Field label={category.label}>
                                <NativeSelect
                                    value={primary}
                                    onChange={(e) => {
                                        const next = e.target.value;
                                        form.setData((data) => ({
                                            ...data,
                                            [category.key]: next,
                                            // Drop a fallback that now equals the primary.
                                            fallback: {
                                                ...data.fallback,
                                                [category.key]:
                                                    data.fallback[
                                                        category.key
                                                    ] === next
                                                        ? ''
                                                        : (data.fallback[
                                                              category.key
                                                          ] ?? ''),
                                            },
                                        }));
                                    }}
                                >
                                    {category.options.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {optionLabel(o)}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </Field>

                            {category.supportsFallback && (
                                <Field label="Fallback (optional)">
                                    <NativeSelect
                                        value={String(
                                            form.data.fallback[category.key] ??
                                                '',
                                        )}
                                        onChange={(e) =>
                                            form.setData('fallback', {
                                                ...form.data.fallback,
                                                [category.key]: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">No fallback</option>
                                        {category.options
                                            .filter((o) => o.id !== primary)
                                            .map((o) => (
                                                <option key={o.id} value={o.id}>
                                                    {optionLabel(o)}
                                                </option>
                                            ))}
                                    </NativeSelect>
                                </Field>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="text-xs text-muted-foreground">
                A provider marked “not configured” needs its credentials filled
                in below before it can process live orders. A fallback only
                covers operator detection and gift-card catalogs — live
                orders always use the primary.
            </p>

            <div className="flex items-center justify-end border-t pt-4">
                <Button type="button" onClick={save} disabled={form.processing}>
                    {form.processing ? 'Saving…' : 'Save providers'}
                </Button>
            </div>
        </div>
    );
}

export default function IntegrationSettings({
    integrations,
    providers,
    aiProviders,
    aiModels,
}: Props) {
    const [tab, setTab] = useState<Group>(tabFromHash);

    // Keep the visited tab in the URL hash so it survives reloads and is
    // shareable, without triggering an Inertia navigation.
    const selectTab = (value: Group) => {
        setTab(value);
        const slug = TABS.find((t) => t.value === value)?.slug;

        if (slug && typeof window !== 'undefined') {
            window.history.replaceState(null, '', `#${slug}`);
        }
    };

    return (
        <>
            <Head title="Integration settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Integrations"
                    description="Connect email, payments, top-ups and storage — applied instantly."
                />

                <ActiveProviders providers={providers} />

                <Tabs
                    tabs={TABS}
                    value={tab}
                    onChange={(v) => selectTab(v as Group)}
                />

                <IntegrationForm
                    // Remount per tab so the form state resets to that group's
                    // fields — without this, switching tabs carries the previous
                    // group's data into the next save.
                    key={tab}
                    group={tab}
                    status={integrations[tab]}
                    aiProviders={aiProviders}
                    aiModels={aiModels}
                />
            </div>
        </>
    );
}

IntegrationSettings.layout = {
    breadcrumbs: [{ title: 'Integration settings', href: integrationsRoute() }],
};
