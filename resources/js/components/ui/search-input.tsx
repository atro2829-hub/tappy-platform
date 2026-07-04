import type * as React from 'react';

import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/** Input with a leading search icon. */
export function SearchInput({ className, ...props }: React.ComponentProps<'input'>) {
    return (
        <div className="relative">
            <Icon
                name="search"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input className={cn('pl-9', className)} {...props} />
        </div>
    );
}
