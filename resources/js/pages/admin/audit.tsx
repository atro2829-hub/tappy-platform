import { Head, router } from '@inertiajs/react';

import { index as indexAudit } from '@/actions/App/Http/Controllers/Admin/AdminAuditController';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelBody } from '@/components/ui/panel';
import { downloadCsv } from '@/lib/csv';

interface AuditLog {
    actor: string;
    action: string;
    target: string;
    ip: string;
    time: string;
    icon: IconName;
}

interface Pagination {
    total: number;
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
}

export default function AdminAudit({
    logs,
    pagination,
}: {
    logs: AuditLog[];
    pagination: Pagination;
}) {
    const exportCsv = () =>
        downloadCsv(
            'tappy-audit.csv',
            ['Actor', 'Action', 'IP', 'Time'],
            logs.map((l) => [l.actor, l.action, l.ip, l.time]),
        );

    const goToPage = (page: number) =>
        router.get(
            indexAudit.url(),
            { page },
            { preserveScroll: true, preserveState: true, replace: true },
        );

    return (
        <>
            <Head title="Audit Logs" />
            <Page>
                <PageHeader
                    title="Audit logs"
                    desc="Immutable record of every sensitive action. Retained 7 years."
                    actions={
                        <Button variant="outline" onClick={exportCsv}>
                            <Icon name="download" className="size-4" />
                            Export
                        </Button>
                    }
                />

                <Panel>
                    <PanelBody className="pt-2">
                        {logs.length === 0 && (
                            <EmptyState
                                icon="receipt"
                                title="No audit entries yet"
                                desc="Sensitive actions will be recorded here."
                            />
                        )}
                        {logs.map((l, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3.5 py-3"
                                style={{
                                    borderBottom:
                                        i < logs.length - 1
                                            ? '1px solid hsl(var(--border))'
                                            : 'none',
                                }}
                            >
                                <div className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-muted text-muted-foreground">
                                    <Icon name={l.icon} className="size-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[13px]">
                                        <b>{l.actor}</b>{' '}
                                        <span className="text-muted-foreground">
                                            ·
                                        </span>{' '}
                                        {l.action}{' '}
                                        {l.target !== '—' && (
                                            <span className="font-medium">
                                                — {l.target}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                                        IP {l.ip}
                                    </div>
                                </div>
                                <span className="flex-none text-[12px] text-muted-foreground">
                                    {l.time}
                                </span>
                            </div>
                        ))}
                    </PanelBody>
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
                                        goToPage(pagination.currentPage - 1)
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
                                        goToPage(pagination.currentPage + 1)
                                    }
                                >
                                    Next
                                    <Icon name="chevright" className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Panel>
            </Page>
        </>
    );
}
