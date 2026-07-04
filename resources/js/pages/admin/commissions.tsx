import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
    destroy,
    store,
    update,
} from '@/actions/App/Http/Controllers/Admin/AdminCommissionController';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelHead } from '@/components/ui/panel';
import { Stat } from '@/components/ui/stat';
import { fmt } from '@/lib/format';

interface CommissionRule {
    id: number;
    product: string;
    region: string;
    markup: string;
    cap: string;
    tier: string;
    markupPercent: number;
    markupFlat: number;
    capValue: number | null;
}

interface Stats {
    platformMargin: number;
    resellerPayouts: number;
    activeRules: number;
    avgMarkup: number;
}

export default function AdminCommissions({
    rules,
    stats,
}: {
    rules: CommissionRule[];
    stats: Stats;
}) {
    const confirm = useConfirm();
    const [editing, setEditing] = useState<CommissionRule | null>(null);
    const [creating, setCreating] = useState(false);
    const [product, setProduct] = useState('Airtime');
    const [region, setRegion] = useState('Global');
    const [tier, setTier] = useState('All');
    const [percent, setPercent] = useState('');
    const [flat, setFlat] = useState('');
    const [cap, setCap] = useState('');
    const [saving, setSaving] = useState(false);

    const openEdit = (r: CommissionRule) => {
        setEditing(r);
        setCreating(false);
        setPercent(String(r.markupPercent));
        setFlat(String(r.markupFlat));
        setCap(r.capValue != null ? String(r.capValue) : '');
    };

    const openCreate = () => {
        setEditing(null);
        setCreating(true);
        setProduct('Airtime');
        setRegion('Global');
        setTier('All');
        setPercent('1.5');
        setFlat('0.20');
        setCap('');
    };

    const close = () => {
        setEditing(null);
        setCreating(false);
    };

    const remove = async (r: CommissionRule) => {
        const ok = await confirm({
            title: 'Delete this rule?',
            description: `The ${r.product} · ${r.region} · ${r.tier} markup rule will be removed and pricing will fall back to defaults.`,
            confirmLabel: 'Delete rule',
            destructive: true,
        });

        if (!ok) {
            return;
        }

        router.delete(destroy.url(r.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Rule deleted'),
            onError: () => toast.error('Could not delete the rule'),
        });
    };

    const save = () => {
        setSaving(true);
        const payload = {
            markup_percent: percent,
            markup_flat: flat,
            cap: cap === '' ? null : cap,
        };
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                close();
                toast.success(
                    creating ? 'Markup rule created' : 'Markup rule updated',
                );
            },
            onError: () => toast.error('Could not save the rule'),
            onFinish: () => setSaving(false),
        };

        if (creating) {
            router.post(
                store.url(),
                { product, region, tier, ...payload },
                opts,
            );
        } else if (editing) {
            router.patch(update.url(editing.id), payload, opts);
        }
    };

    return (
        <>
            <Head title="Commissions" />
            <Page>
                <PageHeader
                    title="Commissions & margin"
                    desc="Markup rules applied on top of provider cost per product, region and tier."
                    actions={
                        <Button onClick={openCreate}>
                            <Icon name="plus" className="size-4" />
                            New rule
                        </Button>
                    }
                />

                <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
                    <Stat
                        label="Platform margin (30d)"
                        value={fmt(stats.platformMargin)}
                        icon="percent"
                        accent="success"
                    />
                    <Stat
                        label="Avg markup"
                        value={`${stats.avgMarkup}%`}
                        icon="trendup"
                        accent="info"
                    />
                    <Stat
                        label="Reseller payouts"
                        value={fmt(stats.resellerPayouts)}
                        icon="users"
                        accent="violet"
                    />
                    <Stat
                        label="Active rules"
                        value={String(stats.activeRules)}
                        icon="list"
                        accent="primary"
                    />
                </div>

                <Panel>
                    <PanelHead title="Markup rules" />
                    <div className="mt-2">
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Product</TH>
                                    <TH>Region</TH>
                                    <TH>Tier</TH>
                                    <TH>Markup</TH>
                                    <TH className="hidden sm:table-cell">
                                        Cap
                                    </TH>
                                    <TH></TH>
                                </TR>
                            </THead>
                            <TBody>
                                {rules.map((r) => (
                                    <TR key={r.id}>
                                        <TD className="text-[12.5px] font-semibold">
                                            {r.product}
                                        </TD>
                                        <TD>{r.region}</TD>
                                        <TD>
                                            <Badge variant="outline">
                                                {r.tier}
                                            </Badge>
                                        </TD>
                                        <TD>
                                            <span
                                                className="font-mono font-semibold"
                                                style={{
                                                    color: 'hsl(var(--success))',
                                                }}
                                            >
                                                {r.markup}
                                            </span>
                                        </TD>
                                        <TD className="hidden font-mono sm:table-cell">
                                            {r.cap}
                                        </TD>
                                        <TD right>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        title="Actions"
                                                    >
                                                        <Icon
                                                            name="more"
                                                            className="size-4"
                                                        />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-44"
                                                >
                                                    <DropdownMenuItem
                                                        onSelect={() =>
                                                            openEdit(r)
                                                        }
                                                    >
                                                        <Icon
                                                            name="edit"
                                                            className="size-4"
                                                        />
                                                        Edit rule
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onSelect={() =>
                                                            remove(r)
                                                        }
                                                    >
                                                        <Icon
                                                            name="trash"
                                                            className="size-4"
                                                        />
                                                        Delete rule
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </Table>
                    </div>
                </Panel>
            </Page>

            <Dialog
                open={!!editing || creating}
                onOpenChange={(o) => !o && close()}
            >
                <DialogContent className="max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>
                            {creating ? 'New markup rule' : 'Edit markup rule'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3.5">
                        {creating ? (
                            <>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="rule-product">
                                        Product
                                    </Label>
                                    <NativeSelect
                                        id="rule-product"
                                        value={product}
                                        onChange={(e) =>
                                            setProduct(e.target.value)
                                        }
                                    >
                                        <option>Airtime</option>
                                        <option>Data</option>
                                        <option>Gift cards</option>
                                        <option>Utility</option>
                                    </NativeSelect>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="rule-region">Region</Label>
                                    <Input
                                        id="rule-region"
                                        value={region}
                                        onChange={(e) =>
                                            setRegion(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="rule-tier">Tier</Label>
                                    <NativeSelect
                                        id="rule-tier"
                                        value={tier}
                                        onChange={(e) =>
                                            setTier(e.target.value)
                                        }
                                    >
                                        <option>All</option>
                                        <option>Standard</option>
                                        <option>Agent</option>
                                    </NativeSelect>
                                </div>
                            </>
                        ) : (
                            editing && (
                                <div className="text-[12.5px] text-muted-foreground">
                                    {editing.product} · {editing.region} ·{' '}
                                    {editing.tier}
                                </div>
                            )
                        )}
                        <div className="grid gap-1.5">
                            <Label htmlFor="markup-percent">Markup %</Label>
                            <Input
                                id="markup-percent"
                                type="number"
                                step="0.1"
                                min="0"
                                value={percent}
                                onChange={(e) => setPercent(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="markup-flat">Flat fee ($)</Label>
                            <Input
                                id="markup-flat"
                                type="number"
                                step="0.01"
                                min="0"
                                value={flat}
                                onChange={(e) => setFlat(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="markup-cap">
                                Cap ($, optional)
                            </Label>
                            <Input
                                id="markup-cap"
                                type="number"
                                step="0.01"
                                min="0"
                                value={cap}
                                placeholder="No cap"
                                onChange={(e) => setCap(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={close}>
                            Cancel
                        </Button>
                        <Button onClick={save} disabled={saving}>
                            <Icon name="check" className="size-4" />
                            {creating ? 'Create rule' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
