import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
    index as recipientsIndex,
    store,
} from '@/actions/App/Http/Controllers/RecipientController';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Page, PageHeader } from '@/components/ui/page';
import { Pagination } from '@/components/ui/pagination';
import type { PaginationMeta } from '@/components/ui/pagination';
import { PanelBody } from '@/components/ui/panel';
import { SearchInput } from '@/components/ui/search-input';
import { useInitials } from '@/hooks/use-initials';
import { COUNTRIES } from '@/lib/mock-data';
import type { Beneficiary } from '@/lib/mock-data';

const go = (href: string) => router.visit(href);

export default function RecipientsScreen({
    recipients,
    filters,
    pagination,
}: {
    recipients: Beneficiary[];
    filters: { search: string };
    pagination: PaginationMeta;
}) {
    const getInitials = useInitials();
    const [q, setQ] = useState(filters.search);
    const [addOpen, setAddOpen] = useState(false);
    const [name, setName] = useState('');
    const [country, setCountry] = useState(COUNTRIES[0].iso);
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);

    // Server-side search + pagination; `recipients` is the current page.
    const list = recipients;

    const firstRender = useRef(true);
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;

            return;
        }

        const t = setTimeout(() => {
            if (q !== filters.search) {
                router.get(
                    recipientsIndex.url(),
                    { search: q },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            }
        }, 350);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    const handleSave = () => {
        if (!name.trim() || !phone.trim()) {
            toast.error('Enter a nickname and phone number');

            return;
        }

        setSaving(true);
        router.post(
            store.url(),
            { name, country, recipient: phone },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAddOpen(false);
                    setName('');
                    setPhone('');
                    toast.success('Recipient saved');
                },
                onError: () =>
                    toast.error('Could not save recipient', {
                        description: 'Please check the details and try again.',
                    }),
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <>
            <Head title="Recipients" />
            <Page>
                <PageHeader
                    title="Saved recipients"
                    desc="Quickly resend to people you top up often."
                    actions={
                        <Button onClick={() => setAddOpen(true)}>
                            <Icon name="plus" className="size-4" />
                            Add recipient
                        </Button>
                    }
                />

                <div className="mb-4 max-w-[360px]">
                    <SearchInput
                        placeholder="Search recipients…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
                    {list.map((b) => (
                        <div
                            key={b.id}
                            className="rounded-xl border bg-card text-card-foreground shadow-sm"
                        >
                            <PanelBody className="flex flex-col gap-3.5">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-[42px] flex-none">
                                        <AvatarFallback className="bg-muted text-[13px] font-semibold">
                                            {getInitials(b.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 text-[13.5px] font-semibold">
                                            {b.name}
                                            {b.fav && (
                                                <Icon
                                                    name="star"
                                                    className="size-[13px]"
                                                    style={{
                                                        color: 'hsl(var(--warning))',
                                                        fill: 'hsl(var(--warning))',
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="font-mono text-[11.5px] text-muted-foreground">
                                            {b.recipient}
                                        </div>
                                    </div>
                                    <Flag code={b.country} size={20} />
                                </div>

                                <div className="flex items-center justify-between text-[12px]">
                                    <span className="text-muted-foreground">
                                        {b.operator}
                                    </span>
                                    <span className="text-muted-foreground">
                                        Last: {b.last}
                                    </span>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => go('/topup')}
                                >
                                    <Icon name="send" className="size-4" />
                                    Send top-up
                                </Button>
                            </PanelBody>
                        </div>
                    ))}
                </div>

                <Pagination
                    meta={pagination}
                    onPage={(p) =>
                        router.get(
                            recipientsIndex.url(),
                            { search: q, page: p },
                            {
                                preserveState: true,
                                preserveScroll: true,
                                replace: true,
                            },
                        )
                    }
                />

                <Dialog
                    open={addOpen}
                    onOpenChange={(open) => {
                        setAddOpen(open);

                        if (!open) {
                            setName('');
                            setPhone('');
                            setCountry(COUNTRIES[0].iso);
                        }
                    }}
                >
                    <DialogContent className="max-w-[420px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Icon name="user" className="size-4" />
                                Add recipient
                            </DialogTitle>
                            <DialogDescription>
                                Save a number for faster top-ups.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-3.5">
                            <Field label="Nickname">
                                <Input
                                    placeholder="e.g. Mum"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Field>
                            <Field label="Country">
                                <NativeSelect
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                >
                                    {COUNTRIES.map((c) => (
                                        <option key={c.iso} value={c.iso}>
                                            {c.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </Field>
                            <Field label="Phone number">
                                <Input
                                    icon="phone"
                                    placeholder="+234 803 555 0142"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
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
                            <Button onClick={handleSave} disabled={saving}>
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Page>
        </>
    );
}
