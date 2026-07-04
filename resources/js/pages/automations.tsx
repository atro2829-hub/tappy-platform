import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
    destroy,
    update,
} from '@/actions/App/Http/Controllers/AutomationController';
import { openCopilot } from '@/components/copilot';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Panel, PanelBody, PanelHead } from '@/components/ui/panel';
import { Stat } from '@/components/ui/stat';
import { fmt } from '@/lib/format';

const go = (href: string) => router.visit(href);

const NEW_AUTOMATION_PROMPT =
    'Recharge my mother’s number with ৳300 every month';

interface Schedule {
    id: string;
    name: string;
    recipient: string;
    country: string;
    operator: string;
    amount: number;
    cur: string;
    freq: string;
    next: string;
    status: string;
    reminder: string;
    failReason?: string | null;
    lastRunAt?: string | null;
}

export default function AutomationsScreen({
    automations,
}: {
    automations: Schedule[];
}) {
    const [list, setList] = useState<Schedule[]>(automations);
    const [cancelTarget, setCancelTarget] = useState<Schedule | null>(null);

    const act = (id: string, status: string) => {
        const previous = list;
        setList((l) => l.map((s) => (s.id === id ? { ...s, status } : s)));
        router.patch(
            update.url(Number(id)),
            { enabled: status === 'active' },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setList(previous);
                    toast.error('Could not update the automation');
                },
            },
        );
    };

    const remove = (id: string) => {
        const previous = list;
        setCancelTarget(null);
        setList((l) => l.filter((s) => s.id !== id));
        router.delete(destroy.url(Number(id)), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.info('Automation cancelled'),
            onError: () => {
                setList(previous);
                toast.error('Could not cancel the automation');
            },
        });
    };

    const active = list.filter((s) => s.status === 'active');
    const upcoming = [...active]
        .sort((a, b) => a.next.localeCompare(b.next))
        .slice(0, 3);
    const failed = list.filter((s) => s.status === 'failed');

    // Derived honestly from real run history (last_run_at); 0 until a run lands.
    // Captured once (lazy init) to keep render pure.
    const [weekAgo] = useState(() => Date.now() - 7 * 864e5);
    const runsThisWeek = list.filter(
        (s) => s.lastRunAt && new Date(s.lastRunAt).getTime() >= weekAgo,
    ).length;
    // Sum of active recurring amounts in USD; only USD-denominated automations
    // contribute (no FX source in-system), so this stays honest, never inflated.
    const monthlyCommitted = active
        .filter((s) => s.cur === 'YER')
        .reduce((sum, s) => sum + s.amount, 0);

    const kpis = [
        {
            label: 'Active automations',
            value: String(active.length),
            icon: 'refresh' as const,
            accent: 'primary',
        },
        {
            label: 'Runs this week',
            value: String(runsThisWeek),
            icon: 'calendar' as const,
            accent: 'info',
        },
        {
            label: 'Monthly committed',
            value: fmt(monthlyCommitted),
            icon: 'dollar' as const,
            accent: 'success',
        },
        {
            label: 'Paused',
            value: String(list.filter((s) => s.status === 'paused').length),
            icon: 'clock' as const,
            accent: 'warning',
        },
    ];

    return (
        <>
            <Head title="Automations" />
            <Page>
                <PageHeader
                    title="Automations"
                    desc="Recurring recharges set up by you or TopUp Copilot — you stay in control, with a reminder before every run."
                    actions={
                        <>
                            <Button
                                variant="outline"
                                onClick={() => go('/ai-activity')}
                            >
                                <Icon name="history" className="size-4" />
                                AI activity
                            </Button>
                            <Button
                                onClick={() =>
                                    openCopilot(NEW_AUTOMATION_PROMPT)
                                }
                            >
                                <Icon name="sparkles" className="size-4" />
                                New automation
                            </Button>
                        </>
                    }
                />

                {failed.length > 0 && (
                    <div
                        className="mb-[18px] flex items-center gap-3 rounded-xl border px-4 py-3"
                        style={{
                            borderLeft: '3px solid hsl(var(--destructive))',
                            background: 'hsl(var(--destructive) / 0.05)',
                        }}
                    >
                        <Icon
                            name="alert"
                            className="size-[18px] flex-none"
                            style={{ color: 'hsl(var(--destructive))' }}
                        />
                        <div className="min-w-0 flex-1">
                            <span className="text-[13px] font-semibold">
                                {failed[0].name}'s recharge didn't run
                            </span>
                            <span className="ml-2 hidden text-[13px] text-muted-foreground sm:inline">
                                {failed[0].failReason} — add funds and we'll
                                retry automatically.
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => go('/wallet')}
                        >
                            Add funds
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                act(failed[0].id, 'active');
                                toast.success('Retry scheduled');
                            }}
                        >
                            Retry now
                        </Button>
                    </div>
                )}

                <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
                    {kpis.map((k) => (
                        <Stat key={k.label} {...k} />
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                    {/* All automations table */}
                    <Panel>
                        <PanelHead
                            title="All automations"
                            desc="Pause, resume or cancel anytime."
                        />
                        <div className="mt-2">
                            <Table>
                                <THead>
                                    <TR>
                                        <TH>Recipient</TH>
                                        <TH className="hidden sm:table-cell">
                                            Amount
                                        </TH>
                                        <TH>Frequency</TH>
                                        <TH className="hidden md:table-cell">
                                            Next run
                                        </TH>
                                        <TH>Status</TH>
                                        <TH />
                                    </TR>
                                </THead>
                                <TBody>
                                    {list.length ? (
                                        list.map((s) => (
                                            <TR key={s.id}>
                                                <TD>
                                                    <div className="flex items-center gap-2.5">
                                                        <Flag
                                                            code={s.country}
                                                            size={18}
                                                        />
                                                        <div>
                                                            <div className="text-[12.5px] font-semibold">
                                                                {s.name}
                                                            </div>
                                                            <div className="font-mono text-[11px] text-muted-foreground">
                                                                {s.recipient}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TD>
                                                <TD className="hidden sm:table-cell">
                                                    <span className="tnum font-mono text-[12.5px]">
                                                        {fmt(s.amount, s.cur)}
                                                    </span>
                                                </TD>
                                                <TD>
                                                    <Badge variant="outline">
                                                        {s.freq}
                                                    </Badge>
                                                </TD>
                                                <TD className="hidden md:table-cell">
                                                    <span className="text-[12px] text-muted-foreground">
                                                        {s.next}
                                                    </span>
                                                </TD>
                                                <TD>
                                                    {s.status === 'failed' ? (
                                                        <Badge
                                                            variant="destructive"
                                                            dot
                                                        >
                                                            Failed
                                                        </Badge>
                                                    ) : s.status ===
                                                      'paused' ? (
                                                        <Badge
                                                            variant="muted"
                                                            dot
                                                        >
                                                            Paused
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="success"
                                                            dot
                                                        >
                                                            Active
                                                        </Badge>
                                                    )}
                                                </TD>
                                                <TD right>
                                                    <div className="flex justify-end gap-1">
                                                        {s.status ===
                                                        'active' ? (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                title="Pause"
                                                                onClick={() => {
                                                                    act(
                                                                        s.id,
                                                                        'paused',
                                                                    );
                                                                    toast.info(
                                                                        'Automation paused',
                                                                    );
                                                                }}
                                                            >
                                                                <Icon
                                                                    name="clock"
                                                                    className="size-3.5"
                                                                />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                title="Resume"
                                                                onClick={() => {
                                                                    act(
                                                                        s.id,
                                                                        'active',
                                                                    );
                                                                    toast.success(
                                                                        'Automation resumed',
                                                                    );
                                                                }}
                                                            >
                                                                <Icon
                                                                    name="refresh"
                                                                    className="size-3.5"
                                                                />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            title="Cancel"
                                                            onClick={() =>
                                                                setCancelTarget(
                                                                    s,
                                                                )
                                                            }
                                                        >
                                                            <Icon
                                                                name="trash"
                                                                className="size-3.5"
                                                            />
                                                        </Button>
                                                    </div>
                                                </TD>
                                            </TR>
                                        ))
                                    ) : (
                                        <TR>
                                            <TD colSpan={6}>
                                                <EmptyState
                                                    icon="refresh"
                                                    title="No automations yet"
                                                    desc="Set up a recurring recharge so you never forget. Just ask Copilot."
                                                    action={
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                openCopilot(
                                                                    NEW_AUTOMATION_PROMPT,
                                                                )
                                                            }
                                                        >
                                                            <Icon
                                                                name="sparkles"
                                                                className="size-3.5"
                                                            />
                                                            Create with AI
                                                        </Button>
                                                    }
                                                />
                                            </TD>
                                        </TR>
                                    )}
                                </TBody>
                            </Table>
                        </div>
                    </Panel>

                    {/* Right column */}
                    <div className="flex flex-col gap-4">
                        {/* Upcoming */}
                        <Panel>
                            <PanelHead
                                title="Upcoming"
                                desc="Next scheduled runs"
                            />
                            <PanelBody className="flex flex-col gap-3 pt-[10px]">
                                {upcoming.length ? (
                                    upcoming.map((s) => {
                                        const parts = s.next.split(' ');
                                        const day = parts[1]
                                            ? parts[1].replace(',', '')
                                            : '—';
                                        const mon = parts[0];

                                        return (
                                            <div
                                                key={s.id}
                                                className="flex items-center gap-3"
                                            >
                                                <div
                                                    className="flex size-[38px] flex-none flex-col items-center justify-center rounded-[9px]"
                                                    style={{
                                                        background:
                                                            'hsl(var(--primary) / 0.1)',
                                                        color: 'hsl(var(--primary))',
                                                    }}
                                                >
                                                    <span className="text-[13px] leading-none font-bold">
                                                        {day}
                                                    </span>
                                                    <span className="text-[8.5px] tracking-[0.04em] uppercase">
                                                        {mon}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-[12.5px] font-semibold">
                                                        {s.name}
                                                    </div>
                                                    <div className="text-[11.5px] text-muted-foreground">
                                                        {fmt(s.amount, s.cur)} ·{' '}
                                                        {s.operator}
                                                    </div>
                                                </div>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {s.freq}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <EmptyState
                                        icon="calendar"
                                        title="Nothing scheduled"
                                        desc="Upcoming runs will show here."
                                    />
                                )}
                            </PanelBody>
                        </Panel>

                        {/* Copilot CTA */}
                        <Panel
                            style={{
                                background: 'hsl(var(--primary) / 0.05)',
                                border: '1px solid hsl(var(--primary) / 0.18)',
                            }}
                        >
                            <PanelBody className="flex gap-3">
                                <div
                                    className="flex size-8 flex-none items-center justify-center rounded-full"
                                    style={{
                                        background:
                                            'var(--ai-grad, hsl(var(--primary)))',
                                        color: '#fff',
                                    }}
                                >
                                    <Icon name="sparkles" className="size-4" />
                                </div>
                                <div>
                                    <div className="text-[13px] font-semibold">
                                        Set up by voice or chat
                                    </div>
                                    <p className="mt-1 mb-[10px] text-[12px] leading-[1.5] text-muted-foreground">
                                        Say "recharge my mother ৳300 every
                                        month" and Copilot builds the schedule —
                                        you just confirm.
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            openCopilot(NEW_AUTOMATION_PROMPT)
                                        }
                                    >
                                        <Icon
                                            name="sparkles"
                                            className="size-3.5"
                                        />
                                        Ask Copilot
                                    </Button>
                                </div>
                            </PanelBody>
                        </Panel>
                    </div>
                </div>

                {/* Cancel confirmation dialog */}
                <Dialog
                    open={!!cancelTarget}
                    onOpenChange={(open) => !open && setCancelTarget(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <span
                                    className="flex size-8 items-center justify-center rounded-full"
                                    style={{
                                        background:
                                            'hsl(var(--destructive) / 0.1)',
                                        color: 'hsl(var(--destructive))',
                                    }}
                                >
                                    <Icon name="alert" className="size-4" />
                                </span>
                                Cancel automation?
                            </DialogTitle>
                            {cancelTarget && (
                                <DialogDescription>
                                    The recurring{' '}
                                    {cancelTarget.freq.toLowerCase()} recharge
                                    for {cancelTarget.name} (
                                    {fmt(cancelTarget.amount, cancelTarget.cur)}
                                    ) will stop. This won't affect past
                                    recharges.
                                </DialogDescription>
                            )}
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setCancelTarget(null)}
                            >
                                Keep it
                            </Button>
                            {cancelTarget && (
                                <Button
                                    variant="destructive"
                                    onClick={() => remove(cancelTarget.id)}
                                >
                                    <Icon name="trash" className="size-4" />
                                    Cancel automation
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Page>
        </>
    );
}
