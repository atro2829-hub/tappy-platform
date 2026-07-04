import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

import { Brand as BrandMark } from '@/components/brand';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag } from '@/components/ui/flag';
import { Icon } from '@/components/ui/icon';
import { useAppearance } from '@/hooks/use-appearance';
import { COUNTRIES } from '@/lib/mock-data';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import type { LandingContent } from '@/types/landing';

// The biggest global top-up / gift-card / remittance markets, shown as the
// coverage preview. Derived from COUNTRIES so names and currencies stay live.
const POPULAR_COVERAGE = [
    'US',
    'GB',
    'NG',
    'IN',
    'PH',
    'PK',
    'BD',
    'MX',
    'BR',
    'KE',
    'GH',
    'ID',
]
    .map((iso) => COUNTRIES.find((c) => c.iso === iso))
    .filter((c): c is (typeof COUNTRIES)[number] => Boolean(c));

function Brand() {
    return <BrandMark surface="homepage" />;
}

function SectionHead({
    eyebrow,
    title,
    desc,
    left = false,
}: {
    eyebrow?: string;
    title: string;
    desc?: string;
    left?: boolean;
}) {
    return (
        <div
            className={left ? '' : 'mx-auto max-w-[560px] text-center'}
            style={left ? {} : undefined}
        >
            {eyebrow && (
                <div className="mb-2.5 text-[12px] font-semibold tracking-[0.06em] text-primary uppercase">
                    {eyebrow}
                </div>
            )}
            <h2
                className="m-0 leading-[1.12] font-extrabold tracking-[-0.03em]"
                style={{ fontSize: 'clamp(24px,3.4vw,32px)' }}
            >
                {title}
            </h2>
            {desc && (
                <p className="mt-3.5 text-[15px] leading-relaxed text-muted-foreground">
                    {desc}
                </p>
            )}
        </div>
    );
}

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-border">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent py-[18px] text-left"
            >
                <span className="text-[14.5px] font-semibold">{q}</span>
                <Icon
                    name={open ? 'minus' : 'plus'}
                    className="size-[17px] shrink-0 text-muted-foreground"
                />
            </button>
            {open && (
                <p className="mb-[18px] max-w-[620px] text-[13.5px] leading-relaxed text-muted-foreground">
                    {a}
                </p>
            )}
        </div>
    );
}

export default function Welcome() {
    const { auth, branding, content } = usePage<
        SharedData & { content: LandingContent }
    >().props;
    const user = auth?.user;
    const appName = branding.appName;
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const {
        nav,
        hero,
        copilot,
        products,
        coverage,
        developers,
        pricing,
        security,
        faq,
        cta,
        footer,
    } = content;

    return (
        <>
            <Head title={content.seo.title} />
            <div
                className="min-h-screen"
                style={{ background: 'hsl(var(--background))' }}
            >
                {/* ── Nav ─────────────────────────────────────────────────── */}
                <header
                    className="sticky top-0 z-30 border-b border-border"
                    style={{
                        background: 'hsl(var(--background) / 0.8)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <div className="mx-auto flex h-[60px] max-w-[1180px] items-center gap-4 px-6">
                        <Brand />
                        <nav className="ml-6 hidden items-center gap-1 md:flex">
                            {nav.links.map((l) => (
                                <a
                                    key={l.anchor}
                                    href={'#' + l.anchor}
                                    className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground no-underline hover:text-foreground"
                                >
                                    {l.label}
                                </a>
                            ))}
                            <Link
                                href="/documentation"
                                className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground no-underline hover:text-foreground"
                            >
                                {nav.docs_label}
                            </Link>
                        </nav>
                        <div className="flex-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                updateAppearance(
                                    resolvedAppearance === 'dark'
                                        ? 'light'
                                        : 'dark',
                                )
                            }
                        >
                            <Icon
                                name={
                                    resolvedAppearance === 'dark'
                                        ? 'sun'
                                        : 'moon'
                                }
                                className="size-[17px]"
                            />
                        </Button>
                        {user ? (
                            <Button asChild>
                                <Link href={dashboard().url}>
                                    {nav.dashboard_label}
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="hidden sm:inline-flex"
                                >
                                    <Link href={login().url}>
                                        {nav.sign_in_label}
                                    </Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href={register().url}>
                                        {nav.start_label}
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </header>

                {/* ── Hero ────────────────────────────────────────────────── */}
                <section className="relative overflow-hidden">
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(60% 50% at 50% 0%, hsl(var(--primary) / 0.08), transparent 70%)',
                        }}
                    />
                    <div
                        className="relative mx-auto max-w-[880px] px-6 text-center"
                        style={{ padding: 'clamp(56px,9vw,104px) 24px 56px' }}
                    >
                        <div className="mb-[22px] inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-[5px] text-[12.5px] font-medium">
                            <span className="size-[7px] rounded-full bg-success" />
                            {hero.badge}
                        </div>
                        <h1
                            className="m-0 leading-[1.04] font-extrabold tracking-[-0.035em]"
                            style={{ fontSize: 'clamp(34px,6.2vw,60px)' }}
                        >
                            {hero.title}{' '}
                            <span className="text-primary">
                                {hero.title_highlight}
                            </span>
                        </h1>
                        <p
                            className="mx-auto mt-[22px] max-w-[600px] leading-relaxed text-muted-foreground"
                            style={{ fontSize: 'clamp(15px,2.2vw,18px)' }}
                        >
                            {hero.subheading}
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Button size="lg" asChild>
                                <Link href={register().url}>
                                    {hero.primary_cta}
                                    <Icon
                                        name="arrowright"
                                        className="size-4"
                                    />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href={login().url}>
                                    <Icon name="code" className="size-4" />
                                    {hero.secondary_cta}
                                </Link>
                            </Button>
                        </div>
                        <div className="mt-[30px] flex flex-wrap justify-center gap-6 text-[12.5px] text-muted-foreground">
                            {hero.badges.map((t) => (
                                <span
                                    key={t}
                                    className="inline-flex items-center gap-1.5"
                                >
                                    <Icon
                                        name="check"
                                        className="size-3.5 text-success"
                                    />
                                    {t}
                                </span>
                            ))}
                        </div>

                        {/* Dashboard preview card */}
                        {hero.preview.enabled && (
                            <div
                                className="mt-12 overflow-hidden rounded-[14px] border border-border bg-card"
                                style={{
                                    boxShadow:
                                        '0 30px 60px -30px rgb(0 0 0 / 0.3)',
                                }}
                            >
                                <div className="flex h-9 items-center gap-1.5 border-b border-border px-3.5">
                                    {(
                                        [
                                            '#ff5f57',
                                            '#febc2e',
                                            '#28c840',
                                        ] as const
                                    ).map((c) => (
                                        <span
                                            key={c}
                                            className="size-[11px] rounded-full"
                                            style={{ background: c }}
                                        />
                                    ))}
                                    <span className="ml-auto text-[10.5px] font-medium tracking-[0.04em] text-muted-foreground uppercase">
                                        {hero.preview.label}
                                    </span>
                                </div>
                                <div
                                    className="grid gap-3 p-5"
                                    style={{
                                        gridTemplateColumns:
                                            'repeat(auto-fit, minmax(116px, 1fr))',
                                    }}
                                >
                                    {hero.preview.metrics.map((m) => (
                                        <div
                                            key={m.label}
                                            className="rounded-[10px] border border-border p-3.5 text-left"
                                        >
                                            <div
                                                className="mb-2.5 flex size-[26px] items-center justify-center rounded-[7px]"
                                                style={{
                                                    background: `hsl(var(--${m.tone}) / 0.12)`,
                                                    color: `hsl(var(--${m.tone}))`,
                                                }}
                                            >
                                                <Icon
                                                    name={m.icon}
                                                    className="size-3.5"
                                                />
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {m.label}
                                            </div>
                                            <div className="tnum font-mono text-[18px] font-bold">
                                                {m.value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── TopUp Copilot AI section ─────────────────────────────── */}
                {copilot.enabled && (
                    <section
                        id="copilot"
                        className="relative overflow-hidden border-t border-b border-border"
                        style={{ background: 'hsl(var(--muted) / 0.35)' }}
                    >
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    'radial-gradient(50% 60% at 80% 0%, hsl(262 83% 60% / 0.10), transparent 70%)',
                            }}
                        />
                        <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 px-6 py-16 md:grid-cols-2">
                            {/* Left copy */}
                            <div>
                                <div
                                    className="mb-[18px] inline-flex items-center gap-2 rounded-full px-3 py-[5px] text-[12px] font-semibold text-white"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, hsl(262 83% 58%), hsl(217 91% 60%))',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Icon
                                        name="sparkles"
                                        className="size-3.5"
                                    />
                                    {copilot.badge}
                                </div>
                                <h2
                                    className="m-0 leading-[1.1] font-extrabold tracking-[-0.03em]"
                                    style={{
                                        fontSize: 'clamp(26px,3.8vw,38px)',
                                    }}
                                >
                                    {copilot.title}
                                </h2>
                                <p className="mt-[18px] text-[16px] leading-relaxed text-muted-foreground">
                                    {copilot.description}{' '}
                                    <strong className="text-foreground">
                                        {copilot.description_strong}
                                    </strong>
                                </p>
                                <div className="my-6 flex flex-wrap gap-2">
                                    {copilot.tags.map((u) => (
                                        <span
                                            key={u}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-[11px] py-1.5 text-[12.5px] font-medium"
                                        >
                                            <Icon
                                                name="check"
                                                className="size-[13px] text-primary"
                                            />
                                            {u}
                                        </span>
                                    ))}
                                </div>
                                <div className="mb-6 flex max-w-[440px] items-center gap-[9px] rounded-[10px] bg-primary/[0.07] px-3.5 py-2.5 text-[13px] font-medium text-primary">
                                    <Icon
                                        name="shieldcheck"
                                        className="size-4 shrink-0"
                                    />
                                    {copilot.reassurance}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button size="lg" asChild>
                                        <Link href={register().url}>
                                            <Icon
                                                name="sparkles"
                                                className="size-4"
                                            />
                                            {copilot.primary_cta}
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" asChild>
                                        <Link href={login().url}>
                                            <Icon
                                                name="arrowright"
                                                className="size-4"
                                            />
                                            {copilot.secondary_cta}
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Right: static copilot demo mock */}
                            <div
                                className="overflow-hidden rounded-xl border border-border bg-card"
                                style={{
                                    boxShadow:
                                        '0 24px 50px -24px rgb(0 0 0 / 0.3)',
                                }}
                            >
                                {/* Chat header */}
                                <div className="flex items-center gap-2.5 border-b border-border px-3.5 py-3">
                                    <div
                                        className="flex size-[28px] items-center justify-center rounded-[8px] text-white"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, hsl(262 83% 58%), hsl(217 91% 60%))',
                                        }}
                                    >
                                        <Icon
                                            name="sparkles"
                                            className="size-[15px]"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[13px] font-bold">
                                            TopUp Copilot
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            AI assistant · you confirm
                                        </div>
                                    </div>
                                    <span className="size-[7px] rounded-full bg-success" />
                                </div>

                                {/* Chat body */}
                                <div className="flex flex-col gap-3 bg-background p-4">
                                    {/* User message */}
                                    <div
                                        className="max-w-[85%] self-end rounded-[14px_14px_5px_14px] px-3 py-[9px] text-[12.5px]"
                                        style={{
                                            background: 'hsl(var(--primary))',
                                            color: 'hsl(var(--primary-foreground))',
                                        }}
                                    >
                                        Recharge 01712345678 with ৳500
                                    </div>
                                    {/* AI message */}
                                    <div
                                        className="max-w-[88%] self-start rounded-[14px_14px_14px_5px] px-3 py-[9px] text-[12.5px]"
                                        style={{
                                            background: 'hsl(var(--muted))',
                                        }}
                                    >
                                        I detected{' '}
                                        <strong>
                                            Bangladesh · Grameenphone
                                        </strong>{' '}
                                        for this number. Here's your order:
                                    </div>

                                    {/* Confirmation card */}
                                    <div
                                        className="overflow-hidden rounded-xl border bg-card"
                                        style={{
                                            borderColor:
                                                'hsl(var(--primary) / 0.35)',
                                        }}
                                    >
                                        <div
                                            className="flex items-center gap-2.5 border-b border-border px-[13px] py-2.5"
                                            style={{
                                                background:
                                                    'hsl(var(--muted) / 0.4)',
                                            }}
                                        >
                                            <div className="flex size-[28px] items-center justify-center rounded-[7px] bg-primary/12 text-primary">
                                                <Icon
                                                    name="phone"
                                                    className="size-[15px]"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[12.5px] font-semibold">
                                                    Airtime
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    ৳500 airtime
                                                </div>
                                            </div>
                                            <Badge variant="muted">
                                                Awaiting confirmation
                                            </Badge>
                                        </div>
                                        <div className="px-[13px]">
                                            {(
                                                [
                                                    [
                                                        'Recipient',
                                                        '+880 1712 •••678',
                                                        null,
                                                    ],
                                                    [
                                                        'Operator',
                                                        'Grameenphone',
                                                        null,
                                                    ],
                                                    [
                                                        'Recipient gets',
                                                        '৳500.00',
                                                        'success',
                                                    ],
                                                    ['Fee', '$0.31', null],
                                                ] as [
                                                    string,
                                                    string,
                                                    string | null,
                                                ][]
                                            ).map(([k, v, c]) => (
                                                <div
                                                    key={k}
                                                    className="flex justify-between border-b border-border py-1.5 text-[12px]"
                                                >
                                                    <span className="text-muted-foreground">
                                                        {k}
                                                    </span>
                                                    <span
                                                        className="font-medium"
                                                        style={
                                                            c
                                                                ? {
                                                                      color: `hsl(var(--${c}))`,
                                                                  }
                                                                : undefined
                                                        }
                                                    >
                                                        {v}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between py-[9px] pb-1">
                                                <span className="text-[12.5px] font-semibold">
                                                    You pay
                                                </span>
                                                <span className="tnum font-mono text-[15px] font-bold">
                                                    $4.58
                                                </span>
                                            </div>
                                        </div>
                                        <div className="px-[13px] pb-[13px]">
                                            <div className="mb-[9px] flex items-center gap-1.5 rounded-[8px] bg-primary/[0.07] px-[9px] py-1.5 text-[11px] font-medium text-primary">
                                                <Icon
                                                    name="shieldcheck"
                                                    className="size-[13px]"
                                                />
                                                Please confirm before we charge
                                                your wallet.
                                            </div>
                                            <div
                                                className="flex gap-1.5"
                                                style={{
                                                    pointerEvents: 'none',
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    className="inline-flex flex-1 cursor-default items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground"
                                                >
                                                    <Icon
                                                        name="check"
                                                        className="size-3.5"
                                                    />
                                                    Confirm
                                                </button>
                                                <button
                                                    type="button"
                                                    className="inline-flex cursor-default items-center rounded-md border border-border px-3 py-1.5 text-[12px] font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="inline-flex cursor-default items-center rounded-md px-3 py-1.5 text-[12px] font-medium hover:bg-accent"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="relative mx-auto max-w-[1180px] px-6 pb-16">
                            <div
                                className="grid gap-4"
                                style={{
                                    gridTemplateColumns:
                                        'repeat(auto-fit, minmax(240px, 1fr))',
                                }}
                            >
                                {copilot.steps.map((s, i) => (
                                    <div
                                        key={s.title}
                                        className="rounded-xl border border-border bg-card p-5"
                                    >
                                        <div className="mb-2.5 flex items-center gap-2.5">
                                            <div
                                                className="flex size-[30px] items-center justify-center rounded-full text-[13px] font-bold text-white"
                                                style={{
                                                    background:
                                                        'linear-gradient(135deg, hsl(262 83% 58%), hsl(217 91% 60%))',
                                                }}
                                            >
                                                {i + 1}
                                            </div>
                                            <Icon
                                                name={s.icon}
                                                className="size-[17px] text-primary"
                                            />
                                        </div>
                                        <div className="text-[14.5px] font-semibold">
                                            {s.title}
                                        </div>
                                        <p className="mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
                                            {s.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Products ─────────────────────────────────────────────── */}
                {products.enabled && (
                    <section
                        id="products"
                        className="mx-auto max-w-[1180px] px-6 py-14"
                    >
                        <SectionHead
                            eyebrow={products.eyebrow}
                            title={products.title}
                            desc={products.desc}
                        />
                        <div
                            className="mt-9 grid gap-4"
                            style={{
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(200px, 1fr))',
                            }}
                        >
                            {products.items.map((p, i) => {
                                const tones = [
                                    'primary',
                                    'info',
                                    'violet',
                                    'warning',
                                    'success',
                                ] as const;
                                const tone = tones[i % tones.length];

                                return (
                                    <div
                                        key={`${p.label}-${i}`}
                                        className="rounded-xl border border-border bg-card p-[22px]"
                                    >
                                        <div
                                            className="mb-4 flex size-11 items-center justify-center rounded-[11px]"
                                            style={{
                                                background: `hsl(var(--${tone}) / 0.12)`,
                                                color: `hsl(var(--${tone}))`,
                                            }}
                                        >
                                            <Icon
                                                name={p.icon}
                                                className="size-[22px]"
                                            />
                                        </div>
                                        <div className="text-[15px] font-semibold">
                                            {p.label}
                                        </div>
                                        <p className="mt-1.5 text-[13px] leading-[1.5] text-muted-foreground">
                                            {p.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── Coverage ─────────────────────────────────────────────── */}
                {coverage.enabled && (
                    <section
                        className="border-t border-b border-border"
                        style={{ background: 'hsl(var(--muted) / 0.4)' }}
                    >
                        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-6 py-14 md:grid-cols-2">
                            <div>
                                <SectionHead
                                    eyebrow={coverage.eyebrow}
                                    title={coverage.title}
                                    desc={coverage.desc}
                                    left
                                />
                                <div className="mt-7 flex flex-wrap gap-7">
                                    {coverage.stats.map((s) => (
                                        <div key={s.label}>
                                            <div className="tnum font-mono text-[26px] font-extrabold text-primary">
                                                {s.value}
                                            </div>
                                            <div className="text-[12.5px] text-muted-foreground">
                                                {s.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                {POPULAR_COVERAGE.map((c) => (
                                    <div
                                        key={c.iso}
                                        className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2.5"
                                    >
                                        <Flag code={c.iso} size={22} />
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-[12.5px] font-semibold">
                                                {c.name}
                                            </div>
                                            <div className="font-mono text-[11px] text-muted-foreground">
                                                {c.cur}
                                            </div>
                                        </div>
                                        <Badge variant="success" dot>
                                            Live
                                        </Badge>
                                    </div>
                                ))}
                                <div className="col-span-2 flex items-center justify-center rounded-xl border border-dashed border-border px-3.5 py-2.5 text-[12.5px] font-medium text-muted-foreground">
                                    {coverage.more_label}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Developers ───────────────────────────────────────────── */}
                {developers.enabled && (
                    <section
                        id="developers"
                        className="mx-auto grid max-w-[1180px] items-center gap-10 px-6 py-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
                    >
                        <div>
                            <SectionHead
                                eyebrow={developers.eyebrow}
                                title={developers.title}
                                desc={developers.desc}
                                left
                            />
                            <div className="mt-6 flex flex-col gap-3">
                                {developers.features.map((d) => (
                                    <div
                                        key={d.label}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                                            <Icon
                                                name={d.icon}
                                                className="size-4"
                                            />
                                        </div>
                                        <span className="text-[13.5px]">
                                            {d.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div
                            className="overflow-hidden rounded-xl border"
                            style={{
                                background: '#0d1117',
                                borderColor: '#21262d',
                            }}
                        >
                            <div
                                className="flex h-[34px] items-center gap-2 border-b px-3.5"
                                style={{ borderColor: '#21262d' }}
                            >
                                <span
                                    className="text-[11.5px]"
                                    style={{
                                        color: '#8b949e',
                                        fontFamily: 'JetBrains Mono, monospace',
                                    }}
                                >
                                    {developers.code.endpoint}
                                </span>
                            </div>
                            <pre
                                className="m-0 overflow-x-auto p-[18px] text-[12px] leading-[1.7]"
                                style={{
                                    fontFamily: 'JetBrains Mono, monospace',
                                    color: '#c9d1d9',
                                }}
                            >
                                {developers.code.request}
                                {'\n\n'}
                                <span style={{ color: '#7ee787' }}>
                                    {developers.code.response}
                                </span>
                            </pre>
                        </div>
                    </section>
                )}

                {/* ── Pricing ──────────────────────────────────────────────── */}
                {pricing.enabled && (
                    <section
                        id="pricing"
                        className="border-t border-b border-border"
                        style={{ background: 'hsl(var(--muted) / 0.4)' }}
                    >
                        <div className="mx-auto max-w-[1180px] px-6 py-14">
                            <SectionHead
                                eyebrow={pricing.eyebrow}
                                title={pricing.title}
                                desc={pricing.desc}
                            />
                            <div
                                className="mx-auto mt-9 grid max-w-[860px] gap-4"
                                style={{
                                    gridTemplateColumns:
                                        'repeat(auto-fit, minmax(240px, 1fr))',
                                }}
                            >
                                {pricing.plans.map((t) => (
                                    <div
                                        key={t.name}
                                        className="relative rounded-xl border bg-card p-6"
                                        style={
                                            t.popular
                                                ? {
                                                      borderColor:
                                                          'hsl(var(--primary))',
                                                      boxShadow:
                                                          '0 0 0 1px hsl(var(--primary))',
                                                  }
                                                : undefined
                                        }
                                    >
                                        {t.popular && (
                                            <div
                                                className="absolute -top-2.5 left-6 rounded-full px-2.5 py-[3px] text-[11px] font-semibold text-white"
                                                style={{
                                                    background:
                                                        'hsl(var(--primary))',
                                                }}
                                            >
                                                Most popular
                                            </div>
                                        )}
                                        <div className="text-[14px] font-semibold">
                                            {t.name}
                                        </div>
                                        <div className="mt-2.5 mb-0.5 flex items-baseline gap-1.5">
                                            <span className="tnum font-mono text-[30px] font-extrabold">
                                                {t.price}
                                            </span>
                                            <span className="text-[12.5px] text-muted-foreground">
                                                {t.unit}
                                            </span>
                                        </div>
                                        <Button
                                            variant={
                                                t.popular
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="my-4 w-full"
                                            asChild
                                        >
                                            <Link href={register().url}>
                                                {t.cta}
                                            </Link>
                                        </Button>
                                        <div className="flex flex-col gap-[9px]">
                                            {t.features.map((f) => (
                                                <div
                                                    key={f}
                                                    className="flex items-center gap-[9px] text-[12.5px]"
                                                >
                                                    <Icon
                                                        name="check"
                                                        className="size-3.5 shrink-0 text-success"
                                                    />
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Security ─────────────────────────────────────────────── */}
                {security.enabled && (
                    <section
                        id="security"
                        className="mx-auto max-w-[1180px] px-6 py-14"
                    >
                        <SectionHead
                            eyebrow={security.eyebrow}
                            title={security.title}
                            desc={security.desc}
                        />
                        <div
                            className="mt-9 grid gap-4"
                            style={{
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(220px, 1fr))',
                            }}
                        >
                            {security.features.map((s) => (
                                <div
                                    key={s.title}
                                    className="rounded-xl border border-border bg-card p-[22px]"
                                >
                                    <div className="mb-3.5 flex size-10 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                                        <Icon
                                            name={s.icon}
                                            className="size-5"
                                        />
                                    </div>
                                    <div className="text-[14px] font-semibold">
                                        {s.title}
                                    </div>
                                    <p className="mt-1.5 text-[12.5px] leading-[1.5] text-muted-foreground">
                                        {s.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── FAQ ──────────────────────────────────────────────────── */}
                {faq.enabled && (
                    <section
                        id="faq"
                        className="mx-auto max-w-[760px] px-6 pt-10 pb-16"
                    >
                        <SectionHead eyebrow={faq.eyebrow} title={faq.title} />
                        <div className="mt-7">
                            {faq.items.map((item) => (
                                <FaqItem key={item.q} q={item.q} a={item.a} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Final CTA ────────────────────────────────────────────── */}
                {cta.enabled && (
                    <section className="mx-auto mb-14 max-w-[1180px] px-6">
                        <div
                            className="relative overflow-hidden rounded-xl border-0 bg-primary text-white"
                            style={{
                                padding: 'clamp(32px,5vw,56px)',
                                textAlign: 'center',
                            }}
                        >
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        'radial-gradient(50% 80% at 50% 0%, rgb(255 255 255 / 0.12), transparent)',
                                }}
                            />
                            <h2
                                className="relative m-0 font-extrabold tracking-[-0.03em]"
                                style={{ fontSize: 'clamp(24px,4vw,34px)' }}
                            >
                                {cta.title}
                            </h2>
                            <p className="relative mx-auto mt-3 max-w-[440px] text-[15px] opacity-90">
                                {cta.description}
                            </p>
                            <div className="relative mt-[26px] flex flex-wrap justify-center gap-3">
                                <Button
                                    size="lg"
                                    style={{
                                        background: '#fff',
                                        color: 'hsl(var(--primary))',
                                    }}
                                    asChild
                                >
                                    <Link href={register().url}>
                                        {cta.primary_cta}
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    style={{
                                        color: '#fff',
                                        border: '1px solid rgb(255 255 255 / 0.3)',
                                    }}
                                    asChild
                                >
                                    <Link href={login().url}>
                                        {cta.secondary_cta}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Footer ───────────────────────────────────────────────── */}
                <footer className="border-t border-border">
                    <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
                        <div>
                            <BrandMark surface="footer" />
                            <p className="mt-3 max-w-[240px] text-[12.5px] leading-relaxed text-muted-foreground">
                                {footer.tagline}
                            </p>
                        </div>
                        {footer.columns.map((col) => (
                            <div key={col.heading}>
                                <div className="mb-3 text-[12.5px] font-semibold">
                                    {col.heading}
                                </div>
                                {col.links.map((linkItem) => {
                                    const dead =
                                        !linkItem.href || linkItem.href === '#';

                                    return (
                                        <a
                                            key={linkItem.label}
                                            href={dead ? '#' : linkItem.href}
                                            onClick={
                                                dead
                                                    ? (e) => e.preventDefault()
                                                    : undefined
                                            }
                                            className="block py-[5px] text-[12.5px] text-muted-foreground no-underline hover:text-foreground"
                                        >
                                            {linkItem.label}
                                        </a>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-border">
                        <div className="mx-auto flex max-w-[1180px] flex-wrap justify-between gap-2.5 px-6 py-[18px] text-[12px] text-muted-foreground">
                            <span>
                                {footer.copyright.replaceAll('{app}', appName)}
                            </span>
                            <span>{footer.legal}</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
