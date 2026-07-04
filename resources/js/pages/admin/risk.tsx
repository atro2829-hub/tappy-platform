import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
    approve,
    reject,
    resolve,
    updateRules,
} from '@/actions/App/Http/Controllers/Admin/AdminRiskController';
import { update } from '@/actions/App/Http/Controllers/Admin/AdminUserController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/data-table';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Money } from '@/components/ui/money';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelHead } from '@/components/ui/panel';
import { Stat } from '@/components/ui/stat';
import { Switch } from '@/components/ui/switch';
import { fmt } from '@/lib/format';

type SeverityVariant = 'destructive' | 'warning' | 'muted';

interface RiskFlag {
    id: string;
    rule: string;
    user: string;
    userId: string;
    sev: 'high' | 'medium' | 'low';
    txn: string;
    time: string;
}

interface RiskRules {
    largeAmount: number;
    highAmount: number;
    flagFailed: boolean;
    flagRefunded: boolean;
}

interface Hold {
    id: string;
    user: string;
    type: string;
    amount: number;
    time: string;
}

const SEV_VARIANT: Record<RiskFlag['sev'], SeverityVariant> = {
    high: 'destructive',
    medium: 'warning',
    low: 'muted',
};

interface Stats {
    open: number;
    held: number;
    blocked: number;
}

export default function AdminRisk({
    flags,
    holds,
    rules,
    stats,
}: {
    flags: RiskFlag[];
    holds: Hold[];
    rules: RiskRules;
    stats: Stats;
}) {
    const confirm = useConfirm();

    const approveHold = (h: Hold) =>
        router.patch(
            approve.url(h.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('Approved', { description: h.id }),
                onError: () => toast.error('Could not approve'),
            },
        );

    const rejectHold = async (h: Hold) => {
        const ok = await confirm({
            title: `Reject ${h.id}?`,
            description: `The ${h.type.toLowerCase()} will be cancelled and ${h.user} refunded in full.`,
            confirmLabel: 'Reject & refund',
            destructive: true,
        });

        if (!ok) {
            return;
        }

        router.patch(
            reject.url(h.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('Rejected & refunded', { description: h.id }),
                onError: () => toast.error('Could not reject'),
            },
        );
    };
    const [rulesOpen, setRulesOpen] = useState(false);
    const [largeAmount, setLargeAmount] = useState(String(rules.largeAmount));
    const [highAmount, setHighAmount] = useState(String(rules.highAmount));
    const [flagFailed, setFlagFailed] = useState(rules.flagFailed);
    const [flagRefunded, setFlagRefunded] = useState(rules.flagRefunded);
    const [savingRules, setSavingRules] = useState(false);

    const saveRules = () =>
        router.patch(
            updateRules.url(),
            {
                largeAmount: Number(largeAmount),
                highAmount: Number(highAmount),
                flagFailed,
                flagRefunded,
            },
            {
                preserveScroll: true,
                onStart: () => setSavingRules(true),
                onFinish: () => setSavingRules(false),
                onSuccess: () => setRulesOpen(false),
                onError: () => toast.error('Could not save the rules'),
            },
        );

    const clearFlag = (f: RiskFlag) =>
        router.patch(
            resolve.url(f.txn),
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('Flag cleared', { description: f.id }),
                onError: () => toast.error('Could not clear the flag'),
            },
        );

    const blockUser = async (f: RiskFlag) => {
        const ok = await confirm({
            title: `Block ${f.user}?`,
            description:
                'This suspends the account — they will be signed out and blocked from logging in until reactivated.',
            confirmLabel: 'Block user',
            destructive: true,
        });

        if (!ok) {
            return;
        }

        router.patch(
            update.url(Number(f.userId)),
            { status: 'suspended' },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.error('User suspended', { description: f.user }),
                onError: () => toast.error('Could not suspend the user'),
            },
        );
    };

    return (
        <>
            <Head title="Risk & Fraud" />
            <Page>
                <PageHeader
                    title="Risk & fraud"
                    desc="Rule-triggered flags awaiting analyst review."
                    actions={
                        <Button
                            variant="outline"
                            onClick={() => setRulesOpen(true)}
                        >
                            <Icon name="settings" className="size-4" />
                            Rules engine
                        </Button>
                    }
                />

                <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
                    <Stat
                        label="Held for review"
                        value={String(stats.held)}
                        icon="clock"
                        accent="violet"
                    />
                    <Stat
                        label="Open flags"
                        value={String(stats.open)}
                        icon="flag"
                        accent="destructive"
                    />
                    <Stat
                        label="Blocked (24h)"
                        value={fmt(stats.blocked)}
                        icon="lock"
                        accent="warning"
                    />
                </div>

                {holds.length > 0 && (
                    <Panel className="mb-4">
                        <PanelHead
                            title="Held for review"
                            desc="High-value transactions awaiting approval before delivery."
                        />
                        <div className="mt-2">
                            <Table>
                                <THead>
                                    <TR>
                                        <TH>Reference</TH>
                                        <TH className="hidden md:table-cell">
                                            User
                                        </TH>
                                        <TH className="hidden sm:table-cell">
                                            Type
                                        </TH>
                                        <TH right>Amount</TH>
                                        <TH></TH>
                                    </TR>
                                </THead>
                                <TBody>
                                    {holds.map((h) => (
                                        <TR key={h.id}>
                                            <TD>
                                                <span className="font-mono text-[12px] font-semibold">
                                                    {h.id}
                                                </span>
                                                <div className="text-[11px] text-muted-foreground">
                                                    {h.time}
                                                </div>
                                            </TD>
                                            <TD className="hidden text-[12.5px] md:table-cell">
                                                {h.user}
                                            </TD>
                                            <TD className="hidden sm:table-cell">
                                                <Badge variant="outline">
                                                    {h.type}
                                                </Badge>
                                            </TD>
                                            <TD right>
                                                <Money value={h.amount} />
                                            </TD>
                                            <TD right>
                                                <div className="flex justify-end gap-1.5">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            rejectHold(h)
                                                        }
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            approveHold(h)
                                                        }
                                                    >
                                                        Approve
                                                    </Button>
                                                </div>
                                            </TD>
                                        </TR>
                                    ))}
                                </TBody>
                            </Table>
                        </div>
                    </Panel>
                )}

                <Panel>
                    <PanelHead title="Active flags" />
                    <div className="mt-2">
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Flag</TH>
                                    <TH>Rule</TH>
                                    <TH className="hidden md:table-cell">
                                        User
                                    </TH>
                                    <TH className="hidden sm:table-cell">
                                        Transaction
                                    </TH>
                                    <TH>Severity</TH>
                                    <TH></TH>
                                </TR>
                            </THead>
                            <TBody>
                                {flags.length === 0 && (
                                    <TR>
                                        <TD colSpan={6}>
                                            <EmptyState
                                                icon="checkcircle"
                                                title="No open flags"
                                                desc="Nothing needs review right now."
                                            />
                                        </TD>
                                    </TR>
                                )}
                                {flags.map((f) => (
                                    <TR key={f.id}>
                                        <TD>
                                            <span className="font-mono text-[12px] font-semibold">
                                                {f.id}
                                            </span>
                                            <div className="text-[11px] text-muted-foreground">
                                                {f.time}
                                            </div>
                                        </TD>
                                        <TD className="text-[12.5px]">
                                            {f.rule}
                                        </TD>
                                        <TD className="hidden text-[12.5px] md:table-cell">
                                            {f.user}
                                        </TD>
                                        <TD className="hidden font-mono text-[11.5px] sm:table-cell">
                                            {f.txn}
                                        </TD>
                                        <TD>
                                            <Badge
                                                variant={SEV_VARIANT[f.sev]}
                                                dot
                                            >
                                                {f.sev}
                                            </Badge>
                                        </TD>
                                        <TD right>
                                            <div className="flex justify-end gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => clearFlag(f)}
                                                >
                                                    Clear
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => blockUser(f)}
                                                >
                                                    Block
                                                </Button>
                                            </div>
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                </Panel>

                <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
                    <DialogContent className="max-w-[420px]">
                        <DialogHeader>
                            <DialogTitle>Rules engine</DialogTitle>
                        </DialogHeader>

                        <p className="text-[13px] text-muted-foreground">
                            Tune the thresholds that decide which transactions
                            get flagged for review.
                        </p>

                        <div className="flex flex-col gap-3.5">
                            <Field label="Flag transactions at or above (USD)">
                                <Input
                                    type="number"
                                    value={largeAmount}
                                    onChange={(e) =>
                                        setLargeAmount(e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="Mark as high severity at or above (USD)">
                                <Input
                                    type="number"
                                    value={highAmount}
                                    onChange={(e) =>
                                        setHighAmount(e.target.value)
                                    }
                                />
                            </Field>
                            <label className="flex items-center justify-between gap-3 text-[13px]">
                                <span>Flag failed transactions</span>
                                <Switch
                                    checked={flagFailed}
                                    onCheckedChange={setFlagFailed}
                                />
                            </label>
                            <label className="flex items-center justify-between gap-3 text-[13px]">
                                <span>Flag refunded transactions</span>
                                <Switch
                                    checked={flagRefunded}
                                    onCheckedChange={setFlagRefunded}
                                />
                            </label>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setRulesOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={saveRules} disabled={savingRules}>
                                <Icon name="check" className="size-4" />
                                Save rules
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Page>
        </>
    );
}
