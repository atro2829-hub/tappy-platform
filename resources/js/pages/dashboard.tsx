import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AiCmdBar } from '@/components/copilot';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart } from '@/components/ui/charts';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/data-table';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { Money } from '@/components/ui/money';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelBody, PanelHead } from '@/components/ui/panel';
import { ProductTile } from '@/components/ui/product-tile';
import { Progress } from '@/components/ui/progress';
import { ReceiptModal } from '@/components/ui/receipt-modal';
import { Stat } from '@/components/ui/stat';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs } from '@/components/ui/tabs';
import { useInitials } from '@/hooks/use-initials';
import { useThemeConfig } from '@/hooks/use-theme-config';
import { downloadCsv } from '@/lib/csv';
import { fmt } from '@/lib/format';
import type { Beneficiary, Txn } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

const go = (href: string) => router.visit(href);

type ApiTxn = {
    reference: string;
    type: string;
    typeLabel: string;
    status: string;
    country: string | null;
    operator: string | null;
    recipient: string | null;
    recipientName: string | null;
    amountUsd: number;
    feeUsd: number;
    localAmount: number | null;
    localCurrency: string | null;
    createdAt: string | null;
};

type CountryPerfRow = {
    iso: string;
    name: string;
    volume: number;
    txns: number;
    share: number;
};

type Metrics = {
    successCount: number;
    pendingCount: number;
    totalCount: number;
    successRate: number;
    txnsToday: number;
    todaySales: number;
    volume30d: number;
    commissionMtd: number;
    profitToday: number;
    weekSales: { label: string; value: number }[];
    revenue30d: number[];
    countryPerf: CountryPerfRow[];
    kycPending: number;
    riskFlags: number;
    providerHealth: {
        name: string;
        successRate: number;
        volume: number;
        status: string;
    }[];
};

type ResellerCustomerRow = {
    id: string;
    name: string;
    contact: string;
    tier: string;
    orders: number;
    volume: number;
    commission: number;
};

type OnboardingData = {
    kycRequired: boolean;
    kycApproved: boolean;
    walletFunded: boolean;
    hasTransaction: boolean;
    complete: boolean;
};

type DashboardProps = {
    wallet: { balance: number; currency: string };
    recent: ApiTxn[];
    savedRecipients: Beneficiary[];
    metrics: Metrics;
    userCount: number;
    onboarding?: OnboardingData | null;
    customers?: ResellerCustomerRow[];
    commissionTrend?: { month: string; amount: number; dim: boolean }[];
};

const TYPE_ICON: Record<string, IconName> = {
    airtime: 'phone',
    data: 'signal',
    giftcard: 'gift',
    utility: 'bolt',
};

function adaptTxn(t: ApiTxn): Txn {
    return {
        id: t.reference,
        ref: t.reference,
        name: t.recipientName ?? t.operator ?? t.recipient ?? '—',
        recipient: t.recipient ?? '',
        type: t.typeLabel,
        icon: TYPE_ICON[t.type] ?? 'signal',
        cat: t.type,
        country: t.country ?? '',
        cur: t.localCurrency ?? 'YER',
        amountUSD: t.amountUsd,
        localAmount: t.localAmount ?? t.amountUsd,
        fee: t.feeUsd,
        margin: 0,
        status: t.status,
        date: t.createdAt ? new Date(t.createdAt) : new Date(0),
        operator: t.operator ?? '',
    };
}

interface Alert {
    tone: string;
    icon: IconName;
    title: string;
    desc: string;
    action?: string;
    route?: string;
}

function AlertStrip({ alerts }: { alerts: Alert[] }) {
    if (!alerts.length) {
        return null;
    }

    return (
        <div className="mb-[18px] flex flex-col gap-2.5">
            {alerts.map((a, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{
                        borderLeft: `3px solid hsl(var(--${a.tone}))`,
                        background: `hsl(var(--${a.tone}) / 0.05)`,
                    }}
                >
                    <Icon
                        name={a.icon}
                        className="size-[18px] flex-none"
                        style={{ color: `hsl(var(--${a.tone}))` }}
                    />
                    <div className="min-w-0 flex-1">
                        <span className="text-[13px] font-semibold">
                            {a.title}
                        </span>
                        <span className="ml-2 hidden text-[13px] text-muted-foreground sm:inline">
                            {a.desc}
                        </span>
                    </div>
                    {a.action && a.route && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => go(a.route!)}
                        >
                            {a.action}
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
}

/** Getting-started checklist; self-hides once every step is done. */
function OnboardingChecklist({ data }: { data?: OnboardingData | null }) {
    if (!data || data.complete) {
        return null;
    }

    const steps = [
        ...(data.kycRequired
            ? [
                  {
                      label: 'Verify your identity',
                      desc: 'Upload your documents to lift transaction limits.',
                      done: data.kycApproved,
                      route: '/settings/verification',
                      cta: 'Upload docs',
                  },
              ]
            : []),
        {
            label: 'Add funds to your wallet',
            desc: 'Pre-fund your wallet to start sending.',
            done: data.walletFunded,
            route: '/wallet',
            cta: 'Add funds',
        },
        {
            label: 'Make your first transaction',
            desc: 'Send airtime, data or a gift card.',
            done: data.hasTransaction,
            route: '/topup',
            cta: 'Start',
        },
    ];

    const doneCount = steps.filter((s) => s.done).length;
    const pct = Math.round((doneCount / steps.length) * 100);

    return (
        <Panel className="mb-[18px]">
            <PanelHead title="Finish setting up your account" />
            <PanelBody>
                <div className="mb-3 flex items-center gap-3">
                    <Progress value={pct} className="h-2 flex-1" />
                    <span className="text-[12px] font-medium text-muted-foreground">
                        {doneCount}/{steps.length} done
                    </span>
                </div>
                <div className="flex flex-col gap-2.5">
                    {steps.map((s) => (
                        <div
                            key={s.label}
                            className="flex items-center gap-3 rounded-lg border p-3"
                        >
                            <span
                                className={cn(
                                    'flex size-7 flex-none items-center justify-center rounded-full',
                                    s.done
                                        ? 'bg-success/15 text-success'
                                        : 'bg-muted text-muted-foreground',
                                )}
                            >
                                <Icon
                                    name={s.done ? 'check' : 'arrowright'}
                                    className="size-4"
                                />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div
                                    className={cn(
                                        'text-[13px] font-medium',
                                        s.done &&
                                            'text-muted-foreground line-through',
                                    )}
                                >
                                    {s.label}
                                </div>
                                <div className="text-[12px] text-muted-foreground">
                                    {s.desc}
                                </div>
                            </div>
                            {!s.done && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => go(s.route)}
                                >
                                    {s.cta}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </PanelBody>
        </Panel>
    );
}

function RecentTxns({
    rows,
    onOpen,
    title = 'Recent transactions',
}: {
    rows: Txn[];
    onOpen: (t: Txn) => void;
    title?: string;
}) {
    return (
        <Panel>
            <PanelHead
                title={title}
                action={
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => go('/transactions')}
                    >
                        View all
                        <Icon name="arrowright" className="size-3.5" />
                    </Button>
                }
            />
            <div className="mt-2">
                <Table>
                    <THead>
                        <TR>
                            <TH>Recipient</TH>
                            <TH className="hidden sm:table-cell">Type</TH>
                            <TH className="hidden md:table-cell">Country</TH>
                            <TH>Status</TH>
                            <TH right>Amount</TH>
                        </TR>
                    </THead>
                    <TBody>
                        {rows.map((t) => (
                            <TR key={t.id} clickable onClick={() => onOpen(t)}>
                                <TD>
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-7 flex-none items-center justify-center rounded-md bg-muted text-muted-foreground">
                                            <Icon
                                                name={t.icon}
                                                className="size-3.5"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[12.5px] font-medium">
                                                {t.name}
                                            </div>
                                            <div className="font-mono text-[11px] text-muted-foreground">
                                                {t.recipient}
                                            </div>
                                        </div>
                                    </div>
                                </TD>
                                <TD className="hidden text-[12.5px] sm:table-cell">
                                    {t.type}
                                </TD>
                                <TD className="hidden md:table-cell">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Flag code={t.country} size={16} />
                                        <span className="text-xs text-muted-foreground">
                                            {t.country}
                                        </span>
                                    </span>
                                </TD>
                                <TD>
                                    <StatusBadge status={t.status} />
                                </TD>
                                <TD right>
                                    <Money value={t.amountUSD} />
                                </TD>
                            </TR>
                        ))}
                    </TBody>
                </Table>
            </div>
        </Panel>
    );
}

function CountryPerf({ data }: { data: CountryPerfRow[] }) {
    return (
        <Panel>
            <PanelHead
                title="Country performance"
                desc="Volume by destination · last 30 days"
            />
            <PanelBody className="flex flex-col gap-3.5">
                {data.length === 0 && (
                    <div className="py-6 text-center text-[12.5px] text-muted-foreground">
                        No destinations yet.
                    </div>
                )}
                {data.map((c) => (
                    <div key={c.iso} className="flex items-center gap-3">
                        <Flag code={c.iso} size={20} />
                        <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex justify-between">
                                <span className="text-[12.5px] font-medium">
                                    {c.name}
                                </span>
                                <span className="tnum font-mono text-xs text-muted-foreground">
                                    {fmt(c.volume)}
                                </span>
                            </div>
                            <Progress value={c.share * 2.4} height={6} />
                        </div>
                    </div>
                ))}
            </PanelBody>
        </Panel>
    );
}

function WeekChart({
    data,
    total,
}: {
    data: { label: string; value: number }[];
    total: number;
}) {
    const [tab, setTab] = useState('w');

    return (
        <Panel>
            <PanelHead
                title="Weekly sales"
                desc="Gross transaction value"
                action={
                    <Tabs
                        tabs={[
                            { value: 'w', label: 'Week' },
                            { value: 'm', label: 'Month' },
                        ]}
                        value={tab}
                        onChange={setTab}
                    />
                }
            />
            <PanelBody>
                <div className="mb-[18px] flex items-baseline gap-2.5">
                    <span className="tnum font-mono text-[26px] font-bold">
                        {fmt(total)}
                    </span>
                    <span className="inline-flex items-center gap-[3px] text-[12.5px] font-semibold text-success">
                        <Icon name="trendup" className="size-3.5" />
                        7d
                    </span>
                    <span className="text-xs text-muted-foreground">
                        gross value
                    </span>
                </div>
                <BarChart data={data} height={150} />
            </PanelBody>
        </Panel>
    );
}

function BusinessDashboard({
    name,
    onOpen,
    wallet,
    metrics,
    recentTxns,
    onboarding,
}: {
    name: string;
    onOpen: (t: Txn) => void;
    wallet: DashboardProps['wallet'];
    metrics: Metrics;
    recentTxns: Txn[];
    onboarding?: OnboardingData | null;
}) {
    const { config } = useThemeConfig();
    const dashLayout =
        (config as { dashLayout?: 'default' | 'focus' }).dashLayout ??
        'default';

    const exportRecent = () =>
        downloadCsv(
            'tappy-dashboard-transactions.csv',
            [
                'Reference',
                'Recipient',
                'Type',
                'Country',
                'USD amount',
                'Fee',
                'Status',
                'Date',
            ],
            recentTxns.map((t) => [
                t.id,
                t.name,
                t.type,
                t.country,
                t.amountUSD,
                t.fee,
                t.status,
                t.date.toISOString(),
            ]),
        );

    const kpis = [
        {
            label: 'Wallet balance',
            value: fmt(wallet.balance),
            icon: 'wallet' as IconName,
            accent: 'primary',
            sub: 'Available',
        },
        {
            label: "Today's sales",
            value: fmt(metrics.todaySales),
            icon: 'trendup' as IconName,
            accent: 'info',
            spark: metrics.revenue30d.slice(-12),
            sparkColor: 'hsl(var(--info))',
        },
        {
            label: 'Successful txns',
            value: metrics.successCount.toLocaleString(),
            icon: 'checkcircle' as IconName,
            accent: 'success',
            sub: `${metrics.successRate}% success rate`,
        },
        {
            label: 'Pending',
            value: metrics.pendingCount.toLocaleString(),
            icon: 'clock' as IconName,
            accent: 'warning',
            sub: 'Awaiting settlement',
        },
        {
            label: 'Profit / margin',
            value: fmt(metrics.profitToday),
            icon: 'percent' as IconName,
            accent: 'violet',
            sub: 'Today',
        },
    ];
    const quick = [
        {
            label: 'Send Top-up',
            desc: 'Airtime to any operator',
            icon: 'phone' as IconName,
            route: '/topup',
            accent: 'primary',
        },
        {
            label: 'Buy Gift Card',
            desc: '4,000+ brands',
            icon: 'gift' as IconName,
            route: '/giftcards',
            accent: 'info',
        },
        {
            label: 'Bulk Upload',
            desc: 'CSV mass payout',
            icon: 'layers' as IconName,
            route: '/bulk',
            accent: 'violet',
        },
    ];

    return (
        <Page>
            <PageHeader
                title="Dashboard"
                desc={`Welcome back, ${name.split(' ')[0]} — here's your business at a glance.`}
                actions={
                    <>
                        <Button variant="outline" onClick={exportRecent}>
                            <Icon name="download" className="size-4" />
                            Export
                        </Button>
                        <Button onClick={() => go('/topup')}>
                            <Icon name="send" className="size-4" />
                            Send top-up
                        </Button>
                    </>
                }
            />
            <OnboardingChecklist data={onboarding} />
            <AiCmdBar showRecent />
            <AlertStrip
                alerts={
                    wallet.balance < 50
                        ? [
                              {
                                  tone: 'warning',
                                  icon: 'alert',
                                  title: 'Low wallet balance',
                                  desc: 'Top up your wallet to keep payouts flowing.',
                                  action: 'Add funds',
                                  route: '/wallet',
                              },
                          ]
                        : []
                }
            />
            <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
                {kpis.map((k) => (
                    <Stat key={k.label} {...k} />
                ))}
            </div>
            <div className="mb-[18px]">
                <div className="mb-2.5 text-[12.5px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
                    Quick actions
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {quick.map((a) => (
                        <ProductTile
                            key={a.label}
                            icon={a.icon}
                            label={a.label}
                            desc={a.desc}
                            accent={a.accent}
                            onClick={() => go(a.route)}
                        />
                    ))}
                </div>
            </div>
            {dashLayout === 'focus' ? (
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                    <div className="flex flex-col gap-4">
                        <WeekChart
                            data={metrics.weekSales}
                            total={metrics.weekSales.reduce(
                                (s, d) => s + d.value,
                                0,
                            )}
                        />
                        <RecentTxns
                            rows={recentTxns.slice(0, 6)}
                            onOpen={onOpen}
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <CountryPerf data={metrics.countryPerf} />
                    </div>
                </div>
            ) : (
                <>
                    <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                        <WeekChart
                            data={metrics.weekSales}
                            total={metrics.weekSales.reduce(
                                (s, d) => s + d.value,
                                0,
                            )}
                        />
                        <CountryPerf data={metrics.countryPerf} />
                    </div>
                    <RecentTxns rows={recentTxns.slice(0, 6)} onOpen={onOpen} />
                </>
            )}
        </Page>
    );
}

function CustomerHome({
    name,
    onOpen,
    wallet,
    savedRecipients,
    recentTxns,
    onboarding,
}: {
    name: string;
    onOpen: (t: Txn) => void;
    wallet: DashboardProps['wallet'];
    savedRecipients: Beneficiary[];
    recentTxns: Txn[];
    onboarding?: OnboardingData | null;
}) {
    const getInitials = useInitials();
    const quick = [
        {
            label: 'Send Airtime',
            icon: 'phone' as IconName,
            route: '/topup',
            accent: 'primary',
        },
        {
            label: 'Buy Gift Card',
            icon: 'gift' as IconName,
            route: '/giftcards',
            accent: 'info',
        },
        {
            label: 'Data Bundle',
            icon: 'signal' as IconName,
            route: '/topup',
            accent: 'violet',
        },
    ];

    return (
        <Page>
            <PageHeader
                title={`Hi ${name.split(' ')[0]} 👋`}
                desc="Send airtime, data and gift cards — instantly."
            />
            <OnboardingChecklist data={onboarding} />
            <AiCmdBar showRecent />
            <div className="mb-[18px] grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <div className="relative overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground shadow-sm">
                    <div className="absolute -top-8 -right-8 size-36 rounded-full bg-white/[0.08]" />
                    <div className="flex items-center gap-2 text-[12.5px] font-medium opacity-85">
                        <Icon name="wallet" className="size-[15px]" />
                        Wallet balance
                    </div>
                    <div className="tnum my-3 font-mono text-[32px] font-bold tracking-[-0.02em]">
                        {fmt(wallet.balance)}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="bg-white/20 text-white hover:bg-white/30"
                            onClick={() => go('/wallet')}
                        >
                            <Icon name="plus" className="size-3.5" />
                            Add funds
                        </Button>
                        <Button
                            size="sm"
                            className="bg-white/15 text-white hover:bg-white/25"
                            onClick={() => go('/transactions')}
                        >
                            <Icon name="receipt" className="size-3.5" />
                            History
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {quick.map((a) => (
                        <ProductTile
                            key={a.label}
                            icon={a.icon}
                            label={a.label}
                            desc=""
                            accent={a.accent}
                            onClick={() => go(a.route)}
                        />
                    ))}
                </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <RecentTxns
                    rows={recentTxns.slice(0, 5)}
                    onOpen={onOpen}
                    title="Recent orders"
                />
                <Panel>
                    <PanelHead
                        title="Saved recipients"
                        action={
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => go('/recipients')}
                            >
                                <Icon name="plus" className="size-4" />
                            </Button>
                        }
                    />
                    <PanelBody className="flex flex-col gap-1 pt-2">
                        {savedRecipients.map((b) => (
                            <button
                                key={b.id}
                                type="button"
                                onClick={() => go('/topup')}
                                className="flex items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent"
                            >
                                <Avatar className="size-[34px]">
                                    <AvatarFallback className="bg-muted text-[11px] font-semibold">
                                        {getInitials(b.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[12.5px] font-semibold">
                                        {b.name}
                                    </div>
                                    <div className="font-mono text-[11px] text-muted-foreground">
                                        {b.recipient}
                                    </div>
                                </div>
                                <Flag code={b.country} size={18} />
                            </button>
                        ))}
                    </PanelBody>
                </Panel>
            </div>
        </Page>
    );
}

function AdminOverview({
    onOpen,
    metrics,
    recentTxns,
    userCount,
}: {
    onOpen: (t: Txn) => void;
    metrics: Metrics;
    recentTxns: Txn[];
    userCount: number;
}) {
    const kpis = [
        {
            label: 'Platform GMV (30d)',
            value: fmt(metrics.volume30d),
            icon: 'dollar' as IconName,
            accent: 'primary',
            spark: metrics.revenue30d,
            sparkColor: 'hsl(var(--primary))',
        },
        {
            label: 'Active users',
            value: userCount.toLocaleString(),
            icon: 'building' as IconName,
            accent: 'info',
        },
        {
            label: 'Txns today',
            value: metrics.txnsToday.toLocaleString(),
            icon: 'receipt' as IconName,
            accent: 'violet',
        },
        {
            label: 'Failure rate',
            value: `${(100 - metrics.successRate).toFixed(1)}%`,
            icon: 'alert' as IconName,
            accent: 'warning',
        },
        {
            label: 'Platform commission',
            value: fmt(metrics.commissionMtd),
            icon: 'percent' as IconName,
            accent: 'success',
            sub: 'This month',
        },
    ];
    const providers = metrics.providerHealth;

    return (
        <Page>
            <PageHeader
                title="Platform overview"
                desc="Tappy operations across all businesses, resellers and customers."
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast.info(
                                    'Operator catalog is fetched live from the provider — nothing to sync.',
                                )
                            }
                        >
                            <Icon name="refresh" className="size-4" />
                            Sync catalog
                        </Button>
                        <Button onClick={() => go('/reports')}>
                            <Icon name="chart" className="size-4" />
                            Reports
                        </Button>
                    </>
                }
            />
            <AiCmdBar />
            <AlertStrip
                alerts={[
                    ...(metrics.kycPending > 0
                        ? [
                              {
                                  tone: 'violet',
                                  icon: 'shieldcheck' as IconName,
                                  title: `${metrics.kycPending} KYC review${metrics.kycPending === 1 ? '' : 's'} pending`,
                                  desc: 'Businesses awaiting verification.',
                                  action: 'Review',
                                  route: '/admin/kyc',
                              },
                          ]
                        : []),
                    ...(metrics.riskFlags > 0
                        ? [
                              {
                                  tone: 'destructive',
                                  icon: 'flag' as IconName,
                                  title: `${metrics.riskFlags} risk flag${metrics.riskFlags === 1 ? '' : 's'} raised`,
                                  desc: 'Large, failed or refunded transactions to review.',
                                  action: 'Investigate',
                                  route: '/admin/risk',
                              },
                          ]
                        : []),
                ]}
            />
            <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
                {kpis.map((k) => (
                    <Stat key={k.label} {...k} />
                ))}
            </div>
            <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <Panel>
                    <PanelHead
                        title="Provider health"
                        desc="Success rate & volume by product"
                        action={
                            providers.every((p) => p.status === 'success') ? (
                                <Badge variant="success" dot>
                                    All systems operational
                                </Badge>
                            ) : (
                                <Badge variant="warning" dot>
                                    Degraded
                                </Badge>
                            )
                        }
                    />
                    <PanelBody className="flex flex-col pt-1.5">
                        {providers.map((p, i) => (
                            <div
                                key={p.name}
                                className="flex items-center gap-3 py-[11px]"
                                style={{
                                    borderBottom:
                                        i < providers.length - 1
                                            ? '1px solid hsl(var(--border))'
                                            : undefined,
                                }}
                            >
                                <span
                                    className="size-2 flex-none rounded-full"
                                    style={{
                                        background: `hsl(var(--${p.status}))`,
                                    }}
                                />
                                <span className="flex-1 text-[13px] font-medium">
                                    {p.name}
                                </span>
                                <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                                    {fmt(p.volume)}
                                </span>
                                <span className="tnum w-16 text-right font-mono text-xs">
                                    {p.successRate}%
                                </span>
                            </div>
                        ))}
                    </PanelBody>
                </Panel>
                <CountryPerf data={metrics.countryPerf} />
            </div>
            <RecentTxns
                rows={recentTxns.slice(0, 7)}
                onOpen={onOpen}
                title="Live transaction monitor"
            />
        </Page>
    );
}

function ResellerHome({
    name,
    wallet,
    metrics,
    customers,
    commissionTrend,
    onboarding,
}: {
    name: string;
    wallet: DashboardProps['wallet'];
    metrics: Metrics;
    customers: ResellerCustomerRow[];
    commissionTrend: { month: string; amount: number; dim: boolean }[];
    onboarding?: OnboardingData | null;
}) {
    const getInitials = useInitials();
    const topCustomers = [...customers]
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5);
    const customerCount = customers.length;
    const kpis = [
        {
            label: 'Wallet balance',
            value: fmt(wallet.balance),
            icon: 'wallet' as IconName,
            accent: 'primary',
            sub: 'Available to sell',
        },
        {
            label: 'Commission (MTD)',
            value: fmt(metrics.commissionMtd),
            icon: 'percent' as IconName,
            accent: 'success',
        },
        {
            label: 'Active customers',
            value: customerCount.toLocaleString(),
            icon: 'users' as IconName,
            accent: 'info',
            sub: 'Your network',
        },
        {
            label: 'Volume (30d)',
            value: fmt(metrics.volume30d),
            icon: 'trendup' as IconName,
            accent: 'violet',
        },
        {
            label: 'Pending payout',
            value: fmt(metrics.commissionMtd),
            icon: 'clock' as IconName,
            accent: 'warning',
            sub: 'This cycle',
        },
    ];
    const quick = [
        {
            label: 'Top up customer',
            desc: 'Sell airtime/data',
            icon: 'phone' as IconName,
            route: '/topup',
            accent: 'primary',
        },
        {
            label: 'Bulk for agents',
            desc: 'CSV distribution',
            icon: 'layers' as IconName,
            route: '/bulk',
            accent: 'violet',
        },
        {
            label: 'Add a customer',
            desc: 'Grow your network',
            icon: 'users' as IconName,
            route: '/reseller/customers',
            accent: 'info',
        },
        {
            label: 'View earnings',
            desc: 'Commission & payouts',
            icon: 'percent' as IconName,
            route: '/reseller/earnings',
            accent: 'success',
        },
    ];

    return (
        <Page>
            <PageHeader
                title="Reseller dashboard"
                desc={`Welcome back, ${name.split(' ')[0]} — here's how your agent network is performing.`}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => go('/reseller/customers')}
                        >
                            <Icon name="users" className="size-4" />
                            Customers
                        </Button>
                        <Button onClick={() => go('/topup')}>
                            <Icon name="send" className="size-4" />
                            Sell top-up
                        </Button>
                    </>
                }
            />
            <OnboardingChecklist data={onboarding} />
            <AiCmdBar showRecent />
            <div
                className="mb-[18px] flex items-center gap-3 rounded-xl border px-4 py-3"
                style={{
                    borderLeft: '3px solid hsl(var(--success))',
                    background: 'hsl(var(--success) / 0.05)',
                }}
            >
                <Icon
                    name="percent"
                    className="size-[18px] flex-none"
                    style={{ color: 'hsl(var(--success))' }}
                />
                <div className="min-w-0 flex-1">
                    <span className="text-[13px] font-semibold">
                        You earned {fmt(metrics.commissionMtd)} in commission
                        this month
                    </span>
                    <span className="ml-2 hidden text-[13px] text-muted-foreground sm:inline">
                        Paid to your wallet at month end.
                    </span>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => go('/reseller/earnings')}
                >
                    View earnings
                </Button>
            </div>
            <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3.5">
                {kpis.map((k) => (
                    <Stat key={k.label} {...k} />
                ))}
            </div>
            <div className="mb-[18px]">
                <div className="mb-2.5 text-[12.5px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
                    Quick actions
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {quick.map((a) => (
                        <ProductTile
                            key={a.label}
                            icon={a.icon}
                            label={a.label}
                            desc={a.desc}
                            accent={a.accent}
                            onClick={() => go(a.route)}
                        />
                    ))}
                </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <Panel>
                    <PanelHead
                        title="Top customers"
                        desc="By volume · last 30 days"
                        action={
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => go('/reseller/customers')}
                            >
                                All customers
                                <Icon name="arrowright" className="size-3.5" />
                            </Button>
                        }
                    />
                    <div className="mt-2">
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Customer</TH>
                                    <TH className="hidden sm:table-cell">
                                        Tier
                                    </TH>
                                    <TH className="hidden md:table-cell">
                                        Orders
                                    </TH>
                                    <TH right>Volume</TH>
                                    <TH right>You earn</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {topCustomers.map((c) => (
                                    <TR
                                        key={c.id}
                                        clickable
                                        onClick={() =>
                                            go('/reseller/customers')
                                        }
                                    >
                                        <TD>
                                            <div className="flex items-center gap-2.5">
                                                <Avatar className="size-7">
                                                    <AvatarFallback className="bg-muted text-[10px] font-semibold">
                                                        {getInitials(c.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="text-[12.5px] font-semibold">
                                                        {c.name}
                                                    </div>
                                                    <div className="font-mono text-[11px] text-muted-foreground">
                                                        {c.contact}
                                                    </div>
                                                </div>
                                            </div>
                                        </TD>
                                        <TD className="hidden sm:table-cell">
                                            <Badge
                                                variant={
                                                    c.tier === 'Agent'
                                                        ? 'violet'
                                                        : 'muted'
                                                }
                                            >
                                                {c.tier}
                                            </Badge>
                                        </TD>
                                        <TD className="tnum hidden text-[12.5px] md:table-cell">
                                            {c.orders}
                                        </TD>
                                        <TD right>
                                            <Money value={c.volume} />
                                        </TD>
                                        <TD right>
                                            <Money
                                                value={c.commission}
                                                className="text-success"
                                            />
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                </Panel>
                <Panel>
                    <PanelHead
                        title="Commission trend"
                        desc="Monthly earnings"
                    />
                    <PanelBody>
                        <div className="mb-4 flex items-baseline gap-2.5">
                            <span className="tnum font-mono text-[26px] font-bold">
                                {fmt(
                                    commissionTrend.reduce(
                                        (s, e) => s + e.amount,
                                        0,
                                    ),
                                )}
                            </span>
                            <span className="inline-flex items-center gap-[3px] text-[12.5px] font-semibold text-success">
                                <Icon name="trendup" className="size-3.5" />6 mo
                            </span>
                        </div>
                        <BarChart
                            data={commissionTrend.map((e) => ({
                                label: e.month,
                                value: e.amount,
                                dim: e.dim,
                            }))}
                            height={150}
                            color="hsl(var(--success))"
                        />
                    </PanelBody>
                </Panel>
            </div>
        </Page>
    );
}

export default function Dashboard({
    wallet,
    recent,
    savedRecipients,
    metrics,
    userCount,
    onboarding,
    customers,
    commissionTrend,
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const { role, name } = auth.user;
    const [receipt, setReceipt] = useState<Txn | null>(null);
    const recentTxns = recent.map(adaptTxn);

    return (
        <>
            <Head title="Dashboard" />
            {role === 'customer' ? (
                <CustomerHome
                    name={name}
                    onOpen={setReceipt}
                    wallet={wallet}
                    savedRecipients={savedRecipients}
                    recentTxns={recentTxns}
                    onboarding={onboarding}
                />
            ) : role === 'admin' ? (
                <AdminOverview
                    onOpen={setReceipt}
                    metrics={metrics}
                    recentTxns={recentTxns}
                    userCount={userCount}
                />
            ) : role === 'reseller' ? (
                <ResellerHome
                    name={name}
                    wallet={wallet}
                    metrics={metrics}
                    customers={customers ?? []}
                    commissionTrend={commissionTrend ?? []}
                    onboarding={onboarding}
                />
            ) : (
                <BusinessDashboard
                    name={name}
                    onOpen={setReceipt}
                    wallet={wallet}
                    metrics={metrics}
                    recentTxns={recentTxns}
                    onboarding={onboarding}
                />
            )}
            <ReceiptModal
                txn={receipt}
                open={!!receipt}
                onClose={() => setReceipt(null)}
            />
        </>
    );
}
