import { Head } from '@inertiajs/react';
import { useState } from 'react';

import { openCopilot } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelBody } from '@/components/ui/panel';
import { Stat } from '@/components/ui/stat';
import { StatusBadge } from '@/components/ui/status-badge';
import { UnderlineTabs } from '@/components/ui/tabs';
import { downloadCsv } from '@/lib/csv';
import { fmt } from '@/lib/format';

const TABS = [
    { value: 'all', label: 'All' },
    { value: 'success', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
];

type ActivityItem = {
    id: string;
    icon: IconName;
    voice: boolean;
    command: string;
    action: string;
    recipient: string;
    confidence: string;
    amount: number | null;
    status: string;
    time: string;
};

export default function AiActivityScreen({
    activity,
    stats,
}: {
    activity: ActivityItem[];
    stats: { total: number; completed: number };
}) {
    const [filter, setFilter] = useState('all');

    const exportCsv = () =>
        downloadCsv(
            'tappy-ai-activity.csv',
            ['Command', 'Action', 'Recipient', 'Amount', 'Status', 'Time'],
            activity.map((a) => [
                a.command,
                a.action,
                a.recipient,
                a.amount ?? '',
                a.status,
                a.time,
            ]),
        );

    const rows = activity.filter(
        (a) =>
            filter === 'all' ||
            a.status === filter ||
            (filter === 'success' && a.status === 'active'),
    );

    const kpis = [
        {
            label: 'AI actions (30d)',
            value: String(stats.total),
            icon: 'sparkles' as const,
            accent: 'primary',
        },
        {
            label: 'Completed',
            value: String(stats.completed),
            icon: 'checkcircle' as const,
            accent: 'success',
        },
    ];

    return (
        <>
            <Head title="AI Activity" />
            <Page>
                <PageHeader
                    title="AI activity"
                    desc="Every action TopUp Copilot prepared — with the exact request, outcome, and your confirmation on record."
                    actions={
                        <>
                            <Button variant="outline" onClick={exportCsv}>
                                <Icon name="download" className="size-4" />
                                Export
                            </Button>
                            <Button onClick={() => openCopilot('')}>
                                <Icon name="sparkles" className="size-4" />
                                Open Copilot
                            </Button>
                        </>
                    }
                />

                <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
                    {kpis.map((k) => (
                        <Stat key={k.label} {...k} />
                    ))}
                </div>

                <Panel>
                    <div className="px-5 pt-5 pb-0">
                        <UnderlineTabs
                            tabs={TABS}
                            value={filter}
                            onChange={setFilter}
                        />
                    </div>
                    <PanelBody className="pt-[6px]">
                        {rows.map((a, i) => (
                            <div
                                key={a.id}
                                className="flex items-center gap-3.5 py-3"
                                style={{
                                    borderBottom:
                                        i < rows.length - 1
                                            ? '1px solid hsl(var(--border))'
                                            : 'none',
                                }}
                            >
                                {/* Icon with optional voice badge */}
                                <div
                                    className="relative flex size-[34px] flex-none items-center justify-center rounded-[9px]"
                                    style={{
                                        background: 'hsl(var(--muted))',
                                        color: 'hsl(var(--muted-foreground))',
                                    }}
                                >
                                    <Icon name={a.icon} className="size-4" />
                                    {a.voice && (
                                        <span
                                            className="absolute -right-[3px] -bottom-[3px] flex size-[15px] items-center justify-center rounded-full border-2"
                                            style={{
                                                background:
                                                    'var(--ai-grad, hsl(var(--primary)))',
                                                color: '#fff',
                                                borderColor: 'hsl(var(--card))',
                                            }}
                                        >
                                            <Icon
                                                name="mic"
                                                className="size-[8px]"
                                            />
                                        </span>
                                    )}
                                </div>

                                {/* Command + action */}
                                <div className="min-w-0 flex-1">
                                    <div className="overflow-hidden text-[13px] font-medium text-ellipsis whitespace-nowrap">
                                        {a.command}
                                    </div>
                                    <div className="mt-[2px] inline-flex items-center gap-[5px] text-[11.5px] text-muted-foreground">
                                        <Icon
                                            name="sparkles"
                                            className="size-[11px]"
                                            style={{
                                                color: 'hsl(var(--primary))',
                                            }}
                                        />
                                        {a.action} · {a.recipient}
                                    </div>
                                </div>

                                {/* Confidence */}
                                <span className="hidden items-center gap-1 text-[11px] text-muted-foreground md:inline-flex">
                                    <Icon
                                        name="shieldcheck"
                                        className="size-3"
                                    />
                                    {a.confidence}
                                </span>

                                {/* Amount */}
                                {a.amount != null && (
                                    <span className="tnum hidden w-[76px] text-right font-mono text-[12.5px] font-semibold sm:inline-block">
                                        {fmt(a.amount)}
                                    </span>
                                )}

                                {/* Status */}
                                <div className="flex w-24 justify-end">
                                    <StatusBadge status={a.status} />
                                </div>

                                {/* Time */}
                                <span className="hidden w-24 text-right text-[11px] text-muted-foreground md:inline-block">
                                    {a.time}
                                </span>

                                {/* Run again */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    title="Run again"
                                    onClick={() => openCopilot(a.command)}
                                >
                                    <Icon name="refresh" className="size-3.5" />
                                </Button>
                            </div>
                        ))}
                    </PanelBody>
                </Panel>
            </Page>
        </>
    );
}
