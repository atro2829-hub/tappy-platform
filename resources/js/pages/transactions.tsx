import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { index as transactionsIndex } from '@/actions/App/Http/Controllers/TransactionController';
import { Button } from '@/components/ui/button';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { Money } from '@/components/ui/money';
import { NativeSelect } from '@/components/ui/native-select';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel } from '@/components/ui/panel';
import { ReceiptModal } from '@/components/ui/receipt-modal';
import { SearchInput } from '@/components/ui/search-input';
import { StatusBadge } from '@/components/ui/status-badge';
import { UnderlineTabs } from '@/components/ui/tabs';
import { downloadCsv } from '@/lib/csv';
import type { Txn } from '@/lib/mock-data';
import type { SharedData } from '@/types/ui';

type Filters = { search: string; status: string; type: string; range: string };

type Pagination = {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
};

type ApiTxn = {
    id: string;
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
    totalUsd: number;
    localAmount: number | null;
    localCurrency: string | null;
    providerStatus: string | null;
    createdAt: string | null;
};

type TransactionsPageProps = {
    transactions: ApiTxn[];
    filters: Filters;
    pagination: Pagination;
};

const TYPE_ICON: Record<string, IconName> = {
    airtime: 'phone',
    data: 'signal',
    giftcard: 'gift',
    utility: 'zap',
};

// Adapt a live transaction into the Txn shape the table + receipt expect.
function adapt(t: ApiTxn): Txn {
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

export default function TransactionsScreen({
    transactions,
    filters,
    pagination,
}: TransactionsPageProps) {
    const { auth } = usePage<SharedData>().props;
    const role = auth.user.role;

    const txns = transactions.map(adapt);
    const pageRows = txns;

    const STATUS_TABS = [
        { value: 'all', label: 'All' },
        { value: 'success', label: 'Success' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
        { value: 'review', label: 'Review' },
    ];

    const tab = filters.status;
    const type = filters.type;
    const range = filters.range;
    const [q, setQ] = useState(filters.search);
    const [sel, setSel] = useState<Txn | null>(null);

    // Server-side filtering + pagination: every change re-requests the list,
    // preserving scroll and replacing history so back-button isn't spammed.
    const navigate = (params: Partial<Filters> & { page?: number }) => {
        router.get(
            transactionsIndex.url(),
            { search: q, status: tab, type, range, ...params },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    // Debounce the search box so we don't fire a request on every keystroke.
    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const id = setTimeout(() => {
            if (q !== filters.search) {
                navigate({ search: q, page: 1 });
            }
        }, 350);

        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const exportCsv = () =>
        downloadCsv(
            'tappy-transactions.csv',
            [
                'Reference',
                'Recipient',
                'Number',
                'Type',
                'Country',
                'Currency',
                'Local amount',
                'USD amount',
                'Fee',
                'Status',
                'Date',
            ],
            txns.map((t) => [
                t.id,
                t.name,
                t.recipient,
                t.type,
                t.country,
                t.cur,
                t.localAmount,
                t.amountUSD,
                t.fee,
                t.status,
                t.date.toISOString(),
            ]),
        );

    return (
        <>
            <Head title="Transactions" />
            <Page>
                <PageHeader
                    title={role === 'customer' ? 'Orders' : 'Transactions'}
                    desc={
                        role === 'admin'
                            ? 'Monitor every transaction across the platform in real time.'
                            : 'Every top-up, gift card and bill payment with full audit trail.'
                    }
                    actions={
                        <>
                            <NativeSelect
                                value={range}
                                onChange={(e) =>
                                    navigate({
                                        range: e.target.value,
                                        page: 1,
                                    })
                                }
                                aria-label="Filter by date range"
                                className="w-[150px]"
                            >
                                <option value="all">All time</option>
                                <option value="24h">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                            </NativeSelect>
                            <Button variant="outline" onClick={exportCsv}>
                                <Icon name="download" className="size-4" />
                                Export CSV
                            </Button>
                        </>
                    }
                />

                <Panel>
                    {/* Underline tabs */}
                    <div className="overflow-x-auto px-5 pt-5">
                        <UnderlineTabs
                            tabs={STATUS_TABS}
                            value={tab}
                            onChange={(v) => navigate({ status: v, page: 1 })}
                        />
                    </div>

                    {/* Filters row */}
                    <div className="flex flex-wrap gap-2.5 px-5 py-3.5">
                        <div className="min-w-[200px] flex-1">
                            <SearchInput
                                placeholder="Search by name, reference, number…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </div>
                        <NativeSelect
                            value={type}
                            onChange={(e) =>
                                navigate({ type: e.target.value, page: 1 })
                            }
                            aria-label="Filter by product"
                            className="w-[160px] flex-none"
                        >
                            <option value="all">All products</option>
                            <option value="airtime">Airtime</option>
                            <option value="data">Data</option>
                            <option value="giftcard">Gift card</option>
                        </NativeSelect>
                    </div>

                    {/* Table */}
                    <Table>
                        <THead>
                            <TR>
                                <TH>Reference</TH>
                                <TH>Recipient</TH>
                                <TH className="hidden sm:table-cell">Type</TH>
                                <TH className="hidden md:table-cell">
                                    Country
                                </TH>
                                <TH className="hidden md:table-cell">Date</TH>
                                <TH>Status</TH>
                                <TH right>Amount</TH>
                                <TH />
                            </TR>
                        </THead>
                        <TBody>
                            {pageRows.length ? (
                                pageRows.map((t) => (
                                    <TR
                                        key={t.id}
                                        clickable
                                        onClick={() => setSel(t)}
                                    >
                                        <TD>
                                            <span className="font-mono text-[11.5px]">
                                                {t.id}
                                            </span>
                                        </TD>
                                        <TD>
                                            <div className="flex items-center gap-2">
                                                <div className="flex size-[26px] flex-none items-center justify-center rounded-md bg-muted text-muted-foreground">
                                                    <Icon
                                                        name={t.icon}
                                                        className="size-3.5"
                                                    />
                                                </div>
                                                <div>
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
                                                <Flag
                                                    code={t.country}
                                                    size={16}
                                                />
                                                <span className="text-[12px] text-muted-foreground">
                                                    {t.country}
                                                </span>
                                            </span>
                                        </TD>
                                        <TD className="hidden md:table-cell">
                                            <span className="text-[12px] text-muted-foreground">
                                                {t.date.toLocaleDateString(
                                                    'en-US',
                                                    {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    },
                                                )}
                                            </span>
                                        </TD>
                                        <TD>
                                            <StatusBadge status={t.status} />
                                        </TD>
                                        <TD right>
                                            <Money value={t.amountUSD} />
                                        </TD>
                                        <TD right>
                                            <Icon
                                                name="chevright"
                                                className="size-[15px] text-muted-foreground"
                                            />
                                        </TD>
                                    </TR>
                                ))
                            ) : (
                                <TR>
                                    <TD colSpan={8}>
                                        <EmptyState
                                            icon="search"
                                            title="No transactions found"
                                            desc="Adjust filters or search term."
                                        />
                                    </TD>
                                </TR>
                            )}
                        </TBody>
                    </Table>

                    {/* Pagination (server-driven) */}
                    {pagination.total > 0 && (
                        <div className="flex items-center justify-between border-t px-5 py-3">
                            <span className="text-[12.5px] text-muted-foreground">
                                Showing {pagination.from ?? 0}–
                                {pagination.to ?? 0} of {pagination.total}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={pagination.currentPage <= 1}
                                    onClick={() =>
                                        navigate({
                                            page: pagination.currentPage - 1,
                                        })
                                    }
                                    aria-label="Previous page"
                                >
                                    <Icon name="chevleft" className="size-4" />
                                </Button>
                                <span className="px-1 text-[12px] text-muted-foreground">
                                    Page {pagination.currentPage} /{' '}
                                    {pagination.lastPage}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                        pagination.currentPage >=
                                        pagination.lastPage
                                    }
                                    onClick={() =>
                                        navigate({
                                            page: pagination.currentPage + 1,
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

                <ReceiptModal
                    txn={sel}
                    open={!!sel}
                    onClose={() => setSel(null)}
                />
            </Page>
        </>
    );
}
