import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-full border px-2 py-[3px] text-[11.5px] font-medium leading-none w-fit whitespace-nowrap shrink-0 gap-1.5 [&>svg]:size-3 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary text-primary-foreground',
                secondary: 'border-transparent bg-secondary text-secondary-foreground',
                destructive: 'border-transparent bg-destructive/12 text-destructive',
                success: 'border-transparent bg-success/12 text-success dark:bg-success/16',
                warning: 'border-transparent bg-warning/15 text-[hsl(38_92%_38%)] dark:text-warning',
                info: 'border-transparent bg-info/12 text-[hsl(217_91%_48%)] dark:text-info',
                violet: 'border-transparent bg-violet/12 text-violet',
                muted: 'border-transparent bg-muted text-muted-foreground',
                outline: 'border-border text-muted-foreground',
            },
        },
        defaultVariants: {
            variant: 'muted',
        },
    },
);

function Badge({
    className,
    variant,
    dot = false,
    asChild = false,
    children,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean; dot?: boolean }) {
    const Comp = asChild ? Slot : 'span';

    return (
        <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
            {dot && <span className="size-1.5 rounded-full bg-current" />}
            {children}
        </Comp>
    );
}

export { Badge, badgeVariants };
