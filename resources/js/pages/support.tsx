import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
    index as supportIndex,
    reply,
    store,
} from '@/actions/App/Http/Controllers/SupportController';
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
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Page, PageHeader } from '@/components/ui/page';
import { Pagination } from '@/components/ui/pagination';
import type { PaginationMeta } from '@/components/ui/pagination';
import { Panel, PanelBody, PanelHead } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { SharedData } from '@/types';

type TicketReply = {
    id: number;
    author: string;
    body: string;
    at: string;
};

type Ticket = {
    key: number;
    id: string;
    subject: string;
    body: string;
    from: string;
    txn: string;
    priority: string;
    status: string;
    updated: string;
    replies?: TicketReply[];
};

const CONTACT_CARDS: { icon: IconName; title: string; desc: string }[] = [
    { icon: 'headset', title: 'Live chat', desc: 'Avg reply < 2 min' },
    { icon: 'mail', title: 'Email us', desc: 'support@tappy.io' },
    { icon: 'file', title: 'Help center', desc: 'Guides & FAQs' },
];

export default function SupportScreen({
    tickets,
    pagination,
}: {
    tickets: Ticket[];
    pagination: PaginationMeta;
}) {
    const { auth } = usePage<SharedData>().props;
    const role = auth.user.role;
    const isAdmin = role === 'admin';

    const [sel, setSel] = useState<Ticket | null>(null);
    const [replyBody, setReplyBody] = useState('');
    const [replying, setReplying] = useState(false);

    const [addOpen, setAddOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState('medium');
    const [saving, setSaving] = useState(false);

    const handleCreate = () => {
        if (!subject.trim() || !message.trim()) {
            toast.error('Enter a subject and message');

            return;
        }

        setSaving(true);
        router.post(
            store.url(),
            { subject, body: message, priority },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAddOpen(false);
                    setSubject('');
                    setMessage('');
                    setPriority('medium');
                    toast.success('Ticket opened');
                },
                onError: () =>
                    toast.error('Could not open ticket', {
                        description: 'Please check the details and try again.',
                    }),
                onFinish: () => setSaving(false),
            },
        );
    };

    const handleReply = () => {
        if (!sel) {
            return;
        }

        if (!replyBody.trim()) {
            toast.error('Type a reply first');

            return;
        }

        setReplying(true);
        router.patch(
            reply.url(sel.key),
            { body: replyBody },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSel(null);
                    setReplyBody('');
                    toast.success('Reply sent');
                },
                onError: () => toast.error('Could not send reply'),
                onFinish: () => setReplying(false),
            },
        );
    };

    return (
        <>
            <Head title="Support" />
            <Page>
                <PageHeader
                    title={isAdmin ? 'Support tickets' : 'Support'}
                    desc={
                        isAdmin
                            ? 'Customer and business disputes, failed transactions and refunds.'
                            : 'Get help with transactions, refunds and your account.'
                    }
                    actions={
                        <Button onClick={() => setAddOpen(true)}>
                            <Icon name="plus" className="size-4" />
                            New ticket
                        </Button>
                    }
                />

                {!isAdmin && (
                    <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5">
                        {CONTACT_CARDS.map((c) => (
                            <div
                                key={c.title}
                                className="rounded-xl border bg-card text-card-foreground shadow-sm"
                            >
                                <PanelBody className="flex items-center gap-3">
                                    <div
                                        className="flex size-[38px] flex-none items-center justify-center rounded-[9px]"
                                        style={{
                                            background:
                                                'hsl(var(--primary) / 0.1)',
                                            color: 'hsl(var(--primary))',
                                        }}
                                    >
                                        <Icon
                                            name={c.icon}
                                            className="size-[18px]"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-[13.5px] font-semibold">
                                            {c.title}
                                        </div>
                                        <div className="text-[12px] text-muted-foreground">
                                            {c.desc}
                                        </div>
                                    </div>
                                </PanelBody>
                            </div>
                        ))}
                    </div>
                )}

                <Panel>
                    <PanelHead
                        title={isAdmin ? 'Open tickets' : 'My tickets'}
                    />
                    <div className="mt-2">
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Ticket</TH>
                                    <TH>Subject</TH>
                                    <TH className="hidden md:table-cell">
                                        Linked txn
                                    </TH>
                                    <TH className="hidden sm:table-cell">
                                        Priority
                                    </TH>
                                    <TH>Status</TH>
                                    <TH right>Updated</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {tickets.length === 0 && (
                                    <TR>
                                        <TD colSpan={6}>
                                            <EmptyState
                                                icon="headset"
                                                title="No tickets yet"
                                                desc="Support requests will appear here."
                                            />
                                        </TD>
                                    </TR>
                                )}
                                {tickets.map((t) => (
                                    <TR
                                        key={t.id}
                                        clickable
                                        onClick={() => setSel(t)}
                                    >
                                        <TD>
                                            <span className="font-mono text-[12px] font-semibold">
                                                {t.id}
                                            </span>
                                        </TD>
                                        <TD>
                                            <div className="max-w-[280px] overflow-hidden text-[12.5px] font-medium text-ellipsis whitespace-nowrap">
                                                {t.subject}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {t.from}
                                            </div>
                                        </TD>
                                        <TD className="hidden font-mono text-[11.5px] md:table-cell">
                                            {t.txn}
                                        </TD>
                                        <TD className="hidden sm:table-cell">
                                            <Badge
                                                variant={
                                                    t.priority === 'high'
                                                        ? 'destructive'
                                                        : t.priority ===
                                                            'medium'
                                                          ? 'warning'
                                                          : 'muted'
                                                }
                                                dot
                                            >
                                                {t.priority}
                                            </Badge>
                                        </TD>
                                        <TD>
                                            <StatusBadge status={t.status} />
                                        </TD>
                                        <TD
                                            right
                                            className="text-[12px] text-muted-foreground"
                                        >
                                            {t.updated}
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
                                supportIndex.url(),
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
                            setReplyBody('');
                        }
                    }}
                >
                    <DialogContent className="max-w-[520px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Icon name="ticket" className="size-4" />
                                {sel?.subject ?? ''}
                            </DialogTitle>
                            {sel && (
                                <DialogDescription>
                                    {sel.id} · from {sel.from}
                                </DialogDescription>
                            )}
                        </DialogHeader>

                        {sel && (
                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <StatusBadge status={sel.status} />
                                    <Badge variant="outline">
                                        Linked: {sel.txn}
                                    </Badge>
                                </div>
                                <div
                                    className="rounded-[var(--radius)] p-3 text-[13px] leading-[1.55]"
                                    style={{ background: 'hsl(var(--muted))' }}
                                >
                                    {sel.body}
                                </div>
                                {sel.replies?.map((r) => (
                                    <div
                                        key={r.id}
                                        className="rounded-[var(--radius)] border p-3 text-[13px] leading-[1.55]"
                                    >
                                        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                                            <span className="font-medium">
                                                {r.author}
                                            </span>
                                            <span>{r.at}</span>
                                        </div>
                                        {r.body}
                                    </div>
                                ))}
                                <Textarea
                                    placeholder="Type your reply…"
                                    value={replyBody}
                                    onChange={(e) =>
                                        setReplyBody(e.target.value)
                                    }
                                />
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline">Issue refund</Button>
                            <Button onClick={handleReply} disabled={replying}>
                                <Icon name="send" className="size-4" />
                                Reply
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogContent className="max-w-[420px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Icon name="ticket" className="size-4" />
                                New ticket
                            </DialogTitle>
                            <DialogDescription>
                                Tell us what went wrong and we'll get back to
                                you.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-3.5">
                            <Field label="Subject">
                                <Input
                                    placeholder="e.g. Top-up not received"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </Field>
                            <Field label="Message">
                                <Textarea
                                    placeholder="Describe the issue…"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </Field>
                            <Field label="Priority">
                                <Tabs
                                    tabs={[
                                        { value: 'low', label: 'Low' },
                                        { value: 'medium', label: 'Medium' },
                                        { value: 'high', label: 'High' },
                                    ]}
                                    value={priority}
                                    onChange={setPriority}
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
                            <Button onClick={handleCreate} disabled={saving}>
                                Open ticket
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Page>
        </>
    );
}
