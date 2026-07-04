import * as React from 'react';

import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentProps<'div'> {
    value?: number;
    /** Tailwind color class or CSS color for the filled bar. */
    indicatorClassName?: string;
    indicatorColor?: string;
    height?: number;
}

function Progress({
    value = 0,
    className,
    indicatorClassName,
    indicatorColor,
    height = 8,
    ...props
}: ProgressProps) {
    return (
        <div
            data-slot="progress"
            className={cn('w-full overflow-hidden rounded-full bg-muted', className)}
            style={{ height }}
            {...props}
        >
            <div
                className={cn('h-full rounded-full bg-primary transition-[width] duration-500', indicatorClassName)}
                style={{
                    width: `${Math.min(100, Math.max(0, value))}%`,
                    background: indicatorColor,
                }}
            />
        </div>
    );
}

export { Progress };
