import * as React from 'react';

import { cn } from '@/lib/utils';

interface SwitchProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
    name?: string;
    'aria-label'?: string;
}

function Switch({ checked = false, onCheckedChange, disabled, className, id, name, ...props }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            id={id}
            name={name}
            aria-checked={checked}
            disabled={disabled}
            data-slot="switch"
            onClick={() => onCheckedChange?.(!checked)}
            className={cn(
                'inline-flex h-[22px] w-[38px] shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors outline-none',
                'focus-visible:ring-ring/40 focus-visible:ring-2',
                checked ? 'bg-primary' : 'bg-input',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        >
            <span
                className={cn(
                    'pointer-events-none block size-[18px] rounded-full bg-white shadow-sm transition-transform',
                    checked ? 'translate-x-4' : 'translate-x-0',
                )}
            />
        </button>
    );
}

export { Switch };
