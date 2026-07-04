import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
    credit as creditUser,
    index as indexUsers,
    store,
    update,
} from '@/actions/App/Http/Controllers/Admin/AdminUserController';
import { start as startImpersonation } from '@/actions/App/Http/Controllers/ImpersonationController';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Money } from '@/components/ui/money';
import { NativeSelect } from '@/components/ui/native-select';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel } from '@/components/ui/panel';
import { SearchInput } from '@/components/ui/search-input';
import { Stat } from '@/components/ui/stat';
import { StatusBadge } from '@/components/ui/status-badge';
import { useInitials } from '@/hooks/use-initials';
import { downloadCsv } from '@/lib/csv';
import { fmtInt } from '@/lib/format';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    roleLabel: string;
    biz: string;
    country: string;
    status: string;
    kyc: string;
    wallet: number;
}

interface Stats {
    total: number;
    businesses: number;
    resellers: number;
    suspended: number;
}

interface Pagination {
    total: number;
    currentPage: number;
    lastPage: number;
    from: number | null;
    to: number | null;
}

export default function AdminUsers({
    users,
    filters,
    pagination,
    stats,
}: {
    users: AdminUser[];
    filters: { search: string; role: string };
    pagination: Pagination;
    stats: Stats;
}) {
    const getInitials = useInitials();
    const confirm = useConfirm();
    const [q, setQ] = useState(filters.search);
    const roleFilter = filters.role;

    const navigate = (params: {
        search?: string;
        role?: string;
        page?: number;
    }) =>
        router.get(
            indexUsers.url(),
            { search: q, role: roleFilter, ...params },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    // Debounce search so we don't request on every keystroke.
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

    const patchUser = (
        u: AdminUser,
        changes: Record<string, string>,
        message: string,
    ) => {
        router.patch(update.url(Number(u.id)), changes, {
            preserveScroll: true,
            onSuccess: () => toast.success(message),
            onError: () => toast.error('Could not update the user'),
        });
    };

    const toggleStatus = async (u: AdminUser) => {
        if (u.status === 'active') {
            const ok = await confirm({
                title: `Suspend ${u.name}?`,
                description:
                    'They will be signed out and blocked from logging in until reactivated.',
                confirmLabel: 'Suspend',
                destructive: true,
            });

            if (!ok) {
                return;
            }

            patchUser(u, { status: 'suspended' }, `${u.name} suspended`);

            return;
        }

        patchUser(u, { status: 'active' }, `${u.name} reactivated`);
    };

    const setKyc = async (u: AdminUser, kyc_status: string) => {
        if (kyc_status === 'rejected') {
            const ok = await confirm({
                title: `Reject ${u.name}'s KYC?`,
                description: 'They will need to resubmit their verification.',
                confirmLabel: 'Reject KYC',
                destructive: true,
            });

            if (!ok) {
                return;
            }
        }

        patchUser(u, { kyc_status }, `${u.name}'s KYC ${kyc_status}`);
    };

    const setRole = (u: AdminUser, role: string) => {
        if (role === u.role) {
            return;
        }

        patchUser(u, { role }, `${u.name} is now ${role}`);
    };

    const impersonate = async (u: AdminUser) => {
        const ok = await confirm({
            title: `Log in as ${u.name}?`,
            description:
                "You'll browse the platform as this user until you stop. The session is audit-logged.",
            confirmLabel: 'Log in as user',
        });

        if (!ok) {
            return;
        }

        router.post(startImpersonation.url(Number(u.id)));
    };

    const exportCsv = () =>
        downloadCsv(
            'tappy-users.csv',
            [
                'Name',
                'Email',
                'Role',
                'Business',
                'Country',
                'KYC',
                'Status',
                'Wallet',
            ],
            users.map((u) => [
                u.name,
                u.email,
                u.roleLabel,
                u.biz,
                u.country,
                u.kyc,
                u.status,
                u.wallet,
            ]),
        );

    const [inviteOpen, setInviteOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newRole, setNewRole] = useState('business');
    const [biz, setBiz] = useState('');
    const [country, setCountry] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetInvite = () => {
        setName('');
        setEmail('');
        setBiz('');
        setCountry('');
        setNewRole('business');
        setErrors({});
    };

    const closeInvite = (open: boolean) => {
        setInviteOpen(open);

        if (!open) {
            resetInvite();
        }
    };

    const invite = () => {
        setSaving(true);
        setErrors({});
        router.post(
            store.url(),
            {
                name,
                email,
                role: newRole,
                business_name: biz || null,
                country: country || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setInviteOpen(false);
                    resetInvite();
                    toast.success('User invited');
                },
                onError: (e) => {
                    setErrors(e as Record<string, string>);
                    toast.error('Could not invite the user');
                },
                onFinish: () => setSaving(false),
            },
        );
    };

    // Manual wallet adjustment (cash received offline → credit the account).
    const [adjustUser, setAdjustUser] = useState<AdminUser | null>(null);
    const [direction, setDirection] = useState<'credit' | 'debit'>('credit');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [adjErrors, setAdjErrors] = useState<Record<string, string>>({});

    const openAdjust = (u: AdminUser, dir: 'credit' | 'debit') => {
        setAdjustUser(u);
        setDirection(dir);
        setAmount('');
        setNote('');
        setAdjErrors({});
    };

    const closeAdjust = (open: boolean) => {
        if (!open) {
            setAdjustUser(null);
            setAdjErrors({});
        }
    };

    const submitAdjust = () => {
        if (!adjustUser) {
            return;
        }

        setSaving(true);
        setAdjErrors({});
        router.post(
            creditUser.url(Number(adjustUser.id)),
            { direction, amount, note },
            {
                preserveScroll: true,
                onSuccess: () => setAdjustUser(null),
                onError: (e) => {
                    setAdjErrors(e as Record<string, string>);
                    toast.error('Could not adjust the balance');
                },
                onFinish: () => setSaving(false),
            },
        );
    };

    // Filtering + pagination are server-side; `users` is the current page.
    const list = users;

    return (
        <>
            <Head title="Users" />
            <Page>
                <PageHeader
                    title="Users"
                    desc="All businesses, resellers and customers on the platform."
                    actions={
                        <>
                            <Button variant="outline" onClick={exportCsv}>
                                <Icon name="download" className="size-4" />
                                Export
                            </Button>
                            <Button onClick={() => setInviteOpen(true)}>
                                <Icon name="plus" className="size-4" />
                                Invite user
                            </Button>
                        </>
                    }
                />

                <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">
                    <Stat
                        label="Total users"
                        value={fmtInt(stats.total)}
                        icon="users"
                        accent="primary"
                    />
                    <Stat
                        label="Businesses"
                        value={fmtInt(stats.businesses)}
                        icon="building"
                        accent="info"
                    />
                    <Stat
                        label="Resellers"
                        value={fmtInt(stats.resellers)}
                        icon="users"
                        accent="violet"
                    />
                    <Stat
                        label="Suspended"
                        value={fmtInt(stats.suspended)}
                        icon="lock"
                        accent="destructive"
                    />
                </div>

                <Panel>
                    <div className="flex flex-wrap gap-2.5 p-5 pb-0">
                        <div className="min-w-[200px] flex-1">
                            <SearchInput
                                placeholder="Search users…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </div>
                        <NativeSelect
                            value={roleFilter}
                            onChange={(e) =>
                                navigate({ role: e.target.value, page: 1 })
                            }
                            aria-label="Filter by role"
                            className="w-[150px] flex-none"
                        >
                            <option value="all">All roles</option>
                            <option value="business">Business</option>
                            <option value="reseller">Reseller</option>
                            <option value="customer">Customer</option>
                        </NativeSelect>
                    </div>
                    <div className="mt-3.5">
                        <Table>
                            <THead>
                                <TR>
                                    <TH>User</TH>
                                    <TH className="hidden sm:table-cell">
                                        Role
                                    </TH>
                                    <TH className="hidden md:table-cell">
                                        Business
                                    </TH>
                                    <TH>KYC</TH>
                                    <TH>Status</TH>
                                    <TH right>Wallet</TH>
                                    <TH></TH>
                                </TR>
                            </THead>
                            <TBody>
                                {list.length === 0 && (
                                    <TR>
                                        <TD colSpan={7}>
                                            <EmptyState
                                                icon="users"
                                                title="No users found"
                                                desc="Try a different search or role filter."
                                            />
                                        </TD>
                                    </TR>
                                )}
                                {list.map((u) => (
                                    <TR key={u.email}>
                                        <TD>
                                            <div className="flex items-center gap-2.5">
                                                <Avatar className="size-[30px]">
                                                    <AvatarFallback className="bg-muted text-[10px] font-semibold">
                                                        {getInitials(u.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="text-[12.5px] font-semibold">
                                                        {u.name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TD>
                                        <TD className="hidden sm:table-cell">
                                            <Badge variant="outline">
                                                {u.roleLabel}
                                            </Badge>
                                        </TD>
                                        <TD className="hidden md:table-cell">
                                            <span className="inline-flex items-center gap-1.5 text-[12.5px]">
                                                <Flag
                                                    code={u.country}
                                                    size={15}
                                                />
                                                {u.biz}
                                            </span>
                                        </TD>
                                        <TD>
                                            <StatusBadge status={u.kyc} />
                                        </TD>
                                        <TD>
                                            <Badge
                                                variant={
                                                    u.status === 'active'
                                                        ? 'success'
                                                        : 'destructive'
                                                }
                                                dot
                                            >
                                                {u.status}
                                            </Badge>
                                        </TD>
                                        <TD right>
                                            <Money value={u.wallet} />
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
                                                    className="w-52"
                                                >
                                                    {u.role !== 'admin' &&
                                                        u.status ===
                                                            'active' && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onSelect={() =>
                                                                        impersonate(
                                                                            u,
                                                                        )
                                                                    }
                                                                >
                                                                    <Icon
                                                                        name="user"
                                                                        className="size-4"
                                                                    />
                                                                    Log in as
                                                                    user
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                            </>
                                                        )}
                                                    <DropdownMenuLabel>
                                                        Wallet
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onSelect={() =>
                                                            openAdjust(
                                                                u,
                                                                'credit',
                                                            )
                                                        }
                                                    >
                                                        <Icon
                                                            name="plus"
                                                            className="size-4"
                                                        />
                                                        Add funds
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onSelect={() =>
                                                            openAdjust(
                                                                u,
                                                                'debit',
                                                            )
                                                        }
                                                    >
                                                        <Icon
                                                            name="minus"
                                                            className="size-4"
                                                        />
                                                        Deduct funds
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel>
                                                        KYC
                                                    </DropdownMenuLabel>
                                                    {u.kyc !== 'approved' && (
                                                        <DropdownMenuItem
                                                            onSelect={() =>
                                                                setKyc(
                                                                    u,
                                                                    'approved',
                                                                )
                                                            }
                                                        >
                                                            <Icon
                                                                name="check"
                                                                className="size-4"
                                                            />
                                                            Approve KYC
                                                        </DropdownMenuItem>
                                                    )}
                                                    {u.kyc !== 'review' && (
                                                        <DropdownMenuItem
                                                            onSelect={() =>
                                                                setKyc(
                                                                    u,
                                                                    'review',
                                                                )
                                                            }
                                                        >
                                                            <Icon
                                                                name="search"
                                                                className="size-4"
                                                            />
                                                            Mark for review
                                                        </DropdownMenuItem>
                                                    )}
                                                    {u.kyc !== 'rejected' && (
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onSelect={() =>
                                                                setKyc(
                                                                    u,
                                                                    'rejected',
                                                                )
                                                            }
                                                        >
                                                            <Icon
                                                                name="x"
                                                                className="size-4"
                                                            />
                                                            Reject KYC
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>
                                                            <Icon
                                                                name="users"
                                                                className="size-4"
                                                            />
                                                            Change role
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuRadioGroup
                                                                value={u.role}
                                                                onValueChange={(
                                                                    v,
                                                                ) =>
                                                                    setRole(
                                                                        u,
                                                                        v,
                                                                    )
                                                                }
                                                            >
                                                                <DropdownMenuRadioItem value="business">
                                                                    Business
                                                                </DropdownMenuRadioItem>
                                                                <DropdownMenuRadioItem value="reseller">
                                                                    Reseller
                                                                </DropdownMenuRadioItem>
                                                                <DropdownMenuRadioItem value="customer">
                                                                    Customer
                                                                </DropdownMenuRadioItem>
                                                                <DropdownMenuRadioItem value="admin">
                                                                    Admin
                                                                </DropdownMenuRadioItem>
                                                            </DropdownMenuRadioGroup>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuSeparator />
                                                    {u.status === 'active' ? (
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onSelect={() =>
                                                                toggleStatus(u)
                                                            }
                                                        >
                                                            <Icon
                                                                name="lock"
                                                                className="size-4"
                                                            />
                                                            Suspend user
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            onSelect={() =>
                                                                toggleStatus(u)
                                                            }
                                                        >
                                                            <Icon
                                                                name="check"
                                                                className="size-4"
                                                            />
                                                            Reactivate user
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </Table>
                    </div>
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
            </Page>

            <Dialog open={inviteOpen} onOpenChange={closeInvite}>
                <DialogContent className="max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Invite user</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3.5">
                        <div className="grid gap-1.5">
                            <Label htmlFor="iu-name">Name</Label>
                            <Input
                                id="iu-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                aria-invalid={!!errors.name}
                            />
                            {errors.name && (
                                <p className="text-[12px] text-destructive">
                                    {errors.name}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="iu-email">Email</Label>
                            <Input
                                id="iu-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && (
                                <p className="text-[12px] text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="iu-role">Role</Label>
                            <NativeSelect
                                id="iu-role"
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                            >
                                <option value="business">Business</option>
                                <option value="reseller">Reseller</option>
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </NativeSelect>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="iu-biz">
                                Business name (optional)
                            </Label>
                            <Input
                                id="iu-biz"
                                value={biz}
                                onChange={(e) => setBiz(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="iu-country">
                                Country code (optional)
                            </Label>
                            <Input
                                id="iu-country"
                                value={country}
                                maxLength={2}
                                placeholder="NG"
                                onChange={(e) =>
                                    setCountry(e.target.value.toUpperCase())
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setInviteOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={invite} disabled={saving}>
                            <Icon name="check" className="size-4" />
                            Send invite
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={adjustUser !== null} onOpenChange={closeAdjust}>
                <DialogContent className="max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>
                            {direction === 'credit'
                                ? 'Add funds'
                                : 'Deduct funds'}
                        </DialogTitle>
                    </DialogHeader>
                    {adjustUser && (
                        <div className="flex flex-col gap-3.5">
                            <div className="flex items-center justify-between rounded-lg bg-muted px-3.5 py-2.5">
                                <div>
                                    <div className="text-[12.5px] font-semibold">
                                        {adjustUser.name}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">
                                        {adjustUser.roleLabel}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[11px] text-muted-foreground">
                                        Current balance
                                    </div>
                                    <div className="text-[13px] font-semibold">
                                        <Money value={adjustUser.wallet} />
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="adj-amount">Amount (USD)</Label>
                                <Input
                                    id="adj-amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    aria-invalid={!!adjErrors.amount}
                                />
                                {adjErrors.amount && (
                                    <p className="text-[12px] text-destructive">
                                        {adjErrors.amount}
                                    </p>
                                )}
                            </div>
                            <div className="grid gap-1.5">
                                <Label htmlFor="adj-note">Note / reference</Label>
                                <Input
                                    id="adj-note"
                                    placeholder="Cash received — receipt #1234"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    aria-invalid={!!adjErrors.note}
                                />
                                {adjErrors.note && (
                                    <p className="text-[12px] text-destructive">
                                        {adjErrors.note}
                                    </p>
                                )}
                            </div>
                            {direction === 'debit' && (
                                <p className="text-[12px] text-muted-foreground">
                                    This deducts from the user's wallet. It will
                                    be refused if the balance is too low.
                                </p>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => closeAdjust(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submitAdjust}
                            disabled={saving}
                            variant={
                                direction === 'debit'
                                    ? 'destructive'
                                    : 'default'
                            }
                        >
                            <Icon
                                name={direction === 'credit' ? 'plus' : 'minus'}
                                className="size-4"
                            />
                            {direction === 'credit'
                                ? 'Add funds'
                                : 'Deduct funds'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
