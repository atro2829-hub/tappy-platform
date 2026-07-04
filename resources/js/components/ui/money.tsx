import { fmt } from '@/lib/format';
import { cn } from '@/lib/utils';

interface MoneyProps {
    value: number;
    cur?: string;
    size?: number;
    weight?: number;
    color?: string;
    /** Prefix a "+" when the value is positive. */
    sign?: boolean;
    className?: string;
}

export function Money({ value, cur = 'USD', size, weight = 600, color, sign, className }: MoneyProps) {
    return (
        <span
            className={cn('font-mono tnum', className)}
            style={{ fontSize: size, fontWeight: weight, color, letterSpacing: '-0.01em' }}
        >
            {sign && value > 0 ? '+' : ''}
            {fmt(value, cur)}
        </span>
    );
}
