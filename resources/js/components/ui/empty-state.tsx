import type * as React from 'react';

import { Icon, type IconName } from '@/components/ui/icon';

interface EmptyStateProps {
    icon?: IconName;
    title: string;
    desc?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon = 'inbox', title, desc, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-12 text-center">
            <div className="mb-1.5 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon name={icon} className="size-[22px]" />
            </div>
            <div className="text-sm font-semibold">{title}</div>
            {desc && <div className="max-w-[320px] text-[13px] leading-relaxed text-muted-foreground">{desc}</div>}
            {action && <div className="mt-2.5">{action}</div>}
        </div>
    );
}
