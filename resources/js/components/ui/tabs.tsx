import { Icon, type IconName } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface TabItem {
    value: string;
    label: string;
    icon?: IconName;
    count?: number | null;
}

interface TabsProps {
    tabs: TabItem[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

/** Pill / segmented tabs. */
export function Tabs({ tabs, value, onChange, className }: TabsProps) {
    return (
        <div className={cn('inline-flex max-w-full gap-0.5 overflow-x-auto rounded-md bg-muted p-[3px]', className)}>
            {tabs.map((t) => (
                <button
                    key={t.value}
                    type="button"
                    data-active={value === t.value}
                    onClick={() => onChange(t.value)}
                    className="inline-flex h-[30px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[calc(var(--radius)-2px)] px-3 text-[12.5px] font-medium text-muted-foreground transition-[color,background,box-shadow] data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm dark:data-[active=true]:bg-accent"
                >
                    {t.icon && <Icon name={t.icon} className="size-3.5" />}
                    {t.label}
                </button>
            ))}
        </div>
    );
}

/** Underlined tabs with optional counts. */
export function UnderlineTabs({ tabs, value, onChange, className }: TabsProps) {
    return (
        <div className={cn('flex gap-0.5 border-b', className)}>
            {tabs.map((t) => (
                <button
                    key={t.value}
                    type="button"
                    data-active={value === t.value}
                    onClick={() => onChange(t.value)}
                    className="relative mr-4 h-[38px] px-1 text-[13px] font-medium text-muted-foreground transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded after:bg-primary after:opacity-0 data-[active=true]:text-foreground data-[active=true]:after:opacity-100"
                >
                    {t.label}
                    {t.count != null && <span className="ml-1.5 text-xs text-muted-foreground">{t.count}</span>}
                </button>
            ))}
        </div>
    );
}
