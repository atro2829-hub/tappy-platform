import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
    importMethod,
    index as customersIndex,
    store,
} from '@/actions/App/Http/Controllers/ResellerCustomerController';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Field } from '@/components/ui/field';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Money } from '@/components/ui/money';
import { NativeSelect } from '@/components/ui/native-select';
import { Page, PageHeader } from '@/components/ui/page';
import { Pagination } from '@/components/ui/pagination';
import type { PaginationMeta } from '@/components/ui/pagination';
import { Panel } from '@/components/ui/panel';
import { SearchInput } from '@/components/ui/search-input';
import { Stat } from '@/components/ui/stat';
import { Tabs } from '@/components/ui/tabs';
import { useInitials } from '@/hooks/use-initials';
import { fmt } from '@/lib/format';

const go = (href: string) => router.visit(href);

type CustomerRow = {
    id: string;
    name: string;
    contact: string;
    country: string;
    tier: string;
    status: string;
    last: string;
    orders: number;
    volume: number;
    commission: number;
};

export default function ResellerCustomers({
    customers,
    filters,
    pagination,
    stats,
    commissionMtd,
}: {
    customers: CustomerRow[];
    filters: { search: string; tier: string };
    pagination: PaginationMeta;
    stats: { total: number; agents: number; active: number };
    commissionMtd: number;
}) {
    const getInitials = useInitials();
    const [q, setQ] = useState(filters.search);
    const tier = filters.tier;
    const [addOpen, setAddOpen] = useState(false);
    const [addName, setAddName] = useState('');
    const [addPhone, setAddPhone] = useState('');
    const [addTier, setAddTier] = useState('agent');
    const [saving, setSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // Server-side search + tier filter + pagination; `customers` is the page.
    const list = customers;

    const navigate = (params: {
        search?: string;
        tier?: string;
        page?: number;
    }) =>
        router.get(
            customersIndex.url(),
            { search: q, tier, ...params },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const t = setTimeout(() => {
            if (q !== filters.search) {
                navigate({ search: q, page: 1 });
            }
        }, 350);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const handleAdd = () => {
        if (!addName.trim() || !addPhone.trim()) {
            toast.error('Enter a name and phone');

            return;
        }

        router.post(
            store.url(),
            {
                name: addName,
                contact: addPhone,
                tier: addTier === 'agent' ? 'Agent' : 'Customer',
            },
            {
                preserveScroll: true,
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
                onSuccess: () => {
                    setAddOpen(false);
                    setAddName('');
                    setAddPhone('');
                    setAddTier('agent');
                    toast.success('Customer added');
                },
                onError: () => toast.error('Could not add customer'),
            },
        );
    };

    return (
        <>
            <Head title="My Customers" />
            <Page>
                <PageHeader
                    title="My customers"
                    desc="Agents and end-customers you serve — track their orders, volume and the commission you earn."
                    actions={
                        <>
                            <Button
                                variant="outline"
                                onClick={() => fileRef.current?.click()}
                            >
                                <Icon name="upload" className="size-4" />
                                Import
                            </Button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".csv,text/csv"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];

                                    if (file) {
                                        router.post(
                                            importMethod.url(),
                                            { file },
                                            {
                                                forceFormData: true,
                                                preserveScroll: true,
                                                onSuccess: () =>
                                                    toast.success(
                                                        'Customers imported',
                                                    ),
                                                onError: () =>
                                                    toast.error(
                                                        'Could not import the CSV',
                                                    ),
                                            },
                                        );
                                    }

                                    e.target.value = '';
                                }}
                            />
                            <Button onClick={() => setAddOpen(true)}>
                                <Icon name="plus" className="size-4" />
                                Add customer
                            </Button>
                        </>
                    }
                />

                <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
                    <Stat
                        label="Total customers"
                        value={String(stats.total)}
                        icon="users"
                        accent="primary"
                    />
                    <Stat
                        label="Agents"
                        value={String(stats.agents)}
                        icon="building"
                        accent="violet"
                    />
                    <Stat
                        label="Active"
                        value={String(stats.active)}
                        icon="checkcircle"
                        accent="success"
                    />
                    <Stat
                        label="Commission (MTD)"
                        value={fmt(commissionMtd)}
                        icon="percent"
                        accent="info"
                    />
                </div>

                <Panel>
                    <div className="flex flex-wrap gap-2.5 p-5 pb-0">
                        <div className="min-w-[200px] flex-1">
                            <SearchInput
                                placeholder="Search customers…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </div>
                        <NativeSelect
                            value={tier}
                            onChange={(e) =>
                                navigate({ tier: e.target.value, page: 1 })
                            }
                            aria-label="Filter by tier"
                            className="w-[150px] flex-none"
                        >
                            <option value="all">All tiers</option>
                            <option value="agent">Agents</option>
                            <option value="customer">Customers</option>
                        </NativeSelect>
                    </div>
                    <div className="mt-3.5">
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Customer</TH>
                                    <TH className="hidden sm:table-cell">
                                        Tier
                                    </TH>
                                    <TH className="hidden md:table-cell">
                                        Country
                                    </TH>
                                    <TH right>Orders</TH>
                                    <TH right>Volume</TH>
                                    <TH right>Commission</TH>
                                    <TH>Status</TH>
                                    <TH></TH>
                                </TR>
                            </THead>
                            <TBody>
                                {list.length ? (
                                    list.map((c) => (
                                        <TR key={c.id} clickable>
                                            <TD>
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar className="size-[30px]">
                                                        <AvatarFallback className="bg-muted text-[11px] font-semibold">
                                                            {getInitials(
                                                                c.name,
                                                            )}
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
                                            <TD className="hidden md:table-cell">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Flag
                                                        code={c.country}
                                                        size={15}
                                                    />
                                                    <span className="text-xs text-muted-foreground">
                                                        {c.country}
                                                    </span>
                                                </span>
                                            </TD>
                                            <TD right>
                                                <span className="tnum text-[12.5px]">
                                                    {c.orders}
                                                </span>
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
                                            <TD>
                                                <Badge
                                                    variant={
                                                        c.status === 'active'
                                                            ? 'success'
                                                            : c.status ===
                                                                'pending'
                                                              ? 'warning'
                                                              : 'destructive'
                                                    }
                                                    dot
                                                >
                                                    {c.status}
                                                </Badge>
                                            </TD>
                                            <TD right>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Top up"
                                                    onClick={() => go('/topup')}
                                                >
                                                    <Icon
                                                        name="send"
                                                        className="size-3.5"
                                                    />
                                                </Button>
                                            </TD>
                                        </TR>
                                    ))
                                ) : (
                                    <TR>
                                        <TD colSpan={8}>
                                            <EmptyState
                                                icon="users"
                                                title="No customers found"
                                                desc="Adjust filters or add a customer."
                                            />
                                        </TD>
                                    </TR>
                                )}
                            </TBody>
                        </Table>
                    </div>
                    <Pagination
                        meta={pagination}
                        onPage={(p) => navigate({ page: p })}
                    />
                </Panel>

                <Dialog
                    open={addOpen}
                    onOpenChange={(open) => {
                        setAddOpen(open);

                        if (!open) {
                            setAddName('');
                            setAddPhone('');
                            setAddTier('agent');
                        }
                    }}
                >
                    <DialogContent className="max-w-[420px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Icon name="users" className="size-4" />
                                Add customer
                            </DialogTitle>
                            <DialogDescription>
                                Add an agent or end-customer to your network.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3.5">
                            <Field label="Name">
                                <Input
                                    placeholder="Karim Store"
                                    value={addName}
                                    onChange={(e) => setAddName(e.target.value)}
                                />
                            </Field>
                            <Field label="Phone">
                                <Input
                                    icon="phone"
                                    placeholder="+880 1712 345678"
                                    value={addPhone}
                                    onChange={(e) =>
                                        setAddPhone(e.target.value)
                                    }
                                />
                            </Field>
                            <Field label="Tier">
                                <Tabs
                                    tabs={[
                                        { value: 'agent', label: 'Agent' },
                                        {
                                            value: 'customer',
                                            label: 'Customer',
                                        },
                                    ]}
                                    value={addTier}
                                    onChange={setAddTier}
                                />
                            </Field>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setAddOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleAdd} disabled={saving}>
                                Add customer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Page>
        </>
    );
}
