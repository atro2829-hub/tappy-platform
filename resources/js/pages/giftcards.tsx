import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { store } from '@/actions/App/Http/Controllers/GiftCardController';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Field } from '@/components/ui/field';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Page, PageHeader } from '@/components/ui/page';
import { Panel, PanelBody, PanelHead } from '@/components/ui/panel';
import { SearchInput } from '@/components/ui/search-input';
import { Spinner } from '@/components/ui/spinner';
import { SummaryRow } from '@/components/ui/summary-row';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTransactionStatus } from '@/hooks/use-transaction-status';
import { fmt } from '@/lib/format';
import { COUNTRIES } from '@/lib/mock-data';
import type { GiftCard } from '@/lib/mock-data';

const go = (href: string) => router.visit(href);

function xsrfToken(): string {
    const m = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return m ? decodeURIComponent(m[1]) : '';
}

function GiftBrandMark({
    g,
    size = 44,
    radius = 11,
}: {
    g: GiftCard;
    size?: number;
    radius?: number;
}) {
    return (
        <div
            className="flex flex-none items-center justify-center font-bold tracking-[-0.02em] text-white shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12)]"
            style={{
                width: size,
                height: size,
                borderRadius: radius,
                background: g.color,
                fontSize: size * 0.34,
            }}
        >
            {g.brand.slice(0, 2)}
        </div>
    );
}

function GiftCatalog({
    cards,
    onSelect,
}: {
    cards: GiftCard[];
    onSelect: (g: GiftCard) => void;
}) {
    const [cat, setCat] = useState('all');
    const [country, setCountry] = useState('all');
    const [q, setQ] = useState('');
    const cats = ['all', ...Array.from(new Set(cards.map((g) => g.cat)))];
    const list = cards.filter(
        (g) =>
            (cat === 'all' || g.cat === cat) &&
            (country === 'all' || g.countries.includes(country)) &&
            g.brand.toLowerCase().includes(q.toLowerCase()),
    );

    return (
        <Page>
            <PageHeader
                title="Gift cards"
                desc="4,000+ brands across 180 countries — delivered instantly by email or SMS."
                actions={
                    <Button
                        variant="outline"
                        onClick={() => go('/transactions')}
                    >
                        <Icon name="receipt" className="size-4" />
                        My orders
                    </Button>
                }
            />

            <div className="mb-[18px] flex flex-wrap items-center gap-2.5">
                <div className="min-w-[200px] flex-1">
                    <SearchInput
                        placeholder="Search brands…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>
                <NativeSelect
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-[170px] flex-none"
                >
                    <option value="all">All countries</option>
                    {COUNTRIES.map((c) => (
                        <option key={c.iso} value={c.iso}>
                            {c.name}
                        </option>
                    ))}
                </NativeSelect>
            </div>
            <div className="mb-[18px] overflow-x-auto">
                <Tabs
                    tabs={cats.map((c) => ({
                        value: c,
                        label: c === 'all' ? 'All' : c,
                    }))}
                    value={cat}
                    onChange={setCat}
                />
            </div>

            {list.length ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
                    {list.map((g) => (
                        <button
                            key={g.id}
                            type="button"
                            onClick={() => onSelect(g)}
                            className="overflow-hidden rounded-xl border bg-card text-left shadow-sm transition hover:-translate-y-[3px] hover:shadow-[0_12px_28px_-12px_rgb(0_0_0_/_0.25)]"
                        >
                            <div
                                className="relative flex h-24 items-center justify-center"
                                style={{
                                    background: `linear-gradient(135deg, ${g.color}, ${g.color}dd)`,
                                }}
                            >
                                <GiftBrandMark g={g} size={48} radius={12} />
                                <span className="absolute top-2 right-2 hidden rounded-full bg-white/20 px-2 py-[3px] text-[11.5px] font-medium text-white sm:inline">
                                    {g.cat}
                                </span>
                            </div>
                            <div className="p-3.5">
                                <div className="text-[13.5px] font-semibold">
                                    {g.brand}
                                </div>
                                <div className="mt-0.5 text-xs text-muted-foreground">
                                    {fmt(g.denoms[0])} –{' '}
                                    {fmt(g.denoms[g.denoms.length - 1])}
                                </div>
                                <div className="mt-2 flex gap-1">
                                    {g.countries.slice(0, 4).map((c) => (
                                        <Flag key={c} code={c} size={16} />
                                    ))}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <Panel>
                    <EmptyState
                        icon="gift"
                        title="No gift cards found"
                        desc="Try a different category or country filter."
                    />
                </Panel>
            )}
        </Page>
    );
}

function GiftCheckout({
    gift,
    onBack,
}: {
    gift: GiftCard;
    onBack: () => void;
}) {
    const [denom, setDenom] = useState(gift.denoms[0]);
    const [qty, setQty] = useState(1);
    const [via, setVia] = useState('email');
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [stage, setStage] = useState<'form' | 'processing' | 'done'>('form');
    const [txnRef, setTxnRef] = useState('');
    const [txnStatus, setTxnStatus] = useState('success');

    // Live-update a still-settling gift card until the provider delivers it.
    const liveStatus = useTransactionStatus(
        txnRef || null,
        stage === 'done' &&
            (txnStatus === 'processing' || txnStatus === 'pending'),
    );
    const shownStatus = liveStatus ?? txnStatus;
    const pending = shownStatus === 'processing' || shownStatus === 'pending';

    const fee = +(denom * qty * 0.04).toFixed(2);
    const total = +(denom * qty + fee).toFixed(2);

    const submit = async () => {
        let e = '';

        if (via === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipient)) {
            e = 'Enter a valid email address.';
        }

        if (via === 'sms' && recipient.replace(/\D/g, '').length < 7) {
            e = 'Enter a valid phone number.';
        }

        setError(e);

        if (e) {
            return;
        }

        setStage('processing');

        try {
            const res = await fetch(store.url(), {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                body: JSON.stringify({
                    product_id: gift.id,
                    brand: gift.brand,
                    denom,
                    quantity: qty,
                    recipient,
                    deliver_via: via,
                    country: gift.countries[0] ?? 'US',
                    message,
                }),
            });

            if (res.status === 422) {
                const body = await res.json().catch(() => ({}));
                setStage('form');
                toast.error('Could not complete order', {
                    description:
                        body.message ??
                        'Please check the details and try again.',
                });

                return;
            }

            if (!res.ok) {
                throw new Error('Request failed');
            }

            const txn = await res.json();

            if (txn.status === 'failed' || txn.status === 'refunded') {
                setStage('form');
                toast.error('Gift card failed', {
                    description: 'Your wallet has been fully refunded.',
                });

                return;
            }

            setTxnRef(txn.reference ?? txn.id ?? '');
            setTxnStatus(txn.status ?? 'success');
            setStage('done');

            if (txn.status === 'processing' || txn.status === 'pending') {
                toast.warning('Gift card processing', {
                    description:
                        "We'll deliver it the moment the provider confirms.",
                });
            } else {
                toast.success('Gift card delivered!', {
                    description: `${qty} × ${gift.brand} ${fmt(denom)} sent to ${recipient}.`,
                });
            }
        } catch {
            setStage('form');
            toast.error('Something went wrong', {
                description: 'Please try again.',
            });
        }
    };

    if (stage === 'done') {
        return (
            <Page>
                <div className="mx-auto mt-[4vh] max-w-[480px]">
                    <Panel>
                        <PanelBody className="p-8 text-center">
                            <div
                                className={`mx-auto mb-[18px] flex size-16 items-center justify-center rounded-full ${pending ? 'bg-warning/12 text-warning' : 'bg-success/12 text-success'}`}
                            >
                                <Icon
                                    name={pending ? 'clock' : 'checkcircle'}
                                    className="size-8"
                                />
                            </div>
                            <h2 className="text-[21px] font-bold">
                                {pending
                                    ? 'Order processing'
                                    : 'Securely delivered'}
                            </h2>
                            <p className="mx-auto mt-2.5 max-w-[360px] text-[13.5px] leading-relaxed text-muted-foreground">
                                {qty} × {gift.brand} {fmt(denom)} gift{' '}
                                {qty > 1 ? 'cards' : 'card'}{' '}
                                {pending
                                    ? 'is being prepared for'
                                    : (qty > 1 ? 'were' : 'was') +
                                      ' sent to'}{' '}
                                <b className="text-foreground">{recipient}</b>{' '}
                                via {via}.
                            </p>
                            <div className="my-5 rounded-md border p-4 text-left">
                                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold">
                                    <Icon name="info" className="size-3.5" />
                                    {pending
                                        ? "We'll email the code once delivered"
                                        : 'Redeem instructions'}
                                </div>
                                <ol className="list-decimal pl-[18px] text-[12.5px] leading-relaxed text-muted-foreground">
                                    <li>
                                        Open the {gift.brand} app or website.
                                    </li>
                                    <li>
                                        Go to{' '}
                                        <b className="text-foreground">
                                            Account → Redeem gift card
                                        </b>
                                        .
                                    </li>
                                    <li>
                                        Enter the 16-digit code from the
                                        delivery email.
                                    </li>
                                </ol>
                            </div>
                            <div className="flex justify-center gap-2.5">
                                <Button onClick={onBack}>
                                    <Icon name="gift" className="size-4" />
                                    Buy another
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => go('/transactions')}
                                >
                                    <Icon name="receipt" className="size-4" />
                                    My orders
                                </Button>
                            </div>
                        </PanelBody>
                    </Panel>
                </div>
            </Page>
        );
    }

    return (
        <Page>
            <PageHeader
                title={gift.brand}
                desc={`${gift.cat} · available in ${gift.countries.length} countries`}
                breadcrumb={
                    <>
                        <span className="cursor-pointer" onClick={onBack}>
                            Gift cards
                        </span>
                        <Icon name="chevright" className="size-3" />
                        {gift.brand}
                    </>
                }
            />
            <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_340px]">
                <Panel>
                    <PanelBody className="flex flex-col gap-5">
                        <div
                            className="relative flex h-[150px] items-center justify-center rounded-xl"
                            style={{
                                background: `linear-gradient(135deg, ${gift.color}, ${gift.color}cc)`,
                            }}
                        >
                            <GiftBrandMark g={gift} size={64} radius={16} />
                            <span className="absolute bottom-3.5 left-4 text-base font-bold text-white/95">
                                {gift.brand}
                            </span>
                        </div>

                        <div>
                            <div className="mb-1.5 text-[12.5px] font-medium">
                                Denomination
                            </div>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2.5">
                                {gift.denoms.map((d) => {
                                    const s = denom === d;

                                    return (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => setDenom(d)}
                                            className="rounded-xl border bg-card px-2 py-3 text-center"
                                            style={
                                                s
                                                    ? {
                                                          borderColor:
                                                              'hsl(var(--primary))',
                                                          background:
                                                              'hsl(var(--primary) / 0.06)',
                                                          boxShadow:
                                                              '0 0 0 3px hsl(var(--ring) / 0.18)',
                                                      }
                                                    : undefined
                                            }
                                        >
                                            <span
                                                className="tnum font-mono text-base font-bold"
                                                style={
                                                    s
                                                        ? {
                                                              color: 'hsl(var(--primary))',
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {fmt(d)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div>
                                <div className="mb-1.5 text-[12.5px] font-medium">
                                    Quantity
                                </div>
                                <div className="flex w-fit items-center rounded-md border border-input">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setQty((q) => Math.max(1, q - 1))
                                        }
                                    >
                                        <Icon
                                            name="minus"
                                            className="size-3.5"
                                        />
                                    </Button>
                                    <span className="tnum w-10 text-center font-mono font-semibold">
                                        {qty}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setQty((q) => Math.min(50, q + 1))
                                        }
                                    >
                                        <Icon
                                            name="plus"
                                            className="size-3.5"
                                        />
                                    </Button>
                                </div>
                            </div>
                            <div className="min-w-[180px] flex-1">
                                <div className="mb-1.5 text-[12.5px] font-medium">
                                    Deliver via
                                </div>
                                <Tabs
                                    tabs={[
                                        {
                                            value: 'email',
                                            label: 'Email',
                                            icon: 'mail',
                                        },
                                        {
                                            value: 'sms',
                                            label: 'SMS',
                                            icon: 'phone',
                                        },
                                    ]}
                                    value={via}
                                    onChange={setVia}
                                />
                            </div>
                        </div>

                        <Field
                            label={
                                via === 'email'
                                    ? 'Recipient email'
                                    : 'Recipient phone'
                            }
                            error={error}
                        >
                            <Input
                                icon={via === 'email' ? 'mail' : 'phone'}
                                placeholder={
                                    via === 'email'
                                        ? 'recipient@email.com'
                                        : '+234 803 555 0142'
                                }
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                aria-invalid={!!error}
                            />
                        </Field>
                        <Field
                            label="Personal message (optional)"
                            hint={`${message.length}/200`}
                        >
                            <Textarea
                                maxLength={200}
                                placeholder="Happy birthday! Enjoy 🎁"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </Field>
                    </PanelBody>
                </Panel>

                <Panel className="sticky top-[76px]">
                    <PanelHead title="Order summary" />
                    <PanelBody className="pt-3">
                        <SummaryRow label="Brand">{gift.brand}</SummaryRow>
                        <SummaryRow label="Face value">{fmt(denom)}</SummaryRow>
                        <SummaryRow label="Quantity">× {qty}</SummaryRow>
                        <SummaryRow label="Delivery">
                            {via === 'email' ? 'Email' : 'SMS'}
                        </SummaryRow>
                        <div className="my-2 h-px bg-border" />
                        <SummaryRow label="Subtotal">
                            {fmt(denom * qty)}
                        </SummaryRow>
                        <SummaryRow label="Processing fee">
                            {fmt(fee)}
                        </SummaryRow>
                        <div className="my-2 h-px bg-border" />
                        <SummaryRow label="Total" big>
                            {fmt(total)}
                        </SummaryRow>
                        <Button
                            className="mt-4 w-full"
                            onClick={submit}
                            disabled={stage === 'processing'}
                        >
                            {stage === 'processing' ? (
                                <>
                                    <Spinner /> Processing…
                                </>
                            ) : (
                                <>
                                    <Icon name="lock" className="size-4" />
                                    Pay {fmt(total)}
                                </>
                            )}
                        </Button>
                        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground">
                            <Icon name="shield" className="size-3" />
                            Encrypted &amp; fraud-protected checkout
                        </div>
                    </PanelBody>
                </Panel>
            </div>
        </Page>
    );
}

type ApiProduct = {
    id: string;
    brand: string;
    cat: string;
    denoms: number[];
    countries: string[];
    logo: string | null;
};

/** Deterministic brand colour so the catalog keeps its coloured-tile design. */
function brandColor(brand: string): string {
    let h = 0;

    for (let i = 0; i < brand.length; i++) {
        h = (h * 31 + brand.charCodeAt(i)) % 360;
    }

    return `hsl(${h} 64% 46%)`;
}

function toGiftCard(p: ApiProduct): GiftCard {
    return {
        id: p.id,
        brand: p.brand,
        color: brandColor(p.brand),
        cat: p.cat,
        denoms: p.denoms.length ? p.denoms : [10],
        countries: p.countries,
        cur: 'YER',
    };
}

export default function GiftFlow({ products }: { products: ApiProduct[] }) {
    const cards = products.map(toGiftCard);
    const [selected, setSelected] = useState<GiftCard | null>(null);

    return (
        <>
            <Head title="Gift cards" />
            {selected ? (
                <GiftCheckout
                    gift={selected}
                    onBack={() => setSelected(null)}
                />
            ) : (
                <GiftCatalog cards={cards} onSelect={setSelected} />
            )}
        </>
    );
}
