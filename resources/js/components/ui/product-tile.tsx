import { Icon, type IconName } from '@/components/ui/icon';

interface ProductTileProps {
    icon: IconName;
    label: string;
    desc: string;
    onClick?: () => void;
    /** Semantic token name for the icon tint. */
    accent?: string;
}

export function ProductTile({ icon, label, desc, onClick, accent = 'primary' }: ProductTileProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex flex-col gap-2.5 rounded-xl border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_-10px_rgb(0_0_0_/_0.2)]"
        >
            <div
                className="flex size-10 items-center justify-center rounded-[10px]"
                style={{ background: `hsl(var(--${accent}) / 0.12)`, color: `hsl(var(--${accent}))` }}
            >
                <Icon name={icon} className="size-5" />
            </div>
            <div>
                <div className="text-[13.5px] font-semibold">{label}</div>
                <div className="mt-0.5 text-xs leading-snug text-muted-foreground">{desc}</div>
            </div>
        </button>
    );
}
