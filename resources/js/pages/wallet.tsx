import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
    autoReload as autoReloadAction,
    checkout,
    fund,
    index as indexWallet,
} from '@/actions/App/Http/Controllers/WalletController';
import { Button } from '@/components/ui/button';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/data-table';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Money } from '@/components/ui/money';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelHead } from '@/components/ui/panel';
import { Spinner } from '@/components/ui/spinner';
import { Stat } from '@/components/ui/stat';
import { Switch } from '@/components/ui/switch';
import { useSandbox } from '@/hooks/use-sandbox';
import { downloadCsv } from '@/lib/csv';
import { fmt } from '@/lib/format';
import type { SharedData } from '@/types/ui';

type PaymentMethod = 'card' | 'bank' | 'crypto';

type WalletData = {
    id: number;
    currency: string;
    balance: number;
    balanceMinor: number;
    status: string;
};

type LedgerEntryData = {
    id: number;
    direction: 'credit' | 'debit';
    reason: string;
    reasonLabel: string;
    amount: number;
    signedAmount: number;
    balanceAfter: number;
    description: string | null;
    createdAt: string | null;
};

type AutoReloadData = {
    enabled: boolean;
    threshold: number | null;
    amount: number | null;
};

type LedgerPagination = {
    total: number;
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
};

type WalletPageProps = {
    wallet: WalletData;
    ledger: LedgerEntryData[];
    ledgerFilter: string;
    ledgerPagination: LedgerPagination;
    paymentDriver: string;
    autoReload: AutoReloadData;
    stats: { refundedMtd: number; spentMonth: number };
};

const METHODS: {
    id: PaymentMethod;
    label: string;
    icon: IconName;
    sub: string;
}[] = [
    {
        id: 'card',
        label: 'Card',
        icon: 'card',
        sub: 'Visa, Mastercard, Amex',
    },
];

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const LEDGER_ICON: Record<string, IconName> = {
    funding: 'wallet',
    purchase: 'send',
    refund: 'refresh',
    fee: 'percent',
    adjustment: 'refresh',
};

function ledgerColor(k: string): string {
    if (k === 'credit') {
        return 'success';
    }

    if (k === 'refund') {
        return 'info';
    }

    if (k === 'hold') {
        return 'violet';
    }

    return 'foreground';
}

export default function WalletScreen({
    wallet,
    ledger,
    ledgerFilter,
    ledgerPagination,
    paymentDriver,
    autoReload,
    stats,
}: WalletPageProps) {
    const { auth } = usePage<SharedData>().props;
    const role = auth.user.role;
    const isAdmin = role === 'admin';
    const { sandbox } = useSandbox();

    const [addOpen, setAddOpen] = useState(false);
    const [amount, setAmount] = useState(500);
    const [method, setMethod] = useState<PaymentMethod>('card');
    const [adding, setAdding] = useState(false);

    const [arOpen, setArOpen] = useState(false);
    const [arEnabled, setArEnabled] = useState(autoReload.enabled);
    const [arThreshold, setArThreshold] = useState(
        String(autoReload.threshold ?? 100),
    );
    const [arAmount, setArAmount] = useState(String(autoReload.amount ?? 500));
    const [arSaving, setArSaving] = useState(false);

    const saveAutoReload = () =>
        router.patch(
            autoReloadAction.url(),
            {
                enabled: arEnabled,
                threshold: arEnabled ? Number(arThreshold) : null,
                amount: arEnabled ? Number(arAmount) : null,
            },
            {
                preserveScroll: true,
                onStart: () => setArSaving(true),
                onFinish: () => setArSaving(false),
                onSuccess: () => setArOpen(false),
                onError: () => toast.error('Could not save auto-reload'),
            },
        );

    const bal = wallet.balance;

    // Ledger filtering + pagination are server-side; `ledger` is the current page.
    const reasonFilter = ledgerFilter;

    const navigateLedger = (params: { reason?: string; ledgerPage?: number }) =>
        router.get(
            indexWallet.url(),
            { reason: reasonFilter, ...params },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    // Adapt the live ledger into the row shape the table renders.
    const rows = ledger.map((entry) => ({
        id: entry.id,
        k: entry.reason === 'refund' ? 'refund' : entry.direction,
        icon: LEDGER_ICON[entry.reason] ?? 'wallet',
        label: entry.description ?? entry.reasonLabel,
        ref: 'LE-' + String(entry.id).padStart(6, '0'),
        date: entry.createdAt ? new Date(entry.createdAt) : new Date(0),
        amount: entry.signedAmount,
        balance: entry.balanceAfter,
    }));

    const doAdd = () => {
        if (!amount || amount <= 0) {
            toast.error('Enter an amount', {
                description: 'Please enter a positive amount to add.',
            });

            return;
        }

        // Stripe: redirect to hosted Checkout (Inertia handles the external
        // redirect); the wallet is credited on return / via webhook.
        if (paymentDriver === 'stripe') {
            router.post(
                checkout.url(),
                { amount },
                {
                    onStart: () => setAdding(true),
                    onFinish: () => setAdding(false),
                    onError: () =>
                        toast.error('Could not start checkout', {
                            description: 'Please try again in a moment.',
                        }),
                },
            );

            return;
        }

        router.post(
            fund.url(),
            { amount },
            {
                preserveScroll: true,
                onStart: () => setAdding(true),
                onFinish: () => setAdding(false),
                onSuccess: () => {
                    setAddOpen(false);
                    toast.success('Funds added', {
                        description: `${fmt(amount)} credited to your wallet.`,
                    });
                },
                onError: () =>
                    toast.error('Could not add funds', {
                        description: 'Please check the amount and try again.',
                    }),
            },
        );
    };

    const exportStatement = () =>
        downloadCsv(
            'tappy-wallet-statement.csv',
            ['Date', 'Reference', 'Type', 'Description', 'Amount', 'Balance'],
            ledger.map((e) => [
                e.createdAt ?? '',
                'LE-' + String(e.id).padStart(6, '0'),
                e.reasonLabel,
                e.description ?? '',
                e.signedAmount,
                e.balanceAfter,
            ]),
        );

    return (
        <>
            <Head title="Wallet" />
            <Page>
                <PageHeader
                    title={isAdmin ? 'Wallet ledger' : 'Wallet'}
                    desc={
                        isAdmin
                            ? 'Immutable ledger of every credit, debit, hold and refund across the platform.'
                            : 'Pre-fund your wallet to send top-ups and gift cards instantly.'
                    }
                    actions={
                        isAdmin ? undefined : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={exportStatement}
                                >
                                    <Icon name="download" className="size-4" />
                                    Statement
                                </Button>
                                <Button onClick={() => setAddOpen(true)}>
                                    <Icon name="plus" className="size-4" />
                                    Add funds
                                </Button>
                            </>
                        )
                    }
                />

                {/* KPI grid */}
                <div className="mb-[18px] grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Big balance card */}
                    <div className="relative overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground shadow-sm">
                        <div className="absolute -top-6 -right-6 size-[120px] rounded-full bg-white/[0.08]" />
                        <div className="flex items-center gap-2 text-[12.5px] font-medium opacity-85">
                            <Icon name="wallet" className="size-[15px]" />
                            Available balance
                        </div>
                        <div className="tnum my-2.5 font-mono text-[30px] font-bold">
                            {fmt(bal)}
                        </div>
                        <div className="text-[11.5px] opacity-80">
                            {sandbox && role !== 'customer'
                                ? 'Sandbox funds'
                                : 'USD · settled'}
                        </div>
                    </div>

                    <Stat
                        label="Refunded (30d)"
                        value={fmt(stats.refundedMtd)}
                        icon="refresh"
                        accent="info"
                    />
                    <Stat
                        label="Spent this month"
                        value={fmt(stats.spentMonth)}
                        icon="trendup"
                        accent="success"
                    />
                </div>

                {/* Low-balance warning */}
                {!isAdmin && bal < 30000 && (
                    <div
                        className="mb-[18px] flex items-center gap-3 rounded-xl border px-4 py-3"
                        style={{
                            borderLeft: '3px solid hsl(var(--warning))',
                            background: 'hsl(var(--warning) / 0.05)',
                        }}
                    >
                        <Icon
                            name="alert"
                            className="size-[18px] flex-none"
                            style={{ color: 'hsl(var(--warning))' }}
                        />
                        <div className="flex-1">
                            <span className="text-[13px] font-semibold">
                                Balance below threshold
                            </span>
                            <span className="ml-2 hidden text-[13px] text-muted-foreground sm:inline">
                                Set up auto-reload to never miss a payout.
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setArOpen(true)}
                        >
                            Auto-reload
                        </Button>
                    </div>
                )}

                {/* Ledger table */}
                <Panel>
                    <PanelHead
                        title="Wallet ledger"
                        desc="Immutable record — entries are never edited, only appended."
                        action={
                            <div className="flex gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <Icon
                                                name="filter"
                                                className="size-4"
                                            />
                                            Filter
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>
                                            Entry type
                                        </DropdownMenuLabel>
                                        <DropdownMenuRadioGroup
                                            value={reasonFilter}
                                            onValueChange={(v) =>
                                                navigateLedger({
                                                    reason: v,
                                                    ledgerPage: 1,
                                                })
                                            }
                                        >
                                            <DropdownMenuRadioItem value="all">
                                                All entries
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="funding">
                                                Funding
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="purchase">
                                                Purchase
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="refund">
                                                Refund
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="fee">
                                                Fee
                                            </DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="adjustment">
                                                Adjustment
                                            </DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    title="Export CSV"
                                    onClick={exportStatement}
                                >
                                    <Icon name="download" className="size-4" />
                                </Button>
                            </div>
                        }
                    />
                    <div className="mt-2">
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Entry</TH>
                                    <TH className="hidden sm:table-cell">
                                        Reference
                                    </TH>
                                    <TH className="hidden md:table-cell">
                                        Date
                                    </TH>
                                    <TH right>Amount</TH>
                                    <TH right>Balance</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {rows.length === 0 && (
                                    <TR>
                                        <TD colSpan={5}>
                                            <EmptyState
                                                icon="wallet"
                                                title="No ledger entries"
                                                desc="Funding, purchases and refunds will appear here."
                                            />
                                        </TD>
                                    </TR>
                                )}
                                {rows.map((l) => {
                                    const tone = ledgerColor(l.k);
                                    const isFg = tone === 'foreground';

                                    return (
                                        <TR key={l.id}>
                                            <TD>
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className="flex size-7 flex-none items-center justify-center rounded-[7px]"
                                                        style={{
                                                            background: isFg
                                                                ? 'hsl(var(--muted))'
                                                                : `hsl(var(--${tone}) / 0.12)`,
                                                            color: isFg
                                                                ? 'hsl(var(--muted-foreground))'
                                                                : `hsl(var(--${tone}))`,
                                                        }}
                                                    >
                                                        <Icon
                                                            name={l.icon}
                                                            className="size-3.5"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="text-[12.5px] font-medium">
                                                            {l.label}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground capitalize">
                                                            {l.k}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TD>
                                            <TD className="hidden sm:table-cell">
                                                <span className="font-mono text-[12px] text-muted-foreground">
                                                    {l.ref}
                                                </span>
                                            </TD>
                                            <TD className="hidden md:table-cell">
                                                <span className="text-[12px] text-muted-foreground">
                                                    {l.date.toLocaleDateString(
                                                        'en-US',
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        },
                                                    )}
                                                </span>
                                            </TD>
                                            <TD right>
                                                <Money
                                                    value={l.amount}
                                                    weight={600}
                                                    sign
                                                    color={
                                                        l.amount > 0
                                                            ? 'hsl(var(--success))'
                                                            : undefined
                                                    }
                                                />
                                            </TD>
                                            <TD right>
                                                <Money
                                                    value={l.balance}
                                                    weight={500}
                                                />
                                            </TD>
                                        </TR>
                                    );
                                })}
                            </TBody>
                        </Table>
                    </div>
                    {ledgerPagination.total > 0 && (
                        <div className="flex items-center justify-between border-t px-5 py-3">
                            <span className="text-[12.5px] text-muted-foreground">
                                Showing {ledgerPagination.from ?? 0}–
                                {ledgerPagination.to ?? 0} of{' '}
                                {ledgerPagination.total}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={ledgerPagination.currentPage <= 1}
                                    onClick={() =>
                                        navigateLedger({
                                            ledgerPage:
                                                ledgerPagination.currentPage -
                                                1,
                                        })
                                    }
                                    aria-label="Previous page"
                                >
                                    <Icon name="chevleft" className="size-4" />
                                </Button>
                                <span className="px-1 text-[12px] text-muted-foreground">
                                    Page {ledgerPagination.currentPage} /{' '}
                                    {ledgerPagination.lastPage}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                        ledgerPagination.currentPage >=
                                        ledgerPagination.lastPage
                                    }
                                    onClick={() =>
                                        navigateLedger({
                                            ledgerPage:
                                                ledgerPagination.currentPage +
                                                1,
                                        })
                                    }
                                >
                                    Next
                                    <Icon name="chevright" className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Panel>

                {/* Add funds modal */}
                <Dialog
                    open={addOpen}
                    onOpenChange={(o) => !o && setAddOpen(false)}
                >
                    <DialogContent className="max-w-[440px]">
                        <DialogHeader>
                            <DialogTitle>
                                <Icon
                                    name="wallet"
                                    className="mr-2 inline size-4"
                                />
                                Add funds to wallet
                            </DialogTitle>
                        </DialogHeader>

                        <p className="text-[13px] text-muted-foreground">
                            Choose an amount and payment method.
                        </p>

                        <Field label="Amount (USD)">
                            <div className="relative">
                                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono font-semibold text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    type="number"
                                    className="pl-7 text-lg font-semibold"
                                    style={{
                                        height: 46,
                                        fontSize: 18,
                                        fontWeight: 600,
                                    }}
                                    value={amount}
                                    onChange={(e) => setAmount(+e.target.value)}
                                />
                            </div>
                            <div className="mt-2.5 flex gap-2">
                                {QUICK_AMOUNTS.map((a) => (
                                    <Button
                                        key={a}
                                        size="sm"
                                        variant={
                                            amount === a ? 'default' : 'outline'
                                        }
                                        onClick={() => setAmount(a)}
                                    >
                                        {fmt(a)}
                                    </Button>
                                ))}
                            </div>
                        </Field>

                        <div>
                            <div className="mb-1.5 text-[12.5px] font-medium">
                                Payment method
                            </div>
                            {METHODS.map((m) => {
                                const s = method === m.id;

                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setMethod(m.id)}
                                        className="mb-2 flex w-full items-center gap-3 rounded-[var(--radius)] border px-3 py-3 text-left transition-[box-shadow]"
                                        style={{
                                            borderColor: s
                                                ? 'hsl(var(--primary))'
                                                : 'hsl(var(--border))',
                                            background: s
                                                ? 'hsl(var(--primary) / 0.06)'
                                                : 'transparent',
                                            boxShadow: s
                                                ? '0 0 0 3px hsl(var(--ring) / 0.18)'
                                                : undefined,
                                        }}
                                    >
                                        <Icon
                                            name={m.icon}
                                            className="size-[18px]"
                                            style={{
                                                color: s
                                                    ? 'hsl(var(--primary))'
                                                    : 'hsl(var(--muted-foreground))',
                                            }}
                                        />
                                        <div className="flex-1">
                                            <div className="text-[13px] font-semibold">
                                                {m.label}
                                            </div>
                                            <div className="text-[11.5px] text-muted-foreground">
                                                {m.sub}
                                            </div>
                                        </div>
                                        <span
                                            className="flex size-4 items-center justify-center rounded-full border-2"
                                            style={{
                                                borderColor: s
                                                    ? 'hsl(var(--primary))'
                                                    : 'hsl(var(--border))',
                                            }}
                                        >
                                            {s && (
                                                <span
                                                    className="size-[7px] rounded-full"
                                                    style={{
                                                        background:
                                                            'hsl(var(--primary))',
                                                    }}
                                                />
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setAddOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={doAdd}
                                disabled={adding || !amount || amount <= 0}
                            >
                                {adding ? (
                                    <>
                                        <Spinner />
                                        Processing…
                                    </>
                                ) : (
                                    <>
                                        <Icon name="lock" className="size-4" />
                                        Add {fmt(amount)}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Auto-reload settings modal */}
                <Dialog open={arOpen} onOpenChange={setArOpen}>
                    <DialogContent className="max-w-[420px]">
                        <DialogHeader>
                            <DialogTitle>
                                <Icon
                                    name="refresh"
                                    className="mr-2 inline size-4"
                                />
                                Auto-reload
                            </DialogTitle>
                        </DialogHeader>

                        <p className="text-[13px] text-muted-foreground">
                            When your balance drops below the threshold, Tappy
                            tops it up automatically using your{' '}
                            {paymentDriver === 'stripe' ? 'card' : 'wallet'}{' '}
                            payment method.
                        </p>

                        <label className="flex items-center justify-between gap-3 text-[13px] font-medium">
                            <span>Enable auto-reload</span>
                            <Switch
                                checked={arEnabled}
                                onCheckedChange={setArEnabled}
                            />
                        </label>

                        {arEnabled && (
                            <div className="flex flex-col gap-3.5">
                                <Field label="When balance falls below (USD)">
                                    <Input
                                        type="number"
                                        value={arThreshold}
                                        onChange={(e) =>
                                            setArThreshold(e.target.value)
                                        }
                                    />
                                </Field>
                                <Field label="Top up by (USD)">
                                    <Input
                                        type="number"
                                        value={arAmount}
                                        onChange={(e) =>
                                            setArAmount(e.target.value)
                                        }
                                    />
                                </Field>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setArOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={saveAutoReload}
                                disabled={arSaving}
                            >
                                <Icon name="check" className="size-4" />
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Page>
        </>
    );
}
