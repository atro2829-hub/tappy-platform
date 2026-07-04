import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
    document as kycDocument,
    index as kycIndex,
} from '@/actions/App/Http/Controllers/Admin/AdminKycController';
import { update } from '@/actions/App/Http/Controllers/Admin/AdminUserController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/data-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import { Page, PageHeader } from '@/components/ui/page';
import { Pagination } from '@/components/ui/pagination';
import type { PaginationMeta } from '@/components/ui/pagination';
import { Panel, PanelHead } from '@/components/ui/panel';
import { Stat } from '@/components/ui/stat';
import { StatusBadge } from '@/components/ui/status-badge';
import { COUNTRIES } from '@/lib/mock-data';

type KycDoc = {
    id: number;
    label: string;
    name: string;
    size: number;
};

type KycEntry = {
    id: string;
    biz: string;
    type: string;
    contact: string;
    docs: number;
    documents: KycDoc[];
    submitted: string;
    status: string;
    country: string;
};

interface Stats {
    pending: number;
    review: number;
    approved: number;
    rejected: number;
}

export default function AdminKyc({
    queue,
    pagination,
    stats,
}: {
    queue: KycEntry[];
    pagination: PaginationMeta;
    stats: Stats;
}) {
    const confirm = useConfirm();
    const [sel, setSel] = useState<KycEntry | null>(null);
    const [acting, setActing] = useState(false);

    const act = async (verb: 'approve' | 'reject' | 'review') => {
        if (!sel) {
            return;
        }

        if (verb === 'reject') {
            const ok = await confirm({
                title: `Reject ${sel.biz}'s KYC?`,
                description: 'They will need to resubmit their verification.',
                confirmLabel: 'Reject KYC',
                destructive: true,
            });

            if (!ok) {
                return;
            }
        }

        const kyc_status =
            verb === 'approve'
                ? 'approved'
                : verb === 'reject'
                  ? 'rejected'
                  : 'review';

        const business = sel.biz;

        router.patch(
            update.url(Number(sel.id)),
            { kyc_status },
            {
                preserveScroll: true,
                onStart: () => setActing(true),
                onFinish: () => setActing(false),
                onSuccess: () => {
                    setSel(null);

                    if (verb === 'approve') {
                        toast.success('KYC approved', {
                            description: business,
                        });
                    } else if (verb === 'reject') {
                        toast.error('KYC rejected', { description: business });
                    } else {
                        toast.info('Marked for review', {
                            description: business,
                        });
                    }
                },
                onError: () =>
                    toast.error('Could not update KYC', {
                        description: 'Please try again.',
                    }),
            },
        );
    };

    return (
        <>
            <Head title="KYC Reviews" />
            <Page>
                <PageHeader
                    title="KYC reviews"
                    desc="Verify businesses and resellers before they can transact at scale."
                />

                <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
                    <Stat
                        label="Pending review"
                        value={String(stats.pending)}
                        icon="clock"
                        accent="warning"
                    />
                    <Stat
                        label="In manual review"
                        value={String(stats.review)}
                        icon="eye"
                        accent="violet"
                    />
                    <Stat
                        label="Approved (30d)"
                        value={String(stats.approved)}
                        icon="shieldcheck"
                        accent="success"
                    />
                    <Stat
                        label="Rejected"
                        value={String(stats.rejected)}
                        icon="xcircle"
                        accent="destructive"
                    />
                </div>

                <Panel>
                    <PanelHead title="Verification queue" />
                    <div className="mt-2">
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Business</TH>
                                    <TH className="hidden sm:table-cell">
                                        Type
                                    </TH>
                                    <TH className="hidden md:table-cell">
                                        Contact
                                    </TH>
                                    <TH>Docs</TH>
                                    <TH className="hidden md:table-cell">
                                        Submitted
                                    </TH>
                                    <TH>Status</TH>
                                    <TH></TH>
                                </TR>
                            </THead>
                            <TBody>
                                {queue.length === 0 && (
                                    <TR>
                                        <TD colSpan={7}>
                                            <EmptyState
                                                icon="filecheck"
                                                title="Queue is clear"
                                                desc="No verifications waiting for review."
                                            />
                                        </TD>
                                    </TR>
                                )}
                                {queue.map((k) => (
                                    <TR
                                        key={k.id}
                                        clickable
                                        onClick={() => setSel(k)}
                                    >
                                        <TD>
                                            <span className="inline-flex items-center gap-2">
                                                <Flag
                                                    code={k.country}
                                                    size={18}
                                                />
                                                <span className="text-[12.5px] font-semibold">
                                                    {k.biz}
                                                </span>
                                            </span>
                                        </TD>
                                        <TD className="hidden sm:table-cell">
                                            <Badge variant="outline">
                                                {k.type}
                                            </Badge>
                                        </TD>
                                        <TD className="hidden text-[12.5px] md:table-cell">
                                            {k.contact}
                                        </TD>
                                        <TD>
                                            <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                                                <Icon
                                                    name="file"
                                                    className="size-[13px] text-muted-foreground"
                                                />
                                                {k.docs}
                                            </span>
                                        </TD>
                                        <TD className="hidden md:table-cell">
                                            <span className="text-[12px] text-muted-foreground">
                                                {k.submitted}
                                            </span>
                                        </TD>
                                        <TD>
                                            <StatusBadge status={k.status} />
                                        </TD>
                                        <TD right>
                                            <Button
                                                size="sm"
                                                variant={
                                                    k.status === 'approved'
                                                        ? 'ghost'
                                                        : 'outline'
                                                }
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSel(k);
                                                }}
                                            >
                                                {k.status === 'approved'
                                                    ? 'View'
                                                    : 'Review'}
                                            </Button>
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
                                kycIndex.url(),
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

                <Dialog
                    open={!!sel}
                    onOpenChange={(open) => {
                        if (!open) {
                            setSel(null);
                        }
                    }}
                >
                    <DialogContent className="max-w-[520px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Icon
                                    name="shieldcheck"
                                    className="size-[18px]"
                                />
                                {sel?.biz ?? ''}
                            </DialogTitle>
                            <DialogDescription>
                                {sel
                                    ? `${sel.type} verification · ${sel.contact}`
                                    : ''}
                            </DialogDescription>
                        </DialogHeader>

                        {sel && (
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                                    {(
                                        [
                                            ['Legal name', sel.biz],
                                            [
                                                'Country',
                                                COUNTRIES.find(
                                                    (c) =>
                                                        c.iso === sel.country,
                                                )?.name ?? sel.country,
                                            ],
                                            ['Type', sel.type],
                                            ['Submitted', sel.submitted],
                                        ] as [string, string][]
                                    ).map(([k, v]) => (
                                        <div key={k}>
                                            <div className="text-[11.5px] text-muted-foreground">
                                                {k}
                                            </div>
                                            <div className="text-[13px] font-semibold">
                                                {v}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <div className="mb-1.5 text-[12.5px] font-medium">
                                        Uploaded documents
                                    </div>
                                    {sel.documents.length ? (
                                        <div className="grid grid-cols-2 gap-2.5">
                                            {sel.documents.map((d) => (
                                                <a
                                                    key={d.id}
                                                    href={kycDocument.url(d.id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2.5 rounded-[var(--radius)] border p-2.5 no-underline hover:bg-muted/50"
                                                >
                                                    <div className="flex size-8 flex-none items-center justify-center rounded-[7px] bg-muted text-muted-foreground">
                                                        <Icon
                                                            name="file"
                                                            className="size-[15px]"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="overflow-hidden text-[12px] font-semibold text-ellipsis whitespace-nowrap">
                                                            {d.label}
                                                        </div>
                                                        <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                                            View
                                                            <Icon
                                                                name="external"
                                                                className="size-3"
                                                            />
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[12px] text-muted-foreground">
                                            No documents uploaded yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {sel && sel.status !== 'approved' && (
                            <DialogFooter>
                                <Button
                                    variant="destructive"
                                    onClick={() => act('reject')}
                                    disabled={acting}
                                >
                                    <Icon name="x" className="size-4" />
                                    Reject
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => act('review')}
                                    disabled={acting}
                                >
                                    Request more info
                                </Button>
                                <Button
                                    onClick={() => act('approve')}
                                    disabled={acting}
                                >
                                    <Icon name="check" className="size-4" />
                                    Approve
                                </Button>
                            </DialogFooter>
                        )}
                    </DialogContent>
                </Dialog>
            </Page>
        </>
    );
}
