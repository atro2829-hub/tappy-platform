import { Head, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import {
    index as bulkIndex,
    show,
    store,
} from '@/actions/App/Http/Controllers/BulkController';
import { Button } from '@/components/ui/button';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/data-table';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import { Money } from '@/components/ui/money';
import { Page, PageHeader } from '@/components/ui/page';
import { Pagination } from '@/components/ui/pagination';
import type { PaginationMeta } from '@/components/ui/pagination';
import { Panel, PanelBody, PanelHead } from '@/components/ui/panel';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { Stat } from '@/components/ui/stat';
import { StatusBadge } from '@/components/ui/status-badge';
import { downloadCsv } from '@/lib/csv';
import { fmt, fmtInt } from '@/lib/format';
import type { SharedData } from '@/types/ui';

interface BulkJob {
    id: string;
    key: number;
    name: string;
    rows: number;
    valid: number;
    errors: number;
    status: string;
    progress: number;
    cost: number;
    created: string;
}

type ItemRow = {
    id: number;
    recipient: string;
    country: string;
    amount: number;
    status: string;
};

type Detail = { batch: BulkJob; items: ItemRow[] };

function BatchDetail({ batch, items }: { batch: BulkJob; items: ItemRow[] }) {
    const exportCsv = () =>
        downloadCsv(
            `${batch.id}.csv`,
            ['Recipient', 'Country', 'Amount', 'Status'],
            items.map((i) => [i.recipient, i.country, i.amount, i.status]),
        );

    return (
        <Page>
            <PageHeader
                title={batch.id}
                breadcrumb={
                    <>
                        <span
                            className="cursor-pointer"
                            onClick={() => router.visit('/bulk')}
                        >
                            Bulk orders
                        </span>
                        <Icon name="chevright" className="size-3" />
                        {batch.id}
                    </>
                }
                desc={`${batch.name} · ${batch.created}`}
                actions={
                    items.length > 0 && (
                        <Button variant="outline" onClick={exportCsv}>
                            <Icon name="download" className="size-4" />
                            Export report
                        </Button>
                    )
                }
            />

            <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-[14px]">
                <Stat
                    label="Total rows"
                    value={fmtInt(batch.rows)}
                    icon="list"
                    accent="primary"
                />
                <Stat
                    label="Delivered"
                    value={fmtInt(batch.valid)}
                    icon="checkcircle"
                    accent="success"
                />
                <Stat
                    label="Failed"
                    value={String(batch.errors)}
                    icon="alert"
                    accent={batch.errors ? 'destructive' : 'muted'}
                />
                <Stat
                    label="Total cost"
                    value={fmt(batch.cost)}
                    icon="dollar"
                    accent="info"
                />
                <Stat
                    label="Status"
                    value={`${batch.progress}%`}
                    icon="layers"
                    accent="violet"
                    sub={batch.status}
                />
            </div>

            {batch.status === 'processing' && (
                <Panel className="mb-[18px]">
                    <PanelBody className="flex items-center gap-[14px]">
                        <Spinner className="size-[18px]" />
                        <div className="flex-1">
                            <div className="mb-1.5 text-[13px] font-semibold">
                                Processing batch — {batch.progress}% complete
                            </div>
                            <Progress value={batch.progress} />
                        </div>
                    </PanelBody>
                </Panel>
            )}

            <Panel>
                <PanelHead
                    title="Row results"
                    desc="Each recipient is processed independently; failed rows are auto-refunded."
                />
                <div className="mt-2">
                    <Table>
                        <THead>
                            <TR>
                                <TH>#</TH>
                                <TH>Recipient</TH>
                                <TH className="hidden sm:table-cell">
                                    Country
                                </TH>
                                <TH className="hidden md:table-cell">Amount</TH>
                                <TH>Status</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {items.length === 0 && (
                                <TR>
                                    <TD colSpan={5}>
                                        <span className="text-[12.5px] text-muted-foreground">
                                            No rows in this batch.
                                        </span>
                                    </TD>
                                </TR>
                            )}
                            {items.map((r, i) => (
                                <TR key={r.id}>
                                    <TD className="font-mono text-[12px] text-muted-foreground">
                                        {i + 1}
                                    </TD>
                                    <TD className="font-mono text-[12px]">
                                        {r.recipient}
                                    </TD>
                                    <TD className="hidden sm:table-cell">
                                        <span className="inline-flex items-center gap-[7px] text-[12.5px]">
                                            <Flag code={r.country} size={15} />
                                            {r.country}
                                        </span>
                                    </TD>
                                    <TD className="hidden md:table-cell">
                                        <Money value={r.amount} />
                                    </TD>
                                    <TD>
                                        <StatusBadge status={r.status} />
                                    </TD>
                                </TR>
                            ))}
                        </TBody>
                    </Table>
                </div>
            </Panel>
        </Page>
    );
}

function UploadView({
    onUpload,
    onBack,
}: {
    onUpload: (file: File) => void;
    onBack: () => void;
}) {
    const fileInput = useRef<HTMLInputElement>(null);

    return (
        <Page>
            <PageHeader
                title="New bulk order"
                breadcrumb={
                    <>
                        <span className="cursor-pointer" onClick={onBack}>
                            Bulk orders
                        </span>
                        <Icon name="chevright" className="size-3" />
                        New
                    </>
                }
                desc="Upload a CSV (country, recipient, amount) to send many top-ups at once."
            />
            <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_320px]">
                <Panel>
                    <PanelBody className="flex flex-col gap-[18px]">
                        <input
                            ref={fileInput}
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];

                                if (file) {
                                    onUpload(file);
                                }

                                e.target.value = '';
                            }}
                        />
                        <div
                            className="cursor-pointer rounded-xl border-2 border-dashed p-[36px_20px] text-center"
                            style={{ background: 'hsl(var(--muted) / 0.3)' }}
                            onClick={() => fileInput.current?.click()}
                        >
                            <div
                                className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl"
                                style={{
                                    background: 'hsl(var(--primary) / 0.1)',
                                    color: 'hsl(var(--primary))',
                                }}
                            >
                                <Icon name="upload" className="size-[22px]" />
                            </div>
                            <div className="text-[14px] font-semibold">
                                Drop your CSV here or click to browse
                            </div>
                            <div className="mt-1 text-[12.5px] text-muted-foreground">
                                Columns: country, recipient, amount · UTF-8 CSV
                                up to 5 MB
                            </div>
                        </div>
                    </PanelBody>
                </Panel>

                <Panel className="sticky top-[76px]">
                    <PanelHead title="How it works" />
                    <PanelBody className="pt-3 text-[12.5px] leading-relaxed text-muted-foreground">
                        Each row is queued and processed independently against
                        the provider. Failed rows are automatically refunded to
                        your wallet. Track progress and per-row results from the
                        batch list once uploaded.
                    </PanelBody>
                </Panel>
            </div>
        </Page>
    );
}

export default function BulkScreen({
    batches,
    detail,
    pagination,
}: {
    batches: BulkJob[];
    detail?: Detail;
    pagination: PaginationMeta;
}) {
    const { auth } = usePage<SharedData>().props;
    const role = auth.user.role;
    const [stage, setStage] = useState<'list' | 'upload'>('list');

    const uploadFile = (file: File) => {
        router.post(
            store.url(),
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setStage('list');
                    toast.success('Batch uploaded', {
                        description: 'Your CSV is queued for processing.',
                    });
                },
                onError: () =>
                    toast.error('Upload failed', {
                        description: 'Please upload a valid CSV file.',
                    }),
            },
        );
    };

    if (detail) {
        return (
            <>
                <Head title="Bulk orders" />
                <BatchDetail batch={detail.batch} items={detail.items} />
            </>
        );
    }

    if (stage === 'upload') {
        return (
            <>
                <Head title="Bulk orders" />
                <UploadView
                    onUpload={uploadFile}
                    onBack={() => setStage('list')}
                />
            </>
        );
    }

    return (
        <>
            <Head title="Bulk orders" />
            <Page>
                <PageHeader
                    title={role === 'admin' ? 'Bulk jobs' : 'Bulk orders'}
                    desc="Mass top-ups via CSV — queued and processed safely."
                    actions={
                        <Button onClick={() => setStage('upload')}>
                            <Icon name="upload" className="size-4" />
                            New bulk order
                        </Button>
                    }
                />

                <Panel>
                    <PanelHead title="Recent batches" />
                    <div className="mt-2">
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Batch</TH>
                                    <TH className="hidden sm:table-cell">
                                        File
                                    </TH>
                                    <TH>Rows</TH>
                                    <TH className="hidden md:table-cell">
                                        Progress
                                    </TH>
                                    <TH>Status</TH>
                                    <TH right>Cost</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {batches.length === 0 && (
                                    <TR>
                                        <TD colSpan={6}>
                                            <span className="text-[12.5px] text-muted-foreground">
                                                No batches yet — upload a CSV to
                                                get started.
                                            </span>
                                        </TD>
                                    </TR>
                                )}
                                {batches.map((b) => (
                                    <TR
                                        key={b.id}
                                        clickable
                                        onClick={() =>
                                            router.visit(show.url(b.key))
                                        }
                                    >
                                        <TD>
                                            <div>
                                                <span className="font-mono text-[12px] font-semibold">
                                                    {b.id}
                                                </span>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {b.created}
                                                </div>
                                            </div>
                                        </TD>
                                        <TD className="hidden sm:table-cell">
                                            <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                                                <Icon
                                                    name="file"
                                                    className="size-3.5 text-muted-foreground"
                                                />
                                                {b.name}
                                            </span>
                                        </TD>
                                        <TD>
                                            <span className="tnum text-[12.5px]">
                                                {fmtInt(b.valid)}
                                            </span>
                                            {b.errors > 0 && (
                                                <span className="ml-1.5 text-[11px] text-destructive">
                                                    {b.errors} err
                                                </span>
                                            )}
                                        </TD>
                                        <TD className="hidden w-[140px] md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <Progress
                                                    value={b.progress}
                                                    height={6}
                                                />
                                                <span className="tnum w-[30px] font-mono text-[11px] text-muted-foreground">
                                                    {b.progress}%
                                                </span>
                                            </div>
                                        </TD>
                                        <TD>
                                            <StatusBadge status={b.status} />
                                        </TD>
                                        <TD right>
                                            <Money value={b.cost} />
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                    <Pagination
                        meta={pagination}
                        onPage={(p) =>
                            router.get(
                                bulkIndex.url(),
                                { page: p },
                                {
                                    preserveScroll: true,
                                    preserveState: true,
                                    replace: true,
                                },
                            )
                        }
                    />
                </Panel>
            </Page>
        </>
    );
}
