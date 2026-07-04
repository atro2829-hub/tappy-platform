import type * as React from 'react';

interface SummaryRowProps {
    label: React.ReactNode;
    children: React.ReactNode;
    strong?: boolean;
    big?: boolean;
}

/** Key/value row used on confirmation and receipt screens. */
export function SummaryRow({ label, children, strong, big }: SummaryRowProps) {
    return (
        <div className="flex items-center justify-between gap-4" style={{ padding: big ? '12px 0' : '7px 0' }}>
            <span className="text-muted-foreground" style={{ fontSize: big ? 14 : 13 }}>
                {label}
            </span>
            <span className="text-right" style={{ fontSize: big ? 18 : 13, fontWeight: strong || big ? 700 : 500 }}>
                {children}
            </span>
        </div>
    );
}
