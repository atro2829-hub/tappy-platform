import type * as React from 'react';

import { cn } from '@/lib/utils';

/** Tappy content card. */
export function Panel({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)} {...props} />;
}

interface PanelHeadProps {
    title?: React.ReactNode;
    desc?: React.ReactNode;
    action?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export function PanelHead({ title, desc, action, children, className }: PanelHeadProps) {
    return (
        <div className={cn('flex items-start justify-between gap-3 p-5 pb-0', className)}>
            <div className="min-w-0">
                {title && <h3 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h3>}
                {desc && <p className="mt-1 text-[13px] text-muted-foreground">{desc}</p>}
                {children}
            </div>
            {action && <div className="flex-none">{action}</div>}
        </div>
    );
}

export function PanelBody({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('p-5', className)} {...props} />;
}
