import type * as React from 'react';

import { cn } from '@/lib/utils';

/** Standard screen content wrapper: centered, max-width, responsive padding. */
export function Page({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn('fadein mx-auto w-full max-w-[1320px]', className)}
            style={{ padding: 'clamp(16px, 2.4vw, 28px)' }}
        >
            {children}
        </div>
    );
}

interface PageHeaderProps {
    title: string;
    desc?: string;
    actions?: React.ReactNode;
    breadcrumb?: React.ReactNode;
}

export function PageHeader({ title, desc, actions, breadcrumb }: PageHeaderProps) {
    return (
        <div className="mb-[clamp(16px,2vw,22px)] flex flex-wrap items-end justify-between gap-4">
            <div>
                {breadcrumb && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">{breadcrumb}</div>
                )}
                <h1 className="text-[clamp(20px,2.4vw,25px)] font-bold tracking-[-0.025em]">{title}</h1>
                {desc && <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{desc}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
        </div>
    );
}
