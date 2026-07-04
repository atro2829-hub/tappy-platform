import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Icon } from '@/components/ui/icon';
import { useAppearance } from '@/hooks/use-appearance';
import { DOC_NAV, DOC_ORDER, DOC_PAGES } from '@/lib/docs';
import type { DocNavGroup } from '@/lib/docs';
import { cn } from '@/lib/utils';
import { dashboard, login } from '@/routes';
import type { SharedData } from '@/types';

function Brand() {
    return (
        <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="flex size-[28px] shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Icon name="zap" className="size-[16px]" strokeWidth={2.4} />
            </div>
            <span className="text-[16px] font-bold tracking-[-0.02em] text-foreground">
                Tappy
            </span>
            <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10.5px] font-semibold tracking-wide text-muted-foreground">
                DOCS
            </span>
        </Link>
    );
}

function SidebarNav({
    groups,
    current,
    onNavigate,
}: {
    groups: DocNavGroup[];
    current: string;
    onNavigate?: () => void;
}) {
    return (
        <nav className="flex flex-col gap-6">
            {groups.map((group) => (
                <div key={group.group}>
                    <div className="mb-2 px-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground/70 uppercase">
                        {group.group}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        {group.pages.map((page) => {
                            const active = page.slug === current;

                            return (
                                <Link
                                    key={page.slug}
                                    href={`/documentation/${page.slug}`}
                                    onClick={onNavigate}
                                    className={cn(
                                        'flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13.5px] no-underline transition-colors',
                                        active
                                            ? 'bg-primary/10 font-semibold text-primary'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    <Icon
                                        name={page.icon}
                                        className="size-[15px] shrink-0"
                                    />
                                    {page.title}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}

function useToc(slug: string, ref: React.RefObject<HTMLDivElement | null>) {
    const [items, setItems] = useState<{ id: string; text: string }[]>([]);
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        const el = ref.current;

        if (!el) {
            return;
        }

        const headings = Array.from(
            el.querySelectorAll<HTMLHeadingElement>('h2[id]'),
        );
        setItems(
            headings.map((h) => ({ id: h.id, text: h.textContent ?? '' })),
        );
        setActiveId(headings[0]?.id ?? '');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-80px 0px -70% 0px' },
        );

        headings.forEach((h) => observer.observe(h));

        return () => observer.disconnect();
    }, [slug, ref]);

    return { items, activeId };
}

export default function Documentation({ slug }: { slug: string }) {
    const user = usePage<SharedData>().props.auth?.user;
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const current = DOC_PAGES[slug] ? slug : DOC_ORDER[0];
    const page = DOC_PAGES[current];

    const [query, setQuery] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const { items: toc, activeId } = useToc(current, contentRef);

    // Filter the sidebar by the search query (title match).
    const groups = useMemo<DocNavGroup[]>(() => {
        const q = query.trim().toLowerCase();

        if (!q) {
            return DOC_NAV;
        }

        return DOC_NAV.map((group) => ({
            ...group,
            pages: group.pages.filter((p) => p.title.toLowerCase().includes(q)),
        })).filter((group) => group.pages.length > 0);
    }, [query]);

    const index = DOC_ORDER.indexOf(current);
    const prev = index > 0 ? DOC_PAGES[DOC_ORDER[index - 1]] : null;
    const next =
        index < DOC_ORDER.length - 1 ? DOC_PAGES[DOC_ORDER[index + 1]] : null;

    return (
        <>
            <Head title={`${page.title} — Tappy Documentation`}>
                <meta name="description" content={page.description} />
            </Head>

            <div className="min-h-screen bg-background text-foreground">
                {/* ── Top bar ─────────────────────────────────────────── */}
                <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
                    <div className="mx-auto flex h-[58px] max-w-[1400px] items-center gap-4 px-4 sm:px-6">
                        <button
                            type="button"
                            onClick={() => setMobileOpen((o) => !o)}
                            className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground lg:hidden"
                            aria-label="Toggle navigation"
                        >
                            <Icon
                                name={mobileOpen ? 'x' : 'menu'}
                                className="size-[18px]"
                            />
                        </button>

                        <Brand />

                        <div className="ml-auto flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    updateAppearance(
                                        resolvedAppearance === 'dark'
                                            ? 'light'
                                            : 'dark',
                                    )
                                }
                                className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
                                aria-label="Toggle theme"
                            >
                                <Icon
                                    name={
                                        resolvedAppearance === 'dark'
                                            ? 'sun'
                                            : 'moon'
                                    }
                                    className="size-[17px]"
                                />
                            </button>
                            <Link
                                href={user ? dashboard() : login()}
                                className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground no-underline"
                            >
                                {user ? 'Open dashboard' : 'Sign in'}
                                <Icon
                                    name="arrowright"
                                    className="size-[14px]"
                                />
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="mx-auto flex max-w-[1400px] gap-8 px-4 sm:px-6">
                    {/* ── Left sidebar (desktop) ──────────────────────── */}
                    <aside className="sticky top-[58px] hidden h-[calc(100vh-58px)] w-[244px] shrink-0 overflow-y-auto py-8 lg:block">
                        <div className="relative mb-5">
                            <Icon
                                name="search"
                                className="pointer-events-none absolute top-1/2 left-3 size-[15px] -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search docs"
                                className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-9 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/50"
                            />
                        </div>
                        <SidebarNav groups={groups} current={current} />
                    </aside>

                    {/* ── Mobile drawer ───────────────────────────────── */}
                    {mobileOpen && (
                        <div className="fixed inset-0 top-[58px] z-30 lg:hidden">
                            <div
                                className="absolute inset-0 bg-black/40"
                                onClick={() => setMobileOpen(false)}
                            />
                            <div className="absolute top-0 left-0 h-full w-[280px] overflow-y-auto border-r border-border bg-background p-5">
                                <SidebarNav
                                    groups={DOC_NAV}
                                    current={current}
                                    onNavigate={() => setMobileOpen(false)}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Content ─────────────────────────────────────── */}
                    <main className="min-w-0 flex-1 py-10">
                        <div className="mx-auto max-w-[760px]">
                            <div className="mb-1 text-[12.5px] font-semibold tracking-[0.04em] text-primary uppercase">
                                {page.group}
                            </div>
                            <h1 className="text-[30px] leading-[1.15] font-extrabold tracking-[-0.03em]">
                                {page.title}
                            </h1>
                            <p className="mt-3 text-[16px] leading-[1.55] text-muted-foreground">
                                {page.description}
                            </p>

                            <div ref={contentRef} className="mt-9">
                                {page.body}
                            </div>

                            {/* Prev / next */}
                            <div className="mt-14 grid gap-3 border-t border-border pt-7 sm:grid-cols-2">
                                {prev ? (
                                    <Link
                                        href={`/documentation/${prev.slug}`}
                                        className="group flex flex-col rounded-xl border border-border bg-card px-4 py-3 no-underline transition-colors hover:border-primary/40"
                                    >
                                        <span className="text-[12px] text-muted-foreground">
                                            ← Previous
                                        </span>
                                        <span className="mt-0.5 text-[14px] font-semibold text-foreground">
                                            {prev.title}
                                        </span>
                                    </Link>
                                ) : (
                                    <span />
                                )}
                                {next && (
                                    <Link
                                        href={`/documentation/${next.slug}`}
                                        className="group flex flex-col rounded-xl border border-border bg-card px-4 py-3 text-right no-underline transition-colors hover:border-primary/40 sm:col-start-2"
                                    >
                                        <span className="text-[12px] text-muted-foreground">
                                            Next →
                                        </span>
                                        <span className="mt-0.5 text-[14px] font-semibold text-foreground">
                                            {next.title}
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* ── On this page (desktop xl) ───────────────────── */}
                    <aside className="sticky top-[58px] hidden h-[calc(100vh-58px)] w-[200px] shrink-0 overflow-y-auto py-10 xl:block">
                        {toc.length > 0 && (
                            <>
                                <div className="mb-3 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground/70 uppercase">
                                    On this page
                                </div>
                                <div className="flex flex-col gap-1.5 border-l border-border">
                                    {toc.map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className={cn(
                                                '-ml-px border-l-2 pl-3 text-[12.5px] leading-snug no-underline transition-colors',
                                                activeId === item.id
                                                    ? 'border-primary font-medium text-primary'
                                                    : 'border-transparent text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            {item.text}
                                        </a>
                                    ))}
                                </div>
                            </>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );
}
