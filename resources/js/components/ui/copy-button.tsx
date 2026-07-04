import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

interface CopyButtonProps {
    text: string;
    label?: string;
    size?: 'sm' | 'default' | 'lg' | 'icon';
    className?: string;
}

export function CopyButton({ text, label, size = 'sm', className }: CopyButtonProps) {
    const [done, setDone] = useState(false);

    const copy = () => {
        navigator.clipboard?.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
    };

    return (
        <Button type="button" variant="ghost" size={label ? size : 'icon'} className={className} onClick={copy}>
            <Icon name={done ? 'check' : 'copy'} className="size-3.5" />
            {label}
        </Button>
    );
}
