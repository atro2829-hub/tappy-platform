import type * as React from 'react';

import { cn } from '@/lib/utils';

/** Tappy-styled table primitives. Wrap rows in <Table>. */
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className="w-full overflow-x-auto">
            <table className={cn('w-full border-collapse text-[13px]', className)}>{children}</table>
        </div>
    );
}

export function THead({ children }: { children: React.ReactNode }) {
    return <thead>{children}</thead>;
}

export function TBody({ children }: { children: React.ReactNode }) {
    return <tbody>{children}</tbody>;
}

interface TRProps extends React.ComponentProps<'tr'> {
    clickable?: boolean;
}

export function TR({ children, className, clickable, ...props }: TRProps) {
    return (
        <tr
            className={cn(
                'transition-colors [&>td]:border-b last:[&>td]:border-b-0',
                clickable && 'cursor-pointer hover:bg-accent/60',
                className,
            )}
            {...props}
        >
            {children}
        </tr>
    );
}

interface CellProps extends React.ComponentProps<'th'> {
    right?: boolean;
}

export function TH({ children, className, right, ...props }: CellProps) {
    return (
        <th
            className={cn(
                'sticky top-0 z-[1] h-[38px] border-b bg-card px-3.5 text-left text-[11.5px] font-medium tracking-[0.02em] whitespace-nowrap text-muted-foreground uppercase',
                right && 'text-right',
                className,
            )}
            {...props}
        >
            {children}
        </th>
    );
}

export function TD({
    children,
    className,
    right,
    ...props
}: React.ComponentProps<'td'> & { right?: boolean }) {
    return (
        <td
            className={cn('border-b px-3.5 align-middle whitespace-nowrap', right && 'text-right', className)}
            style={{ height: 'var(--row-h)' }}
            {...props}
        >
            {children}
        </td>
    );
}
