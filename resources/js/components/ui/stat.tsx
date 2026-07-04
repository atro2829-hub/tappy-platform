import type * as React from 'react';

import { Sparkline } from '@/components/ui/charts';
import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface StatProps {
    label: string;
    value: React.ReactNode;
    sub?: React.ReactNode;
    icon?: IconName;
    trend?: string;
    trendDir?: 'up' | 'down';
    spark?: number[];
    sparkColor?: string;
    /** Semantic token name for the icon tint, e.g. "primary", "info", "warning". */
    accent?: string;
    className?: string;
}

/** KPI / metric card used across dashboards. */
export function Stat({ label, value, sub, icon, trend, trendDir, spark, sparkColor, accent, className }: StatProps) {
    const up = trendDir !== 'down';

    return (
        <div
            className={cn('rounded-xl border bg-card text-card-foreground shadow-sm', className)}
            style={{ padding: 'var(--pad-card)' }}
        >
            <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                    <div className="mb-2.5 flex items-center gap-2">
                        {icon && (
                            <div
                                className="flex size-[30px] shrink-0 items-center justify-center rounded-lg"
                                style={{
                                    background: accent ? `hsl(var(--${accent}) / 0.12)` : 'hsl(var(--muted))',
                                    color: accent ? `hsl(var(--${accent}))` : 'hsl(var(--muted-foreground))',
                                }}
                            >
                                <Icon name={icon} className="size-4" />
                            </div>
                        )}
                        <span className="text-[12.5px] font-medium text-muted-foreground">{label}</span>
                    </div>
                    <div className="tnum text-2xl font-bold leading-none tracking-[-0.02em]">{value}</div>
                    <div className="mt-2.5 flex items-center gap-2">
                        {trend && (
                            <span
                                className="inline-flex items-center gap-[3px] text-xs font-semibold"
                                style={{ color: up ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}
                            >
                                <Icon name={up ? 'trendup' : 'trenddown'} className="size-3" />
                                {trend}
                            </span>
                        )}
                        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
                    </div>
                </div>
                {spark && (
                    <div className="mt-1 shrink-0">
                        <Sparkline data={spark} width={86} height={40} color={sparkColor} fill />
                    </div>
                )}
            </div>
        </div>
    );
}
