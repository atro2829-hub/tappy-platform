import type * as React from 'react';

import { useFieldId } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/** Lightweight styled native <select> used for filters. */
export function NativeSelect({ className, children, id, ...props }: React.ComponentProps<'select'>) {
    const fieldId = useFieldId(id);

    return (
        <div className="relative">
            <select
                id={fieldId}
                className={cn(
                    'h-9 w-full cursor-pointer appearance-none rounded-md border border-input bg-background pr-8 pl-3 text-sm outline-none transition-[color,box-shadow]',
                    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30',
                    className,
                )}
                {...props}
            >
                {children}
            </select>
            <Icon
                name="chevdown"
                className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
        </div>
    );
}
