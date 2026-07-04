import { usePage } from '@inertiajs/react';

import { Icon } from '@/components/ui/icon';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import type { BrandSurface, SharedData } from '@/types';

type BrandSize = 'md' | 'lg';

const SIZES: Record<
    BrandSize,
    { badge: string; icon: string; text: string; logo: string }
> = {
    md: {
        badge: 'size-[30px] rounded-lg',
        icon: 'size-[17px]',
        text: 'text-[17px]',
        logo: 'h-7',
    },
    lg: {
        badge: 'size-9 rounded-lg',
        icon: 'size-5',
        text: 'text-[19px]',
        logo: 'h-8',
    },
};

interface BrandProps {
    /** Which display surface's mode (logo+text / logo / text) to honour. */
    surface: BrandSurface;
    size?: BrandSize;
    /** Force the logo-only mark (e.g. a collapsed sidebar rail). */
    hideText?: boolean;
    className?: string;
}

/**
 * White-label brand mark. Renders the admin-configured logo + app name per the
 * selected display mode for this surface, falling back to the default zap mark
 * and the app name when no custom logo has been uploaded.
 */
export function Brand({
    surface,
    size = 'md',
    hideText = false,
    className,
}: BrandProps) {
    const { branding } = usePage<SharedData>().props;
    const { resolvedAppearance } = useAppearance();
    const s = SIZES[size];
    const mode = branding.modes?.[surface] ?? 'logo_text';

    const customLogo =
        resolvedAppearance === 'dark'
            ? (branding.logoDark ?? branding.logoLight)
            : (branding.logoLight ?? branding.logoDark);

    const showLogo = hideText || mode !== 'text';
    const showText = !hideText && mode !== 'logo';

    return (
        <div className={cn('flex items-center gap-2.5', className)}>
            {showLogo &&
                (customLogo ? (
                    <img
                        src={customLogo}
                        alt={branding.appName}
                        className={cn('w-auto object-contain', s.logo)}
                    />
                ) : (
                    <div
                        className={cn(
                            'flex shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-[0_1px_3px_hsl(var(--primary)/0.4)]',
                            s.badge,
                        )}
                    >
                        <Icon name="zap" className={s.icon} strokeWidth={2.4} />
                    </div>
                ))}
            {showText && (
                <span className={cn('font-bold tracking-[-0.02em]', s.text)}>
                    {branding.appName}
                </span>
            )}
        </div>
    );
}
