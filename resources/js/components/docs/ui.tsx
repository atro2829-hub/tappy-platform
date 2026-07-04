import { useState } from 'react';
import type { ReactNode } from 'react';

import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/**
 * Mintlify-style documentation primitives. Purely presentational — they render
 * the docs content registry (see resources/js/lib/docs) into a polished,
 * readable layout using the app's design tokens.
 */

export function H2({ id, children }: { id: string; children: ReactNode }) {
    return (
        <h2
            id={id}
            className="group mt-12 scroll-mt-24 border-t border-border pt-8 text-[22px] font-bold tracking-[-0.02em] first:mt-0 first:border-t-0 first:pt-0"
        >
            <a href={`#${id}`} className="no-underline">
                {children}
            </a>
        </h2>
    );
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
    return (
        <h3
            id={id}
            className="mt-8 scroll-mt-24 text-[16.5px] font-semibold tracking-[-0.01em]"
        >
            {children}
        </h3>
    );
}

export function P({ children }: { children: ReactNode }) {
    return (
        <p className="mt-4 text-[14.5px] leading-[1.7] text-muted-foreground">
            {children}
        </p>
    );
}

export function Lead({ children }: { children: ReactNode }) {
    return (
        <p className="mt-3 text-[16px] leading-[1.6] text-muted-foreground">
            {children}
        </p>
    );
}

export function UL({ children }: { children: ReactNode }) {
    return (
        <ul className="mt-4 space-y-2 text-[14.5px] leading-[1.65] text-muted-foreground">
            {children}
        </ul>
    );
}

export function LI({ children }: { children: ReactNode }) {
    return (
        <li className="flex gap-2.5">
            <Icon
                name="check"
                className="mt-[3px] size-[15px] shrink-0 text-primary"
                strokeWidth={2.6}
            />
            <span>{children}</span>
        </li>
    );
}

export function Strong({ children }: { children: ReactNode }) {
    return (
        <strong className="font-semibold text-foreground">{children}</strong>
    );
}

export function Code({ children }: { children: ReactNode }) {
    return (
        <code className="rounded-md border border-border bg-muted px-[5px] py-[1px] font-mono text-[12.5px] text-foreground">
            {children}
        </code>
    );
}

type CalloutType = 'note' | 'tip' | 'warning' | 'danger';

const CALLOUT: Record<
    CalloutType,
    { icon: IconName; ring: string; tint: string; fg: string }
> = {
    note: {
        icon: 'info',
        ring: 'border-[hsl(var(--info)/0.35)]',
        tint: 'bg-[hsl(var(--info)/0.07)]',
        fg: 'text-[hsl(var(--info))]',
    },
    tip: {
        icon: 'checkcircle',
        ring: 'border-[hsl(var(--success)/0.35)]',
        tint: 'bg-[hsl(var(--success)/0.07)]',
        fg: 'text-[hsl(var(--success))]',
    },
    warning: {
        icon: 'alert',
        ring: 'border-[hsl(var(--warning)/0.4)]',
        tint: 'bg-[hsl(var(--warning)/0.08)]',
        fg: 'text-[hsl(var(--warning))]',
    },
    danger: {
        icon: 'flag',
        ring: 'border-[hsl(var(--destructive)/0.4)]',
        tint: 'bg-[hsl(var(--destructive)/0.07)]',
        fg: 'text-[hsl(var(--destructive))]',
    },
};

export function Callout({
    type = 'note',
    title,
    children,
}: {
    type?: CalloutType;
    title?: string;
    children: ReactNode;
}) {
    const c = CALLOUT[type];

    return (
        <div
            className={cn('mt-5 rounded-xl border px-4 py-3.5', c.ring, c.tint)}
        >
            <div className="flex gap-3">
                <Icon
                    name={c.icon}
                    className={cn('mt-[1px] size-[18px] shrink-0', c.fg)}
                />
                <div className="text-[13.5px] leading-[1.65] text-foreground">
                    {title && (
                        <div className="mb-0.5 font-semibold">{title}</div>
                    )}
                    <div className="text-muted-foreground">{children}</div>
                </div>
            </div>
        </div>
    );
}

export function CardGrid({
    cols = 2,
    children,
}: {
    cols?: 1 | 2 | 3;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'mt-5 grid gap-3.5',
                cols === 1 && 'grid-cols-1',
                cols === 2 && 'sm:grid-cols-2',
                cols === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
            )}
        >
            {children}
        </div>
    );
}

export function DocCard({
    icon,
    title,
    children,
    href,
}: {
    icon: IconName;
    title: string;
    children?: ReactNode;
    href?: string;
}) {
    const inner = (
        <>
            <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-primary">
                <Icon name={icon} className="size-[18px]" />
            </div>
            <div className="mt-3 text-[14px] font-semibold tracking-[-0.01em]">
                {title}
            </div>
            {children && (
                <div className="mt-1 text-[13px] leading-[1.55] text-muted-foreground">
                    {children}
                </div>
            )}
        </>
    );

    const className =
        'block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40';

    if (href) {
        return (
            <a href={href} className={className}>
                {inner}
            </a>
        );
    }

    return <div className={className}>{inner}</div>;
}

export function Steps({ children }: { children: ReactNode }) {
    return (
        <div className="mt-6 flex flex-col gap-0 border-l border-border pl-0">
            {children}
        </div>
    );
}

export function Step({
    n,
    title,
    children,
}: {
    n: number;
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="relative pb-7 pl-9 last:pb-0">
            <div className="absolute top-0 -left-[14px] flex size-7 items-center justify-center rounded-full border border-border bg-card text-[12px] font-bold text-primary">
                {n}
            </div>
            <div className="text-[14.5px] font-semibold tracking-[-0.01em]">
                {title}
            </div>
            <div className="mt-1.5 text-[13.5px] leading-[1.65] text-muted-foreground">
                {children}
            </div>
        </div>
    );
}

export function CodeBlock({
    title,
    code,
    lang,
}: {
    title?: string;
    code: string;
    lang?: string;
}) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        void navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        });
    };

    return (
        <div className="mt-5 overflow-hidden rounded-xl border border-border bg-[hsl(220_20%_11%)] text-[hsl(210_20%_92%)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                <span className="font-mono text-[11.5px] tracking-wide text-white/55">
                    {title ?? lang ?? 'shell'}
                </span>
                <button
                    type="button"
                    onClick={copy}
                    className="flex cursor-pointer items-center gap-1.5 rounded-md border-none bg-transparent text-[11.5px] text-white/55 hover:text-white"
                >
                    <Icon
                        name={copied ? 'check' : 'copy'}
                        className="size-[13px]"
                    />
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className="overflow-x-auto px-4 py-3.5 text-[12.5px] leading-[1.6]">
                <code className="font-mono">{code}</code>
            </pre>
        </div>
    );
}

export function DocTable({
    head,
    rows,
}: {
    head: ReactNode[];
    rows: ReactNode[][];
}) {
    return (
        <div className="mt-5 overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                    <tr className="border-b border-border bg-muted/50">
                        {head.map((h, i) => (
                            <th
                                key={i}
                                className="px-4 py-2.5 font-semibold text-foreground"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, ri) => (
                        <tr
                            key={ri}
                            className="border-b border-border last:border-b-0"
                        >
                            {row.map((cell, ci) => (
                                <td
                                    key={ci}
                                    className="px-4 py-2.5 align-top text-muted-foreground"
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function Property({
    name,
    type,
    required,
    children,
}: {
    name: string;
    type?: string;
    required?: boolean;
    children: ReactNode;
}) {
    return (
        <div className="border-b border-border py-3.5 last:border-b-0">
            <div className="flex flex-wrap items-center gap-2">
                <code className="font-mono text-[13px] font-semibold text-foreground">
                    {name}
                </code>
                {type && (
                    <span className="font-mono text-[11.5px] text-muted-foreground">
                        {type}
                    </span>
                )}
                {required && (
                    <span className="text-[11px] font-semibold tracking-wide text-[hsl(var(--destructive))] uppercase">
                        required
                    </span>
                )}
            </div>
            <div className="mt-1 text-[13px] leading-[1.6] text-muted-foreground">
                {children}
            </div>
        </div>
    );
}

export function PropertyList({ children }: { children: ReactNode }) {
    return (
        <div className="mt-5 rounded-xl border border-border px-4">
            {children}
        </div>
    );
}
